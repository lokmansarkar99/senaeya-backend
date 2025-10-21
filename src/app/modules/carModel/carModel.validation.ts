import { z } from 'zod';

const createCarModelZodSchema = z.object({
     body: z.object({
          brand: z.string({ required_error: 'Brand is required' }),
          title: z.string({ required_error: 'title text is required' }),
          description: z.string().optional(),
     }),
});

const updateCarModelZodSchema = z.object({
     body: z.object({
          brand: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
     }),
});

export const carModelValidation = {
     createCarModelZodSchema,
     updateCarModelZodSchema
};
