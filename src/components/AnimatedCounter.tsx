"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => {
    if (decimals > 0) {
      return Number(v.toFixed(decimals));
    }
    return Math.round(v);
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return (
    <motion.span>
      {useTransform(rounded, (v) => `${prefix}${decimals > 0 ? v.toFixed(decimals) : v}${suffix}`)}
    </motion.span>
  );
}

// Simpler version that returns string for static contexts
export function useAnimatedValue(value: number, duration = 1.2) {
  const motionValue = useMotionValue(0);
  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, duration, motionValue]);
  return motionValue;
}
