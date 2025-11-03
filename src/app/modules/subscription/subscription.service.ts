import { Package } from '../package/package.model';
import { ISubscription } from './subscription.interface';
import { Subscription } from './subscription.model';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import config from '../../../config';
import { WorkShop } from '../workShop/workShop.model';
import { PackageDuration } from '../package/package.enum';
import mongoose, { Types } from 'mongoose';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { Coupon } from '../coupon/coupon.model';
import QueryBuilder from '../../builder/QueryBuilder';

const subscriptionDetailsFromDB = async (id: string): Promise<{ subscription: ISubscription | {} }> => {
     const subscription = await Subscription.findOne({ userId: id }).populate('package', 'title credit duration').lean();

     if (!subscription) {
          return { subscription: {} }; // Return empty object if no subscription found
     }

     // Check subscription status and update database accordingly
     if (subscription.status !== 'active') {
          await Subscription.findOneAndUpdate({ user: id }, { status: 'expired' }, { new: true });
     }

     return { subscription };
};

const companySubscriptionDetailsFromDB = async (id: string): Promise<{ subscription: ISubscription | {} }> => {
     const subscription = await Subscription.findOne({ userId: id }).populate('package', 'title credit').lean();
     if (!subscription) {
          return { subscription: {} }; // Return empty object if no subscription found
     }

     // Check subscription status and update database accordingly
     if (subscription.status !== 'active') {
          await Subscription.findOneAndUpdate({ user: id }, { status: 'expired' }, { new: true });
     }

     return { subscription };
};

const subscriptionsFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(
          Subscription.find().populate([
               {
                    path: 'package',
                    select: 'title paymentType credit description',
                    options: { strictPopulate: false }  // Add this line
               },
               {
                    path: 'workshop',
                    select: 'workshopName workshopNameArabic ownerId',
                    populate: {
                         path: 'ownerId',
                         select: 'contact name',
                    },
               },
          ]),
          query,
     );
     const result = await queryBuilder.filter().sort().paginate().fields().search(['contact']).modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const createSubscriptionByPackageIdForWorkshop = async (workShopId: string, packageId: string, amountPaid: string, couponCode: string, contact: string) => {
     const isExistPackage = await Package.findOne({
          _id: packageId,
          status: 'active',
     });
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     const workshop = await WorkShop.findById(workShopId).select('ownerId _id workshopNameEnglish').populate('ownerId', 'contact');
     if (!workshop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const currentPeriodStart = new Date();
     const currentPeriodEnd = new Date();

     switch (isExistPackage.duration) {
          case PackageDuration.one_month:
               currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
               break;
          case PackageDuration.three_months:
               currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
               break;
          case PackageDuration.six_months:
               currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 6);
               break;
          case PackageDuration.one_year:
               currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
               break;
          case PackageDuration.one_point_five_year:
               currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 18);
               break;
          default:
               break;
     }

     const trxId = `clickpay-${workshop._id}-${packageId}-${Date.now()}`;
     const payload = {
          price: isExistPackage.price,
          workshop: workshop._id,
          package: packageId,
          trxId,
          currentPeriodStart,
          currentPeriodEnd,
          amountPaid: Number(amountPaid),
          coupon: couponCode,
          contact,
          status: 'active',
     };

     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // Idempotent upsert
          const subscription = await Subscription.findOneAndUpdate({ trxId: payload.trxId }, { $setOnInsert: payload }, { new: true, upsert: true, session });

          const wasInserted = subscription.createdAt && subscription.createdAt.getTime() === subscription.updatedAt.getTime();

          // Update workshop only if new subscription
          if (wasInserted) {
               workshop.subscriptionId = subscription._id;
               workshop.subscribedPackage = new Types.ObjectId(packageId);
               await workshop.save({ session });

               // Increment coupon usage count
               await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } }, { session });

               // Calculate subscription duration in days
               const extendedDaysCount = Math.round((new Date(payload.currentPeriodEnd).getTime() - new Date(payload.currentPeriodStart).getTime()) / 86400000);

               // WhatsApp notification
               const message = whatsAppTemplate.subscriptionExtended({ daysCount: extendedDaysCount });
               await whatsAppHelper.sendWhatsAppTextMessage({
                    to: (workshop.ownerId as any).contact,
                    body: message,
               });

               // Notification for workshop owner
               await sendNotifications({
                    title: workshop.workshopNameEnglish,
                    receiver: (workshop.ownerId as any)._id,
                    message: `Your subscription to Senaeya app has been extended for ${extendedDaysCount} days.`,
                    type: 'ALERT',
               });

               // Notify Super Admin
               const superAdminId = await User.findOne({ role: 'SUPER_ADMIN' }).select('_id name');
               await sendNotifications({
                    title: superAdminId?.name,
                    receiver: superAdminId?._id,
                    message: 'The application has been successfully subscribed and the invoice has been issued and sent via WhatsApp.',
                    type: 'ALERT',
               });
          }

          await session.commitTransaction();
          session.endSession();

          return subscription;
     } catch (error: any) {
          await session.abortTransaction();
          session.endSession();
          throw error;
     }
};

const upgradeSubscriptionToDB = async (subscriptionId: string, payload: any) => {
     const activeSubscription = await Subscription.findOne({
          _id: subscriptionId,
          status: 'active',
     });

     if (!activeSubscription) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'No active subscription found to upgrade');
     }

     const workshop = await WorkShop.findById(activeSubscription.workshop);

     if (!workshop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, { $set: payload }, { new: true, runValidators: true });

     return updatedSubscription;
};
const cancelSubscriptionToDB = async (workshop: string) => {
     const activeSubscription = await Subscription.findOne({
          workshop,
          status: 'active',
     }).populate([
          {
               path: 'workshop',
               select: 'workshopName workshopNameArabic ownerId',
               populate: {
                    path: 'ownerId',
                    select: 'contact name',
               },
          },
     ]);
     if (!activeSubscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No active subscription found to cancel');
     }

     await Subscription.findOneAndUpdate({ workshop, status: 'active' }, { status: 'cancel' }, { new: true });

     const message = whatsAppTemplate.subscriptionDeleted();
     await whatsAppHelper.sendWhatsAppTextMessage({
          to: (activeSubscription.workshop as any).ownerId.contact,
          body: message,
     });

     return { success: true, message: 'Subscription canceled successfully' };
};
const successMessage = async (id: string) => {
     const session = await stripe.checkout.sessions.retrieve(id);
     return session;
};

const deleteSubscriptionPackageToDB = async (packageId: string) => {
     const subscription = await Subscription.find({ package: packageId }).populate([
          {
               path: 'workshop',
               select: 'workshopName workshopNameArabic ownerId',
               populate: {
                    path: 'ownerId',
                    select: 'contact name',
               },
          },
     ]);
     if (!subscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
     }
     // delete subscription
     await Subscription.deleteMany({ package: packageId });
     // delete pacakge
     await Package.deleteOne({ _id: packageId });
     // send messages to the workshop owner
     subscription.forEach(async (sub) => {
          const message = whatsAppTemplate.subscriptionDeleted();
          await whatsAppHelper.sendWhatsAppTextMessage({
               to: (sub.workshop as any).ownerId.contact,
               body: message,
          });
     });
     return subscription;
};

const getSubscriptionByIdToDB = async (subscriptionId: string) => {
     const subscription = await Subscription.findById(subscriptionId).populate('workshop');
     if (!subscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
     }
     return subscription;
};

const mySubscriptionDetailsToDB = async (workshopId: string) => {
     const subscription = await Subscription.findOne({ workshop: workshopId });
     if (!subscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
     }
     return subscription;
};
export const SubscriptionService = {
     subscriptionDetailsFromDB,
     subscriptionsFromDB,
     companySubscriptionDetailsFromDB,
     createSubscriptionByPackageIdForWorkshop,
     upgradeSubscriptionToDB,
     cancelSubscriptionToDB,
     successMessage,
     deleteSubscriptionPackageToDB,
     getSubscriptionByIdToDB,
     mySubscriptionDetailsToDB
};
