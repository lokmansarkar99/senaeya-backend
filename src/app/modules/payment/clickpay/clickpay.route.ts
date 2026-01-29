import express from 'express';
import { clickpayValidation } from './clickpay.validation';
import { clickpayController } from './clickpay.controller';
import validateRequest from '../../../middleware/validateRequest';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middleware/auth';
import validateUserAuthority from '../../../middleware/validateUserAuthority';
import { SubscriptionService } from '../../subscription/subscription.service';
import { Subscription } from '../../subscription/subscription.model';
import sendResponse from '../../../../shared/sendResponse';

const router = express.Router();

router.post('/initiate/:packageId', auth(USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(clickpayValidation.initiatePaymentZodSchema), clickpayController.initiatePayment);

router.post('/callback', clickpayController.paymentCallback);

// make a success route with html return
router.get('/success', async (req, res) => {
     console.log(req.query);
     // log current time of htting this route
     console.log('Current time return url:', new Date().toISOString());
     const { acquirerMessage, acquirerRRN, cartId, customerEmail, respCode, respMessage, respStatus, signature, token, tranRef } = req.query;
     if (!respStatus || respStatus !== 'A') {
          res.send(`
               <h3>Payment Failed</h3>
          `);
          // sendResponse(res, {
          //      statusCode: 400,
          //      success: false,
          //      message: 'Payment failed',
          //      data: {
          //           isPaid: false,
          //      },
          // });
     }
     // // checke already subscribed and not expired
     // const isExistSubscription = await Subscription.findOne({
     //      workshop: req.query.providerWorkShopId,
     //      package: req.query.packageId,
     //      status: 'active',
     //      currentPeriodEnd: { $gt: new Date().toISOString() },
     // });
     // if (!isExistSubscription) {
     //      await SubscriptionService.createSubscriptionByPackageIdForWorkshop(
     //           req.query.providerWorkShopId as string,
     //           req.query.packageId as string,
     //           req.query.amountPaid as string,
     //           req.query.couponCode as string,
     //           req.query.contact as string,
     //           Number(req.query.vatPercent),
     //           Number(req.query.flatDiscountedAmount),
     //           Number(req.query.flatVatAmount),
     //      );
     // }
     res.send(`
          <h3>Payment Successful</h3>
          <p>Thank you! Your payment has been completed.</p>
     `);
});

export const clickpayRoutes = router;
