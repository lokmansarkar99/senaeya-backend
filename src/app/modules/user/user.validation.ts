import { string, z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

export const createUserZodSchema = z.object({
     body: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          deviceToken: z.string().optional(),
          role: z.enum([USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER]),
          fcmToken: z.string().optional(),
          password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long'),
          contact: string().min(11, 'Contact must be at least 11 characters long'),
          helperUserId: z
               .object({
                    contact: string().min(11, 'Contact must be at least 11 characters long'),
                    password: string().min(8, 'Password must be at least 8 characters long'),
               })
               .optional(),
     }),
});

const updateUserZodSchema = z.object({
     body: z.object({
          name: z.string().optional(),
          contact: z.string().optional(),
          address: z.string().optional(),
          email: z.string().optional(),
          password: z.string().optional(),
          image: z.string().optional(),
          nationality: z.string().optional(),
          preferredLanguage: z.string().optional(),
          fingerPrintId: z.string().optional(),
          deviceToken: z.string().optional(),
          role: z.enum([USER_ROLES.WORKSHOP_OWNER, USER_ROLES.WORKSHOP_MEMBER]).optional(),
          fcmToken: z.string().optional(),
          helperUserId: z
               .union([z.string(), z.object({ contact: string().min(11, 'Contact must be at least 11 characters long'), password: string().min(8, 'Password must be at least 8 characters long') })])
               .optional(),
     }),
});

export const UserValidation = {
     createUserZodSchema,
     updateUserZodSchema,
};
