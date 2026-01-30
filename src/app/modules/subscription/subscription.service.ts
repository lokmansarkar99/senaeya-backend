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
import { generateQRFromObject } from '../../../helpers/qrcode/generateQRFromObject';
import { generatePDF } from '../payment/payment.utils';
import { S3Helper } from '../../../helpers/aws/s3helper';
import fs from 'fs';
import { sendToTopic } from '../pushNotification/pushNotification.service';
import DeviceToken from '../DeviceToken/DeviceToken.model';
import { AutoIncrementService } from '../AutoIncrement/AutoIncrement.service';
import { IAutoIncrement } from '../AutoIncrement/AutoIncrement.interface';

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
                    options: { strictPopulate: false }, // Add this line
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

const createSubscriptionByPackageIdForWorkshop = async (
     workShopId: string,
     packageId: string,
     amountPaid: string,
     couponCode: string,
     contact: string,
     vatPercent: number,
     flatDiscountedAmount: number,
     flatVatAmount: number,
     user: any,
) => {
     if (!contact) {
          contact = user.contact;
     }
     console.log({ workShopId, packageId, amountPaid, couponCode, contact, vatPercent, flatDiscountedAmount, flatVatAmount });
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
          vatPercent,
          flatDiscountedAmount,
          flatVatAmount,
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
               workshop.subscriptionId = new mongoose.Types.ObjectId(subscription._id);
               workshop.subscribedPackage = new Types.ObjectId(packageId);
               await workshop.save({ session });

               // Increment coupon usage count
               await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } }, { session });

               // Calculate subscription duration in days
               const extendedDaysCount = Math.round((new Date(payload.currentPeriodEnd).getTime() - new Date(payload.currentPeriodStart).getTime()) / 86400000);

               // // WhatsApp notification
               // const message = whatsAppTemplate.subscriptionExtended({ daysCount: extendedDaysCount, subscriptionId: subscription._id.toString() });
               // await whatsAppHelper.sendWhatsAppTextMessage({
               //      to: workshop.contact,
               //      body: message,
               // });

               // Notification for workshop owner
               await sendNotifications({
                    title: workshop.workshopNameEnglish,
                    receiver: (workshop.ownerId as any)._id,
                    message: `Your subscription to Senaeya app has been extended for ${extendedDaysCount} days.`,
                    message_ar: `تم تمديد اشتراككم في تطبيق الصناعية لمدة (${extendedDaysCount}) يوم`,
                    message_bn: `Senaeya অ্যাপে আপনার সাবস্ক্রিপশনের মেয়াদ (${extendedDaysCount}) দিনের জন্য বাড়ানো হয়েছে।`,
                    message_tl: `Ang iyong subscription sa Senaeya app ay pinalawig nang (${extendedDaysCount}) araw`,
                    message_hi: `सेनाया ऐप की आपकी सदस्यता (${extendedDaysCount}) दिनों के लिए बढ़ा दी गई है।`,
                    message_ur: `Senaeya ایپ کی آپ کی رکنیت (${extendedDaysCount}) دنوں کے لیے بڑھا دی گئی ہے۔`,
                    type: 'ALERT',
               });

               if ((workshop.ownerId as any)._id) {
                    const existingToken = await DeviceToken.findOne({
                         userId: (workshop.ownerId as any)._id,
                    });
                    if (existingToken && existingToken.fcmToken) {
                         await sendToTopic({
                              token: existingToken.fcmToken,
                              title: 'Subscription Extended',
                              body: `Your subscription to Senaeya app has been extended for ${extendedDaysCount} days.`,
                              data: {
                                   title: workshop.workshopNameEnglish,
                                   receiver: (workshop.ownerId as any)._id,
                                   message: `Your subscription to Senaeya app has been extended for ${extendedDaysCount} days.`,
                                   message_ar: `تم تمديد اشتراككم في تطبيق الصناعية لمدة (${extendedDaysCount}) يوم`,
                                   message_bn: `Senaeya অ্যাপে আপনার সাবস্ক্রিপশনের মেয়াদ (${extendedDaysCount}) দিনের জন্য বাড়ানো হয়েছে।`,
                                   message_tl: `Ang iyong subscription sa Senaeya app ay pinalawig nang (${extendedDaysCount}) araw`,
                                   message_hi: `सेनाया ऐप की आपकी सदस्यता (${extendedDaysCount}) दिनों के लिए बढ़ा दी गई है।`,
                                   message_ur: `Senaeya ایپ کی آپ کی رکنیت (${extendedDaysCount}) دنوں کے لیے بڑھا دی گئی ہے۔`,
                                   type: 'ALERT',
                              },
                         });
                    }
               }

               // Notify Super Admin
               const superAdminId = await User.findOne({ role: 'SUPER_ADMIN' }).select('_id name');
               await sendNotifications({
                    title: superAdminId?.name,
                    receiver: superAdminId?._id,
                    message: 'The application has been successfully subscribed and the invoice has been issued and sent via WhatsApp.',
                    message_ar: 'تم الاشتراك في التطبيق بنجاح وتم إصدار الفاتورة وإرسالها عبر واتساب.',
                    message_bn: 'অ্যাপ্লিকেশনটি সফলভাবে সাবস্ক্রাইব করা হয়েছে এবং ইনভয়েস ইস্যু করে হোয়াটসঅ্যাপের মাধ্যমে পাঠানো হয়েছে।',
                    message_tl: 'Matagumpay na naisubscripe ang application at ang invoice ay naibigay na at ipinadala sa pamamagitan ng WhatsApp.',
                    message_hi: 'एप्लिकेशन को सफलतापूर्वक सब्सक्राइब कर लिया गया है और इनवॉइस जारी कर व्हाट्सएप के माध्यम से भेज दिया गया है।',
                    message_ur: 'ایپلیکیشن کو کامیابی کے ساتھ سبسکرائب کر لیا گیا ہے اور انوائس جاری کر کے واٹس ایپ کے ذریعے بھیج دی گئی ہے۔',
                    type: 'ALERT',
               });

               if (superAdminId?._id) {
                    const existingToken = await DeviceToken.findOne({
                         userId: superAdminId?._id,
                    });
                    if (existingToken && existingToken.fcmToken) {
                         await sendToTopic({
                              token: existingToken.fcmToken,
                              title: 'New Subscription',
                              body: 'The application has been successfully subscribed and the invoice has been issued and sent via WhatsApp.',
                              data: {
                                   title: superAdminId?.name || 'superAdmin',
                                   receiver: `superAdminId?._id`,
                                   message: 'The application has been successfully subscribed and the invoice has been issued and sent via WhatsApp.',
                                   message_ar: 'تم الاشتراك في التطبيق بنجاح وتم إصدار الفاتورة وإرسالها عبر واتساب.',
                                   message_bn: 'অ্যাপ্লিকেশনটি সফলভাবে সাবস্ক্রাইব করা হয়েছে এবং ইনভয়েস ইস্যু করে হোয়াটসঅ্যাপের মাধ্যমে পাঠানো হয়েছে।',
                                   message_tl: 'Matagumpay na naisubscripe ang application at ang invoice ay naibigay na at ipinadala sa pamamagitan ng WhatsApp.',
                                   message_hi: 'एप्लिकेशन को सफलतापूर्वक सब्सक्राइब कर लिया गया है और इनवॉइस जारी कर व्हाट्सएप के माध्यम से भेज दिया गया है।',
                                   message_ur: 'ایپلیکیشن کو کامیابی کے ساتھ سبسکرائب کر لیا گیا ہے اور انوائس جاری کر کے واٹس ایپ کے ذریعے بھیج دی گئی ہے۔',
                                   type: 'ALERT',
                              },
                         });
                    }
               }
          }

          // create a new recieptNumber
          const recieptNumber = await AutoIncrementService.increaseAutoIncrement('subscription', session);
          subscription.recieptNumber = recieptNumber.value;
          await subscription.save({ session });

          await session.commitTransaction();
          session.endSession();

          await whatsAppHelper.sendWhatsAppTextMessage({
               to: workshop.contact,
               // body: message,
               body: `
                    Thank you... Subscription successful
شكرا لكم ... تم الاشتراك بنجاح
                    `,
          });

          return subscription;
     } catch (error: any) {
          console.log('🚀 ~ createSubscriptionByPackageIdForWorkshop ~ error:', error);
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

     // **

     if (payload.currentPeriodEnd) {
          const oldEndDate = new Date(activeSubscription.currentPeriodEnd);
          const newEndDate = new Date(payload.currentPeriodEnd);

          const extendedDaysCount = Math.round((newEndDate.getTime() - oldEndDate.getTime()) / 86400000);

          const action = extendedDaysCount >= 0 ? 'extended' : 'downgraded';

          await whatsAppHelper.sendWhatsAppTextMessage({
               to: workshop.contact,
               body: `
Your subscription to Senaeya app has been ${action} for ${extendedDaysCount} days.
تم ${action === 'extended' ? 'تمديد' : 'تخفيض'} اشتراككم في تطبيق الصناعية لمدة ${extendedDaysCount} يوم.
    `,
          });
     }

     return updatedSubscription;
};
const cancelSubscriptionToDB = async (workshop: string) => {
     const activeSubscription = await Subscription.findOne({
          workshop: new mongoose.Types.ObjectId(workshop),
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
     const allSubscriptions = await Subscription.find();
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
     let subscription = await Subscription.findById(subscriptionId).populate('workshop');
     if (!subscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
     }
     // generate qr code if it doesn't exist
     if (!subscription.subscription_qr_code) {
          const qrCode = await generateQRFromObject(subscription);
          // Update and get the updated document
          subscription = await Subscription.findByIdAndUpdate(
               subscription._id,
               { subscription_qr_code: qrCode.qrImagePath },
               { new: true }, // This returns the updated document
          );
     }
     return subscription;
};

const mySubscriptionDetailsToDB = async (workshopId: string) => {
     let subscription = await Subscription.findOne({ workshop: new mongoose.Types.ObjectId(workshopId) }).populate('workshop');
     if (!subscription) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
     }
     try {
          // generate qr code if it doesn't exist
          if (!subscription.subscription_qr_code) {
               const qrCode = await generateQRFromObject(subscription);
               // Update and get the updated document
               subscription = await Subscription.findByIdAndUpdate(
                    subscription._id,
                    { subscription_qr_code: qrCode.qrImagePath },
                    { new: true }, // This returns the updated document
               );
          }

          // if (subscription && !subscription.subscriptionInvoiceAwsLink) {
          //      const createsubscriptionDetailsPdfTemplate = await whatsAppTemplate.subscriptionDetailsPdf(subscription as ISubscription as any);
          //      const invoiceInpdfPath = await generatePDF(createsubscriptionDetailsPdfTemplate);
          //      const fileBuffer = fs.readFileSync(invoiceInpdfPath);
          //      const subscriptionInvoiceAwsLink = await S3Helper.uploadBufferToS3(fileBuffer, 'pdf', subscription!._id?.toString(), 'application/pdf');

          //      subscription.subscriptionInvoiceAwsLink = subscriptionInvoiceAwsLink;
          //      await subscription.save();
          // }

          return subscription;
     } catch (error) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to generate subscription details PDF');
     }
};

const deleteSubscriptionById = async (id: string) => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          const subscription = await Subscription.findByIdAndDelete(id, { session });

          if (!subscription) {
               throw new Error('Subscription not found');
          }

          const subscribedWorkshop = await WorkShop.findById(subscription.workshop, null, { session });

          if (subscribedWorkshop) {
               subscribedWorkshop.subscribedPackage = null;
               subscribedWorkshop.subscriptionId = null;
               await subscribedWorkshop.save({ session });
          }

          await session.commitTransaction();
          session.endSession();

          return subscription;
     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
     }
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
     mySubscriptionDetailsToDB,
     deleteSubscriptionById,
};
