import express from 'express';
import { clickpayValidation } from './clickpay.validation';
import { clickpayController } from './clickpay.controller';
import validateRequest from '../../../middleware/validateRequest';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middleware/auth';
import validateUserAuthority from '../../../middleware/validateUserAuthority';
import { SubscriptionService } from '../../subscription/subscription.service';
import AppError from '../../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { WorkShop } from '../../workShop/workShop.model';
import { Coupon } from '../../coupon/coupon.model';

const router = express.Router();

router.post('/initiate/:packageId', auth(USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(clickpayValidation.initiatePaymentZodSchema), clickpayController.initiatePayment);

router.post('/callback', clickpayController.paymentCallback);

// make a success route with html return
router.get('/success', async (req, res) => {
     await SubscriptionService.createSubscriptionByPackageIdForWorkshop(req.query.providerWorkShopId as string, req.query.packageId as string, req.query.amountPaid as string, req.query.couponCode as string, req.query.contact as string);
     res.send('<h1>Payment successful</h1>');
});

export const clickpayRoutes = router;
