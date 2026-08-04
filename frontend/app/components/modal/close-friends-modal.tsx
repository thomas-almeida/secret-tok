"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import copy from "copy-to-clipboard"
import Logo from "../logo"
import ModalContainer from "./modal-container"
import Input from "../input"
import { Mail, Lock, Sparkles } from "lucide-react"
import { createCustomer } from "@/app/services/user-service"
import { createCloseFriendsPaymentIntent, checkTransactionStatus } from "@/app/services/payments-service"
import { useCustomerStore } from "@/app/stores/auth-store"
import { customerSchema, type CustomerFormData } from "@/app/schemas/customer-schema"

interface CloseFriendsModalProps {
    isVisible: boolean
    onAccept: () => void
    onDecline: () => void
}

type PixData = {
    pixId: string
    brCode: string
    brCode64: string
    status: string
}

const PROMO_DURATION_SECONDS = 10 * 60

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function CloseFriendsModal({ isVisible, onAccept, onDecline }: CloseFriendsModalProps) {
    const { isCustomerAuthenticated, customer, loginCustomer: loginCustomerToStore } = useCustomerStore()
    const afiliateCode = typeof window !== 'undefined' ? localStorage.getItem("afiliate-code") : null

    const [step, setStep] = useState<'email' | 'payment'>(isCustomerAuthenticated ? 'payment' : 'email')
    const [pixData, setPixData] = useState<PixData>()
    const [isProcessing, setIsProcessing] = useState(false)
    const [isLoadingPayment, setIsLoadingPayment] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(PROMO_DURATION_SECONDS)
    const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null)
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        mode: 'onChange',
        defaultValues: { email: '' }
    })

    // Countdown puramente visual, reforça a urgência da promoção
    useEffect(() => {
        if (!isVisible || step !== 'payment') return
        setSecondsLeft(PROMO_DURATION_SECONDS)
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [isVisible, step])

    const generatePayment = useCallback(async (email: string, customerId: string) => {
        setIsLoadingPayment(true)
        try {
            const paymentIntent = await createCloseFriendsPaymentIntent({
                customer: { email, customerId },
                referenceId: afiliateCode || 'none'
            })

            setPixData({
                pixId: paymentIntent?.paymentIntent?.id,
                brCode: paymentIntent?.paymentIntent?.brCode,
                brCode64: paymentIntent?.paymentIntent?.brCodeBase64,
                status: paymentIntent?.paymentIntent?.status
            })
        } catch (error) {
            console.error('Erro ao gerar pagamento do close friends:', error)
        } finally {
            setIsLoadingPayment(false)
        }
    }, [afiliateCode])

    useEffect(() => {
        if (isVisible && step === 'payment' && !pixData) {
            const email = customer?.email || pendingEmail
            const customerId = customer?._id || pendingCustomerId
            if (email && customerId) {
                generatePayment(email, customerId)
            }
        }
    }, [isVisible, step, pixData, customer, pendingCustomerId, pendingEmail, generatePayment])

    const handleEmailSubmit = async (data: CustomerFormData) => {
        setIsProcessing(true)
        try {
            const response = await createCustomer(data.email, {
                amount: 0,
                transactionDate: new Date().toISOString(),
                isActive: false
            })

            if (response?.customer?._id) {
                setPendingCustomerId(response.customer._id)
                setPendingEmail(data.email)
                setStep('payment')
            }
        } catch (error) {
            console.error('Erro ao criar customer para close friends:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const checkPaymentStatus = useCallback(async () => {
        if (!pixData?.pixId) return

        try {
            const statusResponse = await checkTransactionStatus(pixData.pixId)

            setPixData((prev) => prev ? { ...prev, status: statusResponse?.transactionStatus } : prev)

            if (statusResponse?.transactionStatus === 'PAID') {
                if (statusResponse?.customer) {
                    loginCustomerToStore(statusResponse.customer)
                }
                onAccept()
            }
        } catch (error) {
            console.error('Erro ao verificar pagamento do close friends:', error)
        }
    }, [pixData?.pixId, loginCustomerToStore, onAccept])

    useEffect(() => {
        if (step !== 'payment' || !pixData?.pixId || pixData.status === 'PAID') return

        const interval = setInterval(() => {
            checkPaymentStatus()
        }, 5000)

        return () => clearInterval(interval)
    }, [step, pixData?.pixId, pixData?.status, checkPaymentStatus])

    const handleCopyCode = () => {
        if (!pixData?.brCode) return
        const copied = copy(pixData.brCode)
        if (copied) {
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 3000)
        }
    }

    if (!isVisible) return null

    return (
        <ModalContainer>
            <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center w-[95%] shadow-2xl shadow-black/50 lg:max-w-xl">
                <Logo />

                <div className="w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h1 className="text-xl font-bold">Close Friends</h1>
                    </div>
                    <p className="text-sm text-neutral-300">
                        Acesso vitalício aos stories exclusivos de <b>todas</b> as modelos, sem limite. Conteúdo que só quem é close friends vê.
                    </p>
                </div>

                <div className="w-full bg-purple-950/40 border border-purple-500/40 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-neutral-400 line-through text-sm">R$ 29,90</span>
                        <span className="text-2xl font-bold text-white">R$ 9,90</span>
                    </div>
                    <p className="text-purple-300 text-xs mt-1">
                        Oferta promocional válida por mais <b>{formatTime(secondsLeft)}</b>
                    </p>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleSubmit(handleEmailSubmit)} className="grid grid-cols-1 gap-4 w-full">
                        <Input
                            icon={<Mail className="w-5 h-5" />}
                            type="email"
                            placeholder="Seu e-mail"
                            {...register('email', { onChange: () => trigger('email') })}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs -mt-2">{errors.email.message}</p>
                        )}
                    </form>
                )}

                {step === 'payment' && pixData && (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <img src={pixData.brCode64} alt="PIX QR Code" className="w-54 h-54 p-2 border-2 rounded shadow-2xl" />
                        <Input type="text" value={pixData?.brCode} className="w-full" />
                        <button
                            className={`border py-2 rounded w-full shadow-2xl transition-all ${copiedCode
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-slate-100 text-white hover:bg-slate-100 hover:text-neutral-900'
                                }`}
                            onClick={handleCopyCode}
                        >
                            {copiedCode ? '✓ Código Copiado!' : 'Copiar Código PIX'}
                        </button>
                        <div className={pixData.status === 'PAID' ? 'text-green-400 font-bold text-sm' : 'text-yellow-400 font-bold text-sm'}>
                            STATUS: <b>{pixData.status === 'PENDING' ? 'Pendente' : pixData.status === 'PAID' ? 'Pago!' : pixData.status}</b>
                        </div>
                    </div>
                )}

                {step === 'payment' && isLoadingPayment && (
                    <div className="flex flex-col items-center justify-center gap-4 w-full py-8">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-neutral-300">Gerando QR Code de pagamento...</p>
                    </div>
                )}

                {step === 'email' ? (
                    <button
                        onClick={handleSubmit(handleEmailSubmit)}
                        disabled={isProcessing}
                        className="bg-purple-600 text-white px-4 py-2 rounded w-full shadow-2xl shadow-purple-600/50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 font-bold"
                    >
                        {isProcessing ? 'Processando...' : 'Quero acesso vitalício'}
                    </button>
                ) : (
                    <button
                        onClick={checkPaymentStatus}
                        disabled={isLoadingPayment || pixData?.status === 'PAID'}
                        className="flex justify-center items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded w-full shadow-2xl shadow-purple-600/50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 font-bold"
                    >
                        <Lock className="w-4 h-4" />
                        Verificar Pagamento
                    </button>
                )}

                <button
                    className="text-slate-200 px-4 pt-2 rounded w-full text-sm"
                    onClick={onDecline}
                >
                    Agora não
                </button>
            </div>
        </ModalContainer>
    )
}
