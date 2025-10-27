import { z } from 'zod';
import { COUPON_DISCOUNT_TYPE } from './coupon.enums';

export const createCouponSchema = z.object({
     body: z.object({
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
     }),
});

export const updateCouponSchema = z.object({
     body: z.object({
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
     }),
});

export const createCouponValidation = {
     createCouponValidationSchema: createCouponSchema,
     updateCouponValidationSchema: updateCouponSchema,
};
