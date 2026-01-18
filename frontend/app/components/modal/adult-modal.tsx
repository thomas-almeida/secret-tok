import { AlertTriangle, Flame } from "lucide-react"
import ModalContainer from "./modal-container"

interface AdultModalProps {
    isVisible: boolean
    onAccept: () => void
    onDecline: () => void
}

export default function AdultModal({ isVisible, onAccept, onDecline }: AdultModalProps) {

    if (!isVisible) return null

    return (
        <ModalContainer>
            <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-lg text-center">
                <div className="flex items-center text-xl italic mb-3 font-semibold">
                    <Flame className="w-6 h-6 text-red-400" /> rapidinhas
                </div>
                <h1 className="text-2xl font-bold">Este é um site adulto!</h1>
                <p className="max-w-md py-4">Este site contém material com restrições de idade, incluindo nudez e representações explícitas de atividade sexual. Ao se registrar, você afirma que tem pelo menos 18 anos de idade ou a maioridade na jurisdição de onde está acessando o site e que consente em visualizar conteúdo sexualmente explícito.</p>
                <div className="grid grid-cols-1 gap-4 w-full text-lg">
                    <button className="bg-red-500 text-white px-4 py-4 rounded w-full" onClick={onAccept}>Sou maior de 18</button>
                    <button className="bg-black text-white px-4 py-4 rounded w-full" onClick={onDecline}>Sou menor idade</button>
                </div>
            </div>
        </ModalContainer>
    )
}