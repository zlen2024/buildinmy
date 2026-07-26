"use client";

import { useMemo } from "react";
import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import { Wifi, Trophy, Zap, ChevronRight, Medal } from "lucide-react";
import { motion } from "framer-motion";

const MEDAL_COLORS = ["#e0c97f", "#c0c0c0", "#cd7f32"];

export function WifiLeaderboard() {
  const locations = useMapStore((s) => s.locations);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);

  const ranked = useMemo(
    () => [...locations].sort((a, b) => b.avgDownloadMbps - a.avgDownloadMbps),
    [locations]
  );

  const maxSpeed = ranked.length > 0 ? ranked[0].avgDownloadMbps : 300;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e0c97f]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#e0c97f]">Wi-Fi Speed Rank</h2>
            <p className="text-[10px] text-[#e0c97f]/30">{ranked.length} venues ranked</p>
          </div>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto nav-scrollable">
        <div className="p-2">
          {ranked.map((venue, index) => (
            <LeaderboardRow
              key={venue.id}
              venue={venue}
              rank={index + 1}
              maxSpeed={maxSpeed}
              onClick={() => setSelectedVenue(venue)}
              isTopThree={index < 3}
            />
          ))}
        </div>
      </div>

      {/* Footer legend */}
      <div className="p-3 border-t border-[#e0c97f]/10">
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-[9px] text-[#e0c97f]/30">{"< 100 Mbps"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-[9px] text-[#e0c97f]/30">50-100 Mbps</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-[9px] text-[#e0c97f]/30">{"> 50 Mbps"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LeaderboardRowProps {
  venue: LocationPin;
  rank: number;
  maxSpeed: number;
  onClick: () => void;
  isTopThree: boolean;
}

function LeaderboardRow({ venue, rank, maxSpeed, onClick, isTopThree }: LeaderboardRowProps) {
  const categoryConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
  const speedColor =
    venue.avgDownloadMbps > 100
      ? "#22c55e"
      : venue.avgDownloadMbps > 50
        ? "#f59e0b"
        : "#ef4444";
  const barWidth = Math.max(5, (venue.avgDownloadMbps / Math.max(maxSpeed, 1)) * 100);

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 20, 400), duration: 0.2 }}
      whileHover={{ backgroundColor: "rgba(224, 201, 127, 0.04)", x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors group",
        isTopThree && "glass-subtle"
      )}
    >
      {/* Rank badge */}
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
          isTopThree
            ? "text-[#0a0a0f]"
            : "bg-[#e0c97f]/8 text-[#e0c97f]/40"
        )}
        style={isTopThree ? { backgroundColor: MEDAL_COLORS[rank - 1] } : undefined}
      >
        {rank}
      </div>

      {/* Category emoji */}
      <span className="text-xs flex-shrink-0">{categoryConfig?.emoji || "📍"}</span>

      {/* Venue info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-[#e0c97f] truncate group-hover:text-[#e0c97f]">
          {venue.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] text-[#e0c97f]/25 truncate">{venue.state}</span>
          {/* Speed bar */}
          <div className="flex-1 h-1 rounded-full bg-[#e0c97f]/8 overflow-hidden max-w-[60px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ delay: Math.min(rank * 20, 400) + 100, duration: 0.4 }}
              className="h-full rounded-full"
              style={{ backgroundColor: speedColor }}
            />
          </div>
        </div>
      </div>

      {/* Speed value */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-[11px] font-bold tabular-nums" style={{ color: speedColor }}>
          {venue.avgDownloadMbps}
        </span>
        <span className="text-[8px] text-[#e0c97f]/25">Mbps</span>
      </div>

      <ChevronRight className="w-3 h-3 text-[#e0c97f]/10 group-hover:text-[#e0c97f]/25 transition-colors flex-shrink-0" />
    </motion.button>
  );
}
