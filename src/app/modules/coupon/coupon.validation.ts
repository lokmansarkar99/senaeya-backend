import { z } from 'zod';
import { COUPON_DISCOUNT_TYPE } from './coupon.enums';

export const createCouponSchema = z.object({
     body: z
          .object({
               code: z.string(),
               package: z.string(),
               discountType: z.enum([...Object.values(COUPON_DISCOUNT_TYPE)] as [string, ...string[]]),
               discountValue: z.number(),
               startDate: z.string(),
               endDate: z.string(),
               isActive: z.boolean(),
               isDeleted: z.boolean(),
               usageLimit: z.number(),
               usedCount: z.number(),
               name: z.string(),
               description: z.string().optional(),
          })
          .superRefine((data, ctx) => {
               if (data.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
                    if (data.discountValue < 0 || data.discountValue > 100) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'For percentage discount type, discount value must be between 0 and 100.',
                         });
                    }
               }

               if (data.discountType === COUPON_DISCOUNT_TYPE.FLAT) {
                    if (data.discountValue <= 0) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'For FLAT discount type, discount value must be more than 0.',
                         });
                    }
               }
          }),
});

export const updateCouponSchema = z.object({
     body: z
          .object({
               code: z.string().optional(),
               package: z.string().optional(),
               discountType: z.enum([...Object.values(COUPON_DISCOUNT_TYPE)] as [string, ...string[]]).optional(),
               discountValue: z.number().optional(),
               startDate: z.string().optional(),
               endDate: z.string().optional(),
               isActive: z.boolean().optional(),
               isDeleted: z.boolean().optional(),
               usageLimit: z.number().optional(),
               usedCount: z.number().optional(),
               name: z.string().optional(),
               description: z.string().optional(),
          })
          .superRefine((data, ctx) => {
               if (data.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
                    if (data.discountValue && (data.discountValue < 0 || data.discountValue > 100)) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'For percentage discount type, discount value must be between 0 and 100.',
                         });
                    }
               }

               if (data.discountType === COUPON_DISCOUNT_TYPE.FLAT) {
                    if (data.discountValue && data.discountValue <= 0) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'For FLAT discount type, discount value must be more than 0.',
                         });
                    }
               }
          }),
});

export const createCouponValidation = {
     createCouponValidationSchema: createCouponSchema,
     updateCouponValidationSchema: updateCouponSchema,
};
