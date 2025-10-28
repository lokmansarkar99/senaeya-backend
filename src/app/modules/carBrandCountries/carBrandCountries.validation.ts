import { z } from 'zod';

const createCarBrandCountriesZodSchema = z.object({
     body: z.object({
          image: z.string({ required_error: 'Image is required' }),
          title: z.string({ required_error: 'title text is required' }),
     }),
});

const updateCarBrandCountriesZodSchema = z.object({
     body: z.object({
          image: z.string().optional(),
          title: z.string().optional(),
     }),
});

export const carBrandCountriesValidation = {
     createCarBrandCountriesZodSchema,
     updateCarBrandCountriesZodSchema
};
