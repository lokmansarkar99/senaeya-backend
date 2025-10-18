import { z } from "zod";

const initiatePaymentZodSchema = z.object({
    params: z.object({
     packageId: z.string(),
    }),
    body: z.object({
     providerWorkShopId: z.string(),
    })
})

export const clickpayValidation = {
     initiatePaymentZodSchema,
}