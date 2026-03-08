
type Plan = {
    id: string;
    name: string;
}

interface AccordionProps {
    selectedPlan: Plan;
    expandedPlan: string | null;
    handlePlanSelect: (plan: Plan) => void;
    prices: number;
    planName?: string;
    promotional: boolean;
}

export default function Accordion({ selectedPlan, expandedPlan, handlePlanSelect, prices, planName, promotional }: AccordionProps) {

    return (
        <div
            className={`relative border ${selectedPlan.name === expandedPlan ? 'border-red-400 shadow-2xl shadow-red-400/20' : 'border-slate-200'} text-white px-4 py-2 rounded w-full cursor-pointer transition-colors`}
            onClick={() => handlePlanSelect(selectedPlan)}
        >
            {
                promotional ? (
                    <div className={`absolute top-[-15px] right-2.5 ${selectedPlan.name === expandedPlan ? 'bg-red-500' : 'bg-slate-200'} p-1 px-1.5 shadow rounded text-white font-bold`}>
                        <p className={`text-xs ${selectedPlan.name === expandedPlan ? 'text-white' : 'text-slate-700'}`}>Promocional</p>
                    </div>
                ) : null
            }
            <div className="flex justify-start items-center gap-2 italic">
                <input
                    type="radio"
                    id="vitalicio"
                    className="accent-red-500"
                    checked={selectedPlan.name === expandedPlan}
                    readOnly
                />
                <div className="flex-1 text-left">
                    Assinar <b>{planName}</b> - <b>R$ {prices.toFixed(2).replace('.', ',')}</b>
                </div>
            </div>
        </div>
    )
}