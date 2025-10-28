import { Schema, model } from 'mongoose';
import { ICoupon } from './coupon.interface';
import { COUPON_DISCOUNT_TYPE } from './coupon.enums';

const couponSchema = new Schema<ICoupon>(
     {
          code: {
               type: String,
               required: true,
               unique: true,
               uppercase: true,
               trim: true,
          },
          package: {
               type: Schema.Types.ObjectId,
               ref: 'Package',
               required: true,
          },
          createdBy: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
          },
          discountType: {
               type: String,
               enum: COUPON_DISCOUNT_TYPE,
               required: true,
          },
          discountValue: {
               type: Number,
               required: true,
               min: 0,
          },
          startDate: {
               type: Date,
               required: true,
          },
          endDate: {
               type: Date,
               required: true,
          },
          isActive: {
               type: Boolean,
               default: true,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          status: {
               type: String,
               enum: ['active', 'inactive', 'expired'],
               default: 'active',
          },
     },
     {
          timestamps: true,
     },
);

couponSchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

couponSchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

couponSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Coupon = model<ICoupon>('Coupon', couponSchema);
