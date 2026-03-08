import { z } from 'zod'

export const customerSchema = z.object({
    email: z.string()
        .email('E-mail inválido')
        .max(100, 'E-mail deve ter no máximo 100 caracteres'),
})

export const affiliateSchema = customerSchema

export type CustomerFormData = z.infer<typeof customerSchema>
export type AffiliateFormData = z.infer<typeof affiliateSchema>