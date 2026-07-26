"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wifi, MousePointerClick, Star, Coffee } from "lucide-react";
import { CATEGORY_CONFIG, type LocationPin, type VenueCategory } from "@/lib/map-store";

interface PinHoverPreviewProps {
  venue: LocationPin | null;
}

export function PinHoverPreview({ venue }: PinHoverPreviewProps) {
  if (!venue) return null;

  const catConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
  const wifiSpeed = venue.avgDownloadMbps;
  const wifiPct = Math.min(100, (wifiSpeed / 300) * 100);
  const wifiColor = wifiSpeed > 100 ? "#22c55e" : wifiSpeed > 50 ? "#f59e0b" : "#ef4444";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 16, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 16, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-20 right-16 z-30 pointer-events-none w-52"
      >
        <div className="glass-card p-3.5 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-lg shrink-0">{catConfig?.emoji || "📍"}</span>
            <p className="text-[13px] font-semibold text-[#e0c97f] truncate leading-tight">{venue.name}</p>
          </div>
          <p className="text-[10px] text-[#e0c97f]/40 mb-3 truncate">{venue.area}, {venue.state}</p>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-[#e0c97f]/40 flex items-center gap-1">
                  <Wifi className="w-3 h-3" style={{ color: wifiColor }} />
                  Wi-Fi Speed
                </span>
                <span className="text-[10px] font-mono font-semibold" style={{ color: wifiColor }}>
                  {wifiSpeed} Mbps
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#e0c97f]/8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: wifiPct + "%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: wifiColor }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {venue.googleRating ? (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] text-[#e0c97f]/70 font-medium">
                    {venue.googleRating.toFixed(1)}
                  </span>
                </div>
              ) : null}
              {venue.venueCost?.coffeePriceMyr ? (
                <div className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-[#e0c97f]/40" />
                  <span className="text-[10px] text-[#e0c97f]/50">
                    RM{venue.venueCost.coffeePriceMyr}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#e0c97f]/8 flex items-center gap-1.5 justify-center">
            <MousePointerClick className="w-3 h-3 text-[#e0c97f]/25" />
            <p className="text-[9px] text-[#e0c97f]/25">Click to view details</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
