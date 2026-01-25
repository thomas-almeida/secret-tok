import Logo from "../logo"
import ModelsCarousel from "../models-carousel"
import ModalContainer from "./modal-container"
import Accordion from "../accordion"
import { useState, useEffect } from "react"
import Input from "../input"

import { Clipboard, Lock, MessageCircle, User } from "lucide-react"

interface SubscriptionModalProps {
    isVisible: boolean
    title: string
    dailyLimit: boolean
    onAccept: () => void
    onDecline: () => void
}

export default function SubscriptionModal({ isVisible, title, dailyLimit, onAccept, onDecline }: SubscriptionModalProps) {

    const prices = {
        forever: 49.90,
        monthly: 25.90,
        discountForever: (((5.90 * 12) - 14.90) / (5.90 * 12) * 100)
    }

    const [selectedPlan, setSelectedPlan] = useState('vitalicio')
    const [isProcessing, setIsProcessing] = useState(false)
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
    const [step, setStep] = useState<'select' | 'signup' | 'payment'>('select')

    const toCamelCase = (str: string) => {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    const handlePixPayment = () => {

        setIsProcessing(true)
        setTimeout(() => {
            setIsProcessing(false)

            if (step === 'select') {
                setStep('signup')
            } else if (step === 'signup') {
                setStep('payment')
            }

        }, 1000)
    }

    const handlePlanSelect = (plan: string) => {
        setSelectedPlan(plan)
        setExpandedPlan(expandedPlan === plan ? null : plan)
    }

    const plans = ['vitalicio', 'mensal']

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
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center">
                    <Logo />
                    <div>
                        <h1 className="text-xl font-bold">
                            {
                                step === 'select' ? title :
                                    step === 'signup' ? 'Crie sua Conta' :
                                        'Pagamento via PIX'
                            }
                        </h1>
                        <p className={step === 'select' ? 'text-sm py-1' : 'hidden'}>Continue espiando tornando-se VIP e assista sem limites!, Todas elas estão aqui!</p>
                    </div>

                    {step === 'select' && (
                        <ModelsCarousel models={models} />
                    )}

                    <div className="grid grid-cols-1 gap-2 w-full text-lg">

                        {
                            step === 'select' && plans.map((plan) => (
                                <Accordion
                                    selectedPlan={plan}
                                    expandedPlan={expandedPlan}
                                    handlePlanSelect={handlePlanSelect}
                                    planBenefits={planBenefits}
                                    prices={plan === 'vitalicio' ? prices.forever : prices.monthly}
                                    planName={toCamelCase(plan)}
                                    promotional={plan === 'vitalicio'}
                                />

                            ))
                        }

                        {
                            step === 'signup' && (
                                <>
                                    <div className="grid grid-cols-1 gap-4 w-full">
                                        <Input
                                            icon={<MessageCircle className="w-5 h-5" />}
                                            type="text"
                                            placeholder="Telefone com DDD"
                                            value=""
                                        />
                                        <Input
                                            icon={<User className="w-5 h-5" />}
                                            type="text"
                                            placeholder="Nome de usuário"
                                            value=""
                                        />

                                        <Input
                                            icon={<Lock className="w-5 h-5" />}
                                            type="password"
                                            placeholder="Senha"
                                            value=""
                                        />

                                    </div>
                                </>
                            )
                        }

                        {step === 'payment' && (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <img src="/qrcode.svg" alt="PIX QR Code" className="w-54 h-54 p-2 border rounded shadow-2xl" />
                                <Input
                                    icon={<Clipboard className="w-5 h-5" />}
                                    type="text"
                                    value="123e4567-e89b-12d3-a456-426614174000"
                                />
                                <button className="border border-slate-100 text-white py-2 rounded w-[90%]">Copiar Código PIX</button>
                                <p className="text-sm">Use o QR Code acima para completar seu pagamento via PIX.</p>
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