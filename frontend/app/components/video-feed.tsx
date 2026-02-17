"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import VideoCard from "./video-card"
import TopBar from "./topbar"
import AdultModal from "./modal/adult-modal"
import SubscriptionModal from "./modal/subscription-modal"
import LoginModal from "./modal/login-modal"
import { useAuthStore } from "../stores/auth-store"
import { useVideoQueue } from "../hooks/useVideoQueue"

const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

function VideoSkeleton() {
    return (
        <div className="w-full h-full relative bg-black">
            <div className="absolute inset-0 bg-neutral-800 animate-pulse">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-700 animate-pulse"></div>
                        <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-neutral-700 rounded animate-pulse mt-2"></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-24 left-4 right-4">
                <div className="h-4 w-3/4 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/2 bg-neutral-800/50 rounded animate-pulse"></div>
            </div>
        </div>
    )
}

function LoadingOverlay({ message = "Carregando vídeos..." }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg font-medium">{message}</p>
            <p className="text-neutral-400 text-sm mt-2">Preparando o melhor conteúdo para você...</p>
        </div>
    )
}

function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h2>
                <p className="text-neutral-400 mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        </div>
    )
}

export default function VideoFeedOptimized() {

    const { junkieModel, premiumModels, loading, error, retry, isRetrying, initialLoadComplete } = useVideoQueue()
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

    const canChangeTab = !loading && !isRetrying && initialLoadComplete && (junkieFeed.length > 0 || premiumFeed.length > 0)

    useEffect(() => {
        if (premiumModels && junkieModel) {
            const premiumVideos: any[] = []
            const junkieVideos: any[] = []

            if (junkieModel.videos) {
                junkieVideos.push(...junkieModel.videos)
            }

            premiumModels.forEach(model => {
                if (model.videos) {
                    premiumVideos.push(...model.videos)
                }
            })

            setJunkieFeed(shuffleArray(junkieVideos))
            setPremiumFeed(shuffleArray(premiumVideos))
        }
    }, [premiumModels, junkieModel])

    useEffect(() => {
        if (!canChangeTab) return

        setIsLoadingFeed(true)

        const timer = setTimeout(() => {
            if (queueTab === 'espiar') {
                setFeedVideos(junkieFeed)
            } else if (queueTab === 'famosas') {
                setFeedVideos(premiumFeed)
            }
            setIsLoadingFeed(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [queueTab, junkieFeed, premiumFeed, canChangeTab])

    const handleTabChange = (tab: string) => {
        if (!canChangeTab) return
        setQueueTab(tab)
    }

    useEffect(() => {
        const today = new Date().toDateString()
        const lastScrollDate = localStorage.getItem('scrolls-date')
        const isSub = localStorage.getItem('is-subscribed')

        if (lastScrollDate !== today || isSub === 'true') {
            setScrollCount(0)
            localStorage.setItem('scroll-count', '0')
            localStorage.setItem('scrolls-date', today)
        } else {
            const savedCount = parseInt(localStorage.getItem('scroll-count') || '0')
            setScrollCount(savedCount)
        }
    }, [])

    const preloadNearbyVideos = useCallback((centerIndex: number) => {
        const preloadAhead = 1
        const preloadBehind = 0

        const start = Math.max(0, centerIndex - preloadBehind)
        const end = Math.min(feedVideos.length - 1, centerIndex + preloadAhead)

        setPreloadRange({ start, end })

        const urlsToPreload: string[] = []

        for (let i = start; i <= end; i++) {
            if (i !== centerIndex && i === centerIndex + 1) {
                urlsToPreload.push(feedVideos[i].videoUrl)
            }
        }

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
        setSubscriptionModalTitle('Complete seu Pagamento')
        setSubscriptionModalInitialStep('select')
        setIsRePayment(true)
        setIsSubscriptionModalVisible(true)
    }

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

                            if (!isAuthenticated && videoIndex > currentIndex) {
                                const newScrollCount = scrollCount + 1
                                setScrollCount(newScrollCount)
                                localStorage.setItem('scroll-count', newScrollCount.toString())

                                if (newScrollCount >= 10) {
                                    const today = new Date().toDateString()
                                    localStorage.setItem('scrolls-date', today)

                                    setSubscriptionModalTitle('Suas Espiadas diárias Acabaram')
                                    setDailyLimit(true)
                                    setIsSubscriptionModalVisible(true)
                                }
                            }

                            if (isAuthenticated && videoIndex === feedVideos.length - 2) {
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

        const videoElements = container.querySelectorAll('.video-container')
        videoElements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [currentIndex, feedVideos.length, isAuthenticated, scrollCount])

    useEffect(() => {
        if (feedVideos.length > 0) {
            const firstVideo = new Audio()
            firstVideo.src = feedVideos[0].videoUrl
            firstVideo.preload = 'auto'
            firstVideo.load()
        }
    }, [feedVideos])

    const showInitialLoading = loading && !initialLoadComplete
    const showError = error && !initialLoadComplete && junkieFeed.length === 0 && premiumFeed.length === 0

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
                        setLoginVisible(false)
                    }}
                    onDecline={() => {
                        setLoginVisible(false)
                    }}
                    onNeedSubscription={() => {
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
                onToggleQueue={handleTabChange}
                disabledToggle={!canChangeTab}
            />

            {showInitialLoading && (
                <LoadingOverlay message={isRetrying ? "Atualizando..." : "Carregando vídeos..."} />
            )}

            {showError && (
                <ErrorDisplay error={error} onRetry={retry} />
            )}

            {loading && initialLoadComplete && feedVideos.length === 0 && (
                <div className="h-full w-full">
                    <VideoSkeleton />
                </div>
            )}

            {isLoadingFeed && feedVideos.length > 0 && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white text-sm">Trocando...</span>
                    </div>
                </div>
            )}

            {feedVideos.map((video, index) => {
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
