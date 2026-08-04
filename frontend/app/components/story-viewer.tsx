"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import type { Model } from "../stores/model-store"

interface StoryViewerProps {
    model: Model
    onClose: () => void
}

export default function StoryViewer({ model, onClose }: StoryViewerProps) {
    const stories = model.videos
    const [currentIndex, setCurrentIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)

    const goToNext = () => {
        setCurrentIndex((prev) => {
            if (prev >= stories.length - 1) {
                onClose()
                return prev
            }
            return prev + 1
        })
        setProgress(0)
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1))
        setProgress(0)
    }

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.currentTime = 0

        let retryCount = 0
        let retryTimeout: ReturnType<typeof setTimeout> | undefined
        const attemptPlay = () => {
            video.play().catch(() => {
                if (retryCount >= 5) return
                retryCount++
                retryTimeout = setTimeout(attemptPlay, 300 * retryCount)
            })
        }
        attemptPlay()

        const handleTimeUpdate = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100)
            }
        }

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('ended', goToNext)

        return () => {
            clearTimeout(retryTimeout)
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('ended', goToNext)
        }
    }, [currentIndex])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') goToNext()
            if (e.key === 'ArrowLeft') goToPrevious()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    if (!stories.length) return null

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="relative w-full h-full lg:max-w-md lg:h-[95vh] lg:rounded-2xl overflow-hidden bg-neutral-950">

                <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                    {stories.map((story, index) => (
                        <div key={story._id} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute top-8 left-3 right-3 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src={model.profilePic}
                            alt={model.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/30"
                        />
                        <span className="text-white text-sm font-semibold drop-shadow">{model.name}</span>
                    </div>
                    <button onClick={onClose} className="p-1 cursor-pointer">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <video
                    ref={videoRef}
                    key={stories[currentIndex]._id}
                    src={stories[currentIndex].videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                />

                <div className="absolute inset-0 flex z-10">
                    <button className="w-1/2 h-full cursor-pointer" onClick={goToPrevious} />
                    <button className="w-1/2 h-full cursor-pointer" onClick={goToNext} />
                </div>

                <div className="absolute bottom-4 left-3 right-3 z-20">
                    <p className="text-white text-sm drop-shadow">{stories[currentIndex].description}</p>
                </div>
            </div>
        </div>
    )
}
