"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface DensityIndicatorProps {
  count: number;
}

interface DensityLevel {
  label: string;
  color: string;
  bars: number[];
}

function getDensityLevel(count: number): DensityLevel {
  if (count <= 5) return { label: "Sparse", color: "#22c55e", bars: [1, 0, 0, 0] };
  if (count <= 15) return { label: "Moderate", color: "#f59e0b", bars: [1, 1, 0, 0] };
  if (count <= 30) return { label: "Dense", color: "#f97316", bars: [1, 1, 1, 0] };
  return { label: "Very Dense", color: "#ef4444", bars: [1, 1, 1, 1] };
}

export function DensityIndicator({ count }: DensityIndicatorProps) {
  const density = useMemo(() => getDensityLevel(count), [count]);

  const barHeights = ["8px", "12px", "16px", "20px"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="glass-card p-2.5 min-w-[120px]"
    >
      <p className="text-[8px] text-[#e0c97f]/35 uppercase tracking-widest font-semibold mb-1.5">
        Density
      </p>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[10px] font-medium" style={{ color: density.color }}>
          {density.label}
        </span>
        <span className="text-[9px] text-[#e0c97f]/30 font-mono">({count})</span>
      </div>
      <div className="flex items-end gap-[3px] h-5">
        {density.bars.map((filled, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: filled ? barHeights[i] : "3px" }}
            transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: filled ? density.color : "rgba(224,201,127,0.08)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
