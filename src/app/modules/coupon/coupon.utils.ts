import { COUPON_DISCOUNT_TYPE } from './coupon.enums';
import { ICoupon } from './coupon.interface';

export const calculateDiscount = (coupon: ICoupon, orderAmount: number): number => {
     let discountAmount = 0;

     if (coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
          discountAmount = (coupon.discountValue / 100) * orderAmount;
     } else if (coupon.discountType === COUPON_DISCOUNT_TYPE.FLAT) {
          discountAmount = coupon.discountValue;
     }

     return discountAmount;
};
