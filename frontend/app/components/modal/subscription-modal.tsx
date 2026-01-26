import Logo from "../logo"
import ModelsCarousel from "../models-carousel"
import ModalContainer from "./modal-container"
import Accordion from "../accordion"
import { useState, useEffect } from "react"
import Input from "../input"
import copy from "copy-to-clipboard"

import { Clipboard, Lock, MessageCircle, User, Mail } from "lucide-react"
import { createUser } from "@/app/services/user-service"
import { createPaymentIntent, checkTransactionStatus } from "@/app/services/payments-service"

interface SubscriptionModalProps {
    isVisible: boolean
    title: string
    dailyLimit: boolean
    onAccept: () => void
    onDecline: () => void
}

interface FormData {
    phone: string
    name: string
    email: string
    password: string
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

export default function SubscriptionModal({ isVisible, title, dailyLimit, onAccept, onDecline }: SubscriptionModalProps) {

    const prices = {
        forever: 49.90,
        monthly: 25.90,
        discountForever: (((5.90 * 12) - 14.90) / (5.90 * 12) * 100)
    }

    const [selectedPlan, setSelectedPlan] = useState<Plan>({ id: 'RAPIDINHAS_VITALICIO', name: 'vitalicio' })
    const [pixData, setPixData] = useState<PixData>()

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
    const [step, setStep] = useState<'select' | 'signup' | 'payment'>('select')

    const [payload, setPayload] = useState<FormData>({
        phone: '',
        name: '',
        email: '',
        password: ''
    })

    const [copiedCode, setCopiedCode] = useState(false)

    const toCamelCase = (str: string) => {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    const handlePixPayment = async () => {

        if (step === 'select') {
            setStep('signup')
        } else if (step === 'signup') {

            setIsProcessing(true)

            const response = await createUser(
                payload.name,
                Number(payload.phone),
                payload.email,
                payload.password
            )

            if (response?.user?.id) {

                const paymentIntent = await createPaymentIntent({
                    planId: selectedPlan.id,
                    customer: {
                        name: payload.name,
                        cellphone: payload.phone,
                        email: payload.email,
                        userId: response?.user?.id
                    }
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
                    
                    setInterval(() => {
                        onAccept()
                    }, 2000)

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
            "Suporte via Telegram",
        ],
        mensal: [
            "Até 50 downloads por mês",
            "Assista sem Limites",
        ]
    }

    const models = [

        {
            name: "Andressa Urach",
            description: "Atriz premiada com performances inesquecíveis",
            image: "https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2024/09/andressa-urach-1.jpg?w=1200&h=1200&crop=1"
        },
        {
            name: "Martina Oliveira",
            description: "'Beiçola da Privacy', que se destacou por seu marketing agressivo",
            image: "https://galegonoticias.com.br/images/noticias/2261/5c0c97124a84adeb0c00aa4c2aef7382.jpg"
        },
        {
            name: "Juliana Bonde",
            description: "vocalista da banda de forró Bonde do Forró, misturando inocência e ousadia",
            image: "https://conteudo.imguol.com.br/c/entretenimento/64/2020/06/09/juliana-bonde-conheca-o-novo-dinamo-das-redes-sociais-1591744363872_v2_1x1.png"
        },
        {
            name: "Professora Cibelly",
            description: "vídeos de 'dancinhas' com alunos",
            image: "https://yt3.googleusercontent.com/pDlownBL9wWHY4Wx77XRcMkfkuJFI7MNvpZeQtGdINw-nCr8Bg_VZbf1qMR8XWmoxwt-O7Xf2cA=s900-c-k-c0x00ffffff-no-rj"
        },
        {
            name: "MC Mirella",
            description: "Destacando-se pelo estilo funk ousado",
            image: "https://otempo.scene7.com/is/image/sempreeditora/entretenimento-mc-mirella-1743627390?qlt=90&ts=1743627849111&dpr=off"
        },
        {
            name: "MC Pipokinha",
            description: "Rainha da Putaria com conteúdo sexual explícito, como sexo oral em fã no palco",
            image: "https://spdiario.com.br/media/_versions/mc-pipokinha-valor-nudes_widemd.jpg"
        },
        {
            name: "Muito +",
            description: "Muito mais modelos esperando por você de A á Z!",
            image: "https://blog.privacy.com.br/wp-content/uploads/2024/07/sejaprivacy-capablog-demandas-10-perfis-mais-acessados-1920x1080-1.png"
        }
    ]

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
                                <>
                                    <div className="grid grid-cols-1 gap-4 w-full">
                                        <Input
                                            icon={<User className="w-5 h-5" />}
                                            type="text"
                                            placeholder="Nome de usuário"
                                            onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                                            value={payload.name}
                                        />
                                        <Input
                                            icon={<MessageCircle className="w-5 h-5" />}
                                            type="text"
                                            placeholder="Telefone com DDD"
                                            onChange={(e) => setPayload({ ...payload, phone: e.target.value })}
                                            value={payload.phone}
                                            numericOnly
                                        />
                                        <Input
                                            icon={<Mail className="w-5 h-5" />}
                                            type="text"
                                            placeholder="E-mail"
                                            onChange={(e) => setPayload({ ...payload, email: e.target.value })}
                                            value={payload.email}
                                        />

                                        <Input
                                            icon={<Lock className="w-5 h-5" />}
                                            type="password"
                                            placeholder="Senha"
                                            onChange={(e) => setPayload({ ...payload, password: e.target.value })}
                                            value={payload.password}
                                        />

                                    </div>
                                </>
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

                        <button
                            className="bg-green-600 text-white px-4 py-2 mt-4 rounded w-full shadow-2xl shadow-green-600/50"
                            onClick={handlePixPayment}
                            disabled={isProcessing}
                        >
                            <div className="flex justify-center items-center gap-2">
                                {isProcessing ? (
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
                            <p className={`text-xs ${isProcessing || step !== 'select' ? 'hidden' : ''}`}>Insira seu <b>Telegram</b> para continuar</p>
                        </button>
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
            </ModalContainer>
        </>
    )

}