import { z } from 'zod';
import { CLIENT_CAR_TYPE, CLIENT_TYPE } from './client.enum';

const createClientZodSchema = z.object({
     body: z
          .object({
               providerWorkShopId: z.string({ required_error: 'WorkShopId is required' }),
               clientType: z.nativeEnum(CLIENT_TYPE),
               workShopNameAsClient: z.string().optional(),
               brand: z.string().optional(),
               model: z.string().optional(),
               year: z.string().optional(),
               vin: z.string().optional(),
               name: z.string().optional(),
               contact: z.string().optional(),
               description: z.string().optional(),
               documentNumber: z.string().optional(),
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
                    // workShopNameAsClient is required for WorkShop
                    if (!body.workShopNameAsClient) {
                         ctx.addIssue({
                              path: ['workShopNameAsClient'],
                              message: `workShopNameAsClient is required for WorkShop clientType`,
                              code: z.ZodIssueCode.custom,
                         });
                    }
               }
          }),
});

const updateClientZodSchema = z.object({
     params: z.object({
          id: z.string({ required_error: 'Id is required' }),
     }),
     body: z.object({
          providerWorkShopId: z.string({ required_error: 'WorkShopId is required' }),
          name: z.string({ required_error: 'Name is required' }),
          contact: z.string({ required_error: 'Contact is required' }),
          carId: z.string({ required_error: 'carId is required' }),
          brand: z.string({ required_error: 'Brand is required' }),
          model: z.string({ required_error: 'Model is required' }),
          year: z.string({ required_error: 'Year is required' }),
          vin: z.string({ required_error: 'VIN is required' }),
          documentNumber: z.string({ required_error: 'DocumentNumber is required' }),
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
     toggleClientStatusZodSchema,
};
