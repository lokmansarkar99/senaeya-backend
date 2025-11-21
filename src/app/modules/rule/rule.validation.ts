import { z } from 'zod';

const createPrivacyPolicyZodSchema = z.object({
     body: z.object({
          content: z.string({ required_error: 'Privacy policy is required' }),
     }),
});
const updatePrivacyPolicyZodSchema = z.object({
     body: z.object({
          content: z.string().optional(),
     }),
});

const createTermsAndConditionZodSchema = z.object({
     body: z.object({
          content: z.string({ required_error: 'Terms and conditions is required' }),
     }),
});
const updateTermsAndConditionZodSchema = z.object({
     body: z.object({
          content: z.string().optional(),
     }),
});

const createAboutZodSchema = z.object({
     body: z.object({
          content: z.string({ required_error: 'About is required' }),
     }),
});

const updaterAboutZodSchema = z.object({
     body: z.object({
          content: z.string().optional(),
     }),
});

//  support and appExplain
const createSupportZodSchema = z.object({
     body: z.object({
          content: z.string({ required_error: 'Support content is required' }),
     }),
});
const updateSupportZodSchema = z.object({
     body: z.object({
          content: z.string().optional(),
     }),
});

const createAppExplainZodSchema = z.object({
     body: z.object({
          content: z.string({ required_error: 'App explanation content is required' }),
     }),
});
const updateAppExplainZodSchema = z.object({
     body: z.object({
          content: z.string().optional(),
     }),
});

const createDefaultVat = z.object({
     body: z.object({
          value: z.number({ required_error: 'Default VAT is required' }).min(0, 'VAT cannot be negative'),
     }),
});

const updateDefaultVat = z.object({
     body: z.object({
          value: z.number().min(0, 'VAT cannot be negative').optional(),
     }),
});

const createAllowedInvoicesCountForFreeUsers = z.object({
     body: z.object({
          value: z.number({ required_error: 'Allowed invoices count is required' }).int('Count must be an integer').min(0, 'Count cannot be negative'),
     }),
});

const updateAllowedInvoicesCountForFreeUsers = z.object({
     body: z.object({
          value: z.number().int('Count must be an integer').min(0, 'Count cannot be negative').optional(),
     }),
});

export const RuleValidation = {
     createPrivacyPolicyZodSchema,
     updatePrivacyPolicyZodSchema,
     createAboutZodSchema,
     updaterAboutZodSchema,
     createTermsAndConditionZodSchema,
     updateTermsAndConditionZodSchema,
     createSupportZodSchema,
     updateSupportZodSchema,
     createAppExplainZodSchema,
     updateAppExplainZodSchema,
     createDefaultVat,
     updateDefaultVat,
     createAllowedInvoicesCountForFreeUsers,
     updateAllowedInvoicesCountForFreeUsers,
};
