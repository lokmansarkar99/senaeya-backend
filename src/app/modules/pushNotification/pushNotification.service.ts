// import { logger } from '../../../shared/logger';
// import { messaging } from './pushNotification.config';

// export const sendToTopic = async ({
//      topic,
//      notification,
//      // data = {},
// }: any) => {
//      const message = {
//           notification: {
//                title: notification.title,
//                body: notification.body,
//           },
//           // data: Object.keys(data).length > 0 ? data : undefined,
//           topic,
//           android: {
//                priority: 'high' as const,
//                notification: {
//                     sound: 'default',
//                     clickAction: 'FLUTTER_NOTIFICATION_CLICK',
//                },
//           },
//           apns: {
//                payload: {
//                     aps: {
//                          sound: 'default',
//                          badge: 1,
//                     },
//                },
//           },
//           webpush: {
//                headers: {
//                     Urgency: 'high',
//                },
//           },
//      };

//      try {
//           const messageId = await messaging.send(message);
//           logger.info('FCM sent successfully', { topic, messageId, notification });

//           return {
//                success: true,
//                messageId,
//                topic,
//                sentAt: new Date().toISOString(),
//           };
//      } catch (error: any) {
//           console.log('🚀 ~ sendToTopic ~ error:', error);
//           logger.error('FCM send failed', {
//                topic,
//                error: error.message,
//                code: error.code,
//           });
//           throw error;
//      }
// };

import { firebaseAdmin } from './pushNotification.config';

export const sendToTopic = async ({ token, title, body, data }: { token: string; title: string; body: string; data?: Record<string, string> }) => {
     if (!token) return;

     await firebaseAdmin.messaging().send({
          token,
          notification: {
               title,
               body,
          },
          data,
     });
};
