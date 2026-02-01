"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/auth-store"
import Input from "./input"
import { createUser } from "../services/user-service"

interface AffiliateModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AffiliateModal({ isOpen, onClose }: AffiliateModalProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const router = useRouter()
    const { login } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Criar usuário com os dados necessários para afiliado
            const response = await createUser(
                name,
                Number(phone.replace(/\D/g, '')),
                email,
                password,
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
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Nome completo
                        </label>
                        <Input
                            type="text"
                            placeholder="Seu nome completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            E-mail
                        </label>
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            WhatsApp
                        </label>
                        <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                const formatted = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
                                e.target.value = formatted
                                setPhone(formatted)
                            }}
                            maxLength={15}
                            className="w-full"
                            numericOnly
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Senha
                        </label>
                        <Input
                            type="password"
                            placeholder="Crie uma senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            required
                        />
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