
interface AccordionProps {
    selectedPlan: string;
    expandedPlan: string | null;
    handlePlanSelect: (plan: string) => void;
    planBenefits: { [key: string]: string[] };
    prices: number;
    planName?: string;
    promotional: boolean;
}

export default function Accordion({ selectedPlan, expandedPlan, handlePlanSelect, planBenefits, prices, planName, promotional }: AccordionProps) {


    const discountForever = (((5.90 * 12) - 14.90) / (5.90 * 12) * 100)

    return (
        <div
            className={`relative border ${selectedPlan === 'vitalicio' ? 'border-red-400 shadow-2xl shadow-red-400/20' : 'border-slate-200'} text-white px-4 py-4 rounded w-full cursor-pointer transition-colors`}
            onClick={() => handlePlanSelect(selectedPlan)}
        >
            {
                promotional ? (
                    <div className={`absolute top-[-15px] right-2.5 ${selectedPlan === 'vitalicio' ? 'bg-red-500' : 'bg-slate-200'} p-1 px-1.5 shadow rounded text-white font-bold`}>
                        <p className={`text-xs ${selectedPlan === 'vitalicio' ? 'text-white' : 'text-slate-700'}`}>Economize {discountForever?.toFixed(0)}%</p>
                    </div>
                ) : null
            }
            <div className="flex justify-start items-center gap-2 italic">
                <input
                    type="radio"
                    id="vitalicio"
                    className="accent-red-500"
                    checked={selectedPlan === 'vitalicio'}
                    readOnly
                />
                <div className="flex-1">
                    Assinar <b>{planName}</b> - <b>R$ {prices.toFixed(2).replace('.', ',')}</b>
                </div>
                <div className={`transform transition-transform duration-200 ${expandedPlan === 'vitalicio' ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {expandedPlan === selectedPlan && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                    <ul className="text-sm space-y-2 text-left">
                        {planBenefits[selectedPlan].map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-slate-300">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}