"use client";

import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin, useFilteredLocations } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  X,
  Star,
  Wifi,
  Plug,
  Volume2,
  Coffee,
  MapPin,
  ExternalLink,
  ChevronRight,
  LayoutList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function VenueList() {
  const filteredLocations = useFilteredLocations();
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const searchQuery = useMapStore((s) => s.searchQuery);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#e0c97f]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-[#e0c97f]/60" />
            <h2 className="text-sm font-semibold text-[#e0c97f]">Venues</h2>
          </div>
          <span className="text-[10px] text-[#e0c97f]/30">
            {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
          </span>
        </div>
        {searchQuery && (
          <p className="text-[10px] text-[#e0c97f]/40 mt-1">
            Showing results for &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MapPin className="w-8 h-8 text-[#e0c97f]/20 mb-3" />
            <p className="text-sm text-[#e0c97f]/40">No venues found</p>
            <p className="text-xs text-[#e0c97f]/25 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0c97f]/5">
            {filteredLocations.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onClick={() => setSelectedVenue(venue)}
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
  onClick: () => void;
}

function VenueCard({ venue, onClick }: VenueCardProps) {
  const categoryConfig = CATEGORY_CONFIG[venue.category as VenueCategory];

  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(224, 201, 127, 0.05)" }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-[#e0c97f]/5"
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: categoryConfig.color + "15" }}
      >
        <span className="text-lg">
          {venue.category === "coworking" ? "🏢" : venue.category === "cafe" ? "☕" : venue.category === "public_space" ? "📚" : "🏠"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[#e0c97f] truncate">{venue.name}</h3>
        </div>
        <p className="text-[11px] text-[#e0c97f]/40 mt-0.5 truncate">{venue.area}, {venue.state}</p>

        {/* Metrics row */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-[#e0c97f]/30" />
            <span className={cn(
              "text-[10px] font-medium",
              venue.avgDownloadMbps > 100 ? "text-[#22c55e]" : venue.avgDownloadMbps > 50 ? "text-[#f59e0b]" : "text-[#e0c97f]/40"
            )}>
              {venue.avgDownloadMbps} Mbps
            </span>
          </div>

          {venue.googleRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400/60 fill-amber-400/60" />
              <span className="text-[10px] text-[#e0c97f]/50">{venue.googleRating}</span>
            </div>
          )}

          {venue.workProfile?.powerOutlets === "high" && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-[#22c55e]/30 text-[#22c55e]/60 bg-[#22c55e]/5 h-4">
              <Plug className="w-2 h-2 mr-0.5" />
              High
            </Badge>
          )}

          {venue.workProfile?.noiseLevel === "quiet" && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-[#3b82f6]/30 text-[#3b82f6]/60 bg-[#3b82f6]/5 h-4">
              <Volume2 className="w-2 h-2 mr-0.5" />
              Quiet
            </Badge>
          )}

          {venue.venueCost && (
            <span className="text-[10px] text-[#e0c97f]/30">
              <Coffee className="w-2.5 h-2.5 inline mr-0.5" />
              RM {venue.venueCost.coffeePriceMyr.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-[#e0c97f]/20 flex-shrink-0 mt-2" />
    </motion.button>
  );
}
