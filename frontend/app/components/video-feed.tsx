"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import VideoCard from "./video-card"
import TopBar from "./topbar"

const videos = [
    {
        id: "1",
        videoUrl: "/videos/video-secret.mp4",
    },
    {
        id: "2",
        videoUrl: "/videos/video-secret",
    }, {
        id: "3",
        videoUrl: "/videos/video-secret",
    },
]

export default function VideoFeed() {
    const [feedVideos, setFeedVideos] = useState(() => [...videos, ...videos, ...videos])
    const [currentIndex, setCurrentIndex] = useState(videos.length) // Começar no meio
    const containerRef = useRef<HTMLDivElement>(null)
    const isAdjusting = useRef(false)

    useEffect(() => {
        if (containerRef.current) {
            const height = containerRef.current.clientHeight
            containerRef.current.scrollTop = videos.length * height
        }
    }, [])

    const handleScroll = useCallback(() => {
        if (!containerRef.current || isAdjusting.current) return

        const container = containerRef.current
        const scrollTop = container.scrollTop
        const height = container.clientHeight
        const newIndex = Math.round(scrollTop / height)

        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex)
        }

        const totalItems = feedVideos.length
        const threshold = videos.length

        // Chegando no fim - adicionar mais vídeos e reposicionar
        if (newIndex >= totalItems - threshold) {
            isAdjusting.current = true
            setFeedVideos((prev) => [...prev, ...videos])
            setTimeout(() => {
                isAdjusting.current = false
            }, 50)
        }

        // Chegando no início - reposicionar para o meio
        if (newIndex < threshold) {
            isAdjusting.current = true
            const jumpTo = newIndex + videos.length
            setFeedVideos((prev) => [...videos, ...prev])
            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = jumpTo * height
                    setCurrentIndex(jumpTo)
                }
                isAdjusting.current = false
            }, 50)
        }
    }, [currentIndex, feedVideos.length])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [handleScroll])

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
        >
            <TopBar />
            <>
                {feedVideos.map((video, index) => (
                    <VideoCard key={`${video.id}-${index}`} videoUrl={video.videoUrl} isActive={index === currentIndex} />
                ))}
            </>
        </div>
    )
}
