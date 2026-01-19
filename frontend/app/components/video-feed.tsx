"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import VideoCard from "./video-card"
import TopBar from "./topbar"
import AdultModal from "./modal/adult-modal"
import SubscriptionModal from "./modal/subscription-modal"

const videos = [
    {
        id: "0",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720366/videos/andressa_urach_2_wwuiy3.mp4",
        model: "Andressa Urach",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Andressa Urach"
    },
    {
        id: "1",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720357/videos/kinechan_1_ntwnls.mp4",
        model: "Kinechan",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Kinechan"
    }, {
        id: "2",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720362/videos/ester_muniz_1_p2hwvf.mp4",
        model: "Ester Muniz",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Ester Muniz"
    },
    {
        id: "3",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720354/videos/cibelly_1_ebw1st.mp4",
        model: "Cibelly",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Cibelly"
    },
    {
        id: "4",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720350/videos/coelhinha_2_d2xlaq.mp4",
        model: "Coelhinha",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Coelhinha"
    }, {
        id: "5",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720356/videos/lina_naamura_3_cme9pv.mp4",
        model: "Lina Naamura",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Lina Naamura"
    },
    {
        id: "6",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720367/videos/martina_oliveira_3_y1x59b.mp4",
        model: "Martina Oliveira",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Martina Oliveira"
    },
    {
        id: "7",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768774842/juliana_bonde_2_ueal1g.mp4",
        model: "Juliana Bonde",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Juliana Bonde"
    },
    {
        id: "8",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720349/videos/coelhinha_3_yrypuo.mp4",
        model: "Coelhinha",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Coelhinha"
    },
    {
        id: "9",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720353/videos/lina_naamura_1_wx9eho.mp4",
        model: "Lina Nakamura",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Lina Nakamura"
    },
    {
        id: "10",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720364/videos/ester_muniz_2_sujnac.mp4",
        model: "Ester Muniz",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Ester Muniz"
    },
    {
        id: "11",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720359/videos/kinechan_2_u6oemn.mp4",
        model: "Kinechan",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Kinechan"
    },
    {
        id: "12",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720360/videos/mari_avila_3_epwjni.mp4",
        model: "Maria Avila",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Maria Avila"
    },
    {
        id: "13",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720363/videos/ester_muniz_3_gysl4i.mp4",
        model: "Ester Muniz",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Ester Muniz"
    },
    {
        id: "15",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720359/videos/mc_pipokinha_2_j6vge3.mp4",
        model: "MC Pipokinha",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "MC Pipokinha"
    },
    {
        id: "16",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768720363/videos/martina_oliveira_1_isbvzq.mp4",
        model: "Martina Oliveira",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Martina Oliveira"
    },
    {
        id: "17",
        videoUrl: "https://res.cloudinary.com/daaj5jf0n/video/upload/v1768774828/juliana_bonde_1_tzbe57.mp4",
        model: "Juliana Bonde",
        profilePicture: "https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg",
        description: "Juliana Bonde"
    }

]

export default function VideoFeedOptimized() {
    const [feedVideos, setFeedVideos] = useState(() => [...videos])
    const [isAdultModalVisible, setIsAdultModalVisible] = useState(true)
    const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false)
    const [subscriptionModalTitle, setSubscriptionModalTitle] = useState("Suas espiadas diárias acabaram..")
    const [currentIndex, setCurrentIndex] = useState(0)
    const [preloadRange, setPreloadRange] = useState({ start: 0, end: 2 })

    const containerRef = useRef<HTMLDivElement>(null)

    // Função para pré-carregar vídeos próximos
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
                    onAccept={() => setIsSubscriptionModalVisible(false)}
                    onDecline={() => setIsSubscriptionModalVisible(false)}
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