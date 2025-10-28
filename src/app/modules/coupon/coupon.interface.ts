import mongoose from 'mongoose';
import { COUPON_DISCOUNT_TYPE } from './coupon.enums';

export interface ICoupon extends Document {
     code: string;
     package: mongoose.Types.ObjectId;
     discountType: COUPON_DISCOUNT_TYPE;
     discountValue: number;
     startDate: Date;
     endDate: Date;
     isActive: boolean;
     isDeleted: boolean;
     createdBy: mongoose.Types.ObjectId;
     status: string;
     name: string;
     description?: string;
     usageLimit?: number;
     usedCount: number;
     createdAt: Date;
     updatedAt: Date;
}
