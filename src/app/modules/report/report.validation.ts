import { z } from 'zod';

const getAllReportsByCreatedDateRangeZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
     }),
     query: z
          .object({
               startDate: z.string(),
               endDate: z.string(),
               income: z.union([z.string(), z.boolean()]).optional(),
               outlay: z.union([z.string(), z.boolean()]).optional(),
               noOfCars: z.union([z.string(), z.boolean()]).optional(),
               lang: z.enum(['ar', 'en']).optional(),
          }),
});

export const reportValidation = {
     getAllReportsByCreatedDateRangeZodSchema,
};
