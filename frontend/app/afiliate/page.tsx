'use client';

import Logo from "../components/logo";
import Input from "../components/input";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Folder, Eye, Wallet, ArrowLeft, ChevronDown, Percent, RotateCcw, MessageCircle } from "lucide-react";
import copy from "copy-to-clipboard";
import { getAfiliateData } from "../services/user-service";
import { useTranslate } from "../hooks/useTranslate";

interface AfiliateData {
    balance: number,
    associatedUsers: number,
    transactions: any[]
}

export default function AfiliatePage() {

    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const router = useRouter();
    const { translateStatus } = useTranslate()
    const [copiedLink, setCopiedLink] = useState<boolean>(false)
    const [pixKey, setPixKey] = useState<string>('')
    const [expandedPix, setExpandedPix] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [afiliateData, setAfiliateData] = useState<AfiliateData | null>(null)
    const [disabledWithdraw, setDisableWithdraw] = useState<boolean>(true)


    useEffect(() => {

        const getUpdatedData = async () => {

            setIsFetching(true)

            if (user) {
                const res = await getAfiliateData(user?._id)
                setAfiliateData({
                    balance: res.data?.balance,
                    associatedUsers: res.data?.associatedUsers,
                    transactions: res.data?.transactions || []
                })

                setInterval(() => {
                    setIsFetching(false)
                }, 1000)
            }


        }

        getUpdatedData()
    }, [user])

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
        if (isHydrated && !isAuthenticated) {
            router.push('/');
        }
    }, [isHydrated, isAuthenticated, router])

    useEffect(() => {

        if (user) {
            setAfiliateData({
                balance: user.revenue.balance,
                associatedUsers: user.revenue.associatedUsers.length,
                transactions: user.revenue?.transactions || []
            })

            if (user) {
                if (user?.revenue?.balance! > 0) {
                    setDisableWithdraw(false)
                } else {
                    setDisableWithdraw(true)
                }
            }

        }

    }, [user])

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
                    associatedUsers: res.data?.associatedUsers,
                    transactions: res.data?.transactions || []
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

    const requestedWithdraw = () => {
        router.push(`https://wa.me/5511989008294?text=Ol%C3%A1%2C%20quero%20solicitar%20meu%20saque%2C%20meu%20c%C3%B3digo%20de%20usu%C3%A1rio%20%C3%A9%3A%20${user?._id}`)
    }

    return (
        <div className="bg-neutral-900 h-screen w-full text-white flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 py-6 px-4 border-b border-neutral-800 shadow-2xl">
                <div className="max-w-6xl mx-auto flex justify-center items-center relative">
                    <Link href={"/"} className="border absolute left-4 p-2 px-4 rounded border-slate-300/50 shadow-2xl shadow-amber-50/15 lg:left-0">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <Logo />
                </div>
            </div>

            <div className="overflow-y-auto flex justify-center items-start pt-24 pb-6 px-4">
                <div className="w-full max-w-4xl lg:max-w-6xl">

                    <div className="py-6">
                        <p className="text-lg text-neutral-400">Área do Afiliado</p>
                        <h1 className="text-2xl font-bold text-left w-full pt-4 lg:text-3xl">{user?.name}</h1>
                        <p className="py-1 text-neutral-300">{user?.email}</p>

                        <div className="flex flex-col gap-6 mt-6 lg:grid lg:grid-cols-2 lg:gap-8">

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:col-span-2 lg:p-6">
                                <h2 className="text-2xl font-semibold pb-2 lg:text-3xl">Código de Afiliado</h2>
                                <p className="text-neutral-300 lg:text-lg">Ao convidar e anunciar para a sua base, use este link abaixo para contabilizar os ganhos.</p>
                                <p className="text-neutral-300 lg:text-lg">Qualquer novo assinante que ingressar usando seu link você será automaticamente comissionado.</p>
                                <Input
                                    type="text"
                                    placeholder="Seu código de indicação"
                                    value={`https://rapidinhas.vercel.app?ref=${user?._id}`}
                                    className="mt-2 text-xl font-medium lg:text-base"
                                />
                                <button
                                    onClick={handleCopyCode}
                                    className={`mt-2 text-white px-4 py-3 rounded font-semibold transition-colors text-lg lg:hover:bg-opacity-80 cursor-pointer ${copiedLink ? 'bg-green-600' : 'bg-neutral-700 hover:bg-neutral-600'}`}>
                                    {copiedLink ? 'Copiado!' : 'Copiar Meu Link'}
                                </button>
                            </div >


                            <div className="flex flex-col gap-4 border rounded-md border-neutral-800 p-2 py-6 lg:p-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-2xl font-bold lg:text-3xl">Receita Compartilhada</p>
                                    <button
                                        onClick={handleUpdateAfiliateData}
                                        disabled={isFetching}
                                        className="p-3 px-4 hover:bg-neutral-700 rounded-lg transition-colors">
                                        <RotateCcw className={`w-6 h-6 ${isFetching && 'animate-spin'}`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                        <Wallet className="w-8 h-8 text-red-400" />
                                        <div className="flex flex-col">
                                            <p className="text-lg text-neutral-300">Saldo de comissão</p>
                                            <h2 className="text-xl font-bold">{formattedBalance()}</h2>
                                        </div>
                                    </div>

                                    <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                        <Users className="w-8 h-8 text-red-400" />
                                        <div className="flex flex-col">
                                            <p className="text-lg text-neutral-300">Usuários Trazidos</p>
                                            <h2 className="text-xl font-bold">{afiliateData?.associatedUsers} usuários</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                        <Eye className="w-8 h-8 text-neutral-400" />
                                        <div className="flex flex-col">
                                            <p className="text-lg text-neutral-300">Impressões no seu link</p>
                                            <h2 className="text-md font-bold text-neutral-400">Em breve</h2>
                                        </div>
                                    </div>

                                    <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                        <Percent className="w-8 h-8 text-red-400" />
                                        <div className="flex flex-col">
                                            <p className="text-lg text-neutral-300">Porcentagem de comissão</p>
                                            <h2 className="text-xl font-bold">{getPercentage()}%</h2>
                                        </div>
                                    </div>
                                </div>

                                <Link href={"https://drive.google.com/drive/folders/1s6B_F1QkGLf7vNLxJwD_ybd82De0Flpe?usp=sharing"}>
                                    <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                        <Folder className="w-8 h-8 text-red-400" />
                                        <div className="flex flex-col">
                                            <p className="text-lg text-neutral-300">Nossos Criativos</p>
                                            <h2 className="text-lg font-bold">Acesse Aqui</h2>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex flex-col gap-2 border rounded-md p-4 border-neutral-800 bg-neutral-800/50">
                                    <button
                                        onClick={() => setExpandedPix(!expandedPix)}
                                        className="flex justify-between items-center w-full hover:bg-neutral-700/50 p-2 rounded transition-colors"
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
                                </div>

                                {
                                    //href={`https://wa.me/5511989008294?text=Ol%C3%A1%2C%20quero%20solicitar%20meu%20saque%2C%20meu%20c%C3%B3digo%20de%20usu%C3%A1rio%20%C3%A9%3A%20${user?._id}`}
                                }

                                <button
                                    className={`flex justify-center items-center ${disabledWithdraw ? 'bg-gray-600 text-slate-00 hover:bg-gray-600 opacity-60' : 'bg-green-600 hover:bg-green-700 cursor-pointer'} px-4 py-4 rounded font-semibold transition-colors text-lg `}
                                    disabled={disabledWithdraw}
                                    onClick={() => requestedWithdraw()}
                                >
                                    <p>Solicitar Saque</p>
                                    <img src="/icons/pix-white.png" className="w-6 h-6" alt="" />
                                </button>

                            </div>

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6">
                                <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Minhas Vendas</h2>

                                {
                                    isFetching ? (
                                        <div className="flex justify-center items-center py-10">
                                            <RotateCcw className={`w-6 h-6 ${isFetching && 'animate-spin'}`} />
                                        </div>
                                    ) : (

                                        <div className="flex flex-col gap-2 max-h-120 overflow-y-auto">
                                            {
                                                user?.revenue.transactions && user?.revenue.transactions.length! > 0 && afiliateData?.transactions ? (

                                                    afiliateData?.transactions?.map((transaction: any) => (
                                                        <div key={transaction._id} className="flex justify-between items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                                            <div className="flex flex-col">
                                                                <p className="text-lg text-neutral-300"></p>
                                                                <h2 className="text-xl font-bold pb-2">{((transaction.amount / 100) * 0.35).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                                                                <h2 className="text-sm font-bold text-neutral-400"> Assinatura: {(transaction.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1 text-right justify-end items-end">
                                                                <p className={`text-sm italic py-1 rounded-full ${transaction?.status === 'PAID' ? 'text-green-400 font-bold' : 'text-yellow-400'}`}>{translateStatus(transaction?.status)}</p>
                                                                <p className="text-sm text-neutral-500">
                                                                    {
                                                                        transaction?.status === 'PAID' ? `Recebido em ${new Date(transaction.updatedAt).toLocaleDateString('pt-BR')}` : `Criado em ${new Date(transaction.createdAt).toLocaleDateString('pt-BR')}`
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))

                                                ) : (
                                                    <p className="text-neutral-300 lg:text-base">Você ainda não realizou nenhuma venda, comece a divulgar seu link de afiliado para ganhar suas primeiras comissões!</p>
                                                )

                                            }
                                        </div>
                                    )
                                }

                            </div>

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6">
                                <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Perguntas Frequentes</h2>

                                <div className="space-y-4">
                                    <div className="border-l-4 border-green-600 pl-4 hover:bg-neutral-800/30 p-4 rounded transition-colors">
                                        <h3 className="font-semibold text-lg mb-2 lg:text-xl">Como ser comissionado?</h3>
                                        <p className="text-neutral-300 lg:text-base">Você começa como afiliado com <span className="text-green-400 font-bold">35% de comissão</span> em cada venda que realizar através do seu código de indicação.</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4 hover:bg-neutral-800/30 p-4 rounded transition-colors">
                                        <h3 className="font-semibold text-lg mb-2 lg:text-xl">Como aumentar minha comissão?</h3>
                                        <p className="text-neutral-300 lg:text-base">Após realizar <span className="text-green-400 font-bold">10 vendas</span>, sua comissão sobe automaticamente para <span className="text-green-400 font-bold">45%</span>.</p>
                                    </div>

                                    <div className="border-l-4 border-green-600 pl-4 hover:bg-neutral-800/30 p-4 rounded transition-colors">
                                        <h3 className="font-semibold text-lg mb-2 lg:text-xl">Qual o prazo para receber meu saque?</h3>
                                        <p className="text-neutral-300 lg:text-base">Após solicitar o saque, o prazo para receber é de <span className="text-green-400 font-bold">24 horas</span>. Você receberá na conta bancária cadastrada.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 mb-6 lg:col-span-2">
                                <h2 className="text-2xl font-semibold pb-2 lg:text-3xl">Precisa de Ajuda?</h2>
                                <p className="text-neutral-300 lg:text-base">Teve algum problema, bug ou dúvidas de como o app funciona? chama a gente no suporte prioritário para afiliados!</p>
                                <Link
                                    href={`https://wa.me/5511989008294?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20rapidinhas%2C%20meu%20c%C3%B3digo%20de%20usu%C3%A1rio%20%C3%A9%3A${user?._id}`}
                                    className="flex justify-center items-center gap-2 mt-2 border border-green-600 text-white px-4 py-3 rounded font-semibold transition-colors text-lg text-center hover:bg-green-600"
                                >
                                    Chamar Suporte
                                    <MessageCircle className="w-5" />
                                </Link>
                            </div >
                        </div>

                    </div >
                </div >
            </div >
        </div >
    );
}