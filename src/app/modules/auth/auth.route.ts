import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
const router = express.Router();

router.post('/login', validateRequest(AuthValidation.createLoginZodSchema), AuthController.loginUser);
router.post('/admin/login', validateRequest(AuthValidation.createAdminLoginZodSchema), AuthController.loginUser);
router.post('/login-with-finger-print', validateRequest(AuthValidation.createLoginZodSchema), AuthController.loginUserWithFingerPrint);
// router.post('/refresh-token', AuthController.refreshToken);
router.post('/forget-password', validateRequest(AuthValidation.createForgetPasswordZodSchema), AuthController.forgetPassword);
router.get('/check-user-authority/:providerWorkShopId', auth(USER_ROLES.WORKSHOP_MEMBER, USER_ROLES.WORKSHOP_OWNER), AuthController.checkUserAuthority);

// router.post('/verify-email', validateRequest(AuthValidation.createVerifyEmailZodSchema), AuthController.verifyEmail);

// router.post('/reset-password', validateRequest(AuthValidation.createResetPasswordZodSchema), AuthController.resetPassword);
// router.post('/dashboard/forget-password', validateRequest(AuthValidation.createForgetPasswordZodSchema), AuthController.forgetPasswordByUrl);

// router.post('/dashboard/reset-password', auth(USER_ROLES.ADMIN, USER_ROLES.ADMIN), validateRequest(AuthValidation.createResetPasswordZodSchema), AuthController.resetPasswordByUrl);

router.post(
     '/change-password',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.ADMIN),
     validateRequest(AuthValidation.createChangePasswordZodSchema),
     AuthController.changePassword,
);
// router.post('/resend-otp', AuthController.resendOtp);

// OAuth Routes
// router.get('/google', AuthController.googleAuth);
// router.get('/google/callback', AuthController.googleAuthCallback);
// router.get('/facebook', AuthController.facebookAuth);
// router.get('/facebook/callback', AuthController.facebookAuthCallback);

export const AuthRouter = router;
