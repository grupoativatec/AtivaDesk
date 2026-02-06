"use client"

import { motion } from "framer-motion"
import SearchBar from "./SearchBar"
import Image from "next/image"

export default function Hero() {
    return (
        <section className="relative overflow-visible">
            {/* Background vermelho neutro */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-slate-900">
                {/* Luz suave para clarear */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.10),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,120,80,0.08),transparent_60%)]" />

                {/* Grid técnico */}
                <div
                    className="absolute inset-0 opacity-[0.18]"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
            `,
                        backgroundSize: "72px 72px",
                    }}
                />

                {/* Noise sutil */}
                <div
                    className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.05),
                rgba(255,255,255,0.05) 1px,
                transparent 1px,
                transparent 2px
              )
            `,
                    }}
                />

                {/* Glows neutros */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.20, 0.12] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-red-700/40 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.10, 0.18, 0.10] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-40 -right-40 w-[560px] h-[560px] bg-red-800/30 rounded-full blur-[180px]"
                />
            </div>

            <div className="relative">
                <div
                    className="
            mx-auto max-w-7xl text-white
            min-h-[280px] md:min-h-[340px] lg:min-h-[380px]
            flex items-center justify-center text-center md:text-left md:justify-start
            pt-12 pb-24
          "
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-co md:flex-row items-center md:items-start gap-6 max-w-7xl"
                    >
                        <motion.div
                            className="hidden md:block pt-1"
                            initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(2px)" }}
                            animate={{
                                opacity: 1,
                                y: [0, -4, 0],
                                scale: [1, 1.01, 1],
                                filter: "blur(0px)",
                            }}
                            transition={{
                                opacity: { duration: 0.5 },
                                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                                scale: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                                filter: { duration: 0.5 },
                            }}
                        >
                            <div className="relative">
                                {/* halo/glow sutil */}
                                <div className="absolute -inset-6 rounded-full bg-white/10 blur-2xl" />
                                <Image
                                    src="/logo-white-brand.png"
                                    alt="Logo"
                                    width={120}
                                    height={120}
                                    className="relative select-none"
                                    priority
                                />
                            </div>
                        </motion.div>


                        <div className="">
                            <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg">
                                Aprenda de forma{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10">ATIVA</span>

                                    {/* “risco” animado */}
                                    <motion.svg
                                        className="pointer-events-none absolute left-0 top-full mt-1 w-full"
                                        viewBox="0 0 200 24"
                                        preserveAspectRatio="none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2, delay: 0.25 }}
                                    >
                                        <motion.path
                                            d="M4 18 C 40 8, 80 26, 120 14 S 182 10, 196 16"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.92)"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.3,
                                                ease: "easeInOut",
                                            }}
                                        />
                                        {/* brilho suave opcional por trás */}
                                        <motion.path
                                            d="M4 18 C 40 8, 80 26, 120 14 S 182 10, 196 16"
                                            fill="none"
                                            stroke="rgba(255,120,80,0.35)"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.3,
                                                ease: "easeInOut",
                                            }}
                                            style={{ filter: "blur(6px)" }}
                                        />
                                    </motion.svg>
                                </span>
                            </h1>

                            <p className="mt-8 text-lg md:text-xl text-slate-200 max-w-7xl leading-relaxed">
                                Conteúdos práticos para o dia a dia do Grupo Ativa: guias de sistemas,
                                trilhas de aprendizado, atualizações de software e boas práticas internas.
                                Informação organizada para aprender, aplicar e evoluir.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Barra flutuante */}
            <div className="absolute left-1/2 bottom-0 w-[90%] md:w-full max-w-7xl -translate-x-1/2 translate-y-1/2 z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="shadow-2xl rounded-full">
                        <SearchBar />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
