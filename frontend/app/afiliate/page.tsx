'use client';

import Logo from "../components/logo";
import Input from "../components/input";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, RotateCcw, Folder, Eye, Wallet, ArrowLeft, ChevronDown, Percent, RotateCw, MessageCircle, DollarSign, TrendingUp, ScanBarcode, Barcode, BanknoteArrowUp, Instagram } from "lucide-react";
import copy from "copy-to-clipboard";
import { getAfiliateData, updateCustomPlans, updateCustomModel, getModelByUsername } from "../services/user-service";
import { uploadImage } from "../services/image-upload-service";
import { useTranslate } from "../hooks/useTranslate";

interface AfiliateData {
    balance: number,
    associatedUsers: number,
    transactions: any[],
    conversionRate: number,
    sessions: number,
    customPlans: {
        lifetime: number,
        monthly: number
    },
    customModel: {
        username: string,
        displayName: string,
        description: string,
        profilePicture: string,
        coverPicture: string,
        instagramLink?: string
    }
}

export default function AfiliatePage() {

    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const router = useRouter();
    const { translateStatus } = useTranslate()
    const [copiedLink, setCopiedLink] = useState<boolean>(false)
    const [copiedAdsLink, setCopiedAdsLink] = useState<boolean>(false)
    const [pixKey, setPixKey] = useState<string>('')
    const [expandedPix, setExpandedPix] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [afiliateData, setAfiliateData] = useState<AfiliateData | null>(null)
    const [disabledWithdraw, setDisableWithdraw] = useState<boolean>(true)
    const [customPlans, setCustomPlans] = useState<{ lifetime: number; monthly: number }>({ lifetime: 0, monthly: 0 });
const [customModel, setCustomModel] = useState<{
    username: string;
    displayName: string;
    description: string;
    profilePicture: string;
    coverPicture: string;
    instagramLink?: string;
}>({
    username: '',
    displayName: '',
    description: '',
    profilePicture: '',
    coverPicture: '',
    instagramLink: ''
});

    const [isModelSaved, setIsModelSaved] = useState<boolean>(false);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [coverPictureFile, setCoverPictureFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleSaveModel = async () => {
        if (user?._id) {
            try {
                setIsUploading(true);
                let updatedModel = { ...customModel };

                // Fazer upload da foto de perfil, se houver
                if (profilePictureFile) {
                    const profilePictureUrl = await uploadImage(profilePictureFile);
                    updatedModel.profilePicture = profilePictureUrl;
                }

                // Fazer upload da foto de capa, se houver
                if (coverPictureFile) {
                    const coverPictureUrl = await uploadImage(coverPictureFile);
                    updatedModel.coverPicture = coverPictureUrl;
                }

                // Verificar se username ou displayName estão sendo alterados
                if (isModelSaved && (updatedModel.username !== afiliateData?.customModel.username || updatedModel.displayName !== afiliateData?.customModel.displayName)) {
                    alert("Atenção: O username e o nome exibido não podem ser alterados após a criação da modelo. Você só pode atualizar as fotos e a descrição.");
                    setIsUploading(false);
                    return;
                }

                // Salvar a modelo com as URLs das imagens
                await updateCustomModel(user?._id, updatedModel);
                setIsModelSaved(true);
                alert("Modelo fake atualizada com sucesso!");
            } catch (error) {
                console.error('Erro ao salvar a modelo:', error);
                alert("Erro ao salvar a modelo. Por favor, tente novamente.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    const [conversionRate, setConversionRate] = useState<number>(0);
    const [sessions, setSessions] = useState<number>(0);


    useEffect(() => {
        const getUpdatedData = async () => {
            setIsFetching(true)

            if (user) {
                const res = await getAfiliateData(user?._id)
                setAfiliateData({
                    balance: res?.data?.balance ?? 0,
                    associatedUsers: res?.data?.associatedUsers ?? 0,
                    transactions: res?.data?.transactions || [],
                    conversionRate: res?.data?.conversionRate ?? 0,
                    sessions: res?.data?.sessions ?? 0,
                    customPlans: res?.data?.customPlans || { lifetime: 0, monthly: 0 },
                    customModel: res?.data?.customModel || { username: '', displayName: '', description: '', profilePicture: '', coverPicture: '' }
                })
                setCustomPlans(res?.data?.customPlans || { lifetime: 0, monthly: 0 });
                setCustomModel(res?.data?.customModel || { username: '', displayName: '', description: '', profilePicture: '', coverPicture: '', instagramLink: '' });
                setConversionRate(res?.data?.conversionRate ?? 0);
                setSessions(res?.data?.sessions ?? 0);

                // Verifica se a modelo já foi salva
                if (res?.data?.customModel?.username) {
                    setIsModelSaved(true);
                }
            }

            setIsFetching(false)
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

        if (afiliateData) {
            if (afiliateData.balance > 0) {
                setDisableWithdraw(false)
            } else {
                setDisableWithdraw(true)
            }
        }

    }, [afiliateData])

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

    const handleCopyAdsLink = () => {
        if (!user?._id) return

        const copied = copy(`https://rapidinhas.vercel.app/pre-ads?ref=${user?._id}`)

        if (copied) {
            setCopiedAdsLink(true)
            setTimeout(() => setCopiedAdsLink(false), 3000)
        } else {
            console.error('falha ao copiar link')
        }
    }

    const handleUpdateAfiliateData = async () => {
        try {
            setIsFetching(true)

            if (user?._id) {
                const res = await getAfiliateData(user?._id)
                setAfiliateData({
                    balance: res.data?.balance ?? 0,
                    associatedUsers: res.data?.associatedUsers ?? 0,
                    transactions: res.data?.transactions || [],
                    conversionRate: res.data?.conversionRate ?? 0,
                    sessions: res.data?.sessions ?? 0,
                    customPlans: res.data?.customPlans || { lifetime: 0, monthly: 0 },
                    customModel: res.data?.customModel || { username: '', displayName: '', description: '', profilePicture: '', coverPicture: '' }
                })
                setCustomPlans(res.data?.customPlans || { lifetime: 0, monthly: 0 });
                setCustomModel(res.data?.customModel || { username: '', displayName: '', description: '', profilePicture: '', coverPicture: '', instagramLink: '' });
                setConversionRate(res.data?.conversionRate ?? 0);
                setSessions(res.data?.sessions ?? 0);
            }

            setIsFetching(false)

        } catch (error) {
            console.error(error)
            setIsFetching(false)
        }
    }

    const formattedBalance = () => {
        const balanceFormatted = afiliateData?.balance! / 100
        return balanceFormatted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const requestedWithdraw = () => {
        router.push(`https://wa.me/5511989008294?text=Ol%C3%A1%2C%20quero%20solicitar%20meu%20saque%2C%20meu%20c%C3%B3digo%20de%20usu%C3%A1rio%20%C3%A9%3A%20${user?._id}`)
    }

    const newLocal = "bg-neutral-900 h-screen w-full text-white flex flex-col";
    return (
        <div className={newLocal}>
            <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 py-6 px-4 border-b border-neutral-800 shadow-2xl">
                <div className="max-w-6xl mx-auto flex justify-center items-center relative">
                    <Link href={"/"} className="border absolute left-4 p-2 px-4 rounded border-slate-300/50 shadow-2xl shadow-amber-50/15 lg:left-0">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <Logo />
                </div>
            </div>

            <div className="overflow-y-auto flex justify-center items-start pt-24 pb-6 px-4">
                <div className="w-full max-w-4xl md:max-w-4xl">

                    <div className="py-6">
                        <p className="text-lg text-neutral-400">Área do Afiliado</p>
                        <h1 className="text-2xl font-bold text-left w-full pt-4 lg:text-3xl">{user?.name}</h1>
                        <p className="py-1 text-neutral-300">{user?.email}</p>


                        <div className="flex flex-col gap-4 border rounded-md border-neutral-800 p-2 py-6 lg:p-6 mb-8 mt-4">
                            <div className="flex justify-between items-center">
                                <p className="text-2xl font-bold lg:text-3xl">Receita Compartilhada</p>
                                <button
                                    onClick={handleUpdateAfiliateData}
                                    disabled={isFetching}
                                    className="p-3 px-4 hover:bg-neutral-700 rounded-lg transition-colors">
                                    <RotateCcw className={`w-6 h-6 ${isFetching && 'animate-spin'}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                                <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                    <DollarSign className="w-8 h-8 text-red-400" />
                                    <div className="flex flex-col">
                                        <p className="text-lg text-neutral-300">Saldo Disponível</p>
                                        <h2 className="text-xl font-bold">R$ {afiliateData?.balance.toFixed(2).replace('.', ',')}</h2>
                                    </div>
                                </div>


                                <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                    <TrendingUp className="w-8 h-8 text-red-400" />
                                    <div className="flex flex-col">
                                        <p className="text-lg text-neutral-300">Taxa de Conversão</p>
                                        <h2 className="text-xl font-bold">{conversionRate.toFixed(2)}%</h2>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                    <Eye className="w-8 h-8 text-red-400" />
                                    <div className="flex flex-col">
                                        <p className="text-lg text-neutral-300">Sessões</p>
                                        <h2 className="text-xl font-bold">{sessions} sessões</h2>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                    <Users className="w-8 h-8 text-red-400" />
                                    <div className="flex flex-col">
                                        <p className="text-lg text-neutral-300">Vendas</p>
                                        <h2 className="text-xl font-bold">{afiliateData?.associatedUsers} clientes</h2>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                    <BanknoteArrowUp className="w-8 h-8 text-red-400" />
                                    <div className="flex flex-col">
                                        <p className="text-lg text-neutral-300">Starts</p>
                                        <h2 className="text-xl font-bold">{afiliateData?.transactions.length} clientes</h2>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                    <Percent className="w-8 h-8 text-red-400" />
                                    <div className="flex flex-col">
                                        <p className="text-lg text-neutral-300">Comissionamento</p>
                                        <h2 className="text-xl font-bold">90%</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6 mb-8">
                            <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Minhas Vendas</h2>

                            {
                                isFetching ? (
                                    <div className="flex justify-center items-center py-10">
                                        <RotateCcw className={`w-6 h-6 ${isFetching && 'animate-spin'}`} />
                                    </div>
                                ) : (

                                    <div className="flex flex-col gap-2 max-h-120 overflow-y-auto">
                                        {
                                            afiliateData?.transactions && afiliateData?.transactions.length > 0 ? (

                                                afiliateData?.transactions?.map((transaction: any) => (
                                                    <div key={transaction._id} className="flex justify-between items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                                        <div className="flex flex-col">
                                                            <p className="text-lg text-neutral-300"></p>
                                                            <h2 className="text-xl font-bold pb-2">{((transaction.amount / 100) * (90 / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                            <div className="border p-4 rounded shadow border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 ">
                                <h2 className="text-2xl font-semibold pb-2">Link Direto</h2>
                                <p className="text-neutral-300">Qualquer novo assinante que ingressar usando seu link você será automaticamente comissionado.</p>
                                <Input
                                    type="text"
                                    placeholder="Seu código de indicação"
                                    value={`https://rapidinhas.vercel.app?ref=${user?._id}`}
                                    className="mt-2 text-xl font-medium lg:text-base"
                                />
                                <button
                                    onClick={handleCopyCode}
                                    className={`mt-2 w-full text-white px-4 py-3 rounded font-semibold transition-colors text-lg lg:hover:bg-opacity-80 cursor-pointer ${copiedLink ? 'bg-green-600' : 'bg-neutral-700 hover:bg-neutral-600'}`}>
                                    {copiedLink ? 'Copiado!' : 'Copiar Link'}
                                </button>
                            </div >

                            <div className="border p-4 rounded shadow border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 ">
                                <div className="flex items-center gap-2 pb-2">
                                    <h2 className="text-2xl font-semibold">Para Anúncios e Tráfego</h2>
                                </div>
                                <p className="text-neutral-300">Recomendado para uso em anúncios (Facebook, TikTok, Google Ads, etc). Esta página é otimizada para conversão.</p>
                                <Input
                                    type="text"
                                    placeholder="Link para anúncios"
                                    value={`https://rapidinhas.vercel.app/pre-ads?ref=${user?._id}`}
                                    className="mt-2 text-xl font-medium lg:text-base"
                                />
                                <button
                                    onClick={handleCopyAdsLink}
                                    className={`mt-2 text-white w-full px-4 py-3 rounded font-semibold transition-colors text-lg lg:hover:bg-opacity-80 cursor-pointer ${copiedAdsLink ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'}`}>
                                    {copiedAdsLink ? 'Copiado!' : 'Copiar Link'}
                                </button>
                            </div >
                        </div>



                        <Link href={"https://drive.google.com/drive/folders/1s6B_F1QkGLf7vNLxJwD_ybd82De0Flpe?usp=sharing"} className="mb-8">
                            <div className="flex justify-start items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                <Folder className="w-8 h-8 text-red-400" />
                                <div className="flex flex-col">
                                    <p className="text-lg text-neutral-300">Criativos de Apoio</p>
                                    <h2 className="text-lg font-bold">Acesse Aqui</h2>
                                </div>
                            </div>
                        </Link>

                        <div className="flex flex-col gap-2 border rounded-md p-4 my-4 border-neutral-800 bg-neutral-800/50 mb-8">
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
                            className={`flex justify-center w-full items-center ${disabledWithdraw ? 'bg-gray-600 text-slate-00 hover:bg-gray-600 opacity-60' : 'bg-green-600 hover:bg-green-700 cursor-pointer'} px-4 py-4 rounded font-semibold transition-colors text-lg `}
                            disabled={disabledWithdraw}
                            onClick={() => requestedWithdraw()}
                        >
                            <p>Solicitar Saque</p>
                            <img src="/icons/pix-white.png" className="w-6 h-6" alt="" />
                        </button>

                    </div>

                    <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6 mb-8">
                        <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Customizar Planos</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-lg text-neutral-300">Valor do Plano Mensal (R$)</label>
                                <Input
                                    type="number"
                                    placeholder="Valor do plano mensal"
                                    value={String(customPlans.monthly / 100)}
                                    onChange={(e) => setCustomPlans({ ...customPlans, monthly: Number(e.target.value) * 100 })}
                                    className="text-lg font-medium"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-lg text-neutral-300">Valor do Plano Vitalício (R$)</label>
                                <Input
                                    type="number"
                                    placeholder="Valor do plano vitalício"
                                    value={String(customPlans.lifetime / 100)}
                                    onChange={(e) => setCustomPlans({ ...customPlans, lifetime: Number(e.target.value) * 100 })}
                                    className="text-lg font-medium"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (user?._id) {
                                        await updateCustomPlans(user?._id, customPlans.lifetime, customPlans.monthly);
                                        alert("Valores atualizados com sucesso!");
                                    }
                                }}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-semibold transition-colors text-lg"
                            >
                                Salvar Valores
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6 mb-8">
                        <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Customizar Sua Modelo</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-lg text-neutral-300">Username</label>
                                <Input
                                    type="text"
                                    placeholder="Username da modelo"
                                    value={customModel.username}
                                    onChange={(e) => setCustomModel({ ...customModel, username: e.target.value })}
                                    className="text-lg font-medium"
                                    disabled={isModelSaved}
                                />
                                {isModelSaved && (
                                    <p className="text-xs text-neutral-400 italic">O username não pode ser alterado após a criação.</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-lg text-neutral-300">Nome Exibido</label>
                                <Input
                                    type="text"
                                    placeholder="Nome exibido"
                                    value={customModel.displayName}
                                    onChange={(e) => setCustomModel({ ...customModel, displayName: e.target.value })}
                                    className="text-lg font-medium"
                                    disabled={isModelSaved}
                                />
                                {isModelSaved && (
                                    <p className="text-xs text-neutral-400 italic">O nome exibido não pode ser alterado após a criação.</p>
                                )}
                            </div>
                             <div className="flex flex-col gap-2">
                                 <label className="text-lg text-neutral-300">Descrição</label>
                                 <Input
                                     type="text"
                                     placeholder="Descrição"
                                     value={customModel.description}
                                     onChange={(e) => setCustomModel({ ...customModel, description: e.target.value })}
                                     className="text-lg font-medium"
                                 />
                             </div>
                             <div className="flex flex-col gap-2">
                                 <label className="text-lg text-neutral-300">Link do Instagram</label>
                                 <Input
                                     type="text"
                                     placeholder="https://www.instagram.com/username/"
                                     value={customModel.instagramLink || ''}
                                     onChange={(e) => setCustomModel({ ...customModel, instagramLink: e.target.value })}
                                     className="text-lg font-medium"
                                 />
                             </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-lg text-neutral-300">Foto de Perfil</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-neutral-600 rounded-full cursor-pointer hover:border-red-500 transition-colors">
                                        {customModel.profilePicture ? (
                                            <img
                                                src={customModel.profilePicture}
                                                alt="Preview"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-neutral-400">
                                                <span className="text-sm">Upload</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setProfilePictureFile(file);
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setCustomModel({ ...customModel, profilePicture: event.target?.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-lg text-neutral-300">Foto de Capa</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                                        {customModel.coverPicture ? (
                                            <img
                                                src={customModel.coverPicture}
                                                alt="Preview"
                                                className="w-full h-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-neutral-400">
                                                <span className="text-sm">Upload</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setCoverPictureFile(file);
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setCustomModel({ ...customModel, coverPicture: event.target?.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveModel}
                                disabled={isUploading}
                                className={`mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-semibold transition-colors text-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? 'Salvando...' : 'Salvar Modelo'}
                            </button>
                        </div>

                        {customModel.username && (
                            <div className="mt-6 flex flex-col gap-2 border rounded-md border-neutral-800 p-4">
                                <h3 className="text-xl font-semibold">Checkout da Modelo</h3>
                                <p className="text-neutral-300">Copie o link abaixo para acessar a página da modelo fake:</p>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <Input
                                        type="text"
                                        value={`https://rapidinhas.vercel.app/model/${customModel.username}?ref=${user?._id}`}
                                        className="text-lg font-medium w-full"
                                    />
                                    <button
                                        onClick={() => {
                                            const copied = copy(`https://rapidinhas.vercel.app/model/${customModel.username}?ref=${user?._id}`);
                                            if (copied) {
                                                alert("Link copiado com sucesso!");
                                            }
                                        }}
                                        className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-3 rounded font-semibold transition-colors text-lg w-full"
                                    >
                                        Copiar Link
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6 mb-8">
                        <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Minhas Vendas</h2>

                        {
                            isFetching ? (
                                <div className="flex justify-center items-center py-10">
                                    <RotateCcw className={`w-6 h-6 ${isFetching && 'animate-spin'}`} />
                                </div>
                            ) : (

                                <div className="flex flex-col gap-2 max-h-120 overflow-y-auto">
                                    {
                                        afiliateData?.transactions && afiliateData?.transactions.length > 0 ? (

                                            afiliateData?.transactions?.map((transaction: any) => (
                                                <div key={transaction._id} className="flex justify-between items-center p-4 px-4 gap-4 border rounded-md border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors">
                                                    <div className="flex flex-col">
                                                        <p className="text-lg text-neutral-300"></p>
                                                        <h2 className="text-xl font-bold pb-2">{((transaction.amount / 100) * (90 / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
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

                    <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:p-6 mb-8">
                        <h2 className="text-2xl font-semibold pb-4 lg:text-3xl">Perguntas Frequentes</h2>

                        <div className="space-y-4">
                            <div className="border-l-4 border-green-600 pl-4 hover:bg-neutral-800/30 p-4 rounded transition-colors">
                                <h3 className="font-semibold text-lg mb-2 lg:text-xl">Como funciona o comissionamento?</h3>
                                <p className="text-neutral-300 lg:text-base">Você começa como afiliado com <span className="text-green-400 font-bold">90% de comissão</span> em cada venda que realizar através do seu código de indicação.</p>
                            </div>

                            <div className="border-l-4 border-green-600 pl-4 hover:bg-neutral-800/30 p-4 rounded transition-colors">
                                <h3 className="font-semibold text-lg mb-2 lg:text-xl">Qual o prazo para receber meu saque?</h3>
                                <p className="text-neutral-300 lg:text-base">Após solicitar o saque, o prazo para receber é de <span className="text-green-400 font-bold">24 horas</span>. Você receberá na conta bancária cadastrada.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4 lg:col-span-2 mb-8">
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
            </div>
        </div>
    );
}