import Link from "next/link"
import { ArrowLeft, CircleUser, MessageSquareText, NotebookText } from "lucide-react"

export default function TrilhasTopNav() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* ESQUERDA */}
                <div className="flex items-center gap-6">
                    {/* Ícone/Logo */}
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-white">
                        <NotebookText className="h-5 w-5" />
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-5 text-sm">
                        <Link
                            href="/feedback"
                            className="text-slate-500 hover:text-slate-900"
                        >
                            Home
                        </Link>
                    </nav>
                </div>

                {/* DIREITA */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/trilhas"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>

                </div>
            </div>
        </header>
    )
}
