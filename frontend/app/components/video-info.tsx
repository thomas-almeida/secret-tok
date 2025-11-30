"use client"

import { useState } from "react"
import Image from "next/image"
import Button from "./button"
import { Heart, Bookmark } from "lucide-react"
import Tag from "./tag"

interface VideoInfoProps {
    userName: string
    videoDescription: string
}

export default function VideoInfo({ userName, videoDescription }: VideoInfoProps) {
    const [isFollowing, setIsFollowing] = useState(false)
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent click from reaching the parent VideoCard
    }

    return (
        <div className="absolute bottom-2 left-0 right-0 p-4 text-white z-10" onClick={handleClick}>
            <div className="flex justify-start items-center gap-2">
                <Image
                    src="https://i.pinimg.com/1200x/b7/73/f8/b773f847134c609f128f93c8b9bc30b1.jpg"
                    alt=""
                    width={50}
                    height={50}
                    className="rounded-full shadow object-cover max-w-50 max-h-50"
                />
                <div className="flex justify-start items-center gap-1">
                    <p className="text-lg font-medium">{userName}</p>
                    <Image
                        src={"/icons/verified.png"}
                        width={15}
                        height={15}
                        alt=""
                        className="w-5 h-5"
                    />
                </div>
                <Button
                    className="border py-1 ml-2"
                    onClick={() => setIsFollowing(!isFollowing)}
                >
                    {isFollowing ? "Seguindo" : "Seguir"}
                </Button>
            </div>
            <p className="mt-5 text-md">{videoDescription}</p>
            <div className="flex justify-start gap-3 mt-2">
                <Tag link="#rj">#rj</Tag>
                <Tag link="#vazados-rj">#vazados-rj</Tag>
                <Tag link="#loira">#loira</Tag>
            </div>

            {/* Like Button */}
            <div className="absolute right-4 bottom-30 flex items-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        // Add like functionality here
                    }}
                    className="p-2 rounded-full transition-colors"
                >
                    <Heart className="w-8 h-8 text-white fill-white/0 stroke-2" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        // Add like functionality here
                    }}
                    className="p-2 rounded-full transition-colors"
                >
                    <Bookmark className="w-8 h-8 text-white fill-white/0 stroke-2" />
                </button>
            </div>
        </div>
    )
}