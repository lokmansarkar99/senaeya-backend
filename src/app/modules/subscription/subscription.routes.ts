import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { SubscriptionController } from './subscription.controller';
import auth from '../../middleware/auth';
const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), SubscriptionController.subscriptions);

router.get('/details', auth(USER_ROLES.WORKSHOP_OWNER), SubscriptionController.subscriptionDetails);
router.get('/success', SubscriptionController.orderSuccess);
router.get('/cancel', SubscriptionController.orderCancel);
router.post('/create-checkout-session/:id', auth(USER_ROLES.WORKSHOP_OWNER), SubscriptionController.createCheckoutSession);
router.patch('/update/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), SubscriptionController.updateSubscription);
router.get('/get/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.WORKSHOP_OWNER), SubscriptionController.getSubscriptionById);
router.delete('/cancel/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), SubscriptionController.cancelSubscription);
router.delete('/delete/package/:packageId', auth(USER_ROLES.WORKSHOP_OWNER), SubscriptionController.deleteSubscriptionPackageToDB);

export const SubscriptionRoutes = router;
