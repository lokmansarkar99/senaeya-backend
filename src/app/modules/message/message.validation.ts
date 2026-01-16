import { z } from 'zod';
import { MessageStatus } from './message.enum';

const createMessageZodSchema = z.object({
     body: z
          .object({
               providerWorkShopId: z.string().optional(),
               data: z
                    .array(
                         z.object({
                              requestedWorkItem: z.string({ required_error: 'requestedWorkItem is required' }),
                              workCategoryName: z.string({ required_error: 'workCategoryName is required' }),
                         }),
                    )
                    .optional(),
               message: z.string({ required_error: 'message text is required' }),
               name: z.string().optional(),
               contact: z.string().optional(),
          })
          .superRefine((data, ctx) => {
               if (data.data) {
                    if (!data.providerWorkShopId) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'providerWorkShopId is must to add works',
                              path: ['providerWorkShopId'], // Add error to the endDate field
                         });
                    }
               }
          }),
});

const updateMessageZodSchema = z.object({
     body: z.object({
          message: z.string().optional(),
          name: z.string().optional(),
          status: z.nativeEnum(MessageStatus).optional(),
     }),
});

export const messageValidation = {
     createMessageZodSchema,
     updateMessageZodSchema,
};
