"use client"

import { motion } from "framer-motion"
import SearchBar from "./SearchBar"

export default function Hero() {
    return (
        <section className="relative overflow-visible">
            {/* Background com gradiente mesh moderno */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800">
                {/* Efeito de mesh/grid animado */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Gradiente overlay com blur */}
                <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 via-transparent to-cyan-500/20" />

                {/* Círculos decorativos com blur */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-pink-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-cyan-400 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.25, 0.45, 0.25],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-400 rounded-full blur-3xl"
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
                        className="flex flex-col md:flex-row items-center md:items-start gap-6 max-w-4xl"
                    >
                        <motion.div
                            className="hidden md:block text-5xl pt-2"
                            animate={{
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            ✨
                        </motion.div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white drop-shadow-lg">
                                Explore novos conhecimentos
                            </h1>
                            <p className="mt-4 text-lg md:text-xl text-purple-50 max-w-2xl leading-relaxed drop-shadow-md">
                                Descubra trilhas de aprendizado, novidades e recursos exclusivos para impulsionar sua jornada.
                                Estamos sempre evoluindo para você.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Barra flutuando: centralizada e responsiva */}
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