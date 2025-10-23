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
import { Types } from 'mongoose';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { sendNotifications } from '../../../helpers/notificationsHelper';

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

const subscriptionsFromDB = async (query: Record<string, unknown>): Promise<ISubscription[]> => {
     const conditions: any[] = [];

     const { searchTerm, limit, page, paymentType } = query;

     // Handle search term - search in both package title and user details
     if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
          const trimmedSearchTerm = searchTerm.trim();

          // Find matching packages by title or paymentType
          const matchingPackageIds = await Package.find({
               $or: [{ title: { $regex: trimmedSearchTerm, $options: 'i' } }, { paymentType: { $regex: trimmedSearchTerm, $options: 'i' } }],
          }).distinct('_id');

          // Find matching users by email, name, company, etc.
          const matchingUserIds = await User.find({
               $or: [
                    { email: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { name: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { company: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { contact: { $regex: trimmedSearchTerm, $options: 'i' } },
               ],
          }).distinct('_id');

          // Create search conditions
          const searchConditions = [];

          if (matchingPackageIds.length > 0) {
               searchConditions.push({ package: { $in: matchingPackageIds } });
          }

          if (matchingUserIds.length > 0) {
               searchConditions.push({ userId: { $in: matchingUserIds } });
          }

          // Only add search condition if we found matching packages or users
          if (searchConditions.length > 0) {
               conditions.push({ $or: searchConditions });
          } else {
               // If no matches found, return empty result early
               return {
                    data: [],
                    meta: {
                         page: parseInt(page as string) || 1,
                         total: 0,
                    },
               } as any;
          }
     }

     // Handle payment type filter
     if (paymentType && typeof paymentType === 'string' && paymentType.trim()) {
          const packageIdsWithPaymentType = await Package.find({
               paymentType: paymentType.trim(),
          }).distinct('_id');

          if (packageIdsWithPaymentType.length > 0) {
               conditions.push({ package: { $in: packageIdsWithPaymentType } });
          } else {
               // If no packages match the payment type, return empty result
               return {
                    data: [],
                    meta: {
                         page: parseInt(page as string) || 1,
                         total: 0,
                    },
               } as any;
          }
     }

     // Build final query conditions
     const whereConditions = conditions.length > 0 ? { $and: conditions } : {};

     // Pagination
     const pages = Math.max(1, parseInt(page as string) || 1);
     const size = Math.max(1, Math.min(100, parseInt(limit as string) || 10)); // Limit max size
     const skip = (pages - 1) * size;

     try {
          // Execute query with population
          const result = await Subscription.find(whereConditions)
               .populate([
                    {
                         path: 'package',
                         select: 'title paymentType credit description',
                    },
                    {
                         path: 'userId',
                         select: 'email name linkedIn contact company website',
                    },
               ])
               .select('userId package price trxId currentPeriodStart currentPeriodEnd status createdAt updatedAt')
               .sort({ createdAt: -1 }) // Add sorting by creation date
               .skip(skip)
               .limit(size)
               .lean(); // Use lean() for better performance

          // Get total count for pagination
          const count = await Subscription.countDocuments(whereConditions);

          const data: any = {
               data: result,
               meta: {
                    page: pages,
                    limit: size,
                    total: count,
                    totalPages: Math.ceil(count / size),
               },
          };

          return data;
     } catch (error) {
          console.error('Error fetching subscriptions:', error);
          throw new Error('Failed to fetch subscriptions');
     }
};
const createSubscriptionByPackageIdForWorkshop = async (workShopId: string, packageId: string) => {
     console.log('createSubscriptionByPackageIdForWorkshop hitted');
     console.log('🚀 ~ createSubscriptionByPackageIdForWorkshop ~ workShopId: string, packageId: string:', workShopId, packageId);
     const isExistPackage = await Package.findOne({
          _id: packageId,
          status: 'active',
     });
     console.log('🚀 ~ createSubscriptionByPackageIdForWorkshop ~ isExistPackage:', isExistPackage?.duration);
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }
     const workshop = await WorkShop.findById(workShopId).select('ownerId _id').populate('ownerId', 'contact');
     if (!workshop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const currentPeriodStart = new Date();
     const currentPeriodEnd = new Date();
     if (isExistPackage.duration === PackageDuration.one_month) {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
     } else if (isExistPackage.duration === PackageDuration.three_months) {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
     } else if (isExistPackage.duration === PackageDuration.six_months) {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 6);
     } else if (isExistPackage.duration === PackageDuration.one_year) {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
     } else if (isExistPackage.duration === PackageDuration.one_point_five_year) {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 18);
     }

     const payload = {
          price: isExistPackage.price,
          workshop: workshop._id,
          package: packageId,
          trxId: `clickpay-${workshop._id}-${packageId}-${Date.now()}`,
          currentPeriodStart: currentPeriodStart.toString(),
          currentPeriodEnd: currentPeriodEnd.toString(),
          status: 'active',
     };

     try {
          const subscription = await Subscription.create(payload);
          console.log('🚀 ~ createSubscriptionByPackageIdForWorkshop ~ subscription:', subscription);
          // upgrade the workshop
          workshop.subscriptionId = subscription._id;
          workshop.subscribedPackage = new Types.ObjectId(packageId);
          await workshop.save();

          const extendedDaysCount = new Date().getTime() - new Date(payload.currentPeriodEnd).getTime();
          const message = whatsAppTemplate.subscriptionExtended({ daysCount: extendedDaysCount });
          await whatsAppHelper.sendWhatsAppTextMessage({ to: (workshop.ownerId as any).contact, body: message });

          await sendNotifications({
               title: `${workshop?.workshopNameEnglish}`,
               receiver: (workshop.ownerId as any)._id,
               message: `Your subscription to Senaeya app has been extended for ${extendedDaysCount} days.`,
               type: 'ALERT',
          });
          
          const superAdminId = await User.findOne({ role: 'SUPER_ADMIN' }).select('_id name');
          await sendNotifications({
               title: `${superAdminId?.name}`,
               receiver: superAdminId?._id,
               message: `The application has been successfully subscribed and the invoice has been issued and sent via WhatsApp`,
               type: 'ALERT',
          });
          return subscription;
     } catch (error: any) {
          throw error;
     }
};

const upgradeSubscriptionToDB = async (userId: string, packageId: string, workshopId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: 'active',
     });

     if (!activeSubscription) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'No active subscription found to upgrade');
     }

     const packageDoc = await Package.findById(packageId);

     if (!packageDoc) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     const workshop = await WorkShop.findById(workshopId);

     if (!workshop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }
     /* steps to update subscription ⬇️⬇️⬇️ */
     return 'need to work later';
};
const cancelSubscriptionToDB = async (userId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: 'active',
     });
     if (!activeSubscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No active subscription found to cancel');
     }

     await Subscription.findOneAndUpdate({ userId, status: 'active' }, { status: 'canceled' }, { new: true });

     return { success: true, message: 'Subscription canceled successfully' };
};
const successMessage = async (id: string) => {
     const session = await stripe.checkout.sessions.retrieve(id);
     return session;
};
export const SubscriptionService = {
     subscriptionDetailsFromDB,
     subscriptionsFromDB,
     companySubscriptionDetailsFromDB,
     createSubscriptionByPackageIdForWorkshop,
     upgradeSubscriptionToDB,
     cancelSubscriptionToDB,
     successMessage,
};
