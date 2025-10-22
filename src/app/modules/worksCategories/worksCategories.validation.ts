import { z } from 'zod';

const createWorksCategoriesZodSchema = z.object({
     body: z.object({
          image: z.string().optional(),
          workCategoryName: z.string().optional(),
          title: z.string().optional(),
          titleObj: z.object({
               ar: z.string().optional(),
               bn: z.string().optional(),
               ur: z.string().optional(),
               hi: z.string().optional(),
               tl: z.string().optional(),
               en: z.string().optional(),
          }).optional(),
          description: z.string().optional(),
          descriptionObj: z.object({
               ar: z.string().optional(),
               bn: z.string().optional(),
               ur: z.string().optional(),
               hi: z.string().optional(),
               tl: z.string().optional(),
               en: z.string().optional(),
          }).optional(),
     }),
});

const updateWorksCategoriesZodSchema = z.object({
     body: z.object({
          image: z.string().optional(),
          workCategoryName: z.string().optional(),
          title: z.string().optional(),
          titleObj: z.object({
               ar: z.string().optional(),
               bn: z.string().optional(),
               ur: z.string().optional(),
               hi: z.string().optional(),
               tl: z.string().optional(),
               en: z.string().optional(),
          }).optional(),
          description: z.string().optional(),
          descriptionObj: z.object({
               ar: z.string().optional(),
               bn: z.string().optional(),
               ur: z.string().optional(),
               hi: z.string().optional(),
               tl: z.string().optional(),
               en: z.string().optional(),
          }).optional(),
     }),
});

export const worksCategoriesValidation = {
     createWorksCategoriesZodSchema,
     updateWorksCategoriesZodSchema
};
