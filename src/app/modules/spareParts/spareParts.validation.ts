import { z } from 'zod';
import { WorkType } from './spareParts.enum';

const createSparePartsZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string(),
          type: z.nativeEnum(WorkType).default(WorkType.SPARE_PART).optional(),
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

const updateSparePartsZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
          type: z.nativeEnum(WorkType).default(WorkType.SPARE_PART).optional(),
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

export const sparePartsValidation = {
     createSparePartsZodSchema,
     updateSparePartsZodSchema,
};
