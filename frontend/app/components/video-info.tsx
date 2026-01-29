"use client"

import { useState } from "react"
import Image from "next/image"
import Button from "./button"
import { Heart, Bookmark, MessageCircle, Download } from "lucide-react"
import Tag from "./tag"

import Link from "next/link"

import { useAuthStore } from "../stores/auth-store"

interface VideoInfoProps {
    userName: string
    videoDescription: string
    videoUrl: string
    triggerModal: () => void
    triggerSubscriptionModal: boolean
    triggerPaymentModal?: () => void
}

export default function VideoInfo({ userName, videoDescription, videoUrl, triggerModal, triggerSubscriptionModal, triggerPaymentModal }: VideoInfoProps) {
    const [isFollowing, setIsFollowing] = useState(false)
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent click from reaching the parent VideoCard
    }
    const { user, isAuthenticated } = useAuthStore()

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()

        // Se não autenticado, mostrar modal de subscription
        if (!isAuthenticated) {
            triggerModal()
            return
        }

        // Se autenticado mas sem subscription, mostrar pagamento
        if (user?.subscription?.active !== true && triggerPaymentModal) {
            triggerPaymentModal()
            return
        }

        // Fazer download do vídeo
        try {
            const response = await fetch(videoUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `video-${Date.now()}.mp4`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Erro ao fazer download do vídeo:', error)
        }
    }

    return (
        <>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10" onClick={handleClick}>
                <div className="flex justify-start items-center gap-2">
                    <Image
                        src="https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg"
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full shadow object-cover max-w-50 max-h-50"
                    />
                    <div className="flex justify-start items-center gap-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <Image
                            src={"/icons/verified.png"}
                            width={10}
                            height={10}
                            alt=""
                            className="w-5 h-5"
                        />
                    </div>
                    <Button
                        className="border py-0.5 ml-1 text-sm"
                        onClick={() => {
                            if (triggerSubscriptionModal) {
                                triggerModal()
                            } else {
                                setIsFollowing(!isFollowing)
                            }
                        }}
                    >
                        {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                </div>
                <p className="mt-1.5 text-sm">{videoDescription}</p>
                <div className="hidden justify-start gap-3 mt-2 text-xs">
                    <Tag link="#rj">#rj</Tag>
                    <Tag link="#vazados-rj">#vazados-rj</Tag>
                    <Tag link="#loira">#loira</Tag>
                </div>

                <div className="absolute right-2 bottom-20 flex flex-col items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            // Se não autenticado, mostrar modal de subscription
                            if (!isAuthenticated) {
                                triggerModal()
                                return
                            }
                            // Se autenticado mas sem subscription, mostrar pagamento
                            if (user?.subscription?.active !== true && triggerPaymentModal) {
                                triggerPaymentModal()
                                return
                            }
                        }}
                        className="p-2 rounded-full transition-colors"
                    >
                        <Bookmark className="w-8 h-8 text-white fill-white/0 stroke-2" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-full transition-colors"
                    >
                        <Download className="w-8 h-8 text-white fill-white/0 stroke-2" />
                    </button>
                    {
                        isAuthenticated && user?.subscription?.active === true && (
                            <Link href={"/afiliate"}>
                                <button
                                    className="p-2 rounded-full transition-colors"
                                >
                                    <div className="bg-red-500 w-12 h-12 rounded-md flex items-center justify-center text-white font-bold text-2xl shadow-4xl shadow-slate-900">
                                        <b className="uppercase">{user?.name?.slice(0, 1)}</b>
                                    </div>
                                </button>
                            </Link>

                        )
                    }
                </div>
            </div>
        </>
    )
}