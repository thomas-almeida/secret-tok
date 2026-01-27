
import Input from "../input"
import ModalContainer from "./modal-container"
import { useAuthStore } from "@/app/stores/auth-store"

import { Users } from "lucide-react"

interface UserModalProps {
    visible: boolean
    onClose: () => void
}

export default function UserModal({ visible, onClose }: UserModalProps) {

    const { user, isAuthenticated } = useAuthStore()

    if (!visible || !isAuthenticated) return null

    return (
        <>
            <ModalContainer>
                <div className="absolute w-full h-screen flex items-end justify-center">
                    <div className="bottom-0 h-[75vh] flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-t-2xl text-center w-full shadow-2xl shadow-black/50 overflow-y-auto">

                        <hr className="border-2 w-18 mb-2 rounded-full border-slate-300/50" />

                        <h1 className="text-2xl font-bold text-left w-full">Área do Usuário</h1>

                        <div className="w-full text-left font-medium rounded">
                            <p className="text-xl">{user?.name}</p>
                            <p className="text-sm text-slate-300 uppercase">Afiliado</p>
                        </div>

                        <div className="w-full text-left font-medium flex flex-col gap-4">

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4">
                                <p className="text-2xl pb-2 font-bold">Receita Compartilhada</p>
                                
                                <div className="flex justify-start items-center p-2 px-4 gap-4 mt-4 border rounded-md border-neutral-800 bg-neutral-800/50">
                                    <Users className="w-8 h-8 text-white" />
                                    <div className="flex flex-col">
                                        <p className="text-lg">Saldo de comissão</p>
                                        <h2 className="text-xl font-bold">R$ 0,00</h2>
                                    </div>
                                </div>
                                
                                <div className="flex justify-start items-center p-2 px-4 gap-4 mt-4 border rounded-md border-neutral-800 bg-neutral-800/50">
                                    <Users className="w-8 h-8 text-white" />
                                    <div className="flex flex-col">
                                        <p className="text-lg">Usuários Trazidos</p>
                                        <h2 className="text-xl font-bold">0 usuários</h2>
                                    </div>
                                </div>

                                <button className="mt-2 bg-green-600 text-white px-4 py-3 rounded font-semibold hover:bg-red-600 transition-colors text-lg">
                                    Solicitar Saque
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 border rounded-md border-neutral-800 p-2 py-4">
                                <h2 className="text-2xl font-semibold pb-2">Código de Afiliado</h2>
                                <p>Ao convidar sua base, use este link abaixo para contabilizar os ganhos.</p>
                                <Input
                                    type="text"
                                    placeholder="Seu código de indicação"
                                    value={`https://rapidinhas.vercel.app?ref=${user?.id}`}
                                    className="mt-2 text-xl font-medium"
                                />
                                <button className="mt-2 bg-red-500 text-white px-4 py-3 rounded font-semibold hover:bg-red-600 transition-colors text-lg">
                                    Copiar Link
                                </button>

                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="border w-full py-3 px-4 rounded text-lg font-semibold hover:bg-neutral-800 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </ModalContainer>
        </>
    )
}