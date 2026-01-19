import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { whatsAppHelper } from '../../../helpers/whatsAppHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { whatsAppTemplate } from '../../../shared/whatsAppTemplate';
import { IAuthResetPassword, IChangePassword, ILoginData, IVerifyEmail } from '../../../types/auth';
import { createToken } from '../../../utils/createToken';
import cryptoToken from '../../../utils/cryptoToken';
import generateOTP from '../../../utils/generateOTP';
import { verifyToken } from '../../../utils/verifyToken';
import DeviceToken from '../DeviceToken/DeviceToken.model';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { workShopService } from '../workShop/workShop.service';
import { WorkShop } from '../workShop/workShop.model';
import { MAX_FREE_INVOICE_COUNT } from '../workShop/workshop.enum';
import { Rule } from '../rule/rule.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { sendToTopic } from '../pushNotification/pushNotification.service';

//login
const loginUserFromDB = async (payload: ILoginData) => {
     const { contact, password, fcmToken, deviceId, deviceType = 'android', role } = payload;
     if (fcmToken && !deviceId) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'deviceId is required when providing fcmToken');
     }

     const isExistUser = await User.findOne({ contact }).select('+password');
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     if (role && role !== USER_ROLES.WORKSHOP_OWNER && role !== USER_ROLES.WORKSHOP_MEMBER) {
          if (isExistUser.role !== role) {
               throw new AppError(StatusCodes.BAD_REQUEST, `you are not authorised`);
          }
     }

     let info = {};

     if (fcmToken && deviceId) {
          const existingToken = await DeviceToken.findOne({
               userId: isExistUser._id,
          });

          if (existingToken) {
               if (existingToken.deviceId !== deviceId) {
                    const info = {
                         title: `Device Changed`,
                         receiver: isExistUser._id,
                         message: `Updated FCM token for user ${isExistUser._id}, presentDevice ${deviceId} | oldDevice ${existingToken.deviceId}`,
                         type: 'ALERT',
                         presentDevice: deviceId,
                         oldDevice: existingToken.deviceId,
                    };

                    existingToken.deviceId = deviceId;
                    deviceType && (existingToken.deviceType = deviceType);
                    // use socket to emit event
                    //@ts-ignore
                    const socketIo = global.io;
                    socketIo.emit(`notification::${isExistUser._id}`, info);
               }

               existingToken.fcmToken = fcmToken;
               deviceType && (existingToken.deviceType = deviceType);
               await existingToken.save();
               console.log(`Updated FCM token for user ${isExistUser._id}, device ${deviceId}`);
          } else {
               await DeviceToken.create({
                    userId: isExistUser._id,
                    fcmToken,
                    deviceId,
                    deviceType,
               });
               console.log(`Created new FCM token for user ${isExistUser._id}, device ${deviceId}`);
          }
     }

     // Handle OAuth users (they don't have passwords)
     if (isExistUser.oauthProvider) {
          throw new AppError(StatusCodes.BAD_REQUEST, `This account was created using ${isExistUser.oauthProvider}. Please use the ${isExistUser.oauthProvider} login option.`);
     }

     if (!password) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required!');
     }

     //check user status
     if (isExistUser?.status === 'blocked') {
          throw new AppError(StatusCodes.BAD_REQUEST, 'You do not have permission to access this content. It looks like your account has been blocked.');
     }

     //check match password
     if (!(await User.isMatchPassword(password, isExistUser.password || ''))) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
     }
     const jwtData: any = { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email || '', contact: isExistUser.contact, deviceId: deviceId || '' };
     let workshops;
     if (isExistUser.role === USER_ROLES.WORKSHOP_MEMBER || isExistUser.role === USER_ROLES.WORKSHOP_OWNER) {
          const userWorkShops = await workShopService.getAllWorkShops({ ownerId: isExistUser._id, fields: '_id,workshopNameEnglish' });
          if (userWorkShops.result.length > 0) {
               const workShopsIds = userWorkShops.result.map((workShop) => workShop._id!.toString());
               jwtData.workShops = workShopsIds;
               workshops = userWorkShops.result;
          }
     }
     //create token
     const accessToken = jwtHelper.createToken(jwtData, config.jwt.jwt_secret as Secret, config.jwt.jwt_expire_in as string);
     const refreshToken = jwtHelper.createToken(jwtData, config.jwt.jwt_refresh_secret as string, config.jwt.jwt_refresh_expire_in as string);

     return { accessToken, refreshToken, workshops, role: isExistUser.role, userId: isExistUser._id };
};

const loginUserWithFingerPrint = async (payload: ILoginData) => {
     const { fingerPrintId, fcmToken, deviceId, deviceType = 'android', role } = payload;

     const isExistUser = await User.findOne({ fingerPrintId });
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     if (role && role !== USER_ROLES.WORKSHOP_OWNER && role !== USER_ROLES.WORKSHOP_MEMBER) {
          if (isExistUser.role !== role) {
               throw new AppError(StatusCodes.BAD_REQUEST, `you are not authorised`);
          }
     }

     //check user status
     if (isExistUser?.status === 'blocked') {
          throw new AppError(StatusCodes.BAD_REQUEST, 'You do not have permission to access this content. It looks like your account has been blocked.');
     }

     let info = {};

     if (fcmToken && deviceId) {
          const existingToken = await DeviceToken.findOne({
               userId: isExistUser._id,
          });

          if (existingToken) {
               if (existingToken.deviceId !== deviceId && existingToken.deviceType !== deviceType) {
                    info = {
                         message: `Updated FCM token for user ${isExistUser._id}, device ${deviceId}`,
                         oldDeviceId: existingToken.deviceId,
                         presentDeviceId: deviceId,
                    };

                    existingToken.deviceId = deviceId;
                    existingToken.deviceType = deviceType;
                    // use socket to emit event
                    //@ts-ignore
                    const socketIo = global.io;
                    socketIo.emit(`notification::${isExistUser._id}`, info);
               }

               existingToken.fcmToken = fcmToken;
               existingToken.deviceType = deviceType;
               await existingToken.save();
               console.log(`Updated FCM token for user ${isExistUser._id}, device ${deviceId}`);
          } else {
               await DeviceToken.create({
                    userId: isExistUser._id,
                    fcmToken,
                    deviceId,
                    deviceType,
               });
               console.log(`Created new FCM token for user ${isExistUser._id}, device ${deviceId}`);
          }
     }

     const jwtData = { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email || '', contact: isExistUser.contact, deviceId: deviceId || '' };
     //create token
     const accessToken = jwtHelper.createToken(jwtData, config.jwt.jwt_secret as Secret, config.jwt.jwt_expire_in as string);
     const refreshToken = jwtHelper.createToken(jwtData, config.jwt.jwt_refresh_secret as string, config.jwt.jwt_refresh_expire_in as string);
     let workshops;
     if (isExistUser.role === USER_ROLES.WORKSHOP_MEMBER || isExistUser.role === USER_ROLES.WORKSHOP_OWNER) {
          const userWorkShops = await workShopService.getAllWorkShops({ ownerId: isExistUser._id, fields: '_id,workshopNameEnglish' });
          if (userWorkShops.result.length > 0) {
               workshops = userWorkShops.result;
          }
     }
     return { accessToken, refreshToken, workshops, role: isExistUser.role, userId: isExistUser._id };
};

//forget password
const forgetPasswordToDB = async (contact: string) => {
     const isExistUser = await User.findOne({ contact }).select('+password');
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     const newPassword = generateOTP(8).toString();
     isExistUser.password = newPassword;
     await isExistUser.save();

     //send message
     const values = { name: isExistUser.name!, password: newPassword, contact: isExistUser.contact };
     const message = whatsAppTemplate.forgetPassword(values);
     await whatsAppHelper.sendWhatsAppTextMessage({ to: contact, body: message });
};
// resend otp
const resendOtpFromDb = async (email: string) => {
     // Check if the user exists
     const isExistUser = await User.isExistUserByEmail(email);
     if (!isExistUser || !isExistUser._id) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     // send email
     const otp = generateOTP(4);
     const values = { name: isExistUser.name, otp: otp, email: isExistUser.email! };
     const createAccountTemplate = emailTemplate.createAccount(values);
     emailHelper.sendEmail(createAccountTemplate);

     //save to DB
     const authentication = { oneTimeCode: otp, expireAt: new Date(Date.now() + 3 * 60000) };
     await User.findOneAndUpdate({ _id: isExistUser._id }, { $set: { authentication } });
};
//forget password by email url
const forgetPasswordByUrlToDB = async (email: string) => {
     // Check if the user exists
     const isExistUser = await User.isExistUserByEmail(email);
     if (!isExistUser || !isExistUser._id) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     // Check if the user is blocked
     if (isExistUser.status === 'blocked') {
          throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked!');
     }

     // Generate JWT token for password reset valid for 10 minutes
     const jwtPayload = { id: isExistUser._id, email: isExistUser.email, role: isExistUser.role };
     const resetToken = createToken(jwtPayload, config.jwt.jwt_secret as string, config.reset_pass_expire_time as string);

     // Construct password reset URL
     const resetUrl = `${config.frontend_url}/auth/login/set_password?email=${isExistUser.email}&token=${resetToken}`;

     // Prepare email template
     const forgetPasswordEmail = emailTemplate.resetPasswordByUrl({ email: isExistUser.email, resetUrl });

     // Send reset email
     await emailHelper.sendEmail(forgetPasswordEmail);
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
     const { email, oneTimeCode } = payload;
     const isExistUser = await User.findOne({ email }).select('+authentication');
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     if (!oneTimeCode) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Please give the otp, check your email we send a code');
     }

     if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
     }

     const date = new Date();
     if (date > isExistUser.authentication?.expireAt) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
     }

     let message;
     let verifyToken;
     let accessToken;
     let user;
     if (!isExistUser.verified) {
          await User.findOneAndUpdate({ _id: isExistUser._id }, { verified: true, authentication: { oneTimeCode: null, expireAt: null } });
          //create token
          accessToken = jwtHelper.createToken(
               { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email || '', contact: isExistUser.contact || '' },
               config.jwt.jwt_secret as Secret,
               config.jwt.jwt_expire_in as string,
          );
          message = 'Email verify successfully';
          user = await User.findById(isExistUser._id);
     } else {
          await User.findOneAndUpdate({ _id: isExistUser._id }, { authentication: { isResetPassword: true, oneTimeCode: null, expireAt: null } });

          //create token ;
          const createToken = cryptoToken();
          await ResetToken.create({ user: isExistUser._id, token: createToken, expireAt: new Date(Date.now() + 5 * 60000) });
          message = 'Verification Successful: Please securely store and utilize this code for reset password';
          verifyToken = createToken;
     }
     return { verifyToken, message, accessToken, user };
};

//reset password
const resetPasswordToDB = async (token: string, payload: IAuthResetPassword) => {
     const { newPassword, confirmPassword } = payload;
     //isExist token
     const isExistToken = await ResetToken.isExistToken(token);
     if (!isExistToken) {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
     }

     //user permission check
     const isExistUser = await User.findById(isExistToken.user).select('+authentication');
     if (!isExistUser?.authentication?.isResetPassword) {
          throw new AppError(StatusCodes.UNAUTHORIZED, "You don't have permission to change the password. Please click again to 'Forgot Password'");
     }

     //validity check
     const isValid = await ResetToken.isExpireToken(token);
     if (!isValid) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Token expired, Please click again to the forget password');
     }

     //check password
     if (newPassword !== confirmPassword) {
          throw new AppError(StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
     }

     const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

     const updateData = { password: hashPassword, authentication: { isResetPassword: false } };

     await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, { new: true });
};
// reset password by url
const resetPasswordByUrl = async (token: string, payload: IAuthResetPassword) => {
     const { newPassword, confirmPassword } = payload;
     let decodedToken;
     try {
          decodedToken = await verifyToken(token, config.jwt.jwt_secret as Secret);
     } catch (error) {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
     }
     const { id } = decodedToken;
     // Check if user exists
     const user = await User.findById(id);
     if (!user) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'User not found.');
     }

     // Check if passwords match
     if (newPassword !== confirmPassword) {
          throw new AppError(StatusCodes.BAD_REQUEST, "New password and Confirm password don't match!");
     }

     // Hash New Password
     const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

     // Update Password
     await User.findByIdAndUpdate(id, { password: hashPassword, authentication: { isResetPassword: false } }, { new: true, runValidators: true });

     // Return Success Response
     return { message: 'Password reset successful. You can now log in with your new password.' };
};

const changePasswordToDB = async (user: JwtPayload, payload: IChangePassword) => {
     const { currentPassword, newPassword, confirmPassword } = payload;
     const isExistUser = await User.findById(user.id).select('+password');
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     //current password match
     if (currentPassword && !(await User.isMatchPassword(currentPassword, isExistUser.password || ''))) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
     }

     //newPassword and current password
     if (currentPassword === newPassword) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Please give different password from current password');
     }
     //new password and confirm password check
     if (newPassword !== confirmPassword) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
     }

     //hash password
     const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

     const updateData = { password: hashPassword };
     const result = await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
     return result;
};
// Refresh token
const refreshToken = async (token: string) => {
     if (!token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Token not found');
     }

     const decoded = verifyToken(token, config.jwt.jwt_refresh_expire_in as string);

     const { id } = decoded;

     const activeUser = await User.findById(id);
     if (!activeUser) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     if (activeUser.status !== 'active') {
          throw new AppError(StatusCodes.FORBIDDEN, 'User account is inactive');
     }
     if (!activeUser.verified) {
          throw new AppError(StatusCodes.FORBIDDEN, 'User account is not verified');
     }
     if (activeUser.isDeleted) {
          throw new AppError(StatusCodes.FORBIDDEN, 'User account is deleted');
     }

     const jwtPayload = {
          id: activeUser?._id?.toString() as string,
          role: activeUser?.role,
          email: activeUser.email || '',
          contact: activeUser.contact || '',
     };

     const accessToken = jwtHelper.createToken(jwtPayload, config.jwt.jwt_secret as Secret, config.jwt.jwt_expire_in as string);

     return { accessToken };
};

const checkUserAuthority = async (providerWorkShopId: string) => {
     const workShop = await WorkShop.findById(providerWorkShopId).select('ownerId helperUserId subscribedPackage generatedInvoiceCount subscriptionId').populate('subscriptionId');
     // console.log('🚀 ~ checkUserAuthority ~ workShop:', workShop);
     if (!workShop) {
          throw new Error('Workshop not found');
     }

     if (!workShop.subscribedPackage) {
          let maxFreeInvoiceCount;
          const workShopRules = await Rule.findOne({ valuesTypes: 'allowedInvoicesCountForFreeUsers' }).select('value');
          console.log('🚀 ~ checkUserAuthority ~ workShopRules:', workShopRules);
          if (!workShopRules || !workShopRules.value) {
               throw new Error('Free invoice limit exceeded. Please subscribe to continue.');
          }
          maxFreeInvoiceCount = workShopRules.value;
          if (workShop.generatedInvoiceCount >= maxFreeInvoiceCount) {
               throw new Error('Free invoice limit exceeded. Please subscribe to continue.');
          }
     } else if (workShop.subscribedPackage && workShop.subscriptionId && (workShop as any).subscriptionId.status === 'active') {
          const currentDate = new Date();
          const currentPeriodEnd = new Date((workShop as any).subscriptionId.currentPeriodEnd);

          if (currentDate >= currentPeriodEnd) {
               await sendNotifications({
                    title: `${(workShop as any)?.workshopNameEnglish}`,
                    receiver: (workShop as any).ownerId._id,
                    message: `Your app subscription has expired ... Please renew your subscription to continue service`,
                    message_ar: `انتهى اشتراك التطبيق .. نرجو منكم تجديد الاشتراك لاستمرار الخدمة`,
                    message_bn: `আপনার অ্যাপ সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে... পরিষেবা চালিয়ে যেতে অনুগ্রহ করে আপনার সাবস্ক্রিপশন পুনর্নবীকরণ করুন।`,
                    message_tl: `Nag-expire na ang subscription mo sa app... Paki-renew ang subscription mo para maipagpatuloy ang serbisyo.`,
                    message_hi: `आपकी ऐप सदस्यता समाप्त हो गई है... सेवा जारी रखने के लिए कृपया अपनी सदस्यता का नवीनीकरण करें।`,
                    message_ur: `آپ کی ایپ سبسکرپشن کی میعاد ختم ہو گئی ہے... سروس جاری رکھنے کے لیے براہ کرم اپنی رکنیت کی تجدید کریں۔`,
                    type: 'ALERT',
               });

               await sendToTopic({
                    topic: 'WORKSHOP_OWNER',
                    notification: { title: 'Subscription Expired', body: `Your app subscription has expired ... Please renew your subscription to continue service` },
               });
               throw new Error(`Your subscription to Senaeya app has expired. Please renew your subscription to continue the service.
                                   انتهى الاشتراك في تطبيق الصناعية .. نرجو منكم تجديد الاشتراك لاستمرار الخدمة.`);
          }
     }
};

export const AuthService = {
     verifyEmailToDB,
     loginUserFromDB,
     loginUserWithFingerPrint,
     forgetPasswordToDB,
     resetPasswordToDB,
     changePasswordToDB,
     forgetPasswordByUrlToDB,
     resetPasswordByUrl,
     resendOtpFromDb,
     refreshToken,
     checkUserAuthority,
};
