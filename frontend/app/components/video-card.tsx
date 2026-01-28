// components/video-card-optimized.tsx
"use client"

import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { useRef, useEffect, useState, useCallback } from "react"
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
  shouldPreload: boolean // Novo: indica se deve pré-carregar
  triggerSubscriptionModal: () => void
}

export default function VideoCard({
  video,
  isActive,
  shouldPreload,
  triggerSubscriptionModal,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showAudioIndicator, setShowAudioIndicator] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Estratégia de pré-carregamento inteligente
  useEffect(() => {
    if (!videoRef.current) return

    const videoElement = videoRef.current

    // Configurações otimizadas
    videoElement.preload = shouldPreload ? "auto" : "metadata"
    videoElement.playsInline = true
    videoElement.crossOrigin = "anonymous"

    // Event listeners para controle de carregamento
    const handleCanPlay = () => {
      setIsLoading(false)
      setHasError(false)
    }

    const handleWaiting = () => setIsLoading(true)
    const handlePlaying = () => setIsLoading(false)
    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      console.error(`Erro ao carregar vídeo: ${video.videoUrl}`)
    }

    videoElement.addEventListener('canplay', handleCanPlay)
    videoElement.addEventListener('waiting', handleWaiting)
    videoElement.addEventListener('playing', handlePlaying)
    videoElement.addEventListener('error', handleError)

    // Forçar carregamento se necessário
    if (shouldPreload && videoElement.readyState < 3) {
      videoElement.load()
    }

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay)
      videoElement.removeEventListener('waiting', handleWaiting)
      videoElement.removeEventListener('playing', handlePlaying)
      videoElement.removeEventListener('error', handleError)
    }
  }, [video.videoUrl, shouldPreload])

  // Controle de play/pause
  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      // Reset do vídeo se estiver no final
      if (videoRef.current.currentTime >= videoRef.current.duration - 0.5) {
        videoRef.current.currentTime = 0
      }

      videoRef.current.muted = true

      // Tentar play com fallback
      const playPromise = videoRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false)
          })
          .catch(error => {
            console.log("Autoplay bloqueado:", error)
            // Tentar novamente silenciado
            videoRef.current!.muted = true
            videoRef.current!.play().catch(() => {
              // Se ainda falhar, mostrar estado de carregamento
              setIsLoading(true)
            })
          })
      }
    } else {
      // Pausar vídeo não ativo
      videoRef.current.pause()

      // Manter buffer se estiver pré-carregado
      if (!shouldPreload && videoRef.current.readyState >= 3) {
        // Manter vídeo carregado mas pausado
        videoRef.current.currentTime = 0
      }
    }
  }, [isActive, shouldPreload])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(!isMuted)

    setShowAudioIndicator(true)
    setTimeout(() => {
      setShowAudioIndicator(false)
    }, 1000)
  }, [isMuted])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const { currentTime, duration } = videoRef.current
    if (duration && duration > 0) {
      setProgress((currentTime / duration) * 100)
    }
  }, [])

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * videoRef.current.duration

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => { })
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    setIsDragging(false)

    if (videoRef.current?.paused) {
      videoRef.current.play().catch(() => { })
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    let pos = (e.clientX - rect.left) / rect.width
    pos = Math.max(0, Math.min(1, pos))

    videoRef.current.currentTime = pos * videoRef.current.duration
    setProgress(pos * 100)
  }, [isDragging])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className="relative h-dvh w-full snap-start snap-always bg-black" onClick={toggleMute}>
      {/* Overlay de loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        </div>
      )}


      {/* Overlay de erro */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center text-white">
            <p className="text-lg">Erro ao carregar vídeo</p>
            <button
              onClick={() => {
                setHasError(false)
                setIsLoading(true)
                videoRef.current?.load()
              }}
              className="mt-4 px-4 py-2 bg-pink-600 rounded-lg"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <div className="bg-black/90 blur-3xl h-full w-full relative overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="absolute inset-0 h-[calc(100%-4px)] w-full object-cover"
          loop
          playsInline
          muted
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={() => setIsLoading(false)}
        />
      </div>

      {/* Indicador de áudio */}
      {isActive && showAudioIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          {isMuted ? (
            <VolumeX className="w-12 h-12 text-white/80 bg-black/50 p-2 rounded-full" />
          ) : (
            <Volume2 className="w-12 h-12 text-white/80 bg-black/50 p-2 rounded-full" />
          )}
        </div>
      )}

      <VideoInfo
        userName={video.model}
        videoDescription={video.description}
        triggerModal={triggerSubscriptionModal}
        triggerSubscriptionModal={true}
      />

      {/* Barra de progresso */}
      <div
        className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 cursor-pointer z-10"
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        onMouseDown={handleMouseDown}
      >
        <div
          className="h-full bg-linear-to-r from-pink-500 to-purple-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}