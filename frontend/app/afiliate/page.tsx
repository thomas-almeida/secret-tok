'use client';

import Logo from "../components/logo";
import Input from "../components/input";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Wallet, ArrowLeft, ChevronDown, Percent, RotateCcw } from "lucide-react";
import copy from "copy-to-clipboard";
import { getAfiliateData } from "../services/user-service";

interface AfiliateData {
    balance: number,
    associatedUsers: number
}

export default function AfiliatePage() {

    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const router = useRouter();
    const [copiedLink, setCopiedLink] = useState<boolean>(false)
    const [pixKey, setPixKey] = useState<string>('')
    const [expandedPix, setExpandedPix] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [afiliateData, setAfiliateData] = useState<AfiliateData | null>(null)

    useEffect(() => {
        const savedPixKey = localStorage.getItem('userPixKey')
        if (savedPixKey) {
            setPixKey(savedPixKey)
        }
    }, [])

    useEffect(() => {
        if (pixKey) {
            localStorage.setItem('userPixKey', pixKey)
        }
    }, [pixKey])

    useEffect(() => {
        if (isHydrated && !isAuthenticated || !user?.subscription.active) {
            router.push('/');
        }
    }, [isHydrated, isAuthenticated, router])

    useEffect(() => {

        if (user) {
            setAfiliateData({
                balance: user.revenue.balance,
                associatedUsers: user.revenue.associatedUsers.length
            })
        }

    }, [])

    if (!isHydrated) {
        return null;
    }

    const handleCopyCode = () => {
        if (!user?._id) return

        const copied = copy(`https://rapidinhas.vercel.app?ref=${user?._id}`)

        if (copied) {
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 3000)
        } else {
            console.error('falha ao copiar link')
        }
    }

    const handleUpdateAfiliateData = async () => {
        try {

            setIsFetching(true)

            if (user?._id) {

                const res = await getAfiliateData(user?._id)
                console.log(res.data)
                setAfiliateData({
                    balance: res.data?.balance,
                    associatedUsers: res.data?.associatedUsers
                })

                setInterval(() => {
                    setIsFetching(false)
                }, 2000)

            }

        } catch (error) {
            console.error(error)
        }
    }

    const getPercentage = () => {
        if (user?.revenue?.associatedUsers?.length! >= 10) {
            return 45
        }

        return 35
    }

    const formattedBalance = () => {
        const balanceFormatted = afiliateData?.balance! / 100
        return balanceFormatted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    return (
        <div className="bg-neutral-900 h-screen w-full text-white flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 py-6 px-4 border-b border-neutral-800 shadow-2xl">
                <div className="flex justify-center items-center relative">
                    <Link href={"/"} className="border absolute left-4 p-2 px-4 rounded border-slate-300/50 shadow-2xl shadow-amber-50/15">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <Logo />
                </div>
            </div>

            <div className="overflow-y-auto flex justify-center items-start pt-24 pb-6 px-4">
                <div className="">

                    <div className="py-6">
                        <p>Área do Afiliado</p>
                        <h1 className="text-2xl font-bold text-left w-full pt-4">{user?.name}</h1>
                        <p className="py-1">{user?.email}</p>

                        <div className="flex flex-col gap-6 mt-6">

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4">
                                <h2 className="text-2xl font-semibold pb-2">Código de Afiliado</h2>
                                <p>Ao convidar sua base, use este link abaixo para contabilizar os ganhos.</p>
                                <Input
                                    type="text"
                                    placeholder="Seu código de indicação"
                                    value={`https://rapidinhas.vercel.app?ref=${user?._id}`}
                                    className="mt-2 text-xl font-medium"
                                />
                                <button
                                    onClick={handleCopyCode}
                                    className={`mt-2 border text-white px-4 py-3 rounded font-semibold transition-colors text-lg ${copiedLink && 'bg-green-600'}`}>
                                    {copiedLink ? 'Copiado!' : 'Copiar Link de Afiliado'}
                                </button>
                            </div >


                            <div className="flex flex-col gap-4 border rounded-md border-neutral-800 p-2 py-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-2xl font-bold">Receita Compartilhada</p>
                                    <button
                                        onClick={handleUpdateAfiliateData}
                                        disabled={isFetching}
                                        className="p-3 px-4 ">
                                        <RotateCcw className={`w-6 h-6 ${isFetching && 'animate-spin'}`} />
                                    </button>
                                </div>

                                <div className="flex justify-start items-center p-2 px-4 gap-4 mt-4 border rounded-md border-neutral-800 bg-neutral-800/50">
                                    <Wallet className="w-8 h-8 text-white" />
                                    <div className="flex flex-col">
                                        <p className="text-lg">Saldo de comissão</p>
                                        <h2 className="text-xl font-bold">{formattedBalance()}</h2>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center p-2 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50">
                                    <Users className="w-8 h-8 text-white" />
                                    <div className="flex flex-col">
                                        <p className="text-lg">Usuários Trazidos</p>
                                        <h2 className="text-xl font-bold">{afiliateData?.associatedUsers} usuários</h2>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center p-2 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50">
                                    <Percent className="w-8 h-8 text-white" />
                                    <div className="flex flex-col">
                                        <p className="text-lg">Porcentagem de comissão</p>
                                        <h2 className="text-xl font-bold">{getPercentage()}%</h2>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border rounded-md p-4 border-neutral-800 bg-neutral-800/50">
                                    <button
                                        onClick={() => setExpandedPix(!expandedPix)}
                                        className="flex justify-between items-center w-full"
                                    >
                                        <h2 className="text-lg font-semibold">Chave PIX para Saques</h2>
                                        <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${expandedPix ? 'rotate-180' : ''}`} />
                                    </button>

                                    {expandedPix && (
                                        <div className="mt-4 pt-4 border-t border-neutral-800">
                                            <p className="mb-4 text-neutral-300">Cadastre sua chave PIX para receber seus saques. Sua chave será salva com segurança.</p>
                                            <Input
                                                type="text"
                                                placeholder="Digite sua chave PIX (email, CPF, celular ou aleatória)"
                                                value={pixKey}
                                                className="mt-2 text-lg font-medium"
                                                onChange={(e) => setPixKey(e.target.value)}
                                            />
                                            <p className="text-sm text-green-400 mt-2">
                                                {pixKey ? '✓ Chave salva automaticamente' : 'Digite sua chave PIX acima'}
                                            </p>
                                        </div>
                                    )}
                                </div >

                                <Link
                                    className="flex justify-center items-center bg-green-600 text-white px-4 py-4 rounded font-semibold transition-colors text-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-600 disabled:opacity-60"
                                    href={`https://wa.me/5511989008294?text=Ol%C3%A1%2C%20quero%20solicitar%20meu%20saque%2C%20meu%20c%C3%B3digo%20de%20usu%C3%A1rio%20%C3%A9%3A%20${user?._id}`}
                                >
                                    <button
                                        className="flex justify-center items-center gap-4 "
                                        disabled={user?.revenue.balance === 0}
                                    >
                                        <p>Solicitar Saque</p>
                                        <img src="/icons/pix-white.png" className="w-6 h-6" alt="" />
                                    </button>
                                </Link>

                            </div>

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4">
                                <h2 className="text-2xl font-semibold pb-4">Perguntas Frequentes</h2>

                                <div className="space-y-4">
                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h3 className="font-semibold text-lg mb-2">Como ser comissionado?</h3>
                                        <p className="text-neutral-300">Você começa como afiliado com <span className="text-green-400 font-bold">35% de comissão</span> em cada venda que realizar através do seu código de indicação.</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h3 className="font-semibold text-lg mb-2">Como aumentar minha comissão?</h3>
                                        <p className="text-neutral-300">Após realizar <span className="text-green-400 font-bold">10 vendas</span>, sua comissão sobe automaticamente para <span className="text-green-400 font-bold">45%</span>.</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h3 className="font-semibold text-lg mb-2">Qual o prazo para receber meu saque?</h3>
                                        <p className="text-neutral-300">Após solicitar o saque, o prazo para receber é de <span className="text-green-400 font-bold">24 horas</span>. Você receberá na conta bancária cadastrada.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 mb-6">
                                <p>Teve algum problema, bug ou dúvidas de como o app funciona? chama a gente no suporte prioritário para afiliados!</p>
                                <Link
                                    href={`https://wa.me/5511989008294?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20rapidinhas%2C%20meu%20c%C3%B3digo%20de%20usu%C3%A1rio%20%C3%A9%3A${user?._id}`}
                                    className={`mt-2 border text-white px-4 py-3 rounded font-semibold transition-colors text-lg text-center ${copiedLink && 'bg-green-600'}`}
                                >
                                    Chamar Suporte
                                </Link>
                            </div >
                        </div>

                    </div >
                </div >
            </div >
        </div >
    );
}