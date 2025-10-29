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
                              cost: z.number({ required_error: 'Cost is required' }),
                         }),
                    )
                    .optional(),
               sparePartsList: z
                    .array(
                         z.object({
                              itemName: z.string({ required_error: 'Item is required' }),
                              quantity: z.number({ required_error: 'Quantity is required' }),
                              cost: z.number({ required_error: 'Cost is required' }),
                              code: z.string({ required_error: 'Code is required' }),
                         }),
                    )
                    .optional(),
               discount: z.number().optional(),
               discountType: z.nativeEnum(DiscountType, { required_error: 'Discount Type is required' }).optional(),
               paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payment Method is required' }),
               postPaymentDate: z.string().optional(),
               isCashRecieved: z.boolean().optional(),
               cardApprovalCode: z.string().optional(),
               isRecievedTransfer: z.boolean().optional(),
               isReleased: z.enum(['true', 'false'], { required_error: 'Is Released is required' }),
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
                    if (!body.isCashRecieved && !body.isRecievedTransfer && !body.cardApprovalCode) {
                         ctx.addIssue({
                              path: ['isCashRecieved', 'isRecievedTransfer', 'cardApprovalCode'],
                              message: 'At least one of isCashRecieved, isRecievedTransfer, or cardApprovalCode is required',
                              code: z.ZodIssueCode.custom,
                         });
                    }
               }
          }),
});

const updateInvoiceZodSchema = z.object({
     body: z
          .object({
               client: z.string().optional(),
               providerWorkShopId: z.string().optional(),
               payment: z.string().optional(),
               worksList: z
                    .array(
                         z.object({
                              work: z.string({ required_error: 'Work is required' }),
                              quantity: z.number({ required_error: 'Quantity is required' }),
                              cost: z.number({ required_error: 'Cost is required' }),
                         }),
                    )
                    .optional(),
               sparePartsList: z
                    .array(
                         z.object({
                              itemName: z.string({ required_error: 'Item is required' }),
                              quantity: z.number({ required_error: 'Quantity is required' }),
                              cost: z.number({ required_error: 'Cost is required' }),
                         }),
                    )
                    .optional(),
               discount: z.number().optional(),
               discountType: z.nativeEnum(DiscountType, { required_error: 'Discount Type is required' }).optional(),
               paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payment Method is required' }).optional(),
               paymentStatus: z.nativeEnum(PaymentStatus, { required_error: 'Payment Status is required' }).optional(),
               postPaymentDate: z.string().optional(),
               extraTimeForUnpaidPostpaidInvoice: z.number().default(5).optional(),
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

const releaseInvoiceZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'Provider WorkShop ID is required' }),
          cardApprovalCode: z.string().optional(),
     }),
     params: z.object({
          invoiceId: z.string({ required_error: 'Invoice ID is required' }),
     }),
});

export const invoiceValidation = {
     createInvoiceZodSchema,
     updateInvoiceZodSchema,
     releaseInvoiceZodSchema,
};
