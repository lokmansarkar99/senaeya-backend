import { z } from 'zod';

const createDeviceTokenZodSchema = z.object({
     body: z.object({
          image: z.string({ required_error: 'Image is required' }),
          title: z.string({ required_error: 'title text is required' }),
          description: z.string({ required_error: 'description text is required' }),
     }),
});

const updateDeviceTokenZodSchema = z.object({
     body: z.object({
          image: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
     }),
});

export const DeviceTokenValidation = {
     createDeviceTokenZodSchema,
     updateDeviceTokenZodSchema
};
