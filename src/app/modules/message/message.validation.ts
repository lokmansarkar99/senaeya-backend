import { z } from 'zod';

const createMessageZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'providerWorkShopId is required' }),
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
     }),
});

const updateMessageZodSchema = z.object({
     body: z.object({
          message: z.string().optional(),
          name: z.string().optional(),
     }),
});

export const messageValidation = {
     createMessageZodSchema,
     updateMessageZodSchema,
};
