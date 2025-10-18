import express from 'express';
import { clickpayValidation } from './clickpay.validation';
import { clickpayController } from './clickpay.controller';
import validateRequest from '../../../middleware/validateRequest';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middleware/auth';
import validateUserAuthority from '../../../middleware/validateUserAuthority';
import { SubscriptionService } from '../../subscription/subscription.service';

const router = express.Router();

router.post('/initiate/:packageId', auth(USER_ROLES.WORKSHOP_OWNER), validateUserAuthority(), validateRequest(clickpayValidation.initiatePaymentZodSchema), clickpayController.initiatePayment);

router.post('/callback', clickpayController.paymentCallback);

// make a success route with html return
router.get('/success', async (req, res) => {
     res.send('<h1>Payment successful</h1>');
});

export const clickpayRoutes = router;
