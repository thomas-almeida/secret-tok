
interface ModalContainerProps {
    children: React.ReactNode;
}

export default function ModalContainer({ children }: ModalContainerProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            {children}
        </div>
    )
}