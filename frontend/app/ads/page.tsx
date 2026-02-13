"use client"

import { useEffect, useRef, useState } from "react"
import Logo from "../components/logo"
import ModelsCarousel from "../components/models-carousel"
import TestimonialsCarousel from "../components/testimonials-carousel"
import { testimonials } from "../utils/testimonials"
import { models } from "../utils/models"
import { Users, Folder, Play, LayoutDashboard, MessageCircle } from "lucide-react"
import Input from "../components/input"
import AffiliateModal from "../components/affiliate-modal"


export default function AdsLandingPage() {

    const [sales, setSales] = useState<string>('10')
    const [selectedPercent, setSelectedPercent] = useState<number>(30)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            if (video.currentTime >= 3) {
                video.currentTime = 0
                video.play()
            }
        }

        video.addEventListener('timeupdate', handleTimeUpdate)

        // Force play on iOS
        const playPromise = video.play()
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay prevented:', error)
            })
        }

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
        }
    }, [])

    const price = 49.90
    const salesCount = Number(sales) || 0
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    const calcEarnings = (percent: number) => {
        const earned = salesCount * price * (percent / 100)
        return fmt.format(earned)
    }
    const levelColor = selectedPercent === 30 ? 'text-green-400' : selectedPercent === 40 ? 'text-yellow-400' : 'text-red-500'

    return (
        <>
            <div className="fixed inset-0 w-full h-full object-cover z-0">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    style={{
                        filter: 'brightness(0.45)',
                        WebkitFilter: 'brightness(0.25)'
                    }}
                >
                    <source src="/videos/bg-video.mp4" type="video/mp4" />
                    <source src="/videos/bg-video.webm" type="video/webm" />
                </video>
                <div className="absolute inset-0 bg-black/20 blur-2xl"></div>
            </div>

            <div className="relative z-10">
                <header className="w-full flex justify-center p-4">
                    <div className="p-1 rounded-full px-4 border-red-400/80 shadow-2xl">
                        <Logo />
                    </div>
                </header>

                <main className="flex flex-col items-center text-center gap-4 py-12 px-4 text-white">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-center text-3xl tracking-tighter leading-8 font-bold lg:text-5xl lg:leading-[0.9] lg:mx-64">A Primeira Plataforma de Vazados em formato TikTok com você de <i className="underline">Afiliado</i>.</h1>
                        <p className="text-lg px-4 leading-5 mt-6 lg:text-xl lg:px-8"><b className="text-red-500">Configurar Bots, Grupo VIP, Gateways</b> e todas as burocracias só para manter um lead é <b className="text-yellow-400">coisa do passado!</b> em 3 cliques você tem uma base automática de vazados pro seu lead sair satisfeito e você sair <b className="text-green-400">comissionado!</b></p>
                        <div className="w-[80%] max-w-md mx-auto mt-8">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-4 text-lg font-bold rounded bg-red-600 shadow-2xl w-full hover:bg-red-700 lg:text-xl lg:py-6 cursor-pointer"
                            >
                                Me Tornar Afiliado Agora
                            </button>
                        </div>
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4 mb-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">Todas Elas Estão Aqui</h2>
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Facilite a vida do seu lead enviando apenas um link da plataforma, ele assiste prévias em formato tiktok, assina vitalício, faz scroll infinito nos melhores vazados da cena enquanto <b className="text-green-400">você fatura sem ter configurado nada!</b></p>
                        </div>
                        <ModelsCarousel models={models} />
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4 mb-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">O que dizem os nossos afiliados?</h2>
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Veja os resultados reais de quem já está faturando com a gente. pedimos para os melhores players da plataforma falarem por nós!</p>
                        </div>
                        <TestimonialsCarousel testimonials={testimonials} />
                    </div>

                    <div className="p-2 py-4 w-full max-w-6xl mx-auto">
                        <div className="py-4 px-4">
                            <h2 className="text-2xl font-bold tracking-tight pb-4 lg:text-4xl">Eles assinam, você ganha!</h2>
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Seja comissionado por cada assinatura de plano da plataforma que seu lead escolher, quanto mais pessoas virem de você maior sua porcentagem</p>
                            <div className="mt-8 w-full flex flex-col items-center gap-6 lg:gap-8">
                                <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl">
                                    <div className="text-center mb-2">
                                        <h3 className="text-xl font-semibold mb-2">Se Você Trazer</h3>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full max-w-xs">
                                            <Input
                                                placeholder="0"
                                                value={sales}
                                                onChange={(e) => setSales(e.target.value)}
                                                numericOnly
                                                className="w-full text-center text-white text-xl font-bold py-4"
                                            />
                                            <p className="text-lg py-2">Leads Pagantes</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-neutral-300">cada assinatura</div>
                                            <div className="text-white font-bold text-lg">{fmt.format(price)}</div>
                                        </div>
                                    </div>

                                    {/* Level selector buttons */}
                                    <div className="w-full mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => setSelectedPercent(30)}
                                            className={`px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all ${selectedPercent === 30 ? 'bg-white text-black shadow-lg scale-105' : 'bg-transparent border border-neutral-700 hover:border-neutral-600'}`}>
                                            Primeiro Nivel
                                        </button>
                                        <button
                                            onClick={() => setSelectedPercent(40)}
                                            className={`px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all ${selectedPercent === 40 ? 'bg-white text-black shadow-lg scale-105' : 'bg-transparent border border-neutral-700 hover:border-neutral-600'}`}>
                                            Segundo Nível
                                        </button>
                                        <button
                                            onClick={() => setSelectedPercent(50)}
                                            className={`px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all ${selectedPercent === 50 ? 'bg-white text-black shadow-lg scale-105' : 'bg-transparent border border-neutral-700 hover:border-neutral-600'}`}>
                                            Terceiro Nível
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full max-w-2xl bg-linear-to-r from-black to-neutral-900 border-2 border-neutral-800 rounded-xl p-6 shadow-2xl">
                                    <div className="text-center">
                                        <div className="text-sm mb-2">Sua comissão:</div>
                                        <div className={`text-5xl lg:text-6xl font-extrabold mt-2 ${levelColor}`}>{calcEarnings(selectedPercent)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 mt-8 max-w-6xl mx-auto">
                            {/* Tier 1 */}
                            <div className={`relative p-6 py-8 border-2 rounded-xl shadow-2xl border-green-400 transition-all duration-300 hover:scale-105 hover:shadow-3xl`}>
                                <div className="absolute top-0 right-0 bg-green-400 text-black px-3 py-1 rounded-bl-lg rounded-tr-lg font-bold text-sm">Primeiro Nível</div>
                                <div className="flex justify-center items-center gap-2 pb-6">
                                    <Users className="w-8 h-8 text-green-400" />
                                    <h3 className="text-xl font-semibold">10+ Usuários</h3>
                                </div>
                                <div className="text-center">
                                    <span className="text-7xl font-black text-green-400 block">30%</span>
                                    <p className="text-base mt-3">Comissão por assinatura</p>
                                    <p className="mt-4 text-white text-lg">Você ganharia: <span className="font-bold text-xl">{calcEarnings(30)}</span></p>
                                </div>
                            </div>

                            {/* Tier 2 */}
                            <div className={`relative p-6 py-8 border-2 rounded-xl shadow-2xl border-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-3xl`}>
                                <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 rounded-bl-lg font-bold text-sm rounded-tr-lg">Segundo Nível</div>
                                <div className="flex justify-center items-center gap-2 pb-6">
                                    <Users className="w-8 h-8 text-yellow-400" />
                                    <h3 className="text-xl font-semibold">30+ Usuários</h3>
                                </div>
                                <div className="text-center">
                                    <span className="text-7xl font-black text-yellow-400 block">40%</span>
                                    <p className="text-base mt-3">Comissão por assinatura</p>
                                    <p className="mt-4 text-white text-lg">Você ganharia: <span className="font-bold text-xl">{calcEarnings(40)}</span></p>
                                </div>
                            </div>

                            {/* Tier 3 - Premium */}
                            <div className={`relative p-6 py-8 border-2 rounded-xl shadow-2xl border-red-600 transition-all duration-300 hover:scale-105 hover:shadow-3xl lg:transform lg:scale-105`}>
                                <div className="absolute top-0 right-0 bg-linear-to-r from-red-500 to-red-700 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg font-bold text-sm shadow-lg">Terceiro Nível</div>
                                <div className="flex justify-center items-center gap-2 pb-6">
                                    <Users className="w-8 h-8 text-red-400" />
                                    <h3 className="text-xl font-semibold">100+ Usuários</h3>
                                </div>
                                <div className="text-center">
                                    <span className="text-7xl font-black bg-linear-to-r from-red-400 to-red-700 bg-clip-text text-transparent block">50%</span>
                                    <p className="text-base mt-3">Comissão por assinatura</p>
                                    <p className="mt-4 text-white text-lg">Você ganharia: <span className="font-bold text-xl">{calcEarnings(50)}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-6xl mx-auto">
                            <section className="mt-16 px-6 py-8 rounded-xl">
                                <h3 className="text-2xl font-bold mb-4 lg:text-4xl text-center leading-6">Coloque o seu tráfego e operação da sua base no lugar certo!</h3>
                                <p className="mb-8 lg:text-xl text-center max-w-4xl mx-auto">Nossa plataforma foi pensada para facilitar sua operação e maximizar suas conversões, oferecemos ferramentas e suporte para acelerar seus resultados.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
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
                            <p className="leading-6 text-lg lg:text-xl max-w-4xl mx-auto">Todo o conteúdo e facilidade pro seu lead está aqui, foque apenas em anunciar para a sua base seja no pago ou no orgânico enquanto tem uma plataforma com milhares de vídeos.</p>
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