import { z } from 'zod'

export const userSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .regex(/\s/, 'Nome deve conter pelo menos nome e sobrenome'),
  
  email: z.string()
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres'),
  
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(11, 'Telefone deve ter no máximo 11 dígitos')
    .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
})

export const affiliateSchema = userSchema

export type UserFormData = z.infer<typeof userSchema>
export type AffiliateFormData = z.infer<typeof affiliateSchema>