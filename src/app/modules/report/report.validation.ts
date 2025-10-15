import { z } from 'zod';

const getAllReportsByCreatedDateRangeZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
     }),
     query: z.object({
          startDate: z.string(),
          endDate: z.string(),
     }),
});

export const reportValidation = {
     getAllReportsByCreatedDateRangeZodSchema,
};
