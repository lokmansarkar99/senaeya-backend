import chalk from 'chalk';
import figlet from 'figlet';
import cron from 'node-cron';
import { Coupon } from '../app/modules/coupon/coupon.model';
import { Invoice } from '../app/modules/invoice/invoice.model';
import { PaymentStatus } from '../app/modules/payment/payment.enum';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { WorkShop } from '../app/modules/workShop/workShop.model';
import { sendNotifications } from '../helpers/notificationsHelper';
import { whatsAppHelper } from '../helpers/whatsAppHelper';
import { whatsAppTemplate } from '../shared/whatsAppTemplate';
// ====== CRON JOB SCHEDULERS ======
const scheduleTrialWarningCheck = () => {
     // Run every 5 days at 9:00 AM '0 9 */5 * *'
     cron.schedule('0 9 */5 * *', async () => {
          try {
               console.log('🔔 Checking for subscriptions expiring in 5 days...');

               const fiveDaysLater = new Date();
               fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
               fiveDaysLater.setHours(23, 59, 59, 999); // End of the 5th day

               const today = new Date();
               today.setHours(23, 59, 59, 999); // End of today

               // Find users whose subscription expires in exactly 5 days
               const subscriptionsExpiringInFiveDays = await Subscription.find({
                    currentPeriodEnd: {
                         $gte: fiveDaysLater,
                         $lt: fiveDaysLater.setDate(fiveDaysLater.getDate() + 1), // 5th day at midnight
                    },
               })
                    .select('workshop')
                    .populate({
                         path: 'workshop',
                         select: 'ownerId workshopNameEnglish',
                         populate: {
                              path: 'ownerId',
                              select: 'contact _id',
                         },
                    });

               console.log(`📧 Found ${subscriptionsExpiringInFiveDays.length} subscriptions expiring in 5 days`);
               if (subscriptionsExpiringInFiveDays.length > 0) {
                    subscriptionsExpiringInFiveDays.forEach(async (subscription) => {
                         const message = `Sorry, there are 5 days left until the subscription expires.`;
                         await whatsAppHelper.sendWhatsAppTextMessage({ to: (subscription.workshop as any).ownerId.contact, body: message });

                         await sendNotifications({
                              title: `${(subscription.workshop as any)?.workshopNameEnglish}`,
                              receiver: (subscription.workshop as any).ownerId._id,
                              message: `Sorry... 5 days left until the subscription expires`,
                              message_ar: `عفوا ... بقي 5 أيام على انتهاء الاشتراك`,
                              message_bn: `দুঃখিত... সাবস্ক্রিপশনের মেয়াদ শেষ হতে আর ৫ দিন বাকি।`,
                              message_tl: `Pasensya na... 5 araw na lang bago matapos ang subscription`,
                              message_hi: `क्षमा करें... सदस्यता समाप्त होने में केवल 5 दिन शेष हैं।`,
                              message_ur: `معذرت... سبسکرپشن ختم ہونے میں 5 دن باقی ہیں۔`,
                              type: 'ALERT',
                         });
                    });
                    console.log('✅ Subscription warning WhatsApp messages sent');
               }
          } catch (error) {
               console.error('❌ Error in subscription warning check:', error);
          }
     });
};

// 2. Check for expired trials every hour
const scheduleTrialExpiryCheck = () => {
     // Run every hour '0 * * * *'
     cron.schedule('*/1 * * * *', async () => {
          try {
               console.log('⏰ Checking for expired free trials...');

               const now = new Date();

               // Find users whose trial has expired
               const expiredSubscriptions = await Subscription.find({
                    // isFreeTrial: true,
                    // trialExpireAt: { $lt: now },
                    currentPeriodEnd: { $lt: now },
               });

               if (expiredSubscriptions.length > 0) {
                    console.log(`🚫 Found ${expiredSubscriptions.length} expired trial users`);

                    // Update expired users
                    const updateResult = await Subscription.updateMany(
                         {
                              // isFreeTrial: true,
                              // trialExpireAt: { $lt: now },
                              currentPeriodEnd: { $lt: now },
                         },
                         {
                              $set: {
                                   status: 'expired',
                              },
                              $inc: { tokenVersion: 1 },
                         },
                    );

                    // nullify the subscriptionId of the expired users
                    await WorkShop.updateMany(
                         {
                              subscriptionId: { $in: expiredSubscriptions.map((subscription) => subscription._id) },
                         },
                         {
                              $set: {
                                   subscriptionId: null,
                              },
                         },
                    );

                    console.log(`✅ Updated ${updateResult.modifiedCount} expired users`);
               } else {
                    console.log('✅ No expired trials found');
               }
          } catch (error) {
               console.error('❌ Error in trial expiry check:', error);
          }
     });
};

// 3. warn unpaid-due invoices' clients "You have an overdue invoice for (workshop name shown on invoice). Please pay the invoice within 3 days, so that your name is not placed on the defaulters list."
const scheduleInvoiceWarningCheck = () => {
     // Run every 3 days at 9:00 AM '0 9 */3 * *'
     cron.schedule('0 9 */3 * *', async () => {
          try {
               console.log('⏰ Checking for unpaid invoices...');

               const now = new Date();

               // Find users whose postpaid invoices are unpaid and overdue
               const expiredPostpaidInvoices = await Invoice.find({
                    paymentType: 'postpaid',
                    paymentStatus: PaymentStatus.UNPAID,
                    postPaymentDate: { $lt: now },
               })
                    .select('client providerWorkShopId')
                    .populate('client', 'contact')
                    .populate('providerWorkShopId', 'workshopNameEnglish workshopNameArabic');

               if (expiredPostpaidInvoices.length > 0) {
                    expiredPostpaidInvoices.forEach(async (invoice) => {
                         const message = whatsAppTemplate.scheduleInvoiceWarningMessage({
                              workshopNameEnglish: (invoice.providerWorkShopId as any).workshopNameEnglish,
                              workshopNameArabic: (invoice.providerWorkShopId as any).workshopNameArabic,
                         });
                         await whatsAppHelper.sendWhatsAppTextMessage({ to: (invoice.client as any).contact, body: message });
                    });
               } else {
                    console.log('✅ No unpaid invoices found');
               }
          } catch (error) {
               console.error('❌ Error in invoice warning check:', error);
          }
     });
};

// 4. warn unpaid-due invoices' clients "You have an overdue invoice for (workshop name shown on invoice). Please pay the invoice within 3 days, so that your name is not placed on the defaulters list."
const scheduleCouponExpire = () => {
     // Run every 3 days at 9:00 AM '0 9 */3 * *'
     cron.schedule('0 9 */3 * *', async () => {
          try {
               console.log('⏰ Checking for expired coupons...');

               const now = new Date();

               // updatemany
               await Coupon.updateMany(
                    {
                         endDate: { $lt: now },
                    },
                    {
                         $set: {
                              status: 'expired',
                              isActive: false,
                         },
                         $inc: { tokenVersion: 1 },
                    },
               );
          } catch (error) {
               console.error('❌ Error in coupon expire check:', error);
          }
     });
};

// ASCII Art Title
figlet('Senaeya', (err, data) => {
     if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
     }

     // Print the title with color
     console.log(chalk.green(data));

     // Print version info and system details with color
     console.log(chalk.cyan('VERSION INFO:'));
     console.log(chalk.yellow('Template: 1.0'));
     console.log(chalk.magenta('Node.js: v20.11.1'));
     console.log(chalk.blue('OS: windows'));
});
const setupTimeManagement = () => {
     console.log('🚀 Setting up trial management cron jobs...');
     // Start all cron jobs
     scheduleTrialExpiryCheck(); // Every hour
     scheduleTrialWarningCheck(); // Daily at 9 AM
     scheduleInvoiceWarningCheck(); // Daily at 9 AM
     scheduleCouponExpire(); // Daily at 9 AM
};
export default setupTimeManagement;
