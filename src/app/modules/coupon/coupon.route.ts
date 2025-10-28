import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { createCouponValidation } from './coupon.validation';
import { CouponController } from './coupon.controller';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

// Define routes
router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(createCouponValidation.createCouponValidationSchema), CouponController.createCoupon);

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER,USER_ROLES.CLIENT), CouponController.getAllCoupon);

router.post('/try/:couponCode', CouponController.getTryCouponByCode);
router.patch('/update-coupon/:couponCode', validateRequest(createCouponValidation.updateCouponValidationSchema), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CouponController.updateCoupon);

router.delete('/:couponId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CouponController.deleteCoupon);

router.get('/:couponId', CouponController.getCouponById);

export const CouponRoutes = router;
