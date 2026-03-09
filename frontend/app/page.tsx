"use client"

import { useAffiliateCode } from "./hooks/useAffiliateCode"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const VideoFeed = dynamic(() => import('./components/video-feed'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black"></div>
})

export default function Home() {
  useAffiliateCode()
  return (
    <main className="h-dvh w-full bg-background">
      <Suspense fallback={<div className="h-full w-full bg-black"></div>}> 
        <VideoFeed />
      </Suspense>
    </main>
  )
}
