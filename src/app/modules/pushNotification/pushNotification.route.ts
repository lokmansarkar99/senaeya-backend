// import express from 'express';
// import { PushNotificationControllers } from './pushNotification.config';
// import { PushNotificationZodSchema } from './pushNotification.validation';
// import validateRequest from '../../middleware/validateRequest';

// const router = express.Router();

// router.post(
//   '/send',validateRequest(PushNotificationZodSchema),
//   PushNotificationControllers.sendPushNotificationController,
// );

// export const PushNotificationRoutes = router;

import express from 'express';
import { PushNotificationControllers } from './pushNotification.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { PushNotificationZodSchema } from './pushNotification.validation';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.post('/send', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(PushNotificationZodSchema), PushNotificationControllers.sendPushNotificationController);

export const PushNotificationRoutes = router;
