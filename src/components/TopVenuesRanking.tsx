"use client";

import { useMemo } from "react";
import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import { Trophy, Wifi, Star, Coffee, ChevronRight, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface RankedVenue extends LocationPin {
  compositeScore: number;
}

export function TopVenuesRanking() {
  const locations = useMapStore((s) => s.locations);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);

  const ranked = useMemo((): RankedVenue[] => {
    return [...locations]
      .map((loc) => {
        const wifiScore = Math.min(loc.avgDownloadMbps / 200, 1);
        const ratingScore = (loc.googleRating || 0) / 5;
        const costScore = loc.venueCost
          ? Math.max(1 - loc.venueCost.coffeePriceMyr / 30, 0)
          : 0.5;
        const composite = wifiScore * 0.4 + ratingScore * 0.35 + costScore * 0.25;
        return { ...loc, compositeScore: Math.round(composite * 100) / 100 };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 10);
  }, [locations]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e0c97f]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e0c97f]/20 to-[#e94560]/10 flex items-center justify-center">
            <Crown className="w-4 h-4 text-[#e0c97f]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#e0c97f]">Top 10 Venues</h2>
            <p className="text-[10px] text-[#e0c97f]/30">Wi-Fi 40% · Rating 35% · Cost 25%</p>
          </div>
        </div>
      </div>

      {/* Ranking list */}
      <div className="flex-1 overflow-y-auto nav-scrollable p-2 space-y-1">
        {ranked.map((venue, index) => (
          <RankingRow
            key={venue.id}
            venue={venue}
            rank={index + 1}
            score={venue.compositeScore}
            onClick={() => setSelectedVenue(venue)}
          />
        ))}
      </div>
    </div>
  );
}

interface RankingRowProps {
  venue: LocationPin & { compositeScore: number };
  rank: number;
  score: number;
  onClick: () => void;
}

function RankingRow({ venue, rank, score, onClick }: RankingRowProps) {
  const categoryConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference - (score / 1) * circumference;

  const rankGradient =
    rank === 1
      ? "from-[#e0c97f] to-[#d4a847]"
      : rank === 2
        ? "from-[#c0c0c0] to-[#a0a0a0]"
        : rank === 3
          ? "from-[#cd7f32] to-[#b5692a]"
          : "";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 40, duration: 0.25 }}
      whileHover={{ backgroundColor: "rgba(224, 201, 127, 0.04)", x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-colors group"
    >
      {/* Score ring */}
      <div className="relative w-9 h-9 flex-shrink-0">
        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="rgba(224, 201, 127, 0.08)"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0c97f" />
              <stop offset="100%" stopColor="#e94560" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-bold text-[#e0c97f] tabular-nums">
            {(score * 100).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Venue info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {/* Rank badge */}
          <span
            className={cn(
              "text-[9px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
              rank <= 3
                ? "bg-gradient-to-br text-[#0a0a0f] " + rankGradient
                : "bg-[#e0c97f]/8 text-[#e0c97f]/40"
            )}
          >
            {rank}
          </span>
          <span className="text-xs">{categoryConfig?.emoji || "📍"}</span>
          <h3 className="text-[11px] font-medium text-[#e0c97f] truncate group-hover:text-[#e0c97f]">
            {venue.name}
          </h3>
        </div>
        <p className="text-[9px] text-[#e0c97f]/25 mt-0.5 ml-[26px]">{venue.state}</p>

        {/* Metrics row */}
        <div className="flex items-center gap-3 mt-1 ml-[26px]">
          <div className="flex items-center gap-0.5">
            <Wifi className="w-2.5 h-2.5 text-[#e0c97f]/20" />
            <span className="text-[9px] text-[#e0c97f]/40 tabular-nums">{venue.avgDownloadMbps}</span>
          </div>
          {venue.googleRating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-amber-400/40" />
              <span className="text-[9px] text-[#e0c97f]/40 tabular-nums">{venue.googleRating}</span>
            </div>
          )}
          {venue.venueCost && (
            <div className="flex items-center gap-0.5">
              <Coffee className="w-2.5 h-2.5 text-[#e0c97f]/20" />
              <span className="text-[9px] text-[#e0c97f]/40 tabular-nums">
                RM{venue.venueCost.coffeePriceMyr.toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight className="w-3 h-3 text-[#e0c97f]/10 group-hover:text-[#e0c97f]/25 transition-colors flex-shrink-0" />
    </motion.button>
  );
}
