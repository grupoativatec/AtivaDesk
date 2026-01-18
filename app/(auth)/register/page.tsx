"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GoogleButton } from "@/components/features/auth/google-button";
import { PasswordStrength } from "@/components/features/auth/password-strength";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type RegisterResponse = { ok: true } | { error: string };

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = (await res.json().catch(() => ({}))) as RegisterResponse;

            if (!res.ok) {
                const msg = "error" in data ? data.error : "Falha no cadastro";
                toast.error(msg);
                return;
            }

            toast.success("Conta criada. Faça login.");
            router.push("/login");
        } catch {
            toast.error("Erro de rede ao tentar cadastrar.");
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
                className="flex items-center gap-3 mb-2"
            >
                <motion.div 
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shadow-sm"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <span className="text-2xl font-bold text-primary">A</span>
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                        AtivaDesk
                    </span>
                </h1>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-2.5">
                <h2 className="text-3xl font-bold tracking-tight">Criar sua conta</h2>
                <p className="text-muted-foreground">
                    Comece sua jornada conosco hoje
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
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                            Nome completo
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            className="h-11"
                            required
                        />
                    </motion.div>

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
                            inputMode="email"
                            className="h-11"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                            Apenas e-mails @grupoativa.net são permitidos
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="space-y-2.5"
                    >
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Senha
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            className="h-11"
                            required
                        />
                        <PasswordStrength password={password} />
                        {!password && (
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Use pelo menos 6 caracteres
                            </p>
                        )}
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
                                    Cadastrando...
                                </span>
                            ) : (
                                "Criar conta"
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
                    Já tem uma conta?{" "}
                    <Link 
                        href="/login" 
                        className="text-primary font-semibold hover:text-primary/80 underline-offset-4 transition-colors inline-flex items-center gap-1"
                    >
                        Entrar
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
