import * as admin from 'firebase-admin';
import { credential } from 'firebase-admin';
 
 
const serviceAccount = require('../../deliverly-launch-firebase-adminsdk-fbsvc-d418593ff7.json');
// const serviceAccount = require('../../deliverly-4811e-firebase-adminsdk-fbsvc-00237f3c12.json');  
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: credential.cert(serviceAccount),
  });
} else {
  admin.app();
}
 
export default admin;

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
 
    const { mobileNumber, fcmToken, deviceId, deviceType = 'android' } = req.body;
 
    if (!mobileNumber) {
      throw new AppError("Mobile number is required", 400);
    }
 
    if (fcmToken && !deviceId) {
      throw new AppError('deviceId is required when providing fcmToken', 400);
    }
 
    let formattedNumber: string;
    try {
      formattedNumber = formatPhoneNumber(mobileNumber);
    } catch (formatError: any) {
      console.error('Phone formatting error:', formatError.message);
      throw new AppError(`Invalid phone number: ${formatError.message}`, 400);
    }
 
    const existingUser = await User.findOne({ mobileNumber: formattedNumber });
    if (!existingUser) {
      throw new AppError("user account was not found. To continue, please create an account:", 404);
    }
    console.log('User found:', existingUser._id);
 
    // Send OTP via Twilio
    console.log('Attempting to send OTP...');
    await sendTwilioOTP(formattedNumber);
    console.log('OTP sent successfully');
 
 
    if (fcmToken && deviceId) {
      const existingToken = await DeviceToken.findOne({
        userId: existingUser._id,
        deviceId: deviceId
      });
 
      if (existingToken) {
        existingToken.fcmToken = fcmToken;
        existingToken.deviceType = deviceType;
        await existingToken.save();
        console.log(`Updated FCM token for user ${existingUser._id}, device ${deviceId}`);
      } else {
        await DeviceToken.create({
          userId: existingUser._id,
          fcmToken,
          deviceId,
          deviceType
        });
        console.log(`Created new FCM token for user ${existingUser._id}, device ${deviceId}`);
      }
    }
 
 
    console.log('About to send success response...');
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully. Please verify to complete login.",
      userId: existingUser._id
    });
    console.log('Success response sent');
    // console.log('================');
  } catch (error) {
    // console.error('=== LOGIN ERROR ===');
    // console.error('Error in login:', error);
    // console.error('================');
    next(error);
  }
};
 
export const createParcelRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      pickupLocation,
      deliveryLocation,
      deliveryStartTime,
      deliveryEndTime,
      senderType,
      deliveryType,
      price,
      name,
      phoneNumber,
      title,
      description,
    } = req.body;
 
    const parcelsDir = path.join(process.cwd(), 'uploads', 'parcels');
    if (!fs.existsSync(parcelsDir)) {
      fs.mkdirSync(parcelsDir, { recursive: true });
    }
 
    let images: string[] = [];
    if (req.files && typeof req.files === 'object') {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.image && Array.isArray(files.image)) {
        images = files.image.map((file: Express.Multer.File) => `/uploads/image/${file.filename}`);
      }
    }
 
    const pickupCoordinates = await getCoordinates(pickupLocation);
    const deliveryCoordinates = await getCoordinates(deliveryLocation);
 
    const parcel = await ParcelRequest.create({
      senderId: req.user?.id,
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupCoordinates.longitude, pickupCoordinates.latitude],
      },
      deliveryLocation: {
        type: 'Point',
        coordinates: [deliveryCoordinates.longitude, deliveryCoordinates.latitude],
      },
      deliveryStartTime,
      deliveryEndTime,
      senderType,
      deliveryType,
      price,
      title,
      description,
      images,
      name,
      phoneNumber,
      status: 'PENDING',
    });
 
    // Update sender's record
    await User.findByIdAndUpdate(req.user?.id, {
      $push: {
        SendOrders: {
          parcelId: parcel._id,
          type: 'send_parcel',
          pickupLocation,
          deliveryLocation,
          price,
          title,
          phoneNumber,
          description,
          senderType,
          deliveryType,
          deliveryStartTime,
          deliveryEndTime,
        },
      },
      $inc: { totalSentParcels: 1, totalOrders: 1 },
    });
 
    // Get sender info
    const sender = await User.findById(req.user?.id).select('fullName');
    if (!sender) throw new Error('Sender not found');
 
    //specific user obly notify
    const usersToNotify = await User.find({
      isVerified: true,
      _id: { $ne: req.user?.id },
      notificationStatus: true
    }).select('_id');
 
    const userIds = usersToNotify.map(user => user._id.toString());
 
    const fcmTokens = await DeviceToken.find({
      userId: { $in: userIds },
      fcmToken: { $exists: true, $ne: '' }
    }).select('fcmToken userId');
 
    // Compose message
    const notificationMessage = `A new parcel "${title}" created by "${sender.fullName}".`;
    const pushPayload = {
      notification: {
        title: `${parcel.title}`,
        body: notificationMessage,
      },
      data: {
        type: 'send_parcel',
        title,
        message: notificationMessage,
        parcelId: parcel._id.toString(),
        price: String(price),
        description: description || '',
        phoneNumber: phoneNumber || '',
        deliveryStartTime,
        deliveryEndTime,
      },
    };
 
 
    for (const token of fcmTokens) {
      try {
        await admin.messaging().send({
          ...pushPayload,
          token: token.fcmToken,
        });
        console.log(`✅ Sent push to ${token.fcmToken}`);
      } catch (err: any) {
        console.error(`❌ Push failed to ${token.fcmToken}:`, err);
 
        // Remove invalid tokens automatically
        if (
          err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/mismatched-credential'
        ) {
          await DeviceToken.deleteOne({ fcmToken: token.fcmToken });
          console.log(`🗑️ Removed invalid token: ${token.fcmToken}`);
        }
      }
    }
 
 
    for (const userId of userIds) {
      try {
        await Notification.create({
          userId: new mongoose.Types.ObjectId(userId),
          message: notificationMessage,
          type: 'send_parcel',
          title,
          parcelId: parcel._id,
          price,
          phoneNumber,
          description,
          deliveryStartTime,
          deliveryEndTime,
          pickupLocation: {
            latitude: pickupCoordinates.latitude,
            longitude: pickupCoordinates.longitude,
          },
          deliveryLocation: {
            latitude: deliveryCoordinates.latitude,
            longitude: deliveryCoordinates.longitude,
          },
          isRead: false,
          createdAt: new Date(),
          localCreatedAt: moment().tz('Asia/Dhaka').format('YYYY-MM-DD hh:mm A')
        });
      } catch (err) {
        console.error('Error saving notification for user:', userId, err);
      }
    }
 
    console.log(`🔔 Notifications sent to ${userIds.length} users`);
 
    const fullParcel = await ParcelRequest.findById(parcel._id)
      .populate('senderId', 'fullName email mobileNumber name phoneNumber profileImage')
 
 
    res.status(201).json({
      status: 'success',
      data: fullParcel,
    });
  } catch (error) {
    console.error('❌ Error in createParcelRequest:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create parcel request',
    });
    return;
  }
};
 