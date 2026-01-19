// import admin from 'firebase-admin';
// import config from '../../../config';
// import * as fs from 'fs';
// import * as path from 'path';

// // Read the service account file
// const serviceAccountPath = path.resolve(process.cwd(), config.firebase_service_account!);
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//   });
// }

// export const messaging = admin.messaging();

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import config from '../../../config';

if (!admin.apps.length) {
     const serviceAccountPath = path.resolve(process.cwd(), config.firebase_service_account!);

     const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

     admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
     });
}

export default admin;

export const messaging = admin.messaging();
