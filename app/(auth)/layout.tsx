"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-0 sm:p-6 md:p-8 bg-background">
            {/* Container centralizado com largura limitada */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full sm:max-w-6xl sm:mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-none sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-none sm:shadow-lg lg:shadow-2xl border-0 sm:border border-border/50 dark:border-border/30 min-h-screen sm:min-h-[600px] lg:min-h-[700px]">
                    {/* Coluna esquerda - Formulário */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-background dark:bg-card/50 p-6 sm:p-8 md:p-10 lg:p-12 flex items-center justify-center min-h-screen sm:min-h-[600px] lg:min-h-[700px]"
                    >
                        <div className="w-full max-w-md py-2 sm:py-4">
                            {children}
                        </div>
                    </motion.div>

                    {/* Coluna direita - Imagem */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden lg:block relative min-h-[700px]"
                    >
                        <motion.div
                            className="absolute inset-0 overflow-hidden rounded-r-2xl"
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.img
                                src="https://images.unsplash.com/photo-1644088379091-d574269d422f?q=80&w=1693&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Background"
                                className="w-full h-full object-cover"
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.05 }}
                                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                            />

                            {/* Gradiente suave sobre a imagem - adapta para dark mode */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-l from-background/0 via-background/20 dark:via-background/40 to-background/50 dark:to-background/70"
                                animate={{
                                    opacity: [0.7, 0.9, 0.7],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                }}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
