"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GoogleButton } from "@/components/features/auth/google-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtivaDeskLogo } from "@/components/shared/logo/AtivaDeskLogo";

type LoginResponse =
    | { ok: true; user: { id: string; name: string; email: string; role: "USER" | "AGENT" | "ADMIN" } }
    | { error: string };

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const error = searchParams.get("error");
        if (error === "domain_not_allowed") {
            toast.error("Apenas e-mails do domínio @grupoativa.net são permitidos");
        } else if (error === "oauth_error") {
            toast.error("Erro ao autenticar com Google. Tente novamente.");
        } else if (error) {
            toast.error("Erro na autenticação. Tente novamente.");
        }
    }, [searchParams]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = (await res.json().catch(() => ({}))) as LoginResponse;

            if (!res.ok) {
                const msg = "error" in data ? data.error : "Falha no login";
                toast.error(msg);
                return;
            }

            toast.success("Login realizado com sucesso.");

            // Redirect por role (cookie JWT já foi setado pelo backend)
            const role = (data as { user: { role: "USER" | "AGENT" | "ADMIN" } }).user.role;
            
            // Verifica se há um redirect na URL
            const redirectParam = searchParams.get("redirect");
            const redirectTo = redirectParam || (role === "ADMIN" ? "/admin/dashboard" : "/tickets");
            
            router.push(redirectTo);
        } catch {
            toast.error("Erro de rede ao tentar logar.");
        } finally {
            setLoading(false);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Logo/Brand */}
            <motion.div 
                variants={itemVariants}
                className="flex items-center justify-center mb-2"
            >
                <AtivaDeskLogo size="lg" showText={true} animated={true} className="text-2xl" />
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-2.5">
                <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
                <p className="text-muted-foreground">
                    Entre na sua conta para continuar
                </p>
            </motion.div>

            {/* Formulário */}
            <motion.div variants={itemVariants} className="space-y-6">
                <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <GoogleButton />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="relative py-2"
                >
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-4 text-muted-foreground font-medium">
                            ou
                        </span>
                    </div>
                </motion.div>

                <motion.form
                    variants={itemVariants}
                    onSubmit={onSubmit}
                    className="space-y-5"
                >
                    <motion.div
                        variants={itemVariants}
                        className="space-y-2.5"
                    >
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            E-mail
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="voce@grupoativa.net"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="h-11"
                            required
                        />
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="space-y-2.5"
                    >
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Senha
                            </label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="h-11"
                            required
                        />
                    </motion.div>

                    <motion.div
                        className="pt-2"
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 text-base font-semibold shadow-sm"
                            size="lg"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="inline-block"
                                    >
                                        ⟳
                                    </motion.span>
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </motion.div>
                </motion.form>
            </motion.div>

            {/* Footer */}
            <motion.div
                variants={itemVariants}
                className="pt-4"
            >
                <p className="text-center text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link 
                        href="/register" 
                        className="text-primary font-semibold hover:text-primary/80 underline-offset-4 transition-colors inline-flex items-center gap-1"
                    >
                        Criar conta
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            →
                        </motion.span>
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
}
