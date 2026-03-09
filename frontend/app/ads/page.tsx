"use client"

import { useEffect, useRef, useState } from "react"
import Logo from "../components/logo"
import ModelsCarousel from "../components/models-carousel"
import TestimonialsCarousel from "../components/testimonials-carousel"
import { testimonials } from "../utils/testimonials"
import { models } from "../utils/models"
import { Users, Venus, Folder, Play, LayoutDashboard, MessageCircle } from "lucide-react"
import Input from "../components/input"
import AffiliateModal from "../components/affiliate-modal"
import LoginModal from "../components/modal/login-modal"
import { useRouter } from "next/navigation"


export default function AdsLandingPage() {

    const [sales, setSales] = useState<string>('10')
    const [selectedPercent, setSelectedPercent] = useState<number>(50)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoginModalVisible, setLoginVisible] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isParagraphLoaded, setIsParagraphLoaded] = useState(false)
    const router = useRouter()
    const videoRefDemo = useRef<HTMLVideoElement>(null)
    const videoRefDemoModel = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        setIsLoaded(true)
        setTimeout(() => setIsParagraphLoaded(true), 200) // leve atraso
    }, [])

    useEffect(() => {
        const video = videoRefDemo.current
        if (!video) return

        let retryCount = 0
        const maxRetries = 8

        const tryPlay = () => {
            if (retryCount >= maxRetries) return

            const playPromise = video.play()
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    retryCount++
                    const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000)
                    setTimeout(tryPlay, delay)
                })
            }
        }

        setTimeout(tryPlay, 500)
    }, [])

    useEffect(() => {
        const video = videoRefDemoModel.current
        if (!video) return

        let retryCount = 0
        const maxRetries = 8

        const tryPlay = () => {
            if (retryCount >= maxRetries) return

            const playPromise = video.play()
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    retryCount++
                    const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000)
                    setTimeout(tryPlay, delay)
                })
            }
        }

        setTimeout(tryPlay, 500)
    }, [])

    const price = 49.90
    const salesCount = Number(sales) || 0
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    const calcEarnings = (percent: number) => {
        const earned = salesCount * price * (percent / 100)
        return fmt.format(earned)
    }
    const levelColor = selectedPercent === 50 ? 'text-green-400' : selectedPercent === 65 ? 'text-yellow-400' : 'text-red-500'

    return (
        <>
            <div className="bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900">
                <header className="w-full flex justify-center p-4">
                    <div className="p-1 rounded-full px-4 border-red-400/80 shadow-2xl">
                        <Logo />
                    </div>
                </header>

                <main className="flex flex-col items-center text-center gap-4 py-12 px-4 text-white">
                    <div className="max-w-6xl mx-auto">
                        <h1 className={`text-center text-4xl tracking-tighter leading-8 font-bold lg:text-6xl lg:leading-[0.96] lg:mx-64 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>Criar uma estrutura no <b className="italic">hot</b> leva tempo, mas não precisa ser o seu.</h1>
                        <div className="w-full flex justify-center items-center">
                            <p className={`text-lg px-4 leading-6 mt-6 lg:px-8 md:w-[50%] transition-all duration-300 ${isParagraphLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>Configurar Bots, Grupo VIP, Gateways só para manter um lead já saturou! em 3 cliques você tem uma base automática de vazados pro seu lead sair satisfeito e você sair comissionado operando 10x mais rápido!</p>
                        </div>
                        <div className="w-[80%] md:w-full max-w-md md:max-w-xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-4 text-lg font-bold rounded bg-red-600 shadow-2xl w-ful cursor-pointer"
                            >
                                Me Tornar Afiliado Agora
                            </button>
                            <button
                                onClick={() => setLoginVisible(true)}
                                className="p-4 text-lg font-bold rounded border border-white/30 bg-transparent w-full hover:bg-white/10 lg:text-xl lg:py-4 cursor-pointer"
                            >
                                Já tenho conta - Entrar
                            </button>
                        </div>
                    </div>

                    <div className="flex"> 
                        <img src="/shot.png" className="w-260 my-4 transition-transform duration-200 hover:scale-105 cursor-pointer" />
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4 mb-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">Sua Operação Agradece!</h2>
                            <div className="w-full flex justify-center items-center">
                                <p className="leading-6 text-lg lg:text-xl md:w-[60%] max-w-4xl mx-auto">Aumente sua oferta oferecendo um novo formato de VIP ao estilo TikTok, use tanto como <i>Presell</i>, <i>Upsell</i>, <i>Downsell</i>, <i>Order Bump</i> ou criando uma modelo própria, nossa estrutura é flexível para se encaixar em qualquer pedaço da sua operação e maximizar seu LTV.</p>
                            </div>
                        </div>
                        <div className="md:flex justify-center items-center">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:w-[70%] ">
                                <div>
                                    <h1 className="font-bold text-2xl py-4">Vazados</h1>
                                    <div className="relative">
                                        <img
                                            src="/phone-mockup.webp"
                                            alt="Phone mockup"
                                            className="w-full h-full relative z-10"
                                        />
                                        <div className="absolute top-0 left-[6.5%] w-[88%] h-full overflow-hidden rounded-[2.5rem] p-4.5">
                                            <video
                                                ref={videoRefDemo}
                                                className="w-full h-full object-cover rounded-4xl"
                                                autoPlay
                                                muted
                                                playsInline
                                                loop
                                                preload="auto"
                                                onCanPlay={() => {
                                                    let retryCount = 0
                                                    const maxRetries = 5
                                                    const tryPlay = () => {
                                                        if (retryCount >= maxRetries) return
                                                        videoRefDemo.current?.play().catch(() => {
                                                            retryCount++
                                                            setTimeout(tryPlay, 500)
                                                        })
                                                    }
                                                    tryPlay()
                                                }}
                                                onLoadedMetadata={() => {
                                                    let retryCount = 0
                                                    const maxRetries = 5
                                                    const tryPlay = () => {
                                                        if (retryCount >= maxRetries) return
                                                        videoRefDemo.current?.play().catch(() => {
                                                            retryCount++
                                                            setTimeout(tryPlay, 500)
                                                        })
                                                    }
                                                    tryPlay()
                                                }}
                                            >
                                                <source src="/videos/demo.mp4" type="video/mp4" />
                                            </video>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="font-bold text-2xl py-4">Sua Modelo</h1>
                                    <div className="relative">
                                        <img
                                            src="/phone-mockup.webp"
                                            alt="Phone mockup"
                                            className="w-full h-full relative z-10"
                                        />
                                        <div className="absolute top-0 left-[6.5%] w-[88%] h-full overflow-hidden rounded-[2.5rem] p-4.5">
                                            <video
                                                ref={videoRefDemoModel}
                                                className="w-full h-full object-cover rounded-4xl"
                                                autoPlay
                                                muted
                                                playsInline
                                                loop
                                                preload="auto"
                                                onCanPlay={() => {
                                                    let retryCount = 0
                                                    const maxRetries = 5
                                                    const tryPlay = () => {
                                                        if (retryCount >= maxRetries) return
                                                        videoRefDemoModel.current?.play().catch(() => {
                                                            retryCount++
                                                            setTimeout(tryPlay, 500)
                                                        })
                                                    }
                                                    tryPlay()
                                                }}
                                                onLoadedMetadata={() => {
                                                    let retryCount = 0
                                                    const maxRetries = 5
                                                    const tryPlay = () => {
                                                        if (retryCount >= maxRetries) return
                                                        videoRefDemoModel.current?.play().catch(() => {
                                                            retryCount++
                                                            setTimeout(tryPlay, 500)
                                                        })
                                                    }
                                                    tryPlay()
                                                }}
                                            >
                                                <source src="/videos/model-example.mp4" type="video/mp4" />
                                            </video>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4 mb-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">Afiliados que falam por nós!</h2>
                            <div className="w-full flex justify-center items-center">
                                <p className="leading-6 text-lg lg:text-xl max-w-4xl md:w-[50%] mx-auto">Resultados reais de quem já fatura no novo formato, pedimos para os melhores players da plataforma falarem por nós!</p>
                            </div>
                        </div>
                        <TestimonialsCarousel testimonials={testimonials} />
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">Eles assinam, você ganha!</h2>
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Seja comissionado por cada assinatura de plano da plataforma que seu lead escolher, quanto mais pessoas virem de você maior será sua porcentagem</p>
                            <br />
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Os valores de assinatura são completamente customizáveis à sua escolha</p>
                            <div className="mt-8 w-full flex flex-col items-center gap-6 lg:gap-8">
                                <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl">
                                    <div className="text-center mb-2">
                                        <h3 className="text-lg font-semibold mb-2">Se Você Trazer (Leads)</h3>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex justify-center items-center">
                                            <Input
                                                placeholder="0"
                                                value={sales}
                                                onChange={(e) => setSales(e.target.value)}
                                                numericOnly
                                                className="w-[30%] text-center text-white text-xl font-bold py-2"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-neutral-300">cada assinatura</div>
                                            <div className="text-white font-bold text-lg">{fmt.format(price)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 px-6 mt-2 max-w-6xl mx-auto">
                            <div className={`relative p-6 py-6 border-2 rounded-xl shadow-2xl border-red-600 md:border-none md:shadow-none transition-all duration-300 hover:scale-105 hover:shadow-3xl lg:transform lg:scale-105`}>
                                <div className="text-center">
                                    <span className="text-7xl font-black bg-linear-to-r from-red-400 to-red-700 bg-clip-text text-transparent block">90%</span>
                                    <p className="text-base mt-3">Comissão por assinatura</p>
                                    <p className="mt-4 text-white text-lg">Você ganharia: <span className="font-bold text-xl">{calcEarnings(80)}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-6xl mx-auto">
                            <section className="mt-16 px-6 py-8 rounded-xl">
                                <h3 className="text-2xl font-bold mb-4 lg:text-4xl text-center leading-6">Coloque o seu tráfego e operação da sua base no lugar certo!</h3>
                                <p className="mb-8 lg:text-xl text-center max-w-4xl mx-auto">Nossa plataforma foi pensada para facilitar sua operação e maximizar suas conversões, oferecemos ferramentas e suporte para acelerar seus resultados.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                    <div className="flex flex-col items-start gap-3 p-6 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:scale-105 transition-transform">
                                        <Folder className="w-8 h-8 text-red-500" />
                                        <div>
                                            <div className="text-xl font-semibold">Exemplos de criativos</div>
                                            <div className="text-sm mt-2">Modelos de anúncios prontos e testados que convertem — imagens, textos e vídeos otimizados.</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-3 p-6 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:scale-105 transition-transform">
                                        <Play className="w-8 h-8 text-red-500" />
                                        <div>
                                            <div className="text-xl font-semibold">Tempo de prévias</div>
                                            <div className="text-sm mt-2">Prévia de conteúdos para prender o usuário nos primeiros segundos — foco em retenção e clique.</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-3 p-6 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:scale-105 transition-transform">
                                        <LayoutDashboard className="w-8 h-8 text-red-500" />
                                        <div>
                                            <div className="text-xl font-semibold">Dashboard para acompanhar comissões</div>
                                            <div className="text-sm mt-2">Veja cliques, comissões, impressões, realize saques tudo dentro da plataforma para facilitar sua operação </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-3 p-6 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:scale-105 transition-transform">
                                        <Users className="w-8 h-8 text-red-500" />
                                        <div>
                                            <div className="text-xl font-semibold">Página de Pré-Ads</div>
                                            <div className="text-sm mt-2">Leve seu lead para uma página de alta conversão e copy agressiva perfeita para usar no seu tráfego pago sem cair.</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-3 p-6 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:scale-105 transition-transform">
                                        <Venus className="w-8 h-8 text-red-500" />
                                        <div>
                                            <div className="text-xl font-semibold">Tela Checkout para Modelos</div>
                                            <div className="text-sm mt-2">Usa modelos na operação? Sem problemas, leve seu lead para um checkout como se sua modelo estivesse no App</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-3 p-6 bg-neutral-900 rounded-xl hover:bg-neutral-800 hover:scale-105 transition-transform">
                                        <MessageCircle className="w-8 h-8 text-red-500" />
                                        <div>
                                            <div className="text-xl font-semibold">Suporte 24h</div>
                                            <div className="text-sm mt-2">Suporte via WhatsApp e Telegram — nossa equipe entra em contato quando precisar.</div>
                                        </div>
                                    </div>

                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">O Jeito mais fácil de começar no hot de vazados em 2026</h2>
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Todo o conteúdo e facilidade para o seu lead está aqui, foque apenas em anunciar para a sua base seja no pago ou no orgânico enquanto tem uma plataforma com milhares de vídeos.</p>
                            <div className="py-6 max-w-md mx-auto">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-4 text-lg font-bold rounded bg-red-600 shadow-2xl w-full hover:bg-red-700 lg:text-xl lg:py-6 cursor-pointer"
                                >
                                    Me Tornar Afiliado Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* FAQ Section */}
                <section className="px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-8">Perguntas Frequentes</h2>
                        <div className="flex flex-col gap-4">
                            {[
                                {
                                    question: "Dá para implementar no meu fluxo atual?",
                                    answer: "100%! Não importa se você gerencia VIP, Faz X1, Upsell, Order bump, Faz X, Instagram ou qualquer outro canal, nosso sistema é flexível para se encaixar no seu modelo de negócio. Você só precisa usar seu link de afiliado no seu fluxo de CTA, o resto é por nossa conta."
                                },
                                {
                                    question: "Como recebo minha comissão?",
                                    answer: "As comissões são creditadas automaticamente no seu saldo após a confirmação do pagamento do cliente. Você pode solicitar o saque sempre no D+1 da transação."
                                },
                                {
                                    question: "Preciso ter experiência no Hot?",
                                    answer: "Não! Nosso sistema é completamente automatizado para prender o lead com prévias, VIP, Gateway, Saque D+1, Criativos. Tudo depende do seu esforço de divulgação e do seu tráfego seja ele pago ou orgânico."
                                },
                                {
                                    question: "Como faz para o meu lead assinar?",
                                    answer: "Quando ele entra no seu link, após assistir poucas prévias, ele visualiza a oferta para assinatura, no instante em que ele assina sua comissão é automaticamente creditada no seu saldo, você pode acompanhar tudo pelo nosso dashboard de afiliados."
                                }
                            ].map((faq, index) => (
                                <div
                                    key={index}
                                    className="border border-neutral-700 rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                        className="w-full flex justify-between items-center p-4 text-left bg-neutral-800 hover:bg-neutral-750 transition-colors"
                                    >
                                        <span className="font-medium text-white">{faq.question}</span>
                                        <svg
                                            className={`w-5 h-5 text-neutral-400 transform transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {expandedFaq === index && (
                                        <div className="p-4 bg-neutral-800/50 text-neutral-300">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 py-8 px-4 text-center text-neutral-400 text-sm border-t border-neutral-800/50">
                    <div className="max-w-6xl mx-auto">
                        <p>© 2026 Rapidinhas - Todos os direitos reservados</p>
                        <p className="mt-1">CNPJ: 49.995.652/0001-00</p>
                    </div>
                </footer>
            </div>

            <AffiliateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {isLoginModalVisible && (
                <LoginModal
                    isCustomer={false}
                    isVisible={isLoginModalVisible}
                    onAccept={() => {
                        setLoginVisible(false)
                        router.push('/afiliate')
                    }}
                    onDecline={() => setLoginVisible(false)}
                    onNeedSubscription={() => {
                        setLoginVisible(false)
                        setIsModalOpen(true)
                    }}
                    onCreateAccount={() => {
                        setLoginVisible(false)
                        setIsModalOpen(true)
                    }}
                />
            )}

            {/* Botão flutuante do WhatsApp */}
            <a
                href="https://wa.me/5511989008294?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20o%20programa%20de%20afiliados%20da%20Rapidinhas"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
            >
                <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Suporte via WhatsApp
                </span>
            </a>
        </>
    )
}