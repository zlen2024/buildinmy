"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_CONFIG, type LocationPin, type VenueCategory } from "@/lib/map-store";

interface MapPinTooltipProps {
  venue: LocationPin | null;
  position: { x: number; y: number } | null;
}

export function MapPinTooltip({ venue, position }: MapPinTooltipProps) {
  if (!venue || !position) return null;

  const catConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
  const wifiSpeed = venue.avgDownloadMbps;
  const wifiColor =
    wifiSpeed > 100
      ? "text-green-400 bg-green-400/10 border-green-400/20"
      : wifiSpeed > 50
        ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
        : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="fixed z-50 pointer-events-none"
        style={{
          left: position.x + 12,
          top: position.y - 10,
          transform: "translate(0, -100%)",
        }}
      >
        <div className="glass-card p-3 max-w-48 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm shrink-0">{catConfig?.emoji || "📍"}</span>
            <p className="text-sm font-medium text-[#e0c97f] truncate">{venue.name}</p>
          </div>
          <p className="text-[10px] text-[#e0c97f]/40 mb-2.5 truncate">{venue.area}, {venue.state}</p>
          <div className="flex items-center gap-1.5 mb-2">
            <Wifi className={`w-3 h-3 ${wifiSpeed > 100 ? "text-green-400" : wifiSpeed > 50 ? "text-amber-400" : "text-red-400"}`} />
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-mono ${wifiColor}`}>
              {wifiSpeed} Mbps
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            {venue.googleRating ? (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] text-[#e0c97f]/70 font-medium">{venue.googleRating.toFixed(1)}</span>
              </div>
            ) : (<span />)}
            {venue.venueCost?.coffeePriceMyr ? (
              <span className="text-[10px] text-[#e0c97f]/40">☕ RM{venue.venueCost.coffeePriceMyr}</span>
            ) : (<span />)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#e0c97f]/8">
            <p className="text-[9px] text-[#e0c97f]/25 text-center">Click for details</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
