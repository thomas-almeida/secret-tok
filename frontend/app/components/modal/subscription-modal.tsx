import Logo from "../logo"
import ModelsCarousel from "../models-carousel"
import ModalContainer from "./modal-container"
import Accordion from "../accordion"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Input from "../input"
import copy from "copy-to-clipboard"
import { models } from "@/app/utils/models"

import { Clipboard, Lock, MessageCircle, User, Mail } from "lucide-react"
import { createUser } from "@/app/services/user-service"
import { createPaymentIntent, checkTransactionStatus } from "@/app/services/payments-service"
import { useAuthStore } from "@/app/stores/auth-store"
import { userSchema, type UserFormData } from "@/app/schemas/user-schema"

interface SubscriptionModalProps {
    isVisible: boolean
    title: string
    dailyLimit: boolean
    onAccept: () => void
    onDecline: () => void
    onShowLogin?: () => void
    initialStep?: 'select' | 'signup' | 'payment'
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

export default function SubscriptionModal({ isVisible, title, dailyLimit, onAccept, onDecline, onShowLogin, initialStep = 'select', isRePayment = false }: SubscriptionModalProps) {

    const { isAuthenticated, user, login: loginUserToStore } = useAuthStore()

    const prices = {
        forever: 49.90,
        monthly: 25.90,
        discountForever: (((5.90 * 12) - 14.90) / (5.90 * 12) * 100)
    }

    const [selectedPlan, setSelectedPlan] = useState<Plan>({ id: 'RAPIDINHAS_VITALICIO', name: 'vitalicio' })
    const [pixData, setPixData] = useState<PixData>()
    const afiliateCode = localStorage.getItem("afiliate-code")

    const plans = [
        {
            id: 'RAPIDINHAS_VITALICIO',
            name: 'vitalicio',
        },
        {
            id: 'RAPIDINHAS_MENSAL',
            name: 'mensal',
        }
    ]

    const [isProcessing, setIsProcessing] = useState(false)
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
    const [step, setStep] = useState<'select' | 'signup' | 'payment'>(isRePayment ? 'payment' : initialStep)
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
        formState: { errors, isValid },
        setValue,
        watch,
        trigger
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: ''
        }
    })

    const phoneValue = watch('phone', '')

    const [copiedCode, setCopiedCode] = useState(false)

    // Gerar payment intent automaticamente quando usuário já autenticado precisa pagar subscription
    useEffect(() => {
        const generatePaymentForAuthenticatedUser = async () => {
            console.log('Payment Effect - isAuthenticated:', isAuthenticated, 'isVisible:', isVisible, 'isRePayment:', isRePayment, 'step:', step, 'pixData:', pixData)

            if (isAuthenticated && isVisible && isRePayment && step === 'payment' && !pixData) {
                // Usuário está logado e precisa pagar, gerar payment intent
                console.log('Iniciando geração de payment intent')
                setIsLoadingPayment(true)

                try {
                    const paymentIntent = await createPaymentIntent({
                        planId: selectedPlan.id,
                        customer: {
                            name: user?.name || '',
                            cellphone: user?.phone?.toString() || '',
                            email: user?.email || '',
                            userId: user?._id || ''
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
    }, [isAuthenticated, isVisible, isRePayment, step, selectedPlan, pixData, user])

    useEffect(() => {
        if (isAuthenticated && isVisible && initialStep === 'select' && !isRePayment) {
            onAccept()
        }
    }, [isAuthenticated, isVisible, initialStep, isRePayment, onAccept])

    const toCamelCase = (str: string) => {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    const handlePixPayment = async (data?: UserFormData) => {

        if (step === 'select') {
            setStep('signup')
        } else if (step === 'signup') {
            if (!data) return

            setIsProcessing(true)

            const response = await createUser(
                data.name,
                Number(data.phone),
                data.email,
                data.password,
                {
                    amount: selectedPlan.name === 'vitalicio' ? prices.forever : prices.monthly,
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

                setNewUser(response.user)

                const paymentIntent = await createPaymentIntent({
                    planId: selectedPlan.id,
                    customer: {
                        name: data.name,
                        cellphone: data.phone,
                        email: data.email,
                        userId: response?.user?._id
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

        } else if (step === 'payment') {

            setIsProcessing(true)

            if (pixData?.pixId) {
                try {
                    const statusResponse = await checkTransactionStatus(pixData.pixId)
                    console.log(statusResponse)
                    setPixData({
                        ...pixData,
                        status: statusResponse?.transactionStatus
                    })
                    setIsProcessing(false)

                    if (statusResponse?.transactionStatus === 'PAID') {
                        setInterval(() => {
                            localStorage.setItem('is-subscribed', 'true')
                            if (newUser) {
                                loginUserToStore(newUser as any)
                            }
                            onAccept()
                        }, 2000)
                    }

                } catch (error) {
                    console.error('Erro ao verificar status da transação:', error)
                    setIsProcessing(false)
                }
            }

        }

    }

    const handlePlanSelect = (plan: Plan) => {
        setSelectedPlan(plan)
        setExpandedPlan(expandedPlan === plan.name ? null : plan.name)
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



    const planBenefits = {
        vitalicio: [
            "Downloads ilimitados",
            "Acesso exclusivo à aba FAMOSAS",
            "Assista sem Limites",
            "Ganhe Comissões como afiliado",
            "Suporte via Telegram/Whatsapp",
        ],
        mensal: [
            "Até 50 downloads por mês",
            "Assista sem Limites",
        ]
    }
    
    if (!isVisible) return null

    return (
        <>
            <ModalContainer>
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center w-[95%] shadow-2xl shadow-black/50">
                    <Logo />
                    <div>
                        <h1 className="text-xl font-bold">
                            {
                                step === 'select' ? title :
                                    step === 'signup' ? 'Crie sua Conta' :
                                        'Pagamento via PIX'
                            }
                        </h1>
                        <p className={'text-sm py-1'}>
                            {
                                step === 'select' ? 'Continue espiando tornando-se VIP e assista sem limites!, Todas elas estão aqui!' :
                                    step === 'signup' ? 'Complete seu cadastro para continuar.' :
                                        'Quase lá, use o QR Code abaixo para completar seu pagamento e aproveitar seus benefícios.'
                            }
                        </p>
                    </div>

                    {step === 'select' && (
                        <ModelsCarousel models={models} />
                    )}

                    <div className="grid grid-cols-1 gap-2 w-full text-lg">

                        {
                            step === 'select' && plans.map((plan) => (
                                <Accordion
                                    key={plan.id}
                                    selectedPlan={plan}
                                    expandedPlan={expandedPlan}
                                    handlePlanSelect={handlePlanSelect}
                                    planBenefits={planBenefits}
                                    prices={plan.name === 'vitalicio' ? prices.forever : prices.monthly}
                                    planName={toCamelCase(plan.name)}
                                    promotional={plan.name === 'vitalicio'}
                                />
                            ))
                        }

                        {
                            step === 'signup' && (
                                <form onSubmit={handleSubmit(handlePixPayment)} className="grid grid-cols-1 gap-4 w-full">
                                    <div>
                                        <Input
                                            icon={<User className="w-5 h-5" />}
                                            type="text"
                                            placeholder="Nome completo"
                                            {...register('name', {
                                                onChange: () => trigger('name')
                                            })}
                                        />
                                        {errors.name && (
                                            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <Input
                                            icon={<MessageCircle className="w-5 h-5" />}
                                            type="tel"
                                            placeholder="Telefone com DDD"
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
                                            numericOnly
                                        />
                                        {errors.phone && (
                                            <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <Input
                                            icon={<Mail className="w-5 h-5" />}
                                            type="email"
                                            placeholder="E-mail"
                                            {...register('email', {
                                                onChange: () => trigger('email')
                                            })}
                                        />
                                        {errors.email && (
                                            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            icon={<Lock className="w-5 h-5" />}
                                            type="password"
                                            placeholder="Senha"
                                            {...register('password', {
                                                onChange: () => trigger('password')
                                            })}
                                        />
                                        {errors.password && (
                                            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                                        )}
                                    </div>
                                </form>
                            )
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
                            onClick={() => step === 'signup' ? handleSubmit(handlePixPayment)() : handlePixPayment()}
                            disabled={isProcessing || (step === 'payment' && isLoadingPayment) || (step === 'signup' && !isValid)}
                        >
                            <div className="flex justify-center items-center gap-2">
                                {isProcessing || (step === 'payment' && isLoadingPayment) ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <h3 className="font-bold">{
                                            step === 'select'
                                                ? 'Continuar para Cadastro' :
                                                step === 'signup'
                                                    ? 'Cadastrar e Continuar'
                                                    : 'Verificar Pagamento'
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
                                    className="border py-2 mt-2 rounded w-full shadow-2xl transition-all border-slate-100 text-white hover:bg-slate-100 hover:text-neutral-900"
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