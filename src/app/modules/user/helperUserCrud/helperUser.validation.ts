import { z } from 'zod';

const addRemoveEditHelperUserZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string(),
          type: z.enum(['add', 'remove', 'edit'],{required_error: 'Type is required', invalid_type_error: 'Type must be a string  |add |remove |edit |' }),
          contact: z.string().min(11, 'Contact must be at least 11 characters long'),
          password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
     })
     .superRefine((data, ctx) => {
          if (data.type === 'add' && (!data.contact || !data.password)) {
               ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Contact and password are required to add a helper user',
               });
          }
     }),
});

export const HelperUserValidation = {
     addRemoveEditHelperUserZodSchema,
};
