import { z } from 'zod';

const createShortUrlZodSchema = z.object({
     body: z.object({
          shortUrl: z.string({ required_error: 'shortUrl is required' }),
     }),
});

const updateShortUrlZodSchema = z.object({
     body: z.object({
          shortUrl: z.string().optional(),
     }),
});

export const shortUrlValidation = {
     createShortUrlZodSchema,
     updateShortUrlZodSchema,
};
