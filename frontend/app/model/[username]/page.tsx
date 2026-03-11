'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { ArrowRight, Play, Star, Users, Check, X, AlertTriangle, Lock, Heart, MessageCircle, Instagram } from 'lucide-react'
import Logo from '../../components/logo'
import { getModelByUsername } from '../../services/user-service'
import SubscriptionModal from '../../components/modal/subscription-modal'

function ModelPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const [mounted, setMounted] = useState(false)
    const [model, setModel] = useState<any>(null)
    const [customPlans, setCustomPlans] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly')
    const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false)
    const [showFullDesc, setShowFullDesc] = useState(false)

    const affiliateId = searchParams.get('ref')
    const username = params.username as string

    useEffect(() => {
        const fetchModelData = async () => {
            const finalAffiliateId = affiliateId || (typeof window !== 'undefined' ? localStorage.getItem('afiliate-code') : null)
            try {
                const response = await getModelByUsername(username)
                setModel(response?.model)
                
                // Se houver afiliado, tentar buscar os planos customizados dele para essa modelo
                if (finalAffiliateId) {
                    const { getAfiliateData } = await import('@/app/services/user-service')
                    const afiliateData = await getAfiliateData(finalAffiliateId)
                    if (afiliateData?.data?.customPlans) {
                        setCustomPlans(afiliateData.data.customPlans)
                    } else {
                        setCustomPlans(response?.customPlans)
                    }
                } else {
                    setCustomPlans(response?.customPlans)
                }
            } catch (err) {
                setError('Modelo não encontrada')
            } finally {
                setLoading(false)
                setMounted(true)
            }
        }

        fetchModelData()
    }, [username, affiliateId])

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-lg max-w-md">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Modelo não encontrada</h2>
                    <p className="text-neutral-300 mb-6">Não foi possível encontrar a modelo solicitada.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Voltar para Home
                    </button>
                </div>
            </div>
        )
    }

    const handleSubscribe = () => {
        setIsSubscriptionModalVisible(true)
    }

    if (!model) return null

    return (
        <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
                <div className="max-w-2xl w-full text-center">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-8">
                        <Logo />
                    </div>

                    <div className="relative mb-8">
                        <img src={model?.coverPicture} className='h-20 w-full object-cover rounded shadow-2xl' />
                        <img
                            src={model?.profilePicture}
                            alt={model?.displayName}
                            className="w-20 h-20 object-cover rounded-full absolute top-10 left-5 border-3 border-red-400"
                            onError={(e) => {
                                e.currentTarget.src = '/chimper-3.png'
                            }}
                        />
                        <div className='text-left mt-12 px-4'>
                            <h1 className="text-xs font-bold text-white">@{model?.username}</h1>
                            <div className='flex justify-start items-center gap-2 pb-4'>
                                <h1 className="text-xl font-bold text-white">{model?.displayName}</h1>
                                {model?.instagramLink && (
                                    <div className="flex justify-center items-center">
                                        <a
                                            href={model.instagramLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-pink-400 rounded-lg transition-color p-1 bg-neutral-800/50 shadow-2xl"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    </div>
                                )}
                            </div>
                            <p className={`text-neutral-200 mb-2 leading-5 text-left ${!showFullDesc ? 'line-clamp-4 overflow-hidden' : ''}`}>
                                {model?.description}
                            </p>
                            {model?.description && (
                                <button
                                    onClick={() => setShowFullDesc(!showFullDesc)}
                                    className="text-red-400 text-sm underline"
                                >
                                    {showFullDesc ? 'Mostrar menos' : 'Leia mais'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm">
                        <div className="border w-2 h-2 animate-pulse bg-green-500 rounded-full"></div>
                        <span>Assinantes me espiando agora: <i>289</i></span>
                    </div>

                    <div className="p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4 text-left">Assinaturas</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-red-500 bg-neutral-800' : 'border-neutral-700 bg-neutral-800/30'}`}
                                onClick={() => setSelectedPlan('monthly')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white text-sm">Mensal</h3>
                                    {selectedPlan === 'monthly' && <Check className="w-5 h-5 text-red-500" />}
                                </div>
                                <p className="text-neutral-300 text-left text-sm">Acesso completo por 30 dias</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-xl font-bold text-white">{customPlans?.monthly ? (customPlans.monthly / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 29,90'}</div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'lifetime' ? 'border-red-500 bg-neutral-800' : 'border-neutral-700 bg-neutral-800/30'}`}
                                onClick={() => setSelectedPlan('lifetime')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white text-sm">Vitalício</h3>
                                    {selectedPlan === 'lifetime' && <Check className="w-5 h-5 text-red-500" />}
                                </div>
                                <p className="text-neutral-300 mb-4 text-left text-sm">Acesso para sempre (já imaginou?)</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-xl font-bold text-white">{customPlans?.lifetime ? (customPlans.lifetime / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 29,90'}</div>
                                    </div>
                                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">80% OFF</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubscribe}
                            className="group w-full text-sm flex justify-center items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                        >
                            Assinar {selectedPlan === 'monthly' ? 'Mensal' : 'Vitalício'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 py-2">
                        <h2 className="text-left font-bold text-white mb-4">Principais Conteúdos</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='border p-12 py-32 rounded border-neutral-600 flex justify-center items-center shadow-2xl'>
                                <div className='flex flex-col justify-center items-center'>
                                    <Lock className='w-8 h-8 text-red-400' strokeWidth={'1px'} />
                                    <i className='text-xs pt-4'>Assine para espiar</i>
                                    <div className='grid grid-cols-2 gap-4 py-4'>
                                        <div className='flex justify-start items-center gap-1'>
                                            <Heart className='w-4 h-4 text-red-400' strokeWidth={'1px'} />
                                            <i className='text-xs'>2348</i>
                                        </div>
                                        <div className='flex justify-start items-center gap-1'>
                                            <MessageCircle className='w-4 h-4 text-red-400' strokeWidth={'1px'} />
                                            <i className='text-xs'>48</i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='border p-12 py-32 rounded border-neutral-600 flex justify-center items-center shadow-2xl'>
                                <div className='flex flex-col justify-center items-center'>
                                    <Lock className='w-8 h-8 text-red-400' strokeWidth={'1px'} />
                                    <i className='text-xs pt-4'>Assine para espiar</i>
                                    <div className='grid grid-cols-2 gap-4 py-4'>
                                        <div className='flex justify-start items-center gap-1'>
                                            <Heart className='w-4 h-4 text-red-400' strokeWidth={'1px'} />
                                            <i className='text-xs'>721</i>
                                        </div>
                                        <div className='flex justify-start items-center gap-1'>
                                            <MessageCircle className='w-4 h-4 text-red-400' strokeWidth={'1px'} />
                                            <i className='text-xs'>12</i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isSubscriptionModalVisible && (
                <SubscriptionModal
                    isVisible={isSubscriptionModalVisible}
                    title="Assine para Espiar"
                    customValues={customPlans}
                    dailyLimit={false}
                    onAccept={() => {
                        setIsSubscriptionModalVisible(false)
                    }}
                    onDecline={() => {
                        setIsSubscriptionModalVisible(false)
                    }}
                    initialStep="select"
                    isRePayment={false}
                />
            )}

            <footer className="py-6 text-center text-neutral-500 text-sm relative z-10">
                <p>© 2024 Rapidinhas. Todos os direitos reservados.</p>
            </footer>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
            <div className="animate-pulse">
                <div className="w-12 h-12 bg-red-500 rounded-full"></div>
            </div>
        </div>
    )
}

export default function ModelPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ModelPageContent />
        </Suspense>
    )
}