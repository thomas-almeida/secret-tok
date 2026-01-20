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
        forever: 14.90,
        monthly: 5.90,
        discountForever: (((5.90 * 12) - 14.90) / (5.90 * 12) * 100).toFixed(0)
    }

    const [currentSlide, setCurrentSlide] = useState(0)
    const [selectedPlan, setSelectedPlan] = useState('vitalicio')
    const [isProcessing, setIsProcessing] = useState(false)

    const handlePixPayment = () => {
        setIsProcessing(true)
        setTimeout(() => {
            onAccept()
            setIsProcessing(false)
        }, 3000)
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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % actresses.length)
        }, 2000)

        return () => clearInterval(interval)
    }, [actresses.length])

    if (!isVisible) return null

    return (
        <>
            <ModalContainer>
                <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center">
                    <Logo />
                    <div>
                        <h1 className="text-xl font-bold">
                            {title}
                        </h1>
                        <p className="text-sm py-2">Torne-se VIP e assista sem limites!, faça Download de qualquer vídeo, tenha suporte via telegram, tenha acesso a aba <b className="text-yellow-400">FAMOSAS</b> para ver todas as modelos abaixo e muitas outras!</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-md">
                            <div className="relative overflow-hidden rounded-xl shadow-2xl bg-black">
                                <div className="flex transition-transform duration-700 ease-out h-50"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    {actresses.map((actress, index) => (
                                        <div key={index} className="w-full shrink-0 relative">
                                            <img
                                                src={actress.image}
                                                alt={actress.name}
                                                className="w-full h-50 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent">
                                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                    <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{actress.name}</h3>
                                                    <p className="text-sm opacity-90 drop-shadow">{actress.description}</p>
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
                            onClick={() => setSelectedPlan('vitalicio')}
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
                                <div>
                                    Assinar <b>Vitalício</b> por <b>R$ {prices.forever.toFixed(2).replace('.', ',')}</b>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`relative border ${selectedPlan === 'mensal' ? 'border-red-400' : 'border-slate-200'} text-white px-4 py-4 rounded w-full cursor-pointer transition-colors`}
                            onClick={() => setSelectedPlan('mensal')}
                        >
                            <div className="flex justify-start items-center gap-2">
                                <input
                                    type="radio"
                                    id="mensal"
                                    className="accent-red-500"
                                    checked={selectedPlan === 'mensal'}
                                    readOnly
                                />
                                <div>
                                    Assinar <b>Mensal</b> por <b>R$ {prices.monthly.toFixed(2).replace('.', ',')}</b>
                                </div>
                            </div>
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