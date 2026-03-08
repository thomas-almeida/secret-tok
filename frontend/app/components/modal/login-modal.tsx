
'use client'

import { useState } from "react"
import ModalContainer from "./modal-container"
import Logo from "../logo"
import Input from "../input"
import { loginUser } from "@/app/services/user-service"
import { useAuthStore, useCustomerStore } from "@/app/stores/auth-store"

import { Phone, Mail, MessageCircle, Lock } from "lucide-react"

interface LoginPayload {
    phone: number
    password: string
}

interface CustomerLoginPayload {
    email: string
}

interface LoginModalProps {
    isVisible: boolean
    isCustomer: boolean
    onAccept: () => void
    onDecline: () => void
    onNeedSubscription?: () => void
    onCreateAccount?: () => void
}

export default function LoginModal({ isVisible, isCustomer, onAccept, onDecline, onNeedSubscription, onCreateAccount }: LoginModalProps) {

    const [loginPayload, setLoginPayload] = useState<LoginPayload>({ phone: 0, password: '' })
    const [customerLoginPayload, setCustomerLoginPayload] = useState<CustomerLoginPayload>({ email: '' })

    const [isProcessing, setIsProcessing] = useState(false)
    const { login: loginUserToStore } = useAuthStore()
    const { loginCustomer: loginCustomerToStore } = useCustomerStore()

    const handleLogin = async () => {

        if (!isCustomer) {
            if (loginPayload.phone === 0 || loginPayload.password === '') {
                alert('Por favor, preencha todos os campos de login.')
                return
            }
        } else {
            if (customerLoginPayload.email === '') {
                alert('Por favor, preencha o e-mail.')
                return
            }
        }

        setIsProcessing(true)

        try {

            let loginParams: { phone?: number, password?: string, email?: string } = {}

            if (!isCustomer) {
                loginParams.phone = loginPayload.phone
                loginParams.password = loginPayload.password
            } else {
                loginParams.email = customerLoginPayload.email
            }

            let loginResponse = await loginUser(loginParams)

            console.log('Login successful:', loginResponse)
            console.log('Subscription active:', loginResponse?.user?.subscription?.active)
            if (!isCustomer) {
                loginUserToStore(loginResponse?.user)
            } else {
                loginCustomerToStore(loginResponse?.user)
            }

            // Verificar se subscription está ativa
            if (loginResponse?.user?.subscription?.active !== true) {
                // Subscription não está ativa, mostrar modal de pagamento
                console.log('Abrindo modal de pagamento')
                if (onNeedSubscription) {
                    onNeedSubscription()
                }
            } else {
                // Subscription ativa, fazer login normalmente
                console.log('Subscription ativa, fechando login')
                onAccept()
            }
        } catch (error) {
            console.error('Login failed:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <ModalContainer>
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center w-[95%] shadow-2xl shadow-black/50 lg:max-w-xl">
                    <Logo />
                    <h1 className="text-2xl font-bold">Entrar na sua conta</h1>
                    <p>Insira seus dados de login abaixo para voltar a espiar as maiores modelos da cena hot!</p>

                    <div className="grid grid-cols-1 gap-4 w-full">

                        <Input
                            type="text"
                            placeholder="Seu E-mail"
                            icon={<Mail className="w-5 h-5" />}
                            onChange={(e) => setCustomerLoginPayload({ email: e.target.value })}
                            className={`text-lg ${!isCustomer && 'hidden'}`}
                        />

                        <Input
                            type="text"
                            placeholder="Seu Telefone (Com DDD)"
                            icon={<Phone className="w-5 h-5" />}
                            onChange={(e) => setLoginPayload({ ...loginPayload, phone: Number(e.target.value) })}
                            numericOnly
                            className={`text-lg ${isCustomer && 'hidden'}`}
                        />

                        <Input
                            type="password"
                            placeholder="Insira sua Senha"
                            icon={<Lock className="w-5 h-5" />}
                            onChange={(e) => setLoginPayload({ ...loginPayload, password: e.target.value })}
                            className={`text-lg ${isCustomer && 'hidden'}`}
                        />


                        <button
                            onClick={handleLogin}
                            className="flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 text-lg rounded w-full shadow-2xl transition-all"
                        >
                            {isProcessing ? 'Entrando...' : 'Entrar'}
                            {isProcessing && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                        </button>
                        <button
                            onClick={onDecline}
                            className="flex justify-center items-center gap-2 border border-slate-600 text-white font-bold py-2 px-4 text-lg rounded w-full shadow-2xl transition-all"
                        >
                            Voltar
                        </button>
                        <div className={`flex justify-between text-sm text-neutral-400 mt-2 ${isCustomer && 'hidden'}`}>
                            <button onClick={onCreateAccount} className="hover:underline text-white font-medium">Criar conta</button>
                            <a href="#" className="hover:underline">Esqueceu sua senha?</a>
                        </div>
                    </div>
                </div>
            </ModalContainer>
        </>
    )
}