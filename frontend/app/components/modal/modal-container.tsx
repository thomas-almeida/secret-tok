
interface ModalContainerProps {
    children: React.ReactNode;
}

export default function ModalContainer({ children }: ModalContainerProps) {
    return (
        <div
            className="absolute z-50 w-full h-screen flex items-center justify-center bg-black/75 p-4"
        >
            {children}
        </div>
    )
}