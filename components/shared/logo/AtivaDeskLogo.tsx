"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AtivaDeskLogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

const sizeMap = {
  sm: { icon: 20, text: "text-sm" },
  md: { icon: 28, text: "text-base" },
  lg: { icon: 32, text: "text-lg" },
}

export function AtivaDeskLogo({
  className,
  showText = true,
  size = "md",
  animated = true,
}: AtivaDeskLogoProps) {
  const iconSize = sizeMap[size].icon
  const textSize = sizeMap[size].text
  
  // Extrai classes de cor do className para aplicar ao texto
  const textColorClass = className?.match(/text-\S+/)?.[0] || "text-foreground"
  const containerClasses = className?.replace(/text-\S+/g, "").trim() || ""

  const InfinityIcon = () => {
    const gradientId = `infinityGradient-${size}`
    const filterId = `glow-${size}`
    
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary block"
        style={{ display: 'block', verticalAlign: 'middle' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
          </linearGradient>
          {animated && (
            <filter id={filterId}>
              <feGaussianBlur stdDeviation="0.6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Símbolo de infinito moderno e minimalista */}
        <motion.g
          filter={animated ? `url(#${filterId})` : undefined}
          initial={animated ? { opacity: 0, scale: 0.8 } : {}}
          animate={animated ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Path único contínuo formando o infinito completo - design minimalista e moderno */}
          {/* Símbolo de infinito usando um único path contínuo com curvas suaves (lemniscata) */}
          {/* Usando um único path que forma o infinito corretamente */}
          <motion.path
            d="M18.178 8.05c.5.5.5 1.3 0 1.8-.5.5-1.3.5-1.8 0-.5-.5-.5-1.3 0-1.8.5-.5 1.3-.5 1.8 0M5.822 15.95c-.5-.5-.5-1.3 0-1.8.5-.5 1.3-.5 1.8 0 .5.5.5 1.3 0 1.8-.5.5-1.3.5-1.8 0"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : {}}
            animate={animated ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          />
          {/* Loop esquerdo (superior) */}
          <motion.path
            d="M7.5 12c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : {}}
            animate={animated ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          />
          {/* Loop direito (inferior) */}
          <motion.path
            d="M16.5 12c0 2.5-2 4.5-4.5 4.5S7.5 14.5 7.5 12"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : {}}
            animate={animated ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
          />
        </motion.g>
        
        {/* Efeito de brilho pulsante sutil */}
        {animated && (
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity={0.1}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: [0.9, 1.2, 0.9],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
        )}
      </svg>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", containerClasses)}>
      <div className="relative flex items-center justify-center leading-none">
        <motion.div
          className="flex items-center justify-center leading-none"
          whileHover={animated ? { scale: 1.05 } : {}}
          transition={{ duration: 0.2 }}
        >
          <InfinityIcon />
        </motion.div>
        {/* Efeito de brilho sutil ao redor */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10 blur-md -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}
          />
        )}
      </div>
      {showText && (
        <motion.span
          className={cn("font-bold tracking-tight leading-none", textSize, textColorClass)}
          initial={animated ? { opacity: 0, x: -10 } : {}}
          animate={animated ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          AtivaDesk
        </motion.span>
      )}
    </div>
  )
}
