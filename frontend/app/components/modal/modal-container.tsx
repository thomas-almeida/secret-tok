
interface ModalContainerProps {
    children: React.ReactNode;
}

export default function ModalContainer({ children }: ModalContainerProps) {
    return (
        <div
            className="absolute z-50 w-full h-dvh flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            {children}
        </div>
    )
}