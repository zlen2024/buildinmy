"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Wifi, Trophy } from "lucide-react";
import { useMapStore, CATEGORY_CONFIG, type LocationPin, type VenueCategory } from "@/lib/map-store";

interface QuickStatsOverlayProps {
  visibleLocations: LocationPin[];
  selectedState: string | null;
  sidebarOpen: boolean;
}

export function QuickStatsOverlay({
  visibleLocations,
  selectedState,
  sidebarOpen,
}: QuickStatsOverlayProps) {
  // Compute the three quick stats
  const stats = useMemo(() => {
    const count = visibleLocations.length;

    // Average Wi-Fi speed
    const avgWifi =
      count > 0
        ? Math.round(
            visibleLocations.reduce((sum, loc) => sum + loc.avgDownloadMbps, 0) /
              count,
          )
        : 0;
    const wifiColor =
      avgWifi > 100 ? "#22c55e" : avgWifi > 50 ? "#f59e0b" : "#ef4444";

    // Top category (most venues)
    const categoryCounts: Partial<Record<VenueCategory, number>> = {};
    for (const loc of visibleLocations) {
      categoryCounts[loc.category] = (categoryCounts[loc.category] || 0) + 1;
    }
    let topCategory: VenueCategory = "cafe";
    let topCount = 0;
    for (const [cat, cnt] of Object.entries(categoryCounts)) {
      if (cnt > topCount) {
        topCategory = cat as VenueCategory;
        topCount = cnt;
      }
    }
    const topCfg = CATEGORY_CONFIG[topCategory];

    return { count, avgWifi, wifiColor, topCategory, topCfg };
  }, [visibleLocations]);

  return (
    <div
      className={`absolute z-10 pointer-events-none transition-all duration-300 ${
        sidebarOpen ? "left-4 top-4" : "left-4 top-4"
      }`}
    >
      <div className="glass-card p-3 pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
        {/* Stat 1: Total Venues (with pulse animation) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <MapPin className="w-4 h-4 text-[#e94560]" />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(233, 69, 96, 0.4)",
                  "0 0 0 6px rgba(233, 69, 96, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="min-w-0">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={stats.count}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="block text-sm font-bold text-[#e0c97f] tabular-nums leading-tight"
              >
                {stats.count}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[9px] text-[#e0c97f]/40 leading-tight">
              {selectedState ? "state venues" : "total venues"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[#e0c97f]/10 flex-shrink-0" />
        <div className="sm:hidden h-px w-full bg-[#e0c97f]/10 flex-shrink-0" />

        {/* Stat 2: Average Wi-Fi Speed (color-coded) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Wifi
            className="w-4 h-4 flex-shrink-0"
            style={{ color: stats.wifiColor }}
          />
          <div className="min-w-0">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={stats.avgWifi}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="block text-sm font-bold tabular-nums leading-tight"
                style={{ color: stats.wifiColor }}
              >
                {stats.avgWifi}{" "}
                <span className="text-[9px] font-normal text-[#e0c97f]/40">
                  Mbps
                </span>
              </motion.span>
            </AnimatePresence>
            <span className="block text-[9px] text-[#e0c97f]/40 leading-tight">
              avg Wi-Fi
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[#e0c97f]/10 flex-shrink-0" />
        <div className="sm:hidden h-px w-full bg-[#e0c97f]/10 flex-shrink-0" />

        {/* Stat 3: Top Category */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Trophy className="w-4 h-4 text-[#e0c97f] flex-shrink-0" />
          <div className="min-w-0">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={stats.topCategory}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="block text-sm font-bold text-[#e0c97f] leading-tight truncate"
              >
                {stats.topCfg.emoji} {stats.topCfg.label}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[9px] text-[#e0c97f]/40 leading-tight">
              top category
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
