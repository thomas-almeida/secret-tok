"use client"

import { useEffect, useRef, useState } from "react"
import Logo from "../components/logo"
import ModelsCarousel from "../components/models-carousel"
import { models } from "../utils/models"
import { Users, Folder, Play, LayoutDashboard, MessageCircle } from "lucide-react"
import Input from "../components/input"


export default function AdsLandingPage() {

    const [sales, setSales] = useState<string>('0')
    const [selectedPercent, setSelectedPercent] = useState<number>(30)

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
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={{
                        filter: 'blur(8px) brightness(0.3)',
                        WebkitFilter: 'blur(8px) brightness(0.3)'
                    }}
                >
                    <source src="/videos/bg-video.mp4" type="video/mp4" />
                    <source src="/videos/bg-video.webm" type="video/webm" />
                </video>
            </div>
            
            <div className="relative z-10">
                <header className="w-full flex justify-center p-4">
                <div className="p-1 rounded-full px-4 border-red-400/80 shadow-2xl">
                    <Logo />
                </div>
            </header>

            <main className="flex flex-col items-center text-center gap-4 py-12">
                <h1 className="text-center text-3xl tracking-tighter leading-8 font-bold">A Primeira Plataforma de Vazados em formato TikTok com afiliados.</h1>
                <p className="text-lg px-4">Tracking Próprio, Sem Shaving e Pagamentos em Dia. O Nicho Black nunca foi tão fácil.</p>
                <div className="w-[80%]">
                    <button className="p-4 text-lg font-bold rounded bg-red-600 shadow-2xl w-full">
                        Me Tornar Afiliado Agora
                    </button>
                </div>

                <div className="p-2 py-4">
                    <div className="py-4 px-4">
                        <h2 className="text-2xl font-bold tracking-tight pb-4">Todas Elas Estão Aqui</h2>
                        <p className="leading-6 text-lg">Facilite a vida do seu lead enviando apenas um link da plataforma, ele não escolhe mais o que assite, faz scroll infinito nos melhores vazados da cena enquanto você fatura!</p>
                    </div>
                    <ModelsCarousel models={models} />
                </div>

                <div className="p-2 py-4 w-full">
                    <div className="py-4 px-4">
                        <h2 className="text-2xl font-bold tracking-tight pb-4">Eles assinam, você ganha!</h2>
                        <p className="leading-6 text-lg">Seja comissionado por cada assinatura de plano da plataforma que seu lead escolher, quanto mais pessoas virem de você maior sua porcentagem</p>
                        <div className="mt-4 w-full flex flex-col items-center gap-4">
                            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
                                <div className="text-sm text-neutral-300">Se você vender</div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="0"
                                            value={sales}
                                            onChange={(e) => setSales(e.target.value)}
                                            numericOnly
                                            className="w-full text-center text-white text-lg font-semibold"
                                        />
                                    </div>
                                    <div className="">
                                        <div className="text-xs text-neutral-300">cada assinatura</div>
                                        <div className="text-white font-bold">{fmt.format(price)}</div>
                                    </div>
                                </div>
                                {/* Level selector buttons */}
                                <div className="w-full mt-3 flex gap-2 justify-center">
                                    <button
                                        onClick={() => setSelectedPercent(30)}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${selectedPercent === 30 ? 'bg-white text-black shadow-lg' : 'bg-transparent border border-neutral-700 text-neutral-300'}`}>
                                        Primeiro Nivel
                                    </button>
                                    <button
                                        onClick={() => setSelectedPercent(40)}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${selectedPercent === 40 ? 'bg-white text-black shadow-lg' : 'bg-transparent border border-neutral-700 text-neutral-300'}`}>
                                        Segundo Nível
                                    </button>
                                    <button
                                        onClick={() => setSelectedPercent(50)}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${selectedPercent === 50 ? 'bg-white text-black shadow-lg' : 'bg-transparent border border-neutral-700 text-neutral-300'}`}>
                                        Terceiro Nível
                                    </button>
                                </div>
                            </div>

                            <div className="w-full max-w-2xl bg-linear-to-r from-black to-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm text-neutral-300">Sua comissão:</div>
                                    <div className={`text-4xl sm:text-3xl font-extrabold mt-1 ${levelColor}`}>{calcEarnings(selectedPercent)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 px-6">
                        {/* Tier 1 */}
                        <div className={`relative p-6 py-8 border-2 rounded-xl shadow-2xl border-green-400 bg-linear-to-br from-green-900 to-green-800 hover:from-green-900 hover:to-green-800/20 transition-all duration-300`}>
                            <div className="absolute top-0 right-0 bg-green-400 text-black px-3 py-1 rounded-bl-lg font-bold text-sm">Primeiro Nível</div>
                            <div className="flex justify-center items-center gap-2 pb-6">
                                <Users className="w-6 h-6 text-green-400" />
                                <h3 className="text-lg font-semibold">10+ Usuários</h3>
                            </div>
                            <div className="text-center">
                                <span className="text-6xl font-black text-green-400">30%</span>
                                <p className="text-sm text-gray-300 mt-2">Comissão por assinatura</p>
                                <p className="mt-3 text-white">Você ganharia: <span className="font-bold">{calcEarnings(30)}</span></p>
                            </div>
                        </div>

                        {/* Tier 2 */}
                        <div className={`relative p-6 py-8 border-2 rounded-xl shadow-2xl border-yellow-400 bg-linear-to-br from-yellow-900 to-yellow-800 hover:from-yellow-900 hover:to-yellow-800/20 transition-all duration-300`}>
                            <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 rounded-bl-lg font-bold text-sm">Segundo Nível</div>
                            <div className="flex justify-center items-center gap-2 pb-6">
                                <Users className="w-6 h-6 text-yellow-400" />
                                <h3 className="text-lg font-semibold">30+ Usuários</h3>
                            </div>
                            <div className="text-center">
                                <span className="text-6xl font-black text-yellow-400">40%</span>
                                <p className="text-sm text-gray-300 mt-2">Comissão por assinatura</p>
                                <p className="mt-3 text-white">Você ganharia: <span className="font-bold">{calcEarnings(40)}</span></p>
                            </div>
                        </div>

                        {/* Tier 3 - Premium */}
                        <div className={`relative p-6 py-8 border-2 rounded-xl shadow-2xl border-red-500 bg-linear-to-br from-red-900 to-red-800 hover:from-purple-900 hover:to-purple-800 transition-all duration-300 ring-1 ring-purple-500/50`}>
                            <div className="absolute top-0 right-0 bg-linear-to-r from-red-500 to-red-700 text-white px-4 py-1 rounded-bl-lg font-bold text-sm shadow-lg">Terceiro Nível</div>
                            <div className="flex justify-center items-center gap-2 pb-6">
                                <Users className="w-6 h-6 text-red-400" />
                                <h3 className="text-lg font-semibold">100+ Usuários</h3>
                            </div>
                            <div className="text-center">
                                <span className="text-6xl font-black bg-linear-to-r from-red-400 to-red-700 bg-clip-text text-transparent">50%</span>
                                <p className="text-sm text-gray-300 mt-2">Comissão por assinatura</p>
                                <p className="mt-3 text-white">Você ganharia: <span className="font-bold">{calcEarnings(50)}</span></p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <section className="mt-12 w-full max-w-4xl mx-auto px-6 py-8 rounded-xl shadow-2xl">
                            <h3 className="text-2xl font-bold mb-4">Não tem desculpa pra não anunciar com a gente!</h3>
                            <p className="text-neutral-300 mb-4">Nossa plataforma foi pensada para maximizar suas conversões — oferecemos ferramentas e suporte para acelerar seus resultados.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                                <div className="flex flex-col items-start gap-2 p-4 bg-neutral-900 rounded-lg">
                                    <Folder className="text-red-500" />
                                    <div>
                                        <div className="text-xl font-semibold">Exemplos de criativos</div>
                                        <div className="text-sm text-neutral-300">Modelos de anúncios prontos e testados que convertem — imagens, textos e vídeos otimizados.</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start gap-2 p-4 bg-neutral-900 rounded-lg">
                                    <Play className="text-red-500" />
                                    <div>
                                        <div className="text-xl font-semibold">Tempo de prévias</div>
                                        <div className="text-sm text-neutral-300">Prévia de conteúdos para prender o usuário nos primeiros segundos — foco em retenção e clique.</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start gap-2 p-4 bg-neutral-900 rounded-lg">
                                    <LayoutDashboard className="text-red-500" />
                                    <div>
                                        <div className="text-xl font-semibold">Dashboard para acompanhar comissões</div>
                                        <div className="text-sm text-neutral-300">Veja cliques, comissões, impressões, realize saques tudo dentro da plataforma para facilitar sua operação </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start gap-2 p-4 bg-neutral-900 rounded-lg">
                                    <MessageCircle className="text-red-500" />
                                    <div>
                                        <div className="text-xl font-semibold">Suporte 24h</div>
                                        <div className="text-sm text-neutral-300">Suporte via WhatsApp e Telegram — nossa equipe entra em contato quando precisar.</div>
                                    </div>
                                </div>
                                <div className="">
                                    <button className="p-4 text-lg font-bold rounded bg-red-600 shadow-2xl w-full">
                                        Me Tornar Afiliado Agora
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

            </main>
            </div>
        </>
    )
}