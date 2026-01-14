"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type PasswordStrengthProps = {
  password: string;
};

type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

function calculatePasswordStrength(password: string): {
  strength: StrengthLevel;
  score: number;
  feedback: string;
} {
  if (!password) {
    return { strength: "weak", score: 0, feedback: "" };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  if (checks.length) score += 1;
  if (checks.lowercase) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.number) score += 1;
  if (checks.special) score += 1;

  // Bonus por comprimento
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  let strength: StrengthLevel;
  let feedback: string;

  if (score <= 2) {
    strength = "weak";
    feedback = "Senha fraca";
  } else if (score <= 4) {
    strength = "medium";
    feedback = "Senha média";
  } else if (score <= 6) {
    strength = "strong";
    feedback = "Senha forte";
  } else {
    strength = "very-strong";
    feedback = "Senha muito forte";
  }

  return { strength, score, feedback };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { strength, score, feedback } = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  if (!password) return null;

  const getStrengthColor = (level: StrengthLevel) => {
    switch (level) {
      case "weak":
        return "bg-destructive";
      case "medium":
        return "bg-yellow-500 dark:bg-yellow-600";
      case "strong":
        return "bg-primary";
      case "very-strong":
        return "bg-green-500 dark:bg-green-600";
      default:
        return "bg-muted";
    }
  };

  const getStrengthTextColor = (level: StrengthLevel) => {
    switch (level) {
      case "weak":
        return "text-destructive";
      case "medium":
        return "text-yellow-600 dark:text-yellow-500";
      case "strong":
        return "text-primary";
      case "very-strong":
        return "text-green-600 dark:text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const bars = 4;
  const filledBars = Math.min(Math.ceil((score / 7) * bars), bars);

  return (
    <div className="space-y-2 mt-2">
      {/* Barras de força */}
      <div className="flex gap-1.5">
        {Array.from({ length: bars }).map((_, index) => {
          const isFilled = index < filledBars;
          return (
            <motion.div
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                isFilled ? getStrengthColor(strength) : "bg-muted"
              }`}
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: isFilled ? 1 : 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              style={{ originX: 0 }}
            />
          );
        })}
      </div>

      {/* Texto de feedback */}
      <motion.p
        key={strength}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`text-xs font-medium ${getStrengthTextColor(strength)}`}
      >
        {feedback}
      </motion.p>
    </div>
  );
}
