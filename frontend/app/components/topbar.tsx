import { Flame } from "lucide-react"
import { useState } from "react"
import Logo from "./logo"
import { useAuthStore } from "../stores/auth-store"

interface TopBarProps {
    triggerSubscriptionModal: (title: string) => void
    triggerPaymentModal?: () => void
    onToggleQueue: (tab: string) => void
}

export default function TopBar({ triggerSubscriptionModal, triggerPaymentModal, onToggleQueue }: TopBarProps) {
    const [selectedTab, setSelectedTab] = useState("espiar")
    const { user, isAuthenticated } = useAuthStore()

    const handleTabClick = (tab: string) => {
        if (tab === "famosas") {
            if (!isAuthenticated) {
                triggerSubscriptionModal("Acesso às Famosas")
                return
            }

            // Se está autenticado mas subscription não está ativa, mostrar pagamento
            if (user?.subscription?.active !== true) {
                console.log('Usuário tentou acessar famosas sem subscription ativa')
                if (triggerPaymentModal) {
                    triggerPaymentModal()
                }
                return
            }

            setSelectedTab(tab)
            onToggleQueue(tab)
        } else {
            setSelectedTab(tab)
            onToggleQueue(tab)
        }
    }

    return (
        <div className="absolute z-10 w-full flex justify-between items-center font-semibold p-2 lg:max-w-2xl lg:left-1/2 lg:transform lg:-translate-x-1/2">
            <Logo />
            <div className="grid grid-cols-2 border border-slate-200 rounded-full shadow w-56 bg-black/50 text-slate-200-500">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabClick("espiar")}>
                    <p className={`px-4 text-center rounded-full ${selectedTab === "espiar" ? "text-white shadow bg-red-500 " : ""}`}>Só Espiar</p>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabClick("famosas")}>
                    <p className={`px-5 text-center rounded-full ${selectedTab === "famosas" ? "text-white shadow bg-purple-500" : ""}`}>Famosas</p>
                </div>
            </div>
        </div>
    )
}