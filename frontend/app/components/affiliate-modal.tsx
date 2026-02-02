"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "../stores/auth-store"
import Input from "./input"
import { createUser } from "../services/user-service"
import { affiliateSchema, type AffiliateFormData } from "../schemas/user-schema"

interface AffiliateModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AffiliateModal({ isOpen, onClose }: AffiliateModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const router = useRouter()
    const { login } = useAuthStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger
    } = useForm<AffiliateFormData>({
        resolver: zodResolver(affiliateSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: ''
        }
    })

    const phoneValue = watch('phone', '')

    const onSubmit = async (data: AffiliateFormData) => {
        setLoading(true)
        setError('')

        try {
            // Criar usuário com os dados necessários para afiliado
            const response = await createUser(
                data.name,
                Number(data.phone),
                data.email,
                data.password,
                {
                    amount: 0, // Afiliados não pagam assinatura inicial
                    transactionDate: new Date().toISOString(),
                    isActive: false
                },
                {
                    balance: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    associatedUsers: []
                }
            )

            if (response?.user?._id) {
                // Salvar na store
                login(response.user)
                
                // Redirecionar para /afiliate
                router.push('/afiliate')
            } else {
                throw new Error('Erro ao criar conta de afiliado')
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Tornar-se Afiliado</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Nome completo
                        </label>
                        <Input
                            type="text"
                            placeholder="Seu nome completo"
                            {...register('name', {
                                onChange: () => trigger('name')
                            })}
                            className="w-full"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            E-mail
                        </label>
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            {...register('email', {
                                onChange: () => trigger('email')
                            })}
                            className="w-full"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            WhatsApp
                        </label>
                        <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={phoneValue}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                if (value.length <= 11) {
                                    const formatted = value.length >= 11 
                                        ? value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
                                        : value.length >= 7 
                                            ? value.replace(/^(\d{2})(\d{5}).*/, '($1) $2')
                                            : value.length >= 2 
                                                ? `(${value.slice(0, 2)}`
                                                : value
                                    setValue('phone', value.replace(/\D/g, ''))
                                    e.target.value = formatted
                                }
                            }}
                            maxLength={15}
                            className="w-full"
                            numericOnly
                            required
                        />
                        {errors.phone && (
                            <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Senha
                        </label>
                        <Input
                            type="password"
                            placeholder="Crie uma senha"
                            {...register('password', {
                                onChange: () => trigger('password')
                            })}
                            className="w-full"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}