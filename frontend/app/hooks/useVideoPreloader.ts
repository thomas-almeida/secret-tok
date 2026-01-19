// hooks/useVideoPreloader.ts
import { useEffect, useRef } from 'react'

interface UseVideoPreloaderProps {
  videoUrls: string[]
  currentIndex: number
  preloadAhead?: number
  preloadBehind?: number
}

export function useVideoPreloader({
  videoUrls,
  currentIndex,
  preloadAhead = 2,
  preloadBehind = 1
}: UseVideoPreloaderProps) {
  const preloadedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const preloadVideo = (url: string) => {
      if (preloadedRef.current.has(url)) return
      
      const video = document.createElement('video')
      video.preload = 'auto'
      video.style.display = 'none'
      video.src = url
      
      video.onloadeddata = () => {
        preloadedRef.current.add(url)
        document.body.removeChild(video)
      }
      
      document.body.appendChild(video)
    }

    // Calcular range de pré-carregamento
    const start = Math.max(0, currentIndex - preloadBehind)
    const end = Math.min(videoUrls.length - 1, currentIndex + preloadAhead)

    // Pré-carregar vídeos no range
    for (let i = start; i <= end; i++) {
      if (i !== currentIndex) {
        preloadVideo(videoUrls[i])
      }
    }

    // Limpar vídeos muito distantes
    preloadedRef.current.forEach(url => {
      const index = videoUrls.indexOf(url)
      if (index !== -1 && Math.abs(index - currentIndex) > 3) {
        preloadedRef.current.delete(url)
      }
    })
  }, [videoUrls, currentIndex, preloadAhead, preloadBehind])

  return preloadedRef.current
}