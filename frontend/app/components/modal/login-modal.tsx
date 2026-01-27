
'use client'

import { useState } from "react"
import ModalContainer from "./modal-container"
import Logo from "../logo"
import Input from "../input"
import { loginUser } from "@/app/services/user-service"
import { useAuthStore } from "@/app/stores/auth-store"

import { Phone, MessageCircle, Lock } from "lucide-react"

interface LoginPayload {
    phone: number
    password: string
}

interface LoginModalProps {
    isVisible: boolean
    onAccept: () => void
    onDecline: () => void
}

export default function LoginModal({ isVisible, onAccept, onDecline }: LoginModalProps) {

    const [loginPayload, setLoginPayload] = useState<LoginPayload>({ phone: 0, password: '' })
    const [isProcessing, setIsProcessing] = useState(false)
    const { login: loginUserToStore } = useAuthStore()

    const handleLogin = async () => {

        if (loginPayload.phone === 0 || loginPayload.password === '') {
            alert('Por favor, preencha todos os campos de login.')
            return
        }

        setIsProcessing(true)

        try {
            const loginResponse = await loginUser(loginPayload.phone, loginPayload.password)
            console.log('Login successful:', loginResponse)
            loginUserToStore(loginResponse?.user)
            onAccept()
        } catch (error) {
            console.error('Login failed:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <ModalContainer>
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center w-[95%] shadow-2xl shadow-black/50">
                    <Logo />
                    <h1 className="text-2xl font-bold">Entrar na sua conta</h1>
                    <p>Insira seus dados de login abaixo para voltar a espiar as maiores modelos da cena hot!</p>

                    <div className="grid grid-cols-1 gap-4 w-full">
                        <Input
                            type="text"
                            placeholder="Seu Telefone (Com DDD)"
                            icon={<Phone className="w-5 h-5" />}
                            onChange={(e) => setLoginPayload({ ...loginPayload, phone: Number(e.target.value) })}
                            numericOnly
                            className="text-lg"
                        />
                        <Input
                            type="password"
                            placeholder="Insira sua Senha"
                            icon={<Lock className="w-5 h-5" />}
                            onChange={(e) => setLoginPayload({ ...loginPayload, password: e.target.value })}
                            className="text-lg"
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
                        <div className="text-sm text-neutral-400 mt-2">
                            <a href="#" className="hover:underline">Esqueceu sua senha?</a>
                        </div>
                    </div>
                </div>
            </ModalContainer>
        </>
    )
}