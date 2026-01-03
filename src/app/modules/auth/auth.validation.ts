import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const createVerifyEmailZodSchema = z.object({
     body: z.object({
          email: z.string({ required_error: 'Email is required' }),
          oneTimeCode: z.number({ required_error: 'One time code is required' }),
     }),
});

const createLoginZodSchema = z.object({
     body: z.union([
          z.object({
               contact: z.string({ required_error: 'Contact is required' }),
               password: z.string({ required_error: 'Password is required' }),
          }),
          z.object({
               fingerPrintId: z.string({ required_error: 'Finger print id is required' }),
          }),
     ]),
});

const createAdminLoginZodSchema = z.object({
     body: z.object({
          contact: z.string({ required_error: 'Contact is required' }),
          password: z.string({ required_error: 'Password is required' }),
          role: z.enum([USER_ROLES.ADMIN]),
     }),
});

const createForgetPasswordZodSchema = z.object({
     body: z.object({
          contact: z.string({ required_error: 'Contact is required' }),
     }),
});

const createResetPasswordZodSchema = z.object({
     body: z.object({
          newPassword: z.string({ required_error: 'Password is required' }),
          confirmPassword: z.string({
               required_error: 'Confirm Password is required',
          }),
     }),
});

const createChangePasswordZodSchema = z.object({
     body: z.object({
          currentPassword: z.string({
               required_error: 'Current Password is required',
          }),
          newPassword: z.string({ required_error: 'New Password is required' }),
          confirmPassword: z.string({
               required_error: 'Confirm Password is required',
          }),
     }),
});

export const AuthValidation = {
     createVerifyEmailZodSchema,
     createForgetPasswordZodSchema,
     createLoginZodSchema,
     createAdminLoginZodSchema,
     createResetPasswordZodSchema,
     createChangePasswordZodSchema,
};
