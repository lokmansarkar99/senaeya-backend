import { z } from "zod";

const initiatePaymentZodSchema = z.object({
    params: z.object({
     packageId: z.string(),
    }),
    query: z.object({
     couponCode: z.string().optional(),
    }),
    body: z.object({
     providerWorkShopId: z.string(),
    })
})

export const clickpayValidation = {
     initiatePaymentZodSchema,
}