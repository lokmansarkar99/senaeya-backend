import { z } from 'zod';
import { CLIENT_CAR_TYPE, CLIENT_TYPE } from './client.enum';

const createClientZodSchema = z.object({
     body: z
          .object({
               providerWorkShopId: z.string({ required_error: 'WorkShopId is required' }),
               clientType: z.nativeEnum(CLIENT_TYPE),
               workShopIdAsClient: z.string().optional(),
               brand: z.string().optional(),
               model: z.string().optional(),
               year: z.string().optional(),
               vin: z.string().optional(),
               name: z.string().optional(),
               contact: z.string().optional(),
               description: z.string().optional(),
               carType: z.nativeEnum(CLIENT_CAR_TYPE).optional(),
               plateNumberForInternational: z.string().optional(),
               plateNumberForSaudi: z
                    .object({
                         symbol: z.string().optional(),
                         numberEnglish: z.string().optional(),
                         numberArabic: z.string().optional(),
                         alphabetsCombinations: z.array(z.string()).optional(),
                    })
                    .optional(),
          })
          .superRefine((body, ctx) => {
               if (body.clientType === CLIENT_TYPE.USER) {
                    // These fields are required for User
                    const requiredFields: (keyof typeof body)[] = ['brand', 'model', 'year', 'vin', 'name', 'contact', 'carType'];
                    requiredFields.forEach((field) => {
                         if (!body[field]) {
                              ctx.addIssue({
                                   path: [field],
                                   message: `${field} is required for "User" clientType`,
                                   code: z.ZodIssueCode.custom,
                              });
                         }
                    });
               } else if (body.clientType === CLIENT_TYPE.WORKSHOP) {
                    // workShopIdAsClient is required for WorkShop
                    if (!body.workShopIdAsClient) {
                         ctx.addIssue({
                              path: ['workShopIdAsClient'],
                              message: `workShopIdAsClient is required for WorkShop clientType`,
                              code: z.ZodIssueCode.custom,
                         });
                    }
               }
          }),
});

const updateClientZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'WorkShopId is required' }),
          clientType: z.nativeEnum(CLIENT_TYPE).optional(),
          // for worksop type ⬇️⬇️
          workShopIdAsClient: z.string().optional(),
          // for worksop type ⬆️⬆️
          // for user type ⬇️⬇️
          brand: z.string({ required_error: 'Brand is required' }).optional(),
          model: z.string({ required_error: 'Model is required' }).optional(),
          year: z.string({ required_error: 'Year is required' }).optional(),
          vin: z.string({ required_error: 'VIN is required' }).optional(),
          client: z.string({ required_error: 'Client is required' }).optional(),
          image: z.string().optional(),
          description: z.string().optional(),
          carType: z.boolean().optional(),
          plateNumberForInternational: z.string().optional(),
          plateNumberForSaudi: z
               .object({
                    symbol: z.string().optional(),
                    numberEnglish: z.string().optional(),
                    numberArabic: z.string().optional(),
                    alphabetsCombinations: z.array(z.string()).optional(),
               })
               .optional(),
          // for user type ⬆️⬆️
     }),
});

const toggleClientStatusZodSchema = z.object({
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'WorkShopId is required' }),
     }),
     params: z.object({
          id: z.string({ required_error: 'Id is required' }),
     }),
});

export const clientValidation = {
     createClientZodSchema,
     updateClientZodSchema,
     toggleClientStatusZodSchema
};
