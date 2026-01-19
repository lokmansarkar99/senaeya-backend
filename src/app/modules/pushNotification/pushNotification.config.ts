// // import admin from 'firebase-admin';
// // import config from '../../../config';
// // import * as fs from 'fs';
// // import * as path from 'path';

// // // Read the service account file
// // const serviceAccountPath = path.resolve(process.cwd(), config.firebase_service_account!);
// // const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// // if (!admin.apps.length) {
// //   admin.initializeApp({
// //     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
// //   });
// // }

// // export const messaging = admin.messaging();

// import admin from 'firebase-admin';
// import fs from 'fs';
// import path from 'path';
// import config from '../../../config';

// if (!admin.apps.length) {
//      const serviceAccountPath = path.resolve(process.cwd(), config.firebase_service_account!);

//      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

//      admin.initializeApp({
//           credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//      });
// }

// export default admin;

// export const messaging = admin.messaging();

/* ********************* */
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const base64key = config.firebase_service_account_key!;
if (!base64key) {
     throw new AppError(StatusCodes.NOT_FOUND, 'Firebase service account key is not provided in environment variables');
}

// Decode base64-encoded service account JSON
const serviceAccount = JSON.parse(Buffer.from(base64key, 'base64').toString('utf-8'));

if (!admin.apps.length) {
     admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
     });
}

export default admin;

export const messaging = admin.messaging();

interface message {
     notification: {
          title: string;
          body: any;
          data?: any;
     };
     token: string;
}

export const sendPushNotification = async (msg: message) => {
     try {
          const response = await getMessaging().send(msg);
          console.log('Message sent successfully:', response);
          return {
               message: 'Successfully sent the message',
               status: true,
          };
     } catch (error) {
          console.log(error);
          throw new AppError(StatusCodes.EXPECTATION_FAILED, 'Error hapending on the push message');
     }
};
