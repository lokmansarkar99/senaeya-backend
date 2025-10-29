import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from './payment.enum';

const createPaymentZodSchema = z.object({
     body: z
          .object({
               providerWorkShopId: z.string({ required_error: 'Provider WorkShop ID is required' }),
               invoice: z.string({ required_error: 'Invoice ID is required' }),
               paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payment Method is required' }),
               amount: z.number({ required_error: 'Amount is required' }),
               isCashRecieved: z.boolean({ required_error: 'Is Cash Recieved is required' }).optional(),
               isRecievedTransfer: z.boolean({ required_error: 'Is Recieved Transfer is required' }).optional(),
               cardApprovalCode: z.string({ required_error: 'Card Approval Code is required' }).optional(),
          })
          .superRefine((data, ctx) => {
               if (!data.isCashRecieved && !data.isRecievedTransfer && !data.cardApprovalCode) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'At least one of isCashRecieved, isRecievedTransfer, or cardApprovalCode must be true',
                    });
               }
               if (data.paymentMethod == PaymentMethod.CARD && !data.cardApprovalCode) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: 'Card approval code is required for card payment.',
                    });
               }
          }),
});

const updatePaymentZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
          invoice: z.string().optional(),
          paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payment Method is required' }).optional(),
          paymentStatus: z.nativeEnum(PaymentStatus, { required_error: 'Payment Status is required' }).optional(),
          amount: z.number().optional(),
          cardApprovalCode: z.string().optional(),
     }),
});

export const paymentValidation = {
     createPaymentZodSchema,
     updatePaymentZodSchema,
};
