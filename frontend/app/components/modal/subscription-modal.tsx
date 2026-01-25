import Logo from "../logo"
import ModalContainer from "./modal-container"
import { useState, useEffect } from "react"

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
        discountForever: (((5.90 * 12) - 14.90) / (5.90 * 12) * 100).toFixed(0)
    }

    const [selectedPlan, setSelectedPlan] = useState('vitalicio')
    const [isProcessing, setIsProcessing] = useState(false)
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

    const handlePixPayment = () => {
        setIsProcessing(true)
        setTimeout(() => {
            onAccept()
            setIsProcessing(false)
        }, 3000)
    }

    const handlePlanSelect = (plan: string) => {
        setSelectedPlan(plan)
        setExpandedPlan(expandedPlan === plan ? null : plan)
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

    const actresses = [

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
            <style jsx>{`
                @keyframes infinite-scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-300%);
                    }
                }
                
                .animate-infinite-scroll {
                    animation: infinite-scroll 40s linear infinite;
                }
                
            `}</style>

            <ModalContainer>
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center">
                    <Logo />
                    <div>
                        <h1 className="text-xl font-bold">
                            {title}
                        </h1>
                        <p className="text-sm py-1">Continue espiando tornando-se VIP e assista sem limites!, Todas elas estão aqui!</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-md overflow-hidden">
                            <div className="relative">
                                <div className="flex animate-infinite-scroll">
                                    {[...actresses, ...actresses].map((actress, index) => (
                                        <div key={index} className="shrink-0 relative px-2 w-2/5 h-[105px]">
                                            <div className="relative h-full rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden shadow-lg shadow-red-500/15">
                                                <img
                                                    src={actress.image}
                                                    alt={actress.name}
                                                    className="w-[180px] h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent">
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                                        <h3 className="text-lg font-bold mb-1 drop-shadow-lg leading-4">{actress.name}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 w-full text-lg">
                        <div
                            className={`relative border ${selectedPlan === 'vitalicio' ? 'border-red-400 shadow-2xl shadow-red-400/90' : 'border-slate-200'} text-white px-4 py-4 rounded w-full cursor-pointer transition-colors`}
                            onClick={() => handlePlanSelect('vitalicio')}
                        >
                            <div className={`absolute top-[-15px] right-2.5 ${selectedPlan === 'vitalicio' ? 'bg-red-500' : 'bg-slate-200'} p-1 px-1.5 shadow rounded text-white font-bold`}>
                                <p className={`text-xs ${selectedPlan === 'vitalicio' ? 'text-white' : 'text-slate-700'}`}>Economize {prices.discountForever}%</p>
                            </div>
                            <div className="flex justify-start items-center gap-2 italic">
                                <input
                                    type="radio"
                                    id="vitalicio"
                                    className="accent-red-500"
                                    checked={selectedPlan === 'vitalicio'}
                                    readOnly
                                />
                                <div className="flex-1">
                                    Assinar <b>Vitalício</b> - <b>R$ {prices.forever.toFixed(2).replace('.', ',')}</b>
                                </div>
                                <div className={`transform transition-transform duration-200 ${expandedPlan === 'vitalicio' ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {expandedPlan === 'vitalicio' && (
                                <div className="mt-4 pt-4 border-t border-slate-600">
                                    <ul className="text-sm space-y-2 text-left">
                                        {planBenefits.vitalicio.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-300">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div
                            className={`relative border ${selectedPlan === 'mensal' ? 'border-red-400' : 'border-slate-200'} text-white px-4 py-4 rounded w-full cursor-pointer transition-colors`}
                            onClick={() => handlePlanSelect('mensal')}
                        >
                            <div className="flex justify-start items-center gap-2">
                                <input
                                    type="radio"
                                    id="mensal"
                                    className="accent-red-500"
                                    checked={selectedPlan === 'mensal'}
                                    readOnly
                                />
                                <div className="flex-1">
                                    Assinar <b>Mensal</b> - <b>R$ {prices.monthly.toFixed(2).replace('.', ',')}</b>
                                </div>
                                <div className={`transform transition-transform duration-200 ${expandedPlan === 'mensal' ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {expandedPlan === 'mensal' && (
                                <div className="mt-4 pt-4 border-t border-slate-600">
                                    <ul className="text-sm space-y-2 text-left">
                                        {planBenefits.mensal.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-300">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 mt-4 rounded w-full shadow-2xl shadow-green-600/50" onClick={handlePixPayment} disabled={isProcessing}>
                            <div className="flex justify-center items-center gap-2">
                                {isProcessing ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <h3 className="font-bold">Continuar para o PIX</h3>
                                        <img src="/icons/pix-white.png" alt="PIX" className="w-6 h-6" />
                                    </>
                                )}
                            </div>
                            <p className={`text-xs ${isProcessing ? 'hidden' : ''}`}>Pagamento discreto e seguro</p>
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