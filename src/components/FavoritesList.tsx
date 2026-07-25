"use client";

import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  X,
  Star,
  Wifi,
  Coffee,
  Plug,
  Volume2,
  Heart,
  Trash2,
  TrainFront,
  Phone,
  ThermometerSun,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function FavoritesList() {
  const locations = useMapStore((s) => s.locations);
  const favoriteIds = useMapStore((s) => s.favoriteIds);
  const toggleFavorite = useMapStore((s) => s.toggleFavorite);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const toggleCompare = useMapStore((s) => s.toggleCompare);
  const compareIds = useMapStore((s) => s.compareIds);
  const clearCompare = useMapStore((s) => s.clearCompare);

  const favoriteLocations = locations.filter((l) => favoriteIds.includes(l.id));
  const compareLocations = locations.filter((l) => compareIds.includes(l.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#e0c97f]/10">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#e94560] fill-[#e94560]" />
          <h2 className="text-sm font-semibold text-[#e0c97f]">Saved Venues</h2>
          <span className="text-[10px] text-[#e0c97f]/30">
            {favoriteLocations.length}
          </span>
        </div>
      </div>

      {/* Compare tray */}
      <AnimatePresence>
        {compareLocations.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-[#e0c97f]/10 overflow-hidden"
          >
            <div className="p-3 bg-[#e0c97f]/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-[#e0c97f]/50 uppercase tracking-wider">
                  Compare ({compareLocations.length}/3)
                </p>
                <button
                  onClick={clearCompare}
                  className="text-[10px] text-[#e94560]/50 hover:text-[#e94560] transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              {/* Comparison table */}
              <div className="bg-[#0d1b2a] rounded-lg border border-[#e0c97f]/8 overflow-hidden text-[10px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e0c97f]/8">
                      <th className="p-1.5 text-left text-[#e0c97f]/30 font-medium">Metric</th>
                      {compareLocations.map((loc) => (
                        <th key={loc.id} className="p-1.5 text-center font-medium text-[#e0c97f]/60 max-w-[80px] truncate">
                          {loc.name.split(" ").slice(0, 2).join(" ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0c97f]/5">
                    <tr>
                      <td className="p-1.5 text-[#e0c97f]/30 flex items-center gap-1"><Wifi className="w-2.5 h-2.5" />Wi-Fi</td>
                      {compareLocations.map((loc) => (
                        <td key={loc.id} className="p-1.5 text-center font-medium" style={{
                          color: loc.avgDownloadMbps > 100 ? "#22c55e" : loc.avgDownloadMbps > 50 ? "#f59e0b" : "#ef4444"
                        }}>
                          {loc.avgDownloadMbps}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-1.5 text-[#e0c97f]/30"><Coffee className="w-2.5 h-2.5 inline mr-1" />Coffee</td>
                      {compareLocations.map((loc) => (
                        <td key={loc.id} className="p-1.5 text-center text-[#e0c97f]/60">
                          {loc.venueCost ? `RM${loc.venueCost.coffeePriceMyr.toFixed(0)}` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-1.5 text-[#e0c97f]/30">Day Pass</td>
                      {compareLocations.map((loc) => (
                        <td key={loc.id} className="p-1.5 text-center text-[#e0c97f]/60">
                          {loc.venueCost?.dayPassMyr ? `RM${loc.venueCost.dayPassMyr.toFixed(0)}` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-1.5 text-[#e0c97f]/30">Rating</td>
                      {compareLocations.map((loc) => (
                        <td key={loc.id} className="p-1.5 text-center text-[#e0c97f]/60">
                          {loc.googleRating ? loc.googleRating.toFixed(1) : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-1.5 text-[#e0c97f]/30 flex items-center gap-1"><Plug className="w-2.5 h-2.5" />Power</td>
                      {compareLocations.map((loc) => (
                        <td key={loc.id} className="p-1.5 text-center" style={{
                          color: loc.workProfile?.powerOutlets === "high" ? "#22c55e" : "rgba(224, 201, 127, 0.4)"
                        }}>
                          {loc.workProfile?.powerOutlets || "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-1.5 text-[#e0c97f]/30 flex items-center gap-1"><Volume2 className="w-2.5 h-2.5" />Noise</td>
                      {compareLocations.map((loc) => (
                        <td key={loc.id} className="p-1.5 text-center" style={{
                          color: loc.workProfile?.noiseLevel === "quiet" || loc.workProfile?.noiseLevel === "silent" ? "#22c55e" : "rgba(224, 201, 127, 0.4)"
                        }}>
                          {loc.workProfile?.noiseLevel || "—"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites list */}
      <div className="flex-1 overflow-y-auto nav-scrollable">
        {favoriteLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e94560]/10 to-[#e94560]/3 border border-[#e94560]/10 flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-[#e94560]/20" />
            </div>
            <p className="text-sm text-[#e0c97f]/40 font-medium">No saved venues yet</p>
            <p className="text-xs text-[#e0c97f]/20 mt-1 max-w-[200px]">Click the heart icon on any venue to save it here for quick access</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0c97f]/5">
            {favoriteLocations.map((venue) => (
              <motion.div
                key={venue.id}
                layout
                className="p-3 hover:bg-[#e0c97f]/3 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_CONFIG[venue.category as VenueCategory]?.color + "15" }}
                  >
                    <span className="text-sm">{CATEGORY_CONFIG[venue.category as VenueCategory]?.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedVenue(venue)}>
                    <p className="text-xs font-medium text-[#e0c97f] truncate">{venue.name}</p>
                    <p className="text-[10px] text-[#e0c97f]/30 mt-0.5">{venue.area}, {venue.state}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn(
                        "text-[9px] font-medium",
                        venue.avgDownloadMbps > 100 ? "text-[#22c55e]" : venue.avgDownloadMbps > 50 ? "text-[#f59e0b]" : "text-[#e0c97f]/30"
                      )}>
                        {venue.avgDownloadMbps} Mbps
                      </span>
                      {venue.venueCost && (
                        <span className="text-[9px] text-[#e0c97f]/30">
                          RM {venue.venueCost.coffeePriceMyr.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleCompare(venue.id)}
                      className={cn(
                        "p-1.5 rounded-md text-[10px] transition-colors",
                        compareIds.includes(venue.id)
                          ? "bg-[#e0c97f]/15 text-[#e0c97f]"
                          : "text-[#e0c97f]/20 hover:text-[#e0c97f]/50"
                      )}
                      title={compareIds.includes(venue.id) ? "Remove from compare" : "Add to compare"}
                    >
                      <TrainFront className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(venue.id)}
                      className="p-1.5 rounded-md text-[10px] text-[#e94560]/50 hover:text-[#e94560] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
