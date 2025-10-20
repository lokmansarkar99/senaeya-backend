import { z } from 'zod';

const createMessageZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'providerWorkShopId is required' }),
          message: z.string({ required_error: 'message text is required' }),
          name: z.string({ required_error: 'name text is required' }),
          contact: z.string({ required_error: 'contact text is required' }),
     }),
});

const updateMessageZodSchema = z.object({
     body: z.object({
          message: z.string().optional(),
          name: z.string().optional(),
          contact: z.string().optional(),
     }),
});

export const messageValidation = {
     createMessageZodSchema,
     updateMessageZodSchema
};
