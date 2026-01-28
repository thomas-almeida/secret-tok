"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import VideoCard from "./video-card"
import TopBar from "./topbar"
import AdultModal from "./modal/adult-modal"
import SubscriptionModal from "./modal/subscription-modal"
import LoginModal from "./modal/login-modal"
import { videos } from "../utils/mocked-videos"

export default function VideoFeedOptimized() {
    const [feedVideos, setFeedVideos] = useState(() => [...videos])
    const [isAdultModalVisible, setIsAdultModalVisible] = useState(true)
    const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false)
    const [isLoginModalVisible, setLoginVisible] = useState(false)
    const [subscriptionModalTitle, setSubscriptionModalTitle] = useState("Seja VIP")
    const [currentIndex, setCurrentIndex] = useState(0)
    const [preloadRange, setPreloadRange] = useState({ start: 0, end: 2 })
    const [dailyLimit, setDailyLimit] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        const checkDailyScrolls = () => {
            const currentScrolls = localStorage.getItem('daily-scrolls') || 'false'
            const limitReached = currentScrolls === 'true' ? 'true' : 'false'
            const scrollsDate = localStorage.getItem('scrolls-date')
            const today = new Date().toDateString()
            const isSub = localStorage.getItem('is-subscribed')

            if (scrollsDate !== today || isSub === 'true') {
                localStorage.setItem('daily-scrolls', 'false')
                localStorage.setItem('scrolls-date', today)
                localStorage.setItem('last-video-reached', 'false')
                return
            }

            localStorage.setItem('daily-scrolls', limitReached)
            localStorage.setItem('scrolls-date', today)
            localStorage.setItem('last-video-reached', 'true')

            console.log('Scrolls diários atualizados:', limitReached)

            setSubscriptionModalTitle('Suas Espiadas diárias Acabaram')
            setDailyLimit(true)
            setIsSubscriptionModalVisible(true)
        }

        checkDailyScrolls()

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

                            // Verificar se é o último vídeo
                            if (videoIndex === feedVideos.length - 1) {

                                console.log('Último vídeo alcançado - index:', videoIndex)

                                // Atualizar storage com scrolls diários
                                const currentScrolls = localStorage.getItem('daily-scrolls') || 'false'
                                const limitReached = currentScrolls === 'true' ? 'true' : 'false'
                                const today = new Date().toDateString()

                                if (localStorage.getItem('is-subscribed') !== 'true') {

                                    localStorage.setItem('daily-scrolls', limitReached)
                                    localStorage.setItem('scrolls-date', today)
                                    localStorage.setItem('last-video-reached', 'true')
                                    console.log('Scrolls diários atualizados:', limitReached)
                                    setSubscriptionModalTitle('Suas Espiadas diárias Acabaram')
                                    setIsSubscriptionModalVisible(true)

                                }
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
    }, [currentIndex, feedVideos.length])

    // Otimização: Pré-carregar primeiro vídeo imediatamente
    useEffect(() => {
        if (feedVideos.length > 0) {
            // Forçar pré-carregamento do primeiro vídeo
            const firstVideo = new Audio()
            firstVideo.src = feedVideos[0].videoUrl
            firstVideo.preload = 'auto'
            firstVideo.load()
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
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
                    onAccept={() => setIsSubscriptionModalVisible(false)}
                    onDecline={() => setIsSubscriptionModalVisible(false)}
                    onShowLogin={() => setLoginVisible(true)}
                />
            )}

            {isLoginModalVisible && (
                <LoginModal
                    isVisible={isLoginModalVisible}
                    onAccept={() => setLoginVisible(false)}
                    onDecline={() => setLoginVisible(false)}
                />
            )}


            <TopBar triggerSubscriptionModal={handleTriggerSubscriptionModal} />

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
                        />
                    </div>
                )
            })}
        </div>
    )
}