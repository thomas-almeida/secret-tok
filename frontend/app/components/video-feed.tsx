"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import VideoCard from "./video-card"
import TopBar from "./topbar"
import AdultModal from "./modal/adult-modal"
import SubscriptionModal from "./modal/subscription-modal"
import LoginModal from "./modal/login-modal"
import { useAuthStore } from "../stores/auth-store"
import { useVideoQueue } from "../hooks/useVideoQueue"

// Função para embaralhar array
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export default function VideoFeedOptimized() {

    const { junkieModel, premiumModels, loading, error } = useVideoQueue()
    const [feedVideos, setFeedVideos] = useState<any[]>([])
    const [junkieFeed, setJunkieFeed] = useState<any[]>([])
    const [premiumFeed, setPremiumFeed] = useState<any[]>([])

    const [isAdultModalVisible, setIsAdultModalVisible] = useState(true)
    const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false)
    const [isLoginModalVisible, setLoginVisible] = useState(false)
    const [subscriptionModalTitle, setSubscriptionModalTitle] = useState("Seja VIP")
    const [currentIndex, setCurrentIndex] = useState(0)
    const [preloadRange, setPreloadRange] = useState({ start: 0, end: 2 })
    const [dailyLimit, setDailyLimit] = useState(false)
    const [subscriptionModalInitialStep, setSubscriptionModalInitialStep] = useState<'select' | 'signup' | 'payment'>('select')
    const [isRePayment, setIsRePayment] = useState(false)
    const [hasLoadedMore, setHasLoadedMore] = useState(false)
    const [queueTab, setQueueTab] = useState<string>('espiar')
    const [isLoadingFeed, setIsLoadingFeed] = useState(false)
    const [scrollCount, setScrollCount] = useState(0)

    const containerRef = useRef<HTMLDivElement>(null)
    const { isAuthenticated } = useAuthStore()

    // Processar modelos e separar em feeds de junkie e premium
    useEffect(() => {
        if (premiumModels && junkieModel) {
            const premiumVideos: any[] = []
            const junkieVideos: any[] = []

            // Coletar videos do modelo junkie
            if (junkieModel.videos) {
                junkieVideos.push(...junkieModel.videos)
            }

            // Coletar videos dos modelos premium
            premiumModels.forEach(model => {
                if (model.videos) {
                    premiumVideos.push(...model.videos)
                }
            })

            // Embaralhar os feeds
            setJunkieFeed(shuffleArray(junkieVideos))
            setPremiumFeed(shuffleArray(premiumVideos))
        }
    }, [premiumModels, junkieModel])

    // Alternar feed baseado na tab selecionada
    useEffect(() => {
        setIsLoadingFeed(true)

        // Simular pequeno delay para mostrar loading
        const timer = setTimeout(() => {
            if (queueTab === 'espiar') {
                setFeedVideos(junkieFeed)
            } else if (queueTab === 'famosas') {
                setFeedVideos(premiumFeed)
            }
            setIsLoadingFeed(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [queueTab, junkieFeed, premiumFeed])

    useEffect(() => {
        // Reset contador diário se for um novo dia ou usuário for assinante
        const today = new Date().toDateString()
        const lastScrollDate = localStorage.getItem('scrolls-date')
        const isSub = localStorage.getItem('is-subscribed')

        if (lastScrollDate !== today || isSub === 'true') {
            setScrollCount(0)
            localStorage.setItem('scroll-count', '0')
            localStorage.setItem('scrolls-date', today)
        } else {
            // Restaurar contador atual do localStorage
            const savedCount = parseInt(localStorage.getItem('scroll-count') || '0')
            setScrollCount(savedCount)
        }
    }, [])

    const preloadNearbyVideos = useCallback((centerIndex: number) => {
        const preloadAhead = 2 // Pré-carregar 2 vídeos à frente
        const preloadBehind = 1 // Pré-carregar 1 vídeo atrás

        const start = Math.max(0, centerIndex - preloadBehind)
        const end = Math.min(feedVideos.length - 1, centerIndex + preloadAhead)

        setPreloadRange({ start, end })

        // Pré-carregar URLs
        const urlsToPreload: string[] = []

        for (let i = start; i <= end; i++) {
            if (i !== centerIndex) {
                urlsToPreload.push(feedVideos[i].videoUrl)
            }
        }

        // Pré-carregar as URLs em segundo plano
        urlsToPreload.forEach(url => {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'video'
            link.href = url
            document.head.appendChild(link)
            setTimeout(() => document.head.removeChild(link), 1000)
        })
    }, [feedVideos])

    useEffect(() => {
        preloadNearbyVideos(currentIndex)
    }, [currentIndex, preloadNearbyVideos])

    const handleTriggerSubscriptionModal = (title?: string) => {
        if (title) {
            setSubscriptionModalTitle(title)
        }
        setIsSubscriptionModalVisible(true)
    }

    const handleTriggerPaymentModal = () => {
        console.log('Abrindo modal de pagamento direto')
        setSubscriptionModalTitle('Complete seu Pagamento')
        setSubscriptionModalInitialStep('select')
        setIsRePayment(true)
        setIsSubscriptionModalVisible(true)
    }

    // Otimização: Intersection Observer para detectar vídeos visíveis
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const videoIndex = parseInt(entry.target.getAttribute('data-index') || '0')
                        if (videoIndex !== currentIndex) {
                            setCurrentIndex(videoIndex)

                            // Incrementar contador de scrolls para usuários não autenticados
                            if (!isAuthenticated && videoIndex > currentIndex) {
                                const newScrollCount = scrollCount + 1
                                setScrollCount(newScrollCount)
                                localStorage.setItem('scroll-count', newScrollCount.toString())

                                // Verificar se atingiu o limite de 10 scrolls
                                if (newScrollCount >= 10) {
                                    const today = new Date().toDateString()
                                    localStorage.setItem('scrolls-date', today)

                                    setSubscriptionModalTitle('Suas Espiadas diárias Acabaram')
                                    setDailyLimit(true)
                                    setIsSubscriptionModalVisible(true)
                                }
                            }

                            // Scroll infinito para usuários autenticados
                            if (isAuthenticated && videoIndex === feedVideos.length - 2) { // -2 para carregar antes do fim
                                console.log('Usuário autenticado - carregando mais vídeos')
                                // Duplicar os vídeos do feed atual para criar scroll infinito
                                setFeedVideos(prevVideos => [...prevVideos, ...prevVideos])
                                setHasLoadedMore(true)
                            }
                        }
                    }
                })
            },
            {
                root: container,
                threshold: 0.5
            }
        )

        // Observar todos os vídeos
        const videoElements = container.querySelectorAll('.video-container')
        videoElements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [currentIndex, feedVideos.length, isAuthenticated, scrollCount])

    // Otimização: Pré-carregar primeiro vídeo imediatamente
    useEffect(() => {
        if (feedVideos.length > 0) {
            // Forçar pré-carregamento do primeiro vídeo
            const firstVideo = new Audio()
            firstVideo.src = feedVideos[0].videoUrl
            firstVideo.preload = 'auto'
            firstVideo.load()
        }
    }, [feedVideos])

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar scrollbar-hide"
        >
            {isAdultModalVisible && (
                <AdultModal
                    isVisible={isAdultModalVisible}
                    onAccept={() => setIsAdultModalVisible(false)}
                    onDecline={() => setIsAdultModalVisible(false)}
                />
            )}

            {isSubscriptionModalVisible && (
                <SubscriptionModal
                    title={subscriptionModalTitle}
                    isVisible={isSubscriptionModalVisible}
                    dailyLimit={dailyLimit}
                    onAccept={() => {
                        setIsSubscriptionModalVisible(false)
                        setIsRePayment(false)
                    }}
                    onDecline={() => {
                        setIsSubscriptionModalVisible(false)
                        setIsRePayment(false)
                    }}
                    onShowLogin={() => setLoginVisible(true)}
                    initialStep={subscriptionModalInitialStep}
                    isRePayment={isRePayment}
                />
            )}

            {isLoginModalVisible && (
                <LoginModal
                    isVisible={isLoginModalVisible}
                    onAccept={() => {
                        console.log('Login bem-sucedido, fechando modal')
                        setLoginVisible(false)
                    }}
                    onDecline={() => {
                        console.log('Login cancelado')
                        setLoginVisible(false)
                    }}
                    onNeedSubscription={() => {
                        console.log('Usuário precisa de subscription, abrindo modal de pagamento')
                        setLoginVisible(false)
                        setSubscriptionModalTitle('Complete seu Pagamento')
                        setSubscriptionModalInitialStep('select')
                        setIsRePayment(true)
                        setIsSubscriptionModalVisible(true)
                    }}
                />
            )}


            <TopBar
                triggerSubscriptionModal={handleTriggerSubscriptionModal}
                triggerPaymentModal={handleTriggerPaymentModal}
                onToggleQueue={setQueueTab}
            />

            {isLoadingFeed && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white text-sm">Carregando vídeos...</p>
                    </div>
                </div>
            )}

            {feedVideos.map((video, index) => {
                // Determinar se este vídeo deve ser pré-carregado
                const shouldPreload = index >= preloadRange.start && index <= preloadRange.end

                return (
                    <div
                        key={`${video.id}-${index}`}
                        data-index={index}
                        className="video-container snap-start snap-always"
                    >
                        <VideoCard
                            video={video}
                            isActive={index === currentIndex}
                            shouldPreload={shouldPreload}
                            triggerSubscriptionModal={handleTriggerSubscriptionModal}
                            triggerPaymentModal={handleTriggerPaymentModal}
                        />
                    </div>
                )
            })}
        </div>
    )
}