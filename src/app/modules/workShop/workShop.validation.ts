import { z } from 'zod';

const DaysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const workingSubScheduleSchema = z.object({
     startDay: z.enum(DaysOfWeek, { required_error: 'startDay is required' }),
     endDay: z.enum(DaysOfWeek, { required_error: 'endDay is required' }),
     startTime: z.string({ required_error: 'startTime is required' }),
     endTime: z.string({ required_error: 'endTime is required' }),
});

const geoLocationSchema = z.object({
     type: z.literal('Point', { errorMap: () => ({ message: 'type must be Point' }) }),
     // [longitude, latitude]
     coordinates: z.tuple([z.number(), z.number()]).refine((arr) => arr.length === 2, {
          message: 'coordinates must be [longitude, latitude] of length 2',
     }),
});

const createWorkShopZodSchema = z.object({
     body: z.object({
          workshopNameEnglish: z.string({ required_error: 'workshopNameEnglish is required' }).trim(),
          workshopNameArabic: z.string({ required_error: 'workshopNameArabic is required' }).trim(),
          contact: z.string({ required_error: 'contact is required' }).trim().optional(),
          unn: z
               .string({ required_error: 'unn is required' })
               .trim()
               .regex(/^7\d{9}$/i, 'unn must be 10 digits starting with 7'),
          crn: z
               .string({ required_error: 'crn is required' })
               .trim()
               .regex(/^\d{10}$/i, 'crn must be exactly 10 digits'),
          mln: z
               .string({ required_error: 'mln is required' })
               .trim()
               .regex(/^4\d{10}$/i, 'mln must be 11 digits starting with 4'),
          address: z.string({ required_error: 'address is required' }).trim(),
          taxVatNumber: z
               .string()
               .trim()
               .regex(/^3\d{14}$/i, 'taxVatNumber must be 15 digits starting with 3')
               .optional(),
          bankAccountNumber: z
               .string()
               .trim()
               .regex(/^SA[A-Z0-9]{22}$/i, 'bankAccountNumber must be 24 characters starting with SA')
               .optional(),
          isAvailableMobileWorkshop: z.boolean({ required_error: 'isAvailableMobileWorkshop is required' }),
          workshopGEOlocation: geoLocationSchema,
          regularWorkingSchedule: workingSubScheduleSchema,
          ramadanWorkingSchedule: workingSubScheduleSchema,
          image: z.string().optional(),
          description: z.string({ required_error: 'description is required' }).optional(),
     }),
});

const updateWorkShopZodSchema = z.object({
     body: z.object({
          workshopNameEnglish: z.string().trim().optional(),
          workshopNameArabic: z.string().trim().optional(),
          contact: z.string().trim().optional(),
          region: z.string().trim().optional(),
          city: z.string().trim().optional(),
          industrialComplexAreaName: z.string().trim().optional(),
          unn: z
               .string()
               .trim()
               .regex(/^7\d{9}$/i, 'unn must be 10 digits starting with 7')
               .optional(),
          crn: z
               .string()
               .trim()
               .regex(/^\d{10}$/i, 'crn must be exactly 10 digits')
               .optional(),
          mln: z
               .string()
               .trim()
               .regex(/^4\d{10}$/i, 'mln must be 11 digits starting with 4')
               .optional(),
          address: z.string().trim().optional(),
          taxVatNumber: z
               .string()
               .trim()
               .regex(/^3\d{14}$/i, 'taxVatNumber must be 15 digits starting with 3')
               .optional().optional(),
          bankAccountNumber: z
               .string()
               .trim()
               .regex(/^SA[A-Z0-9]{22}$/i, 'bankAccountNumber must be 24 characters starting with SA')
               .optional()
               .nullable().optional(),
          isAvailableMobileWorkshop: z.boolean().optional(),
          workshopGEOlocation: geoLocationSchema.optional(),
          regularWorkingSchedule: workingSubScheduleSchema.partial().optional(),
          ramadanWorkingSchedule: workingSubScheduleSchema.partial().optional(),
          image: z.string().optional(),
          helperUserId: z.string().regex(objectIdRegex).nullable().optional(),
          description: z.string().optional(),
     }),
});

const updateWorkShopZodSchemaByWorkshopOwner = z.object({
     body: z.object({
          workshopNameEnglish: z.string().trim().optional(),
          address: z.string().trim().optional(),
          bankAccountNumber: z
               .string()
               .trim()
               .regex(/^SA[A-Z0-9]{22}$/i, 'bankAccountNumber must be 24 characters starting with SA')
               .optional()
               .nullable(),
          isAvailableMobileWorkshop: z.boolean().optional(),
          workshopGEOlocation: geoLocationSchema.optional(),
          regularWorkingSchedule: workingSubScheduleSchema.partial().optional(),
          ramadanWorkingSchedule: workingSubScheduleSchema.partial().optional(),
          image: z.string().optional(),
          helperUserId: z.string().regex(objectIdRegex).nullable().optional(),
          description: z.string().optional(),
     }),
});

const getWorkShopBycrnMlnUnnTaxZodSchema = z.object({
     query: z.object({
          crn: z.string({ required_error: 'crn is required' }).trim(),
          mln: z.string({ required_error: 'mln is required' }).trim(),
          unn: z.string({ required_error: 'unn is required' }).trim(),
          taxVatNumber: z.string({ required_error: 'taxVatNumber is required' }).trim().optional(),
     }),
});

export const workShopValidation = {
     createWorkShopZodSchema,
     updateWorkShopZodSchema,
     updateWorkShopZodSchemaByWorkshopOwner,
     getWorkShopBycrnMlnUnnTaxZodSchema
};
