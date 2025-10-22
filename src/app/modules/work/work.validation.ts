import { z } from 'zod';
import { WorkType } from './work.enum';

const createWorkZodSchema = z.object({
     body: z.object({
          workCategoryName: z.string(),
          type: z.nativeEnum(WorkType).optional(),
          title: z.string().optional(),
          titleObj: z
               .object({
                    ar: z.string().optional(),
                    bn: z.string().optional(),
                    ur: z.string().optional(),
                    hi: z.string().optional(),
                    tl: z.string().optional(),
                    en: z.string().optional(),
               })
               .optional(),
          code: z.string().optional(),
          cost: z.number().optional(),
     }),
});

const updateWorkZodSchema = z.object({
     body: z.object({
          workCategoryName: z.string().optional(),
          type: z.nativeEnum(WorkType).optional(),
          title: z.string().optional(),
          titleObj: z
               .object({
                    ar: z.string().optional(),
                    bn: z.string().optional(),
                    ur: z.string().optional(),
                    hi: z.string().optional(),
                    tl: z.string().optional(),
                    en: z.string().optional(),
               })
               .optional(),
          code: z.string().optional(),
          cost: z.number().optional(),
     }),
});

export const workValidation = {
     createWorkZodSchema,
     updateWorkZodSchema,
};
