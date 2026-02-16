'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Play, Star, Users } from 'lucide-react';
import Logo from '../components/logo';
import ModelsCarousel from '../components/models-carousel';
import { models } from '../utils/models';

function PreAdsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const affiliateId = searchParams.get('ref');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="w-12 h-12 bg-neutral-700 rounded-full"></div>
                </div>
            </div>
        );
    }

    const handleCtaClick = () => {
        const targetUrl = affiliateId
            ? `/?ref=${affiliateId}`
            : '/';
        router.push(targetUrl);
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
                <div className="max-w-2xl w-full text-center">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-8">
                        <Logo />
                    </div>


                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-9 tracking-tighter">
                        O que você quer ver está aqui! <br />
                    </h1>

                    <div className="mb-6">
                        <ModelsCarousel models={models} />
                    </div>

                    <p className="text-lg md:text-xl text-neutral-300 mb-10 max-w-xl mx-auto leading-5">
                        Acesse o maior catálogo de mais completo e exclusivo agora!
                    </p>


                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <button
                            onClick={handleCtaClick}
                            className="group w-[80%] flex justify-center items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                        >
                            Acessar Agora!
                            <Play className="w-5 h-5 fill-white" />
                        </button>

                        <div className="flex items-center gap-2 text-neutral-400 text-sm">
                            <Users className="w-4 h-4" />
                            <span>Mais de 10.000 usuários ativos</span>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="py-6 text-center text-neutral-500 text-sm relative z-10">
                <p>© 2024 Rapidinhas. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
            <div className="animate-pulse">
                <div className="w-12 h-12 bg-neutral-700 rounded-full"></div>
            </div>
        </div>
    );
}

export default function PreAdsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PreAdsContent />
        </Suspense>
    );
}
