import { z } from 'zod';

const createUpdateSettingsZodSchemaForWorkshop = z.object({
     body: z.object({
          providerWorkShopId: z.string(),
          workShopDiscount: z.number().optional(),
     }),
});

const createUpdateSettingsZodSchemaForApp = z.object({
     body: z
          .object({
               privacyPolicy: z.string().optional(),
               warrantyAndTerms: z.string().optional(),
               aboutUs: z.string().optional(),
               support: z.string().optional(),
               termsOfService: z.string().optional(),
               allowedInvoicesCountForFreeUsers: z.number(),
               defaultVat: z.number(),
               socialMedia: z.object({
                    facebook: z.string().optional(),
                    twitter: z.string().optional(),
                    instagram: z.string().optional(),
                    linkedin: z.string().optional(),
                    whatsapp: z.string().optional(),
               }),
          })
          .superRefine((body, ctx) => {
               const allowedFieldsToModifyForApp: (keyof typeof body)[] = [
                    'privacyPolicy',
                    'aboutUs',
                    'support',
                    'termsOfService',
                    'allowedInvoicesCountForFreeUsers',
                    'defaultVat',
                    'warrantyAndTerms',
                    'socialMedia',
               ];
               const fieldsToModifyforApp = Object.keys(body);
               // check if any field is not allowed to modify
               const invalidFields = fieldsToModifyforApp.filter((field) => !allowedFieldsToModifyForApp.includes(field as keyof typeof body));
               if (invalidFields.length > 0) {
                    ctx.addIssue({
                         path: ['body'],
                         message: `Invalid fields: ${invalidFields.join(', ')}`,
                         code: z.ZodIssueCode.custom,
                    });
               }
          }),
});

export const settingsValidation = {
     createUpdateSettingsZodSchemaForWorkshop,
     createUpdateSettingsZodSchemaForApp,
};
