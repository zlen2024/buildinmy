"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { MapPin, ChevronRight, Wifi, X, Layers, Navigation, BarChart3 } from "lucide-react";
import { useMapStore, STATE_DISPLAY_NAMES, CATEGORY_CONFIG } from "@/lib/map-store";
import { getDistrictSummaries } from "@/lib/districts";
import { cn } from "@/lib/utils";

interface DistrictPanelProps {
  /** Ref to scrollable container for accessibility */
  className?: string;
}

/**
 * DistrictPanel — appears when a state is selected.
 *
 * Shows the list of districts (in the selected state) that have venues, with
 * counts, top category and avg Wi-Fi. Clicking a district:
 *  - selects it in the store (filters venue list + map pins)
 *  - highlights it on the map via the parent MalaysiaMap component
 *
 * Also exposes:
 *  - "Drill into state" button (calls krackedmaps drillInto via parent)
 *  - "Exit state" button (clears selectedState)
 *  - "All districts" reset pill
 */
export function DistrictPanel({ className }: DistrictPanelProps) {
  const selectedState = useMapStore((s) => s.selectedState);
  const selectedDistrict = useMapStore((s) => s.selectedDistrict);
  const setSelectedDistrict = useMapStore((s) => s.setSelectedDistrict);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const setShowDistrictCompare = useMapStore((s) => s.setShowDistrictCompare);
  const locations = useMapStore((s) => s.locations);

  const stateDisplay = selectedState ? STATE_DISPLAY_NAMES[selectedState] || selectedState : "";
  const districts = useMemo(() => {
    if (!selectedState) return [];
    return getDistrictSummaries(selectedState, stateDisplay, locations);
  }, [selectedState, stateDisplay, locations]);

  return (
    <AnimatePresence>
      {selectedState && (
        <motion.div
          initial={{ opacity: 0, x: 24, y: -8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 24, y: -8 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className={cn(
            "absolute top-20 left-4 z-30 w-[260px] max-w-[calc(100vw-2rem)] pointer-events-auto",
            className,
          )}
        >
          <div className="glass-card district-panel-glow">
            {/* Header — state name + exit */}
            <div className="flex items-start justify-between px-4 pt-3.5 pb-3 border-b border-[#e0c97f]/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#e0c97f]/10 border border-[#e0c97f]/25 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-3.5 h-3.5 text-[#e0c97f]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[#e0c97f]/40 font-semibold">
                    District Zoom
                  </p>
                  <p className="text-sm font-semibold text-[#e0c97f] truncate gold-gradient-text">
                    {stateDisplay}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {districts.length >= 2 && (
                  <button
                    onClick={() => setShowDistrictCompare(true)}
                    aria-label="Compare districts"
                    title="Compare districts side-by-side"
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#e0c97f]/40 hover:text-[#e0c97f] hover:bg-[#e0c97f]/8 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedState(null)}
                  aria-label="Exit state view"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[#e0c97f]/40 hover:text-[#e0c97f] hover:bg-[#e0c97f]/8 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* All districts reset pill */}
            <div className="px-3 pt-3 pb-2">
              <button
                onClick={() => setSelectedDistrict(null)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 border",
                  !selectedDistrict
                    ? "bg-[#e0c97f]/15 border-[#e0c97f]/35 text-[#e0c97f]"
                    : "bg-transparent border-[#e0c97f]/8 text-[#e0c97f]/55 hover:text-[#e0c97f]/85 hover:border-[#e0c97f]/20",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3 h-3" />
                  All districts
                </span>
                <span className="text-[10px] text-[#e0c97f]/45 font-mono">
                  {districts.reduce((s, d) => s + d.count, 0)} venues
                </span>
              </button>
            </div>

            {/* District list */}
            <div className="max-h-[320px] overflow-y-auto px-3 pb-3 pt-1 custom-scrollbar-thin">
              {districts.length === 0 ? (
                <p className="text-[11px] text-[#e0c97f]/40 px-2 py-4 text-center">
                  No district-tagged venues yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {districts.map((d, idx) => {
                    const isActive = selectedDistrict === d.name;
                    const topCat = d.topCategory ? CATEGORY_CONFIG[d.topCategory as keyof typeof CATEGORY_CONFIG] : null;
                    const wifiColor = d.avgWifi > 100 ? "#22c55e" : d.avgWifi > 50 ? "#f59e0b" : "#ef4444";
                    return (
                      <li key={d.name}>
                        <motion.button
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25 }}
                          onClick={() => setSelectedDistrict(isActive ? null : d.name)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-200 border group",
                            isActive
                              ? "bg-[#e0c97f]/12 border-[#e0c97f]/30 district-row-active"
                              : "bg-transparent border-transparent hover:bg-[#e0c97f]/6 hover:border-[#e0c97f]/12",
                          )}
                        >
                          {/* Category icon */}
                          <div
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center text-[11px] flex-shrink-0 transition-transform",
                              isActive ? "scale-110" : "group-hover:scale-105",
                            )}
                            style={{
                              backgroundColor: (topCat?.color || "#e0c97f") + "20",
                            }}
                          >
                            {topCat?.emoji || "📍"}
                          </div>

                          {/* Name + meta */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-[12px] font-medium truncate transition-colors",
                                isActive ? "text-[#e0c97f]" : "text-[#e0c97f]/75 group-hover:text-[#e0c97f]/95",
                              )}
                            >
                              {d.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-[#e0c97f]/40 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {d.count} venue{d.count !== 1 ? "s" : ""}
                              </span>
                              <span className="text-[9px] flex items-center gap-0.5 font-mono" style={{ color: wifiColor }}>
                                <Wifi className="w-2.5 h-2.5" />
                                {d.avgWifi}
                              </span>
                            </div>
                          </div>

                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 flex-shrink-0 transition-all",
                              isActive
                                ? "text-[#e0c97f] translate-x-0"
                                : "text-[#e0c97f]/30 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0",
                            )}
                          />
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2.5 border-t border-[#e0c97f]/8 bg-[#0a0a0f]/40">
              <p className="text-[9px] text-[#e0c97f]/35 leading-tight flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-[#e0c97f]/40 pulse-soft" />
                Click a district to filter venues & zoom in on the map
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
