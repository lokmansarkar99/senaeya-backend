import cron from 'node-cron';
import figlet from 'figlet';
import chalk from 'chalk';
import { Subscription } from '../app/modules/subscription/subscription.model';
// ====== CRON JOB SCHEDULERS ======
// 1. Check for users expiring in 24 hours (send warning email)
const scheduleTrialWarningCheck = () => {
     // Run every day at 9:00 AM '0 9 * * *'
     cron.schedule('*/1 * * * *', async () => {
          try {
               console.log('🔔 Checking for trials expiring in 24 hours...');

               const tomorrow = new Date();
               tomorrow.setDate(tomorrow.getDate() + 1);
               tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

               const today = new Date();
               today.setHours(23, 59, 59, 999); // End of today

               // Find users whose trial expires tomorrow
               const subscriptionsExpiringTomorrow = await Subscription.countDocuments({
                    // isFreeTrial: true,
                    // hasAccess: true,
                    currentPeriodEnd: {
                         $gte: today,
                         $lte: tomorrow,
                    },
               });

               console.log(`📧 Found ${subscriptionsExpiringTomorrow} users expiring tomorrow`);
               console.log('✅ Trial warning emails sent');
          } catch (error) {
               console.error('❌ Error in trial warning check:', error);
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
               const expiredUsers = await Subscription.find({
                    // isFreeTrial: true,
                    // trialExpireAt: { $lt: now },
                    currentPeriodEnd: { $lt: now },
               });

               if (expiredUsers.length > 0) {
                    console.log(`🚫 Found ${expiredUsers.length} expired trial users`);

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

                    console.log(`✅ Updated ${updateResult.modifiedCount} expired users`);
               } else {
                    console.log('✅ No expired trials found');
               }
          } catch (error) {
               console.error('❌ Error in trial expiry check:', error);
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
};
export default setupTimeManagement;
