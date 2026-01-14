type Props = {
    className?: string;
    tileOpacity?: number;
};

export function TiAiAvatarIcon({ className, tileOpacity = 0.28 }: Props) {
    const uid = "ti-ai-avatar";

    return (
        <svg
            className={className}
            viewBox="0 0 256 256"
            role="img"
            aria-label="TI AI avatar"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id={`${uid}-bg`} cx="50%" cy="40%" r="78%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="55%" stopColor="#111827" />
                    <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                <linearGradient id={`${uid}-tile`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.55" />
                </linearGradient>

                <linearGradient id={`${uid}-tri`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e5e7eb" />
                </linearGradient>

                <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feColorMatrix
                        in="b"
                        type="matrix"
                        values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.55 0
              "
                        result="g"
                    />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.35" />
                </filter>
            </defs>

            {/* fundo */}
            <circle cx="128" cy="128" r="120" fill={`url(#${uid}-bg)`} />

            {/* anel sutil */}
            <circle
                cx="128"
                cy="128"
                r="118"
                fill="none"
                stroke="#94a3b8"
                strokeOpacity="0.18"
                strokeWidth="2"
            />

            {/*
          Tiles 2x2 perfeitamente alinhados e centralizados.
          Cada tile: 72x72 | gap: 14 | total: 158
          top-left: 49 (porque (256-158)/2 = 49)
        */}
            <g opacity={tileOpacity} filter={`url(#${uid}-shadow)`}>
                <rect x="49" y="49" width="72" height="72" rx="16" fill={`url(#${uid}-tile)`} />
                <rect x="135" y="49" width="72" height="72" rx="16" fill={`url(#${uid}-tile)`} />
                <rect x="49" y="135" width="72" height="72" rx="16" fill={`url(#${uid}-tile)`} />
                <rect x="135" y="135" width="72" height="72" rx="16" fill={`url(#${uid}-tile)`} />
            </g>

            {/* triângulo central */}
            <g filter={`url(#${uid}-glow)`}>
                <circle cx="128" cy="128" r="34" fill="#0b1220" opacity="0.22" />
                <path d="M118 102 L118 154 L166 128 Z" fill={`url(#${uid}-tri)`} />
            </g>
        </svg>
    );
}
