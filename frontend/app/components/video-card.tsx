"use client"

import { useRef, useEffect, useState } from "react"
import VideoInfo from "./video-info"

interface VideoCardProps {
  videoUrl: string
  isActive: boolean
}

export default function VideoCard({ videoUrl, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => { })
    } else {
      videoRef.current.pause()
    }
  }, [isActive])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
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
    <div className="relative h-dvh w-full snap-start snap-always flex-shrink-0 bg-black" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 h-[calc(100%-4px)] w-full object-cover"
        loop
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
      />
      <VideoInfo
        userName="Fulana"
        videoDescription="Lorem Ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod."
      />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700 cursor-pointer"
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        onMouseDown={handleMouseDown}>
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
