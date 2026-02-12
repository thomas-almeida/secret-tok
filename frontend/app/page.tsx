"use client"

import { useAffiliateCode } from "./hooks/useAffiliateCode"
import VideoFeed from "./components/video-feed"

export default function Home() {
  useAffiliateCode()
  return (
    <main className="h-dvh w-full bg-background">
      <VideoFeed />
    </main>
  )
}
