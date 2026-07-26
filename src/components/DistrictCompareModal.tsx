"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, MapPin, Trophy, TrendingUp, Coffee, Building2 } from "lucide-react";
import { useMapStore, STATE_DISPLAY_NAMES, CATEGORY_CONFIG } from "@/lib/map-store";
import { getDistrictSummaries, type DistrictInfo } from "@/lib/districts";
import { cn } from "@/lib/utils";

/**
 * DistrictCompareModal — side-by-side comparison of all districts in the
 * currently selected state. Shows: venue count, avg Wi-Fi, top category,
 * and a relative Wi-Fi bar.
 *
 * Triggered from the DistrictPanel via the showDistrictCompare store flag.
 */
export function DistrictCompareModal() {
  const showDistrictCompare = useMapStore((s) => s.showDistrictCompare);
  const setShowDistrictCompare = useMapStore((s) => s.setShowDistrictCompare);
  const selectedState = useMapStore((s) => s.selectedState);
  const selectedDistrict = useMapStore((s) => s.selectedDistrict);
  const setSelectedDistrict = useMapStore((s) => s.setSelectedDistrict);
  const locations = useMapStore((s) => s.locations);

  const stateDisplay = selectedState ? STATE_DISPLAY_NAMES[selectedState] || selectedState : "";
  const districts = useMemo<DistrictInfo[]>(() => {
    if (!selectedState) return [];
    return getDistrictSummaries(selectedState, stateDisplay, locations);
  }, [selectedState, stateDisplay, locations]);

  // Best values for highlighting
  const maxCount = Math.max(1, ...districts.map((d) => d.count));
  const maxWifi = Math.max(1, ...districts.map((d) => d.avgWifi));

  return (
    <AnimatePresence>
      {showDistrictCompare && selectedState && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md"
            onClick={() => setShowDistrictCompare(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-card rounded-2xl p-6 max-w-2xl w-full pointer-events-auto max-h-[85vh] overflow-hidden flex flex-col"
              style={{ boxShadow: "0 0 60px rgba(224,201,127,0.12)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5 flex-shrink-0">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#e0c97f]/40 font-semibold mb-1">
                    District Comparison
                  </p>
                  <h2 className="text-lg font-bold text-[#e0c97f] gold-gradient-text">
                    {stateDisplay}
                  </h2>
                  <p className="text-[11px] text-[#e0c97f]/45 mt-0.5">
                    {districts.length} district{districts.length !== 1 ? "s" : ""} with venues ·{" "}
                    {districts.reduce((s, d) => s + d.count, 0)} total venues
                  </p>
                </div>
                <button
                  onClick={() => setShowDistrictCompare(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#e0c97f]/40 hover:text-[#e0c97f] hover:bg-[#e0c97f]/8 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comparison grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar-thin -mx-2 px-2">
                <div className="grid gap-2.5">
                  {districts.map((d, idx) => {
                    const isSelected = selectedDistrict === d.name;
                    const isBestCount = d.count === maxCount;
                    const isBestWifi = d.avgWifi === maxWifi;
                    const wifiPct = Math.min(100, (d.avgWifi / 300) * 100);
                    const countPct = (d.count / maxCount) * 100;
                    const topCat = d.topCategory
                      ? CATEGORY_CONFIG[d.topCategory as keyof typeof CATEGORY_CONFIG]
                      : null;
                    const wifiColor =
                      d.avgWifi > 100 ? "#22c55e" : d.avgWifi > 50 ? "#f59e0b" : "#ef4444";

                    return (
                      <motion.button
                        key={d.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.3 }}
                        onClick={() => {
                          setSelectedDistrict(isSelected ? null : d.name);
                          setShowDistrictCompare(false);
                        }}
                        className={cn(
                          "text-left rounded-xl border p-3.5 transition-all duration-200 hover-lift",
                          isSelected
                            ? "bg-[#e0c97f]/8 border-[#e0c97f]/35 district-row-active"
                            : "bg-[#0a0a0f]/40 border-[#e0c97f]/10 hover:border-[#e0c97f]/25 hover:bg-[#e0c97f]/4",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                              style={{ backgroundColor: (topCat?.color || "#e0c97f") + "20" }}
                            >
                              {topCat?.emoji || "📍"}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-semibold truncate transition-colors",
                                  isSelected ? "text-[#e0c97f]" : "text-[#e0c97f]/85",
                                )}
                              >
                                {d.name}
                              </p>
                              <p className="text-[10px] text-[#e0c97f]/40 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />
                                {topCat?.label || "Mixed venues"}
                              </p>
                            </div>
                          </div>
                          {isBestCount && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e0c97f]/12 border border-[#e0c97f]/25">
                              <Trophy className="w-2.5 h-2.5 text-[#e0c97f]" />
                              <span className="text-[9px] text-[#e0c97f] font-semibold uppercase tracking-wider">
                                Most venues
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Metrics row */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {/* Venue count bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-[#e0c97f]/40 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5" />
                                Venues
                              </span>
                              <span className="text-[11px] text-[#e0c97f]/80 font-mono font-semibold">
                                {d.count}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#e0c97f]/8 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${countPct}%` }}
                                transition={{ delay: 0.1 + idx * 0.04, duration: 0.6, ease: "easeOut" }}
                                className={cn(
                                  "h-full rounded-full",
                                  isBestCount
                                    ? "bg-gradient-to-r from-[#e0c97f] to-[#f5e6b3]"
                                    : "bg-[#e0c97f]/50",
                                )}
                              />
                            </div>
                          </div>

                          {/* Wi-Fi bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-[#e0c97f]/40 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Wifi className="w-2.5 h-2.5" />
                                Avg Wi-Fi
                              </span>
                              <span
                                className="text-[11px] font-mono font-semibold"
                                style={{ color: wifiColor }}
                              >
                                {d.avgWifi}
                                <span className="text-[9px] opacity-60 ml-0.5">Mbps</span>
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#e0c97f]/8 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${wifiPct}%` }}
                                transition={{ delay: 0.15 + idx * 0.04, duration: 0.6, ease: "easeOut" }}
                                className="h-full rounded-full wifi-bar-fill"
                                style={{
                                  background: `linear-gradient(90deg, ${wifiColor}80, ${wifiColor})`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isBestWifi && (
                            <span className="district-badge" style={{ borderColor: wifiColor + "60", color: wifiColor }}>
                              <TrendingUp className="w-2.5 h-2.5" />
                              Fastest Wi-Fi
                            </span>
                          )}
                          <span className="text-[9px] text-[#e0c97f]/35">
                            Click to {isSelected ? "deselect" : "filter map"}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-[#e0c97f]/10 flex items-center justify-between flex-shrink-0">
                <p className="text-[10px] text-[#e0c97f]/40 flex items-center gap-1.5">
                  <Coffee className="w-3 h-3" />
                  Comparison based on {districts.reduce((s, d) => s + d.count, 0)} venues across{" "}
                  {districts.length} districts
                </p>
                <button
                  onClick={() => {
                    setSelectedDistrict(null);
                    setShowDistrictCompare(false);
                  }}
                  className="text-[11px] text-[#e0c97f]/60 hover:text-[#e0c97f] px-2.5 py-1 rounded-md hover:bg-[#e0c97f]/8 transition-colors"
                >
                  Reset filter
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
