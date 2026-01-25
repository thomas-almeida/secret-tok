
interface InputProps {
    type?: string
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    icon?: React.ReactNode
}

export default function Input({ type, placeholder, value, onChange, icon }: InputProps) {
    return (
        <>
            <div className="flex items-center border rounded p-2 gap-2 bg-neutral-800 border-neutral-700">
                {icon}
                <input
                    type={type || 'text'}
                    placeholder={placeholder || ''}
                    value={value}
                    onChange={onChange}
                    className="outline-none bg-transparent w-full text-white placeholder:text-neutral-500"
                />
            </div>
        </>
    )
}