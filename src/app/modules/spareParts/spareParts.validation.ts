import { z } from 'zod';
import { SparePartType } from './spareParts.enum';

const createSparePartsZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
          type: z.nativeEnum(SparePartType).default(SparePartType.SPARE_PART).optional(),
          itemName: z.string().optional(),
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
          code: z.string(),
     }),
});

const updateSparePartsZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string().optional(),
          type: z.nativeEnum(SparePartType).default(SparePartType.SPARE_PART).optional(),
          item: z.string().optional(),
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
     }),
});



export const sparePartsValidation = {
     createSparePartsZodSchema,
     updateSparePartsZodSchema,
};
