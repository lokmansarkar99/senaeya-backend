import { Queue, Worker, Job } from 'bullmq';
import redisClient, { redisConfig } from '../redis';
import { formatDelay } from '../utils/formatDelay';
import { errorLogger } from '../../../shared/logger';
import { Invoice } from '../../../app/modules/invoice/invoice.model';
import { User } from '../../../app/modules/user/user.model';
import { CLIENT_STATUS, CLIENT_TYPE } from '../../../app/modules/client/client.enum';
import { Client } from '../../../app/modules/client/client.model';
import { SpareParts } from '../../../app/modules/spareParts/spareParts.model';
import { buildTranslatedField } from '../../../utils/buildTranslatedField';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';

// Create a reusable connection for BullMQ
export const connection = {
     ...redisConfig,
     maxRetriesPerRequest: null,
     enableReadyCheck: false,
};

// Example queue setup
export const emailQueue = new Queue('emailQueue', {
     connection,
     defaultJobOptions: {
          attempts: 3,
          backoff: {
               type: 'exponential',
               delay: 5000,
          },
          removeOnComplete: {
               age: 24 * 3600, // Keep jobs for 24 hours after completion
               count: 1000, // Keep up to 1000 jobs
          },
          removeOnFail: {
               age: 3 * 24 * 3600, // Keep failed jobs for 3 days
          },
     },
});

// Email worker setup
export const emailWorker = new Worker(
     'emailQueue',
     async (job) => {
          // Process your job here
          console.log('Processing email job:', job.id, job.data);
          // Add your email sending logic here
     },
     {
          connection,
          autorun: true,
     },
);

// WhatsApp Queue
export const whatsAppQueue = new Queue('whatsAppQueue', {
     connection,
     defaultJobOptions: {
          attempts: 3,
          backoff: {
               type: 'exponential',
               delay: 5000,
          },
          removeOnComplete: {
               age: 24 * 3600, // Keep jobs for 24 hours after completion
               count: 1000, // Keep up to 1000 jobs
          },
          removeOnFail: {
               age: 3 * 24 * 3600, // Keep failed jobs for 3 days
          },
     },
});

// WhatsApp worker setup
export const whatsAppWorker = new Worker(
     'whatsAppQueue',
     async (job: Job<{ type: 'text' | 'pdf' | 'admin'; data: any }>) => {
          const { type, data } = job.data;

          try {
               switch (type) {
                    case 'text':
                         return await whatsAppHelper.sendWhatsAppTextMessage(data);
                    case 'pdf':
                         return await whatsAppHelper.sendWhatsAppPDFMessage(data);
                    case 'admin':
                         return await whatsAppHelper.sendWhatsAppForAdmin(data.message, data.adminPhone);
                    default:
                         throw new Error(`Unsupported WhatsApp message type: ${type}`);
               }
          } catch (error) {
               errorLogger.error(`Error processing WhatsApp job ${job.id}:`, error);
               throw error; // Will trigger retry logic
          }
     },
     {
          connection,
          autorun: true,
          concurrency: 5, // Process up to 5 messages concurrently
     },
);

/* // Instead of:
await whatsAppHelper.sendWhatsAppTextMessage({ to: '1234567890', body: 'Hello' });

// Use:
import { whatsAppQueue } from '../helpers/redis/queues';

await whatsAppQueue.add('send-whatsapp-text', {
     type: 'text',
     data: {
          to: '1234567890',
          body: 'Hello',
          // other WhatsApp message options
     },
}); */

// Handle worker events
emailWorker.on('completed', (job) => {
     console.log(`Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
     console.error(`Job ${job?.id} has failed with error:`, err);
});

// Gracefully close queues and workers on shutdown
const shutdown = async () => {
     console.log('Shutting down queues and workers...');

     // Close email queue and worker
     await emailQueue.close();
     await emailWorker.close();

     // Close WhatsApp queue and worker
     await whatsAppQueue.close();
     await whatsAppWorker.close();

     console.log('All queues and workers have been shut down');
     process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Spare Parts Queue
export const sparePartsQueue = new Queue('sparePartsQueue', {
     connection,
     defaultJobOptions: {
          attempts: 3,
          backoff: {
               type: 'exponential',
               delay: 2000,
          },
          removeOnComplete: {
               age: 24 * 3600, // Keep jobs for 24 hours after completion
               count: 5000, // Keep up to 5000 jobs
          },
          removeOnFail: {
               age: 7 * 24 * 3600, // Keep failed jobs for 7 days
          },
     },
});

// Spare Parts Worker
export const sparePartsWorker = new Worker(
     'sparePartsQueue',
     async (job) => {
          const { sparePart } = job.data;

          try {
               // Check if spare part with this code and item already exists
               const existingSparePart = await SpareParts.findOne(
                    {
                         code: sparePart.code.toLowerCase(),
                         itemName: sparePart.itemName,
                    },
                    null,
               );

               if (!existingSparePart) {
                    const title = await buildTranslatedField(sparePart.itemName);
                    const sparePartData = {
                         providerWorkShopId: sparePart.providerWorkShopId,
                         itemName: sparePart.itemName,
                         code: sparePart.code.toLowerCase(),
                         title,
                    };

                    const newSparePart = await SpareParts.create(sparePartData);

                    if (!newSparePart) {
                         throw new Error('Failed to create spare part');
                    }

                    console.log('Successfully processed spare part:', newSparePart._id);
               }
          } catch (error) {
               console.error('Error processing spare part job:', error);
               throw error; // This will trigger the retry mechanism
          }
     },
     {
          connection,
          concurrency: 5, // Process up to 5 jobs in parallel
          autorun: true,
     },
);

// Handle worker events
sparePartsWorker.on('completed', (job, result) => {
     console.log(`Spare parts job ${job.id} completed`, result);
});

sparePartsWorker.on('failed', (job, error) => {
     errorLogger.error(`Spare parts job ${job?.id} failed:`, error);
});
//   attempts: 3, // Override default attempts if needed
// });

/* =================== special queues =================== */

// Create Queue

const redisPubClient = redisClient;
export const scheduleQueue = new Queue('scheduleQueue', {
     connection: redisPubClient.options, // reuse your redis config
});

interface IScheduleJob {
     name: string;
     data: {
          scheduleId?: string; // doctorAppointmentSchedule
          appointmentBookingId?: string; // doctorAppointmentBooking
          invoiceId?: string; // For payment check
          userId?: string; // For payment check
          clientId?: string; // For payment check
     };
     id: string;
}

async function checkAndBlockUser(invoiceId: string, clientId: string) {
     try {
          // Fetch the invoice from your database
          const invoice = await Invoice.findById(invoiceId);

          if (!invoice) {
               console.error(`Invoice ${invoiceId} not found`);
               return;
          }

          // Check if the invoice is still unpaid after 3 days
          if (invoice.paymentStatus !== 'paid') {
               // Block the user if the invoice is unpaid
               await Client.findByIdAndUpdate(clientId, {
                    status: CLIENT_STATUS.BLOCK,
               });

               console.log(`❌ User ${clientId} blocked due to unpaid invoice ${invoiceId}`);

               // Optionally, notify the client about the blocked user
               // await notifyClientAboutBlockedUser(clientId, userId, invoiceId);
          }
     } catch (error) {
          console.error('Error in checkAndBlockUser:', error);
          throw error; // Let BullMQ handle the retry
     }
}

export const startScheduleWorker = () => {
     const worker = new Worker(
          'scheduleQueue',
          async (job: any) => {
               console.log(`Processing job ${job.id} of type ${job.name}⚡${job.data}`);

               if (job.name === 'checkInvoicePaymentStatus') {
                    console.log('🔍 Checking payment status for invoice');
                    const { invoiceId, clientId } = job.data;
                    await checkAndBlockUser(invoiceId, clientId);
               } else {
                    console.log(`❓ Unknown job type: ${job.name}`);
               }
          },
          {
               connection: redisPubClient.options,
          },
     );

     worker.on('completed', (job) => {
          console.log(`✅ Job ${job.id} (${job.name}) completed`);
     });

     worker.on('failed', (job: any, err: any) => {
          console.error(`❌ Job.id ${job?.id} :: ${job.name} failed`, err);
     });
};

export async function addToBullQueueToCheckInvoicePaymentStatus(invoiceId: string, clientId: string, extraTimeForUnpaidPostpaidInvoice: number = 3) {
     const delay = extraTimeForUnpaidPostpaidInvoice * 24 * 60 * 60 * 1000; // 3 days in milliseconds

     // Schedule the job with a 3-day delay
     await scheduleQueue.add('checkInvoicePaymentStatus', { invoiceId, clientId }, { delay });

     console.log(`⏰ Job to check invoice payment status added with a ${extraTimeForUnpaidPostpaidInvoice} day delay for invoice ${invoiceId}`);
}
