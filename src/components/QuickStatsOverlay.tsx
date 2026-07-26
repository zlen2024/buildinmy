"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Wifi, Trophy } from "lucide-react";
import { useMapStore, CATEGORY_CONFIG, type LocationPin, type VenueCategory } from "@/lib/map-store";

interface QuickStatsOverlayProps {
  visibleLocations: LocationPin[];
  selectedState: string | null;
  sidebarOpen: boolean;
}

/** Animated counter hook — counts from prev to target */
function useAnimatedCount(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === target) return;
    prevRef.current = target;

    const start = startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + (target - prev) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
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

  // Animated counters
  const animatedCount = useAnimatedCount(stats.count);
  const animatedWifi = useAnimatedCount(stats.avgWifi);

  return (
    <div
      className={`absolute z-10 pointer-events-none transition-all duration-300 ${
        sidebarOpen ? "left-4 top-4" : "left-4 top-4"
      }`}
    >
      <div className="glass-card gradient-border-animated p-3 pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
        {/* Stat 1: Total Venues (with pulse animation + bg gradient) */}
        <div
          className="flex items-center gap-2.5 min-w-0 rounded-lg px-2 py-1.5 stat-gradient-bg"
          style={{ '--stat-gradient': 'rgba(233, 69, 96, 0.06)' } as React.CSSProperties}
        >
          <div className="relative flex-shrink-0">
            <motion.div
              key={stats.count}
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
            >
              <MapPin className="w-4 h-4 text-[#e94560]" />
            </motion.div>
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
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="block text-sm font-bold text-[#e0c97f] tabular-nums leading-tight"
              >
                {animatedCount}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[9px] text-[#e0c97f]/40 leading-tight">
              {selectedState ? "state venues" : "total venues"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-[#e0c97f]/12 to-transparent flex-shrink-0" />
        <div className="sm:hidden h-px w-full bg-gradient-to-r from-transparent via-[#e0c97f]/12 to-transparent flex-shrink-0" />

        {/* Stat 2: Average Wi-Fi Speed (color-coded + bg gradient) */}
        <div
          className="flex items-center gap-2.5 min-w-0 rounded-lg px-2 py-1.5 stat-gradient-bg"
          style={{ '--stat-gradient': stats.wifiColor + '08' } as React.CSSProperties}
        >
          <motion.div
            key={stats.avgWifi}
            initial={{ rotate: 15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="flex-shrink-0"
          >
            <Wifi
              className="w-4 h-4"
              style={{ color: stats.wifiColor }}
            />
          </motion.div>
          <div className="min-w-0">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={stats.avgWifi}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="block text-sm font-bold tabular-nums leading-tight"
                style={{ color: stats.wifiColor }}
              >
                {animatedWifi}{" "}
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
        <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-[#e0c97f]/12 to-transparent flex-shrink-0" />
        <div className="sm:hidden h-px w-full bg-gradient-to-r from-transparent via-[#e0c97f]/12 to-transparent flex-shrink-0" />

        {/* Stat 3: Top Category (with bg gradient) */}
        <div
          className="flex items-center gap-2.5 min-w-0 rounded-lg px-2 py-1.5 stat-gradient-bg"
          style={{ '--stat-gradient': 'rgba(224, 201, 127, 0.05)' } as React.CSSProperties}
        >
          <motion.div
            key={stats.topCategory}
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="flex-shrink-0"
          >
            <Trophy className="w-4 h-4 text-[#e0c97f]" />
          </motion.div>
          <div className="min-w-0">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={stats.topCategory}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
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
