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

const router = express.Router();

router.post('/initiate/:packageId', auth(USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(clickpayValidation.initiatePaymentZodSchema), clickpayController.initiatePayment);

router.post('/callback', clickpayController.paymentCallback);

// make a success route with html return
router.get('/success', async (req, res) => {
     const subscription = await SubscriptionService.createSubscriptionByPackageIdForWorkshop(req.query.providerWorkShopId as string, req.query.packageId as string);
     if (!subscription) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription creation failed');
     }

     // update providerWorkShopId's subscription filed to null
     await WorkShop.updateOne({ _id: req.query.providerWorkShopId }, { $set: { subscriptionId: subscription._id } });
     res.send('<h1>Payment successful</h1>');
});

export const clickpayRoutes = router;
