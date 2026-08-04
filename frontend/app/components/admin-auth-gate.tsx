'use client';

import { useState, useEffect, ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkIsAdmin, validateAdmin } from "../services/admin-service";
import Input from "./input";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface AdminAuthGateProps {
    children: (userId: string) => ReactNode;
}

export function AdminAuthGateSkeleton() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4">
            <div className="animate-pulse max-w-md mx-auto mt-24">
                <div className="h-8 bg-neutral-800 rounded w-32 mb-8 mx-auto"></div>
                <div className="h-40 bg-neutral-800 rounded-lg"></div>
            </div>
        </div>
    );
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userIdFromUrl = searchParams.get('ref');

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isValidatingPassword, setIsValidatingPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isAdminCheckComplete, setIsAdminCheckComplete] = useState<boolean>(false);
    const [isValidAdmin, setIsValidAdmin] = useState<boolean>(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            if (!userIdFromUrl) {
                router.push('/');
                return;
            }

            setUserId(userIdFromUrl);

            try {
                const response = await checkIsAdmin(userIdFromUrl);

                if (response.isAdmin) {
                    setIsValidAdmin(true);
                    setUserName(response.userName || '');
                } else {
                    setError('Acesso negado. Você não tem permissão para acessar esta página.');
                }
            } catch (err) {
                setError('Erro ao verificar permissões. Tente novamente.');
            } finally {
                setIsAdminCheckComplete(true);
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, [userIdFromUrl, router]);

    const handleLogin = async () => {
        if (!userId || !password) {
            setError('Preencha a senha');
            return;
        }

        setIsValidatingPassword(true);
        setError('');

        try {
            const response = await validateAdmin(userId, password);
            if (response.success) {
                setIsAuthenticated(true);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Senha incorreta');
        } finally {
            setIsValidatingPassword(false);
        }
    };

    if (isLoading || !isAdminCheckComplete) {
        return <AdminAuthGateSkeleton />;
    }

    if (!isValidAdmin) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Link href="/" className="text-red-500 hover:underline">
                        Voltar para página inicial
                    </Link>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-800 border border-neutral-700 p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-neutral-700 rounded-full">
                                <Lock className="w-8 h-8 text-amber-500" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2">Acesso Admin</h2>
                        <p className="text-neutral-400 text-center mb-6">
                            Olá, <span className="text-white font-medium">{userName}</span>. Digite sua senha para continuar.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Senha</label>
                                <Input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={isValidatingPassword}
                                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isValidatingPassword ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Validando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children(userId)}</>;
}
