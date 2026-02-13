interface TestimonialsCarouselProps {
    testimonials: any
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
    return (
        <>

            <style jsx>{`
                        @keyframes infinite-scroll-testimonials {
                            0% {
                                transform: translateX(-200%);
                            }
                            100% {
                                transform: translateX(0);
                            }
                        }
                        
                        .animate-infinite-scroll-testimonials {
                            animation: infinite-scroll-testimonials 30s linear infinite;
                        }
                        
                    `}
            </style>

            <div className="flex flex-col items-center gap-4">
                <div className="relative w-full max-w-6xl overflow-hidden">
                    <div className="relative">
                        <div className="flex animate-infinite-scroll-testimonials text-left">
                            {[...testimonials, ...testimonials].map((testimonial, index) => (
                                <div key={index} className="shrink-0 relative px-2 w-[320px] lg:w-[400px]">
                                    <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-4 rounded-xl shadow-lg h-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center border-2 border-red-500">
                                                <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                                                <p className="text-green-400 text-md font-bold">{testimonial.earnings}</p>
                                            </div>
                                        </div>
                                        <p className="text-neutral-300 text-xs leading-relaxed mb-3">
                                            "{testimonial.comment}"
                                        </p>
                                        <p className="text-neutral-500 text-xs">{testimonial.date}</p>
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
