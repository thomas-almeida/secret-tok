interface ModelsCarouselProps {
    models: any
}

export default function ModelsCarousel({ models }: ModelsCarouselProps) {
    return (
        <>

            <style jsx>{`
                        @keyframes infinite-scroll-models {
                            0% {
                                transform: translateX(0);
                            }
                            100% {
                                transform: translateX(-300%);
                            }
                        }
                        
                        .animate-infinite-scroll {
                            animation: infinite-scroll-models 25s linear infinite;
                        }
                        
                    `}
            </style>

            <div className="flex flex-col items-center gap-4">
                <div className="relative w-full max-w-6xl overflow-hidden">
                    <div className="relative">
                        <div className="flex animate-infinite-scroll">
                            {[...models, ...models].map((model, index) => (
                                <div key={index} className="shrink-0 relative px-2 w-2/5 h-[105px] lg:w-[180px] lg:h-[140px]">
                                    <div className="relative h-full rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden shadow-lg shadow-red-500/15">
                                        <img
                                            src={model.image}
                                            alt={model.name}
                                            className="w-[180px] h-full object-cover lg:w-full"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent">
                                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                                <h3 className="text-lg font-bold mb-1 drop-shadow-lg leading-4">{model.name}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}