import { z } from 'zod';

const createAdminZodSchema = z.object({
     body: z.object({
          name: z.string({ required_error: 'Name is required' }),
          email: z.string({ required_error: 'Email is required' }).email().optional(),
          contact: z.string({ required_error: 'Contact is required' }),
          password: z.string({ required_error: 'Password is required' }),
          role: z.string({ required_error: 'Role is required' }),
     }),
});

const getDashboardZodSchema = z.object({
     query: z.object({
          month: z.string().optional(),
          year: z.string().optional(),
     }),
});

export const AdminValidation = {
     createAdminZodSchema,
     getDashboardZodSchema,
};
