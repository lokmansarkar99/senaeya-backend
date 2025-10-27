import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import { User } from '../user/user.model';
import DeviceToken from '../DeviceToken/DeviceToken.model';
import { firebaseHelper } from '../../../helpers/firebaseHelper';
import { token } from 'morgan';
import { USER_ROLES } from '../../../enums/user';

const getNotificationFromDB = catchAsync(async (req: Request, res: Response) => {
     const user: any = req.user;
     const result = await NotificationService.getNotificationFromDB(user);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notifications Retrieved Successfully',
          data: result,
     });
});

const adminNotificationFromDB = catchAsync(async (req: Request, res: Response) => {
     const result = await NotificationService.adminNotificationFromDB();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notifications Retrieved Successfully',
          data: result,
     });
});

const readNotification = catchAsync(async (req: Request, res: Response) => {
     const user: any = req.user;
     const result = await NotificationService.readNotificationToDB(user);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});

const adminReadNotification = catchAsync(async (req: Request, res: Response) => {
     const result = await NotificationService.adminReadNotificationToDB();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});
// send admin notifications to the users accaunts
const sendAdminPushNotification = catchAsync(async (req, res) => {
     const result = await NotificationService.adminSendNotificationFromDB(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Send Successfully',
          data: result,
     });
});

const pushNotificationToUser = catchAsync(async (req: Request, res: Response) => {
     //specific user obly notify
     const usersToNotify = await User.find({
          isVerified: true,
          _id: { $ne: (req.user as any)?.id },
          role: req.body.role ? req.body.role : { $in: [USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CLIENT] },
     }).select('_id');

     const userIds = usersToNotify.map((user) => user._id.toString());

     const fcmTokens = await DeviceToken.find({
          userId: { $in: userIds },
          fcmToken: { $exists: true, $ne: '' },
     }).select('fcmToken userId');

     // Compose message
     const pushPayload = {
          notification: {
               title: `${req.body.title}`,
               body: req.body.message,
          },
          data: {
               type: req.body.type,
               title: req.body.title,
               message: req.body.message,
               referenceModel: req.body.referenceModel,
               reference: req.body.reference,
          },
     };

     for (const token of fcmTokens) {
          try {
               firebaseHelper.sendPushNotification({
                    ...pushPayload,
                    token: token.fcmToken,
               });
          } catch (err: any) {
               console.error(`❌ Push failed to ${token.fcmToken}:`, err);

               // Remove invalid tokens automatically
               if (err.code === 'messaging/registration-token-not-registered' || err.code === 'messaging/mismatched-credential') {
                    await DeviceToken.deleteOne({ fcmToken: token.fcmToken });
                    console.log(`🗑️ Removed invalid token: ${token.fcmToken}`);
               }
          }
     }
});

export const NotificationController = {
     adminNotificationFromDB,
     getNotificationFromDB,
     readNotification,
     adminReadNotification,
     sendAdminPushNotification,
     pushNotificationToUser,
};
