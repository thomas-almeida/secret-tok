"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import VideoInfo from "./video-info"

type Video = {
  id: string
  videoUrl: string
  model: string
  profilePicture: string
  description: string
}

interface VideoCardProps {
  video: Video
  isActive: boolean
  triggerSubscriptionModal: () => void
}

export default function VideoCard({ video, isActive, triggerSubscriptionModal }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showAudioIndicator, setShowAudioIndicator] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.currentTime = 0
      videoRef.current.muted = true
      videoRef.current.play().catch(() => { })
    } else {
      videoRef.current.pause()
      // Pré-carregar próximos vídeos quando não estão ativos
      if (videoRef.current.readyState < 3) {
        videoRef.current.load()
      }
    }
  }, [isActive])

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(!isMuted)
    
    // Mostrar indicador por 1 segundo
    setShowAudioIndicator(true)
    setTimeout(() => {
      setShowAudioIndicator(false)
    }, 1000)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const { currentTime, duration } = videoRef.current
    if (duration) {
      setProgress((currentTime / duration) * 100)
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation() // Prevent the click from reaching the parent div
    if (!videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * videoRef.current.duration

    // Ensure video continues playing after seeking
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => { })
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation() // Prevent the click from reaching the parent div
    setIsDragging(true)
  }

  const handleMouseUp = (e: MouseEvent) => {
    e.stopPropagation()
    setIsDragging(false)

    // Ensure video continues playing after dragging
    if (videoRef.current?.paused) {
      videoRef.current.play().catch(() => { })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    let pos = (e.clientX - rect.left) / rect.width
    pos = Math.max(0, Math.min(1, pos)) // Clamp between 0 and 1

    videoRef.current.currentTime = pos * videoRef.current.duration
    setProgress(pos * 100)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className="relative h-dvh w-full snap-start snap-always bg-black" onClick={toggleMute}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 h-[calc(100%-4px)] w-full object-cover"
        loop
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
      />
      
      {/* Indicador de áudio */}
      {isActive && showAudioIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {isMuted ? (
            <VolumeX className="w-8 h-8 text-white" />
          ) : (
            <Volume2 className="w-8 h-8 text-white" />
          )}
        </div>
      )}
      
      <VideoInfo
        userName={video.model}
        videoDescription={video.description}
        triggerModal={triggerSubscriptionModal}
        triggerSubscriptionModal={true}
      />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700 cursor-pointer"
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        onMouseDown={handleMouseDown}>
        <div
          className="h-full bg-red-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
