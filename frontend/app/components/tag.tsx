import Link from "next/link";

interface TagProps {
    children: React.ReactNode;
    link: string
}


export default function Tag({ children, link }: TagProps) {
    return (
        <Link
            href={link}
            className="font-semibold px-4 rounded-full border border-slate-200/50"
        >
            {children}
        </Link>
    )
}