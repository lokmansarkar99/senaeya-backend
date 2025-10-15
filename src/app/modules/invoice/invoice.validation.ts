import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '../payment/payment.enum';
import { DiscountType } from './invoice.enum';

const createInvoiceZodSchema = z.object({
     body: z
          .object({
               client: z.string({ required_error: 'Client is required' }),
               providerWorkShopId: z.string({ required_error: 'Provider WorkShop is required' }),
               worksList: z
                    .array(
                         z.object({
                              work: z.string({ required_error: 'Work is required' }),
                              quantity: z.number({ required_error: 'Quantity is required' }),
                         }),
                    )
                    .optional(),
               sparePartsList: z
                    .array(
                         z.object({
                              work: z.string({ required_error: 'Work is required' }),
                              quantity: z.number({ required_error: 'Quantity is required' }),
                         }),
                    )
                    .optional(),
               discount: z.number().optional(),
               discountType: z.nativeEnum(DiscountType, { required_error: 'Discount Type is required' }).optional(),
               paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payment Method is required' }).optional(),
               postPaymentDate: z.string().optional(),
          })
          .superRefine((body, ctx) => {
               if (body.paymentMethod === PaymentMethod.POSTPAID) {
                    // These fields are required for POSTPAID paymentMethod
                    const requiredFields: (keyof typeof body)[] = ['postPaymentDate'];
                    requiredFields.forEach((field) => {
                         if (!body[field]) {
                              ctx.addIssue({
                                   path: [field],
                                   message: `${field} is required for "POSTPAID" paymentMethod`,
                                   code: z.ZodIssueCode.custom,
                              });
                         }
                    });
               } else {
                    // These fields are required for CASH paymentMethod
                    const deleteFields: (keyof typeof body)[] = ['postPaymentDate'];
                    deleteFields.forEach((field) => {
                         delete body[field];
                    });

               }
          }),
});

const updateInvoiceZodSchema = z.object({
     body: z.object({
          client: z.string().optional(),
          providerWorkShopId: z.string().optional(),
          payment: z.string().optional(),
          worksList: z
               .array(
                    z.object({
                         work: z.string({ required_error: 'Work is required' }),
                         quantity: z.number({ required_error: 'Quantity is required' }),
                    }),
               )
               .optional(),
          sparePartsList: z
               .array(
                    z.object({
                         work: z.string({ required_error: 'Work is required' }),
                         quantity: z.number({ required_error: 'Quantity is required' }),
                    }),
               )
               .optional(),
          discount: z.number().optional(),
          discountType: z.nativeEnum(DiscountType, { required_error: 'Discount Type is required' }).optional(),
          paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payment Method is required' }).optional(),
          paymentStatus: z.nativeEnum(PaymentStatus, { required_error: 'Payment Status is required' }).optional(),
          postPaymentDate: z.string().optional(),
     }),
});

const releaseInvoiceZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'Provider WorkShop ID is required' }),
          cardApprovalCode: z.string().optional()
     }),
     params: z.object({
          invoiceId: z.string({ required_error: 'Invoice ID is required' }),
     })
});

export const invoiceValidation = {
     createInvoiceZodSchema,
     updateInvoiceZodSchema,
     releaseInvoiceZodSchema
};
