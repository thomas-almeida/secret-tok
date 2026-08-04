"use client"

export interface StoryModel {
    _id: string
    name: string
    profilePic: string
}

interface StoriesBarProps {
    models: StoryModel[]
    onSelectModel: (model: StoryModel) => void
}

export default function StoriesBar({ models, onSelectModel }: StoriesBarProps) {
    if (!models.length) return null

    return (
        <div className="absolute top-14 left-0 right-0 z-10 flex gap-3 px-3 py-2 overflow-x-auto hide-scrollbar scrollbar-hide lg:max-w-xl lg:left-1/2 lg:-translate-x-1/2">
            {models.map((model) => (
                <button
                    key={model._id}
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelectModel(model)
                    }}
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full p-[2px] bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600">
                        <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-neutral-800">
                            <img
                                src={model.profilePic}
                                alt={model.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <span className="text-white text-[11px] max-w-16 truncate drop-shadow">{model.name}</span>
                </button>
            ))}
        </div>
    )
}
