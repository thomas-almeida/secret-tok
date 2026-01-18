import { Flame } from "lucide-react"
import { useState } from "react"

export default function TopBar() {
    const [selectedTab, setSelectedTab] = useState("para-voce")

    return (
        <div className="absolute z-10 w-full p-4 flex justify-between items-center font-semibold ">
            <div className="flex items-center text-xl italic mb-3">
                <Flame className="w-5 h-5 text-red-400" /> rapidinhas
            </div>
            <div className="grid grid-cols-2 border border-slate-200 rounded-full shadow">
                <div className="flex items-center gap-2" onClick={() => setSelectedTab("para-voce")}>
                    <p className={`px-4 rounded-full w-26 ${selectedTab === "para-voce" ? "text-white shadow bg-red-400 " : ""}`}>Pra Você</p>
                </div>
                <div className="flex items-center gap-2" onClick={() => setSelectedTab("famosas")}>
                    <p className={`px-4 rounded-full w-26 ${selectedTab === "famosas" ? "text-white shadow bg-purple-500" : ""}`}>Famosas</p>
                </div>
            </div>
        </div>
    )
}