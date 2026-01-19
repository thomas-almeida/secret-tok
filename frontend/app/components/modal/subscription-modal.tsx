import ModalContainer from "./modal-container"
import { useState, useEffect } from "react"

interface SubscriptionModalProps {
    isVisible: boolean
    title: string
    onAccept: () => void
    onDecline: () => void
}

export default function SubscriptionModal({ isVisible, title, onAccept, onDecline }: SubscriptionModalProps) {

    const [currentSlide, setCurrentSlide] = useState(0)

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
                    <div>
                        <h1 className="text-xl font-bold">
                            {title}
                        </h1>
                        <p className="text-sm py-2">Torne-se VIP e assista sem limites!, faça Download de qualquer vídeo, tenha acesso a aba <b className="text-purple-500">FAMOSAS</b> para ver todas as modelos abaixo e muitas outras!</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-md">
                            <div className="relative overflow-hidden rounded-xl shadow-2xl bg-black">
                                <div className="flex transition-transform duration-700 ease-out h-60"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    {actresses.map((actress, index) => (
                                        <div key={index} className="w-full shrink-0 relative">
                                            <img
                                                src={actress.image}
                                                alt={actress.name}
                                                className="w-full h-60 object-cover"
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

                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + actresses.length) % actresses.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % actresses.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex justify-center gap-2 mt-4">
                                {actresses.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                            ? 'bg-pink-500 w-8'
                                            : 'bg-gray-300 w-2 hover:bg-gray-400'
                                            }`}
                                        onClick={() => setCurrentSlide(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full text-lg">
                        <button className="bg-purple-500 text-white px-4 py-4 rounded w-full" onClick={onDecline}>Assinar <b>Vitalício</b> por <b> R$14,90</b></button>
                        <button className="bg-red-500 text-white px-4 py-4 rounded w-full" onClick={onAccept}>Assinar <b>Mensal</b> por <b> R$9,90</b></button>
                        <button className="text-slate-200 px-4 pt-4 rounded w-full text-sm" onClick={onDecline}>Fechar e perder oferta</button>
                    </div>
                </div>
            </ModalContainer>
        </>
    )

}