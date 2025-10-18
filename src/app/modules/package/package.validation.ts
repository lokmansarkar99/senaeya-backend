import { z } from 'zod';
import { PackageDuration, PackagePaymentType, PackageSubscriptionType } from './package.enum';
const createPackageZodSchema = z.object({
     body: z.object({
          title: z.string({ required_error: 'Title is required' }),
          description: z.string({ required_error: 'Description is required' }),
          features: z.array(z.string()),
          price: z
               .union([z.string(), z.number()])
               .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
               .refine((val) => !isNaN(val), {
                    message: 'Price must be a valid number.',
               }),
          monthlyBasePrice: z.number(),
          duration: z.nativeEnum(PackageDuration, {
               required_error: 'Duration is required',
          }),
          paymentType: z.nativeEnum(PackagePaymentType, {
               required_error: 'Payment type is required',
          }),
          subscriptionType: z.nativeEnum(PackageSubscriptionType, {
               required_error: 'Subscription type is required',
          }),
          discountPercentage: z.number(),
     }),
});

export const PackageValidation = {
     createPackageZodSchema,
};
