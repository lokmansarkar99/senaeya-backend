import { z } from 'zod';

const createCheckPhoneNumberZodSchema = z.object({
     body: z.object({
          phoneNumber: z.string({ required_error: 'Phone Number is required' }),
     }),
});

const verifyPhoneNumber = z.object({
     body: z.object({
          otp: z.number(),
     }),
     params: z.object({
          phoneNumber: z.string(),
     }),
});

export const checkPhoneNumberValidation = {
     createCheckPhoneNumberZodSchema,
     verifyPhoneNumber
};
