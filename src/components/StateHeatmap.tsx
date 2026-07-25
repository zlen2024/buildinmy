"use client";

import { useMemo } from "react";
import { useMapStore, SLUG_TO_STATE } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Reverse mapping: state name → slug
const STATE_TO_SLUG: Record<string, string> = {};
for (const [slug, name] of Object.entries(SLUG_TO_STATE)) {
  STATE_TO_SLUG[name] = slug;
}

// State abbreviations for compact display
const STATE_ABBR: Record<string, string> = {
  "Kuala Lumpur": "KL",
  Selangor: "Sel",
  Penang: "Pen",
  Johor: "Joh",
  Melaka: "Mel",
  Sabah: "Sab",
  Sarawak: "Sar",
  Perlis: "Per",
  Kedah: "Ked",
  Pahang: "Pah",
  Terengganu: "Ter",
  "Negeri Sembilan": "NS",
};

export function StateHeatmap() {
  const locations = useMapStore((s) => s.locations);
  const selectedState = useMapStore((s) => s.selectedState);
  const setSelectedState = useMapStore((s) => s.setSelectedState);

  const stateData = useMemo(() => {
    const stateMap = new Map<string, number>();
    for (const loc of locations) {
      stateMap.set(loc.state, (stateMap.get(loc.state) || 0) + 1);
    }
    const maxCount = Math.max(...stateMap.values(), 1);

    return Array.from(stateMap.entries())
      .map(([state, count]) => ({
        state,
        count,
        intensity: count / maxCount,
        slug: STATE_TO_SLUG[state] || state.toLowerCase().replace(/\s+/g, "-"),
        abbr: STATE_ABBR[state] || state.slice(0, 3),
      }))
      .sort((a, b) => b.count - a.count);
  }, [locations]);

  return (
    <div className="p-3 border-t border-[#e0c97f]/10">
      <p className="text-[10px] font-semibold text-[#e0c97f]/30 uppercase tracking-widest mb-2.5 px-1">
        Coverage
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {stateData.map((data, index) => (
          <motion.button
            key={data.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 30, duration: 0.2 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setSelectedState(selectedState === data.slug ? null : data.slug)
            }
            className={cn(
              "relative rounded-lg p-2 border transition-all duration-200 flex flex-col items-center justify-center min-h-[44px]",
              selectedState === data.slug
                ? "border-[#e0c97f]/40 shadow-sm shadow-[#e0c97f]/10"
                : "border-[#e0c97f]/8 hover:border-[#e0c97f]/15"
            )}
            style={{
              backgroundColor: `rgba(224, 201, 127, ${0.03 + data.intensity * 0.12})`,
            }}
            title={`${data.state}: ${data.count} venues`}
          >
            {/* Glow for top states */}
            {data.intensity > 0.7 && (
              <div
                className="absolute inset-0 rounded-lg opacity-20"
                style={{
                  boxShadow: `0 0 12px 2px rgba(224, 201, 127, ${data.intensity * 0.3})`,
                }}
              />
            )}

            <span
              className={cn(
                "text-[10px] font-bold",
                selectedState === data.slug
                  ? "text-[#e0c97f]"
                  : "text-[#e0c97f]/60"
              )}
            >
              {data.abbr}
            </span>
            <span
              className={cn(
                "text-[8px] tabular-nums",
                selectedState === data.slug
                  ? "text-[#e0c97f]/80"
                  : "text-[#e0c97f]/30"
              )}
            >
              {data.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Intensity legend */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="text-[8px] text-[#e0c97f]/20">Less</span>
        <div className="flex gap-px">
          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((i) => (
            <div
              key={i}
              className="w-3 h-1.5 rounded-sm"
              style={{ backgroundColor: `rgba(224, 201, 127, ${0.03 + i * 0.12})` }}
            />
          ))}
        </div>
        <span className="text-[8px] text-[#e0c97f]/20">More</span>
      </div>
    </div>
  );
}
