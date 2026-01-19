import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { sendToTopic } from './pushNotification.service';


const sendPushNotificationController = catchAsync(async (req, res) => {
  

  const { topic, title, body } = req.body;

  const result = await sendToTopic({
    topic,
    notification: { title, body },
    // data,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Push notification sent successfully',
    data: result,
  });
});

export const PushNotificationControllers = {
  sendPushNotificationController,
};