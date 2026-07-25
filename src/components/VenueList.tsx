"use client";

import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin, useFilteredLocations } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  Star,
  Wifi,
  Plug,
  Volume2,
  Coffee,
  MapPin,
  ChevronRight,
  LayoutList,
  Heart,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function VenueList() {
  const filteredLocations = useFilteredLocations();
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const searchQuery = useMapStore((s) => s.searchQuery);
  const isLoading = useMapStore((s) => s.isLoading);
  const toggleFavorite = useMapStore((s) => s.toggleFavorite);
  const favoriteIds = useMapStore((s) => s.favoriteIds);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#e0c97f]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-[#e0c97f]/50" />
            <h2 className="text-sm font-semibold text-[#e0c97f]">Venues</h2>
          </div>
          {!isLoading && (
            <span className="text-[10px] text-[#e0c97f]/25 bg-[#e0c97f]/5 px-2 py-0.5 rounded-full">
              {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-[#e0c97f]/30 mt-1">
            Showing results for &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto nav-scrollable">
        {/* Loading state */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg bg-[#e0c97f]/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4 rounded bg-[#e0c97f]/5" />
                  <Skeleton className="h-2.5 w-1/2 rounded bg-[#e0c97f]/3" />
                  <div className="flex gap-3">
                    <Skeleton className="h-2.5 w-16 rounded bg-[#e0c97f]/3" />
                    <Skeleton className="h-2.5 w-10 rounded bg-[#e0c97f]/3" />
                    <Skeleton className="h-2.5 w-14 rounded bg-[#e0c97f]/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e0c97f]/10 to-[#e0c97f]/3 border border-[#e0c97f]/10 flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-[#e0c97f]/20" />
            </div>
            <p className="text-sm text-[#e0c97f]/40 font-medium">No venues found</p>
            <p className="text-xs text-[#e0c97f]/20 mt-1 max-w-[200px]">Try adjusting your filters or search query to find work-friendly spaces</p>
            {searchQuery && (
              <button
                onClick={() => useMapStore.getState().resetFilters()}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e0c97f]/8 border border-[#e0c97f]/15 text-[#e0c97f]/60 text-xs font-medium hover:bg-[#e0c97f]/15 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#e0c97f]/5">
            {filteredLocations.map((venue, index) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                index={index}
                onClick={() => setSelectedVenue(venue)}
                isFavorite={favoriteIds.includes(venue.id)}
                onToggleFavorite={() => toggleFavorite(venue.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface VenueCardProps {
  venue: LocationPin;
  index: number;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function VenueCard({ venue, index, onClick, isFavorite, onToggleFavorite }: VenueCardProps) {
  const categoryConfig = CATEGORY_CONFIG[venue.category as VenueCategory];

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 30, 150), duration: 0.2 }}
      whileHover={{ backgroundColor: "rgba(224, 201, 127, 0.04)" }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3.5 text-left transition-colors hover:bg-[#e0c97f]/4 group"
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
        style={{ backgroundColor: categoryConfig.color + "12" }}
      >
        <span className="text-base">{categoryConfig.emoji}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-medium text-[#e0c97f] truncate group-hover:text-[#e0c97f]">{venue.name}</h3>
        </div>
        <p className="text-[10px] text-[#e0c97f]/30 mt-0.5 truncate">{venue.area}, {venue.state}</p>

        {/* Metrics row */}
        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
          <div className="flex items-center gap-0.5">
            <Wifi className="w-2.5 h-2.5 text-[#e0c97f]/20" />
            <span className={cn(
              "text-[9px] font-medium",
              venue.avgDownloadMbps > 100 ? "text-[#22c55e]" : venue.avgDownloadMbps > 50 ? "text-[#f59e0b]" : "text-[#e0c97f]/30"
            )}>
              {venue.avgDownloadMbps}
            </span>
          </div>

          {venue.googleRating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-amber-400/50 fill-amber-400/50" />
              <span className="text-[9px] text-[#e0c97f]/40">{venue.googleRating}</span>
            </div>
          )}

          {venue.workProfile?.powerOutlets === "high" && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 border-[#22c55e]/25 text-[#22c55e]/50 bg-[#22c55e]/5 h-3.5 leading-none">
              <Plug className="w-2 h-2 mr-0.5" />
              High
            </Badge>
          )}

          {venue.workProfile?.noiseLevel === "quiet" && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 border-[#3b82f6]/25 text-[#3b82f6]/50 bg-[#3b82f6]/5 h-3.5 leading-none">
              <Volume2 className="w-2 h-2 mr-0.5" />
              Quiet
            </Badge>
          )}

          {venue.venueCost && (
            <span className="text-[9px] text-[#e0c97f]/25">
              <Coffee className="w-2.5 h-2.5 inline mr-0.5" />
              {venue.venueCost.coffeePriceMyr.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0 mt-1">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="p-1 rounded-md text-[#e0c97f]/15 hover:text-[#e94560] transition-colors"
        >
          <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-[#e94560] text-[#e94560]")} />
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#e0c97f]/10 group-hover:text-[#e0c97f]/25 transition-colors" />
      </div>
    </motion.button>
  );
}
