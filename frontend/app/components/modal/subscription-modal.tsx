import Logo from "../logo"
import ModelsCarousel from "../models-carousel"
import ModalContainer from "./modal-container"
import Accordion from "../accordion"
import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Input from "../input"
import copy from "copy-to-clipboard"
import { models } from "@/app/utils/models"

import { Clipboard, Lock, MessageCircle, User, Mail } from "lucide-react"
import { createUser, createCustomer } from "@/app/services/user-service"
import { createPaymentIntent, checkTransactionStatus } from "@/app/services/payments-service"
import { useAuthStore, useCustomerStore } from "@/app/stores/auth-store"
import { userSchema, type UserFormData } from "@/app/schemas/user-schema"
import { customerSchema, type CustomerFormData } from "@/app/schemas/customer-schema"

interface SubscriptionModalProps {
    isVisible: boolean
    title: string
    dailyLimit: boolean
    customValues?: any
    onAccept: () => void
    onDecline: () => void
    onShowLogin?: () => void
    initialStep?: 'select' | 'payment'
    isRePayment?: boolean
}

type Plan = {
    id: string
    name: string
}

type PixData = {
    pixId: string
    brCode: string
    brCode64: string
    status: string
}

export default function SubscriptionModal({ isVisible, title, dailyLimit, customValues: initialCustomValues, onAccept, onDecline, onShowLogin, initialStep = 'select', isRePayment = false }: SubscriptionModalProps) {

    const { isCustomerAuthenticated, customer, loginCustomer: loginUserToStore } = useCustomerStore()
    const [customValues, setCustomValues] = useState(initialCustomValues)
    const afiliateCode = typeof window !== 'undefined' ? localStorage.getItem("afiliate-code") : null

    useEffect(() => {
        if (initialCustomValues) {
            setCustomValues(initialCustomValues)
        } else if (afiliateCode) {
            const fetchAfiliateDataInternal = async () => {
                try {
                    const { getAfiliateData } = await import("@/app/services/user-service")
                    const response = await getAfiliateData(afiliateCode)
                    if (response?.data?.customPlans) {
                        setCustomValues(response.data.customPlans)
                    }
                } catch (error) {
                    console.error("Erro ao buscar planos customizados internamente:", error)
                }
            }
            fetchAfiliateDataInternal()
        }
    }, [initialCustomValues, afiliateCode])

    const prices = {
        forever: customValues?.lifetime / 100 || 49.90,
        monthly: customValues?.monthly / 100 || 29.90,
    }

    const plans = [
        {
            id: 'lifetime',
            name: 'vitalicio',
        },
        {
            id: 'monthly',
            name: 'mensal',
        }
    ]

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(plans[0])
    const [pixData, setPixData] = useState<PixData>()

    const [isProcessing, setIsProcessing] = useState(false)
    const [expandedPlan, setExpandedPlan] = useState<string | null>(plans[0].name)
    const [step, setStep] = useState<'select' | 'payment'>(isRePayment ? 'payment' : initialStep)
    const [newUser, setNewUser] = useState<{ _id: string; name: string; email: string; phone: string } | null>(null)
    const [isLoadingPayment, setIsLoadingPayment] = useState(false)

    // Garanta que quando isRePayment muda para true, o step vai direto para pagamento
    useEffect(() => {
        if (isRePayment && step !== 'payment') {
            console.log('Re-payment ativado, mudando para payment step')
            setStep('payment')
        }
    }, [isRePayment])

    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
        }
    })

    const [copiedCode, setCopiedCode] = useState(false)

    // Gerar payment intent automaticamente quando usuário já autenticado precisa pagar subscription
    useEffect(() => {
        const generatePaymentForAuthenticatedUser = async () => {
            console.log('Payment Effect - isCustomerAuthenticated:', isCustomerAuthenticated, 'isVisible:', isVisible, 'isRePayment:', isRePayment, 'step:', step, 'pixData:', pixData)

            if (isCustomerAuthenticated && isVisible && isRePayment && step === 'payment' && !pixData && selectedPlan) {
                // Usuário está logado e precisa pagar, gerar payment intent
                console.log('Iniciando geração de payment intent')
                setIsLoadingPayment(true)

                try {
                    const paymentIntent = await createPaymentIntent({
                        planId: selectedPlan.id,
                        customer: {
                            email: customer?.email || '',
                            customerId: customer?._id || ''
                        },
                        referenceId: afiliateCode || 'none'
                    })

                    console.log('Payment intent gerado:', paymentIntent)
                    setPixData({
                        pixId: paymentIntent?.paymentIntent?.id,
                        brCode: paymentIntent?.paymentIntent?.brCode,
                        brCode64: paymentIntent?.paymentIntent?.brCodeBase64,
                        status: paymentIntent?.paymentIntent?.status
                    })
                } catch (error) {
                    console.error('Erro ao gerar intent de pagamento:', error)
                } finally {
                    setIsLoadingPayment(false)
                }
            }
        }

        generatePaymentForAuthenticatedUser()
    }, [isCustomerAuthenticated, isVisible, isRePayment, step, selectedPlan, pixData, customer])

    useEffect(() => {
        if (isCustomerAuthenticated && isVisible && initialStep === 'select' && !isRePayment) {
            onAccept()
        }
    }, [isCustomerAuthenticated, isVisible, initialStep, isRePayment, onAccept])

    const toCamelCase = (str: string) => {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    const checkPaymentStatus = useCallback(async () => {
        if (!pixData?.pixId) return

        try {
            const statusResponse = await checkTransactionStatus(pixData.pixId)
            console.log(statusResponse)

            setPixData((prev) => prev ? { ...prev, status: statusResponse?.transactionStatus } : prev)

            if (statusResponse?.transactionStatus === 'PAID') {
                localStorage.setItem('is-subscribed', 'true')
                // Usa o customer atualizado que o backend retorna (subscription.active já true),
                // em vez do customer capturado antes do pagamento, que ficaria com acesso desatualizado.
                if (statusResponse?.customer) {
                    loginUserToStore(statusResponse.customer)
                }
                onAccept()
            }
        } catch (error) {
            console.error('Erro ao verificar status da transação:', error)
        }
    }, [pixData?.pixId, loginUserToStore, onAccept])

    // Poll automático: evita depender do usuário clicar "Verificar Pagamento" manualmente
    useEffect(() => {
        if (step !== 'payment' || !pixData?.pixId || pixData.status === 'PAID') return

        const interval = setInterval(() => {
            checkPaymentStatus()
        }, 5000)

        return () => clearInterval(interval)
    }, [step, pixData?.pixId, pixData?.status, checkPaymentStatus])

    const handlePixPayment = async (data?: CustomerFormData) => {

        console.log(step)

        if (step == 'select') {
            if (!data || !selectedPlan) return

            setIsProcessing(true)

            const response = await createCustomer(
                data.email,
                {
                    amount: selectedPlan.name === 'vitalicio' ? prices.forever : prices.monthly,
                    transactionDate: new Date().toISOString(),
                    isActive: false
                }
            )

            if (response?.customer?._id) {

                const paymentIntent = await createPaymentIntent({
                    planId: selectedPlan.id,
                    customer: {
                        email: data.email,
                        customerId: response?.customer?._id
                    },
                    referenceId: afiliateCode || 'none'
                })

                setPixData({
                    pixId: paymentIntent?.paymentIntent?.id,
                    brCode: paymentIntent?.paymentIntent?.brCode,
                    brCode64: paymentIntent?.paymentIntent?.brCodeBase64,
                    status: paymentIntent?.paymentIntent?.status
                })

                setStep('payment')
                setIsProcessing(false)
            }

        } else {
            setIsProcessing(true)
            await checkPaymentStatus()
            setIsProcessing(false)
        }
    }

    const handlePlanSelect = (plan: Plan) => {
        if (expandedPlan === plan.name) {
            setExpandedPlan(null)
            setSelectedPlan(null)
        } else {
            setExpandedPlan(plan.name)
            setSelectedPlan(plan)
        }
    }

    const handleCopyCode = async () => {
        if (!pixData?.brCode) return

        const copied = copy(pixData.brCode)

        if (copied) {
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 3000)
        } else {
            console.error('Falha ao copiar')
        }
    }


    if (!isVisible) return null

    return (
        <>
            <ModalContainer>
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center w-[95%] shadow-2xl shadow-black/50 lg:max-w-xl">
                    <Logo />
                    <div>
                        <h1 className="text-xl font-bold">
                            {
                                step === 'select' ? title : 'Pagamento via PIX'
                            }
                        </h1>
                        <p className={'text-sm py-1'}>
                            {
                                step === 'select'
                                    ? 'Continue espiando tornando-se VIP'
                                    : ''
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 w-full text-lg">

                        {
                            step === 'select' && (
                                <>
                                    <form onSubmit={handleSubmit(handlePixPayment)} className="grid grid-cols-1 gap-4 w-full mb-2">

                                        <div className="my-2">
                                            <Input
                                                icon={<Mail className="w-5 h-5" />}
                                                type="email"
                                                placeholder="Seu e-mail"
                                                {...register('email', {
                                                    onChange: () => trigger('email')
                                                })}
                                            />
                                            {errors.email && (
                                                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                            )}
                                        </div>

                                    </form>
                                </>
                            )
                        }


                        {
                            step === 'select' && plans.map((plan) => (
                                <Accordion
                                    key={plan.id}
                                    selectedPlan={plan}
                                    expandedPlan={expandedPlan}
                                    handlePlanSelect={handlePlanSelect}
                                    prices={plan.name === 'vitalicio' ? prices.forever : prices.monthly}
                                    planName={toCamelCase(plan.name)}
                                    promotional={plan.name === 'vitalicio'}
                                />
                            ))
                        }

                        {step === 'payment' && pixData && (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <img src={pixData.brCode64} alt="PIX QR Code" className="w-54 h-54 p-2 border-2 rounded shadow-2xl" />
                                <Input
                                    type="text"
                                    value={pixData?.brCode}
                                    className="w-full"
                                />
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
                                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-neutral-300">Gerando QR Code de pagamento...</p>
                            </div>
                        )}

                        <button
                            className="bg-green-600 text-white px-4 py-2 mt-4 rounded w-full shadow-2xl shadow-green-600/50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => step === 'select' ? handleSubmit(handlePixPayment)() : handlePixPayment()}
                            disabled={isProcessing || (step === 'payment' && isLoadingPayment) || (step === 'select' && !selectedPlan)}
                        >
                            <div className="flex justify-center items-center gap-2">
                                {isProcessing || (step === 'payment' && isLoadingPayment) ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <h3 className="font-bold">{
                                            step === 'select' ? 'Continuar' : 'Verificar Pagamento'
                                        }</h3>
                                        <img src="/icons/pix-white.png" alt="PIX" className={step === 'payment' ? 'w-6 h-6' : 'hidden'} />
                                    </>
                                )}
                            </div>
                            <p className={`text-xs ${isProcessing || step !== 'select' ? 'hidden' : ''}`}>Super rápido e discreto</p>
                        </button>

                        {
                            step === 'select' && (
                                <button
                                    className="border py-1 mt-2 rounded w-full shadow-2xl transition-all border-slate-50/20 text-white text-sm hover:bg-slate-100 hover:text-neutral-900"
                                    onClick={onShowLogin}
                                >
                                    Já Tenho Conta
                                </button>
                            )
                        }

                        {
                            dailyLimit ? (
                                <p className="text-red-200 px-4 pt-4 rounded w-full text-sm">Oferta válida até hoje: {new Date().toLocaleDateString('pt-BR')}</p>
                            ) : (
                                <button
                                    className="text-slate-200 px-4 pt-4 rounded w-full text-sm"
                                    onClick={onDecline}>Fechar e perder oferta
                                </button>
                            )
                        }
                    </div>
                </div>
            </ModalContainer >
        </>
    )

}