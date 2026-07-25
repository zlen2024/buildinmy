"use client";

import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  X,
  Star,
  Wifi,
  Plug,
  Volume2,
  Phone,
  Armchair,
  Clock,
  Coffee,
  CreditCard,
  TrainFront,
  ExternalLink,
  Navigation,
  ThermometerSun,
  Laptop,
  MapPin,
  Heart,
  GitCompareArrows,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface VenueDrawerProps {
  venue: LocationPin;
  onClose: () => void;
}

export function VenueDrawer({ venue, onClose }: VenueDrawerProps) {
  const categoryConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
  const favoriteIds = useMapStore((s) => s.favoriteIds);
  const toggleFavorite = useMapStore((s) => s.toggleFavorite);
  const isFav = favoriteIds.includes(venue.id);
  const compareIds = useMapStore((s) => s.compareIds);
  const toggleCompare = useMapStore((s) => s.toggleCompare);
  const isCompared = compareIds.includes(venue.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden"
      >
        <div className="bg-[#0d1b2a]/98 backdrop-blur-2xl border-t border-[#e0c97f]/15 rounded-t-3xl shadow-2xl shadow-black/60">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-[#e0c97f]/20" />
          </div>

          {/* Header */}
          <div className="flex items-start gap-3 px-5 pb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: categoryConfig.color + "20" }}
            >
              <span className="text-xl">
                {venue.category === "coworking" ? "🏢" : venue.category === "cafe" ? "☕" : venue.category === "public_space" ? "📚" : "🏠"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[#e0c97f] truncate">{venue.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-3 h-3 text-[#e0c97f]/40" />
                <p className="text-xs text-[#e0c97f]/50 truncate">{venue.area}, {venue.state}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-[#e0c97f]/20 text-[#e0c97f]/60 bg-[#e0c97f]/5"
                >
                  {categoryConfig.label}
                </Badge>
                {venue.googleRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] text-[#e0c97f]/60">{venue.googleRating}</span>
                    <span className="text-[10px] text-[#e0c97f]/30">({venue.googleUserRatingsTotal})</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleCompare(venue.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isCompared
                    ? "bg-[#e0c97f]/15 text-[#e0c97f]"
                    : "hover:bg-[#e0c97f]/10 text-[#e0c97f]/30 hover:text-[#e0c97f]/60"
                )}
                title={isCompared ? "Remove from comparison" : "Add to comparison"}
              >
                <GitCompareArrows className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(venue.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isFav
                    ? "bg-[#e94560]/15 text-[#e94560]"
                    : "hover:bg-[#e0c97f]/10 text-[#e0c97f]/30 hover:text-[#e0c97f]/60"
                )}
              >
                <Heart className={cn("w-4 h-4", isFav && "fill-[#e94560]")} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-6 overflow-y-auto max-h-[55vh] space-y-5">
            {/* Wi-Fi Speed */}
            <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs font-medium text-[#e0c97f]/70">Wi-Fi Speed</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#22c55e]">{venue.avgDownloadMbps}</span>
                <span className="text-sm text-[#e0c97f]/40">Mbps avg download</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#e0c97f]/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (venue.avgDownloadMbps / 300) * 100)}%`,
                    backgroundColor: venue.avgDownloadMbps > 100 ? "#22c55e" : venue.avgDownloadMbps > 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[#e0c97f]/30">
                <span>Slow</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Work Profile */}
            {venue.workProfile && (
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  icon={<Plug className="w-4 h-4" />}
                  label="Power Outlets"
                  value={venue.workProfile.powerOutlets}
                  color={venue.workProfile.powerOutlets === "high" ? "#22c55e" : venue.workProfile.powerOutlets === "moderate" ? "#f59e0b" : "#ef4444"}
                />
                <MetricCard
                  icon={<Volume2 className="w-4 h-4" />}
                  label="Noise Level"
                  value={venue.workProfile.noiseLevel}
                  color={venue.workProfile.noiseLevel === "silent" || venue.workProfile.noiseLevel === "quiet" ? "#22c55e" : venue.workProfile.noiseLevel === "moderate" ? "#f59e0b" : "#ef4444"}
                />
                <MetricCard
                  icon={<Armchair className="w-4 h-4" />}
                  label="Seating"
                  value={venue.workProfile.seatingType}
                  color="#3b82f6"
                />
                <MetricCard
                  icon={<Laptop className="w-4 h-4" />}
                  label="Laptop Policy"
                  value={venue.workProfile.laptopPolicy.replace(/_/g, " ")}
                  color="#a855f7"
                />
                <MetricCard
                  icon={<ThermometerSun className="w-4 h-4" />}
                  label="Air Con"
                  value={venue.workProfile.hasAirCon ? "Yes" : "No"}
                  color={venue.workProfile.hasAirCon ? "#22c55e" : "#ef4444"}
                />
                <MetricCard
                  icon={<Phone className="w-4 h-4" />}
                  label="Call Friendly"
                  value={venue.workProfile.callFriendly ? "Yes" : "No"}
                  color={venue.workProfile.callFriendly ? "#22c55e" : "#ef4444"}
                />
              </div>
            )}

            {/* Cost Info */}
            {venue.venueCost && (
              <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-[#e0c97f]/70">Cost Index</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <CostItem label="Coffee" value={`RM ${venue.venueCost.coffeePriceMyr.toFixed(0)}`} />
                  {venue.venueCost.dayPassMyr && (
                    <CostItem label="Day Pass" value={`RM ${venue.venueCost.dayPassMyr.toFixed(0)}`} />
                  )}
                  <CostItem label="Min Spend" value={venue.venueCost.minSpendMyr > 0 ? `RM ${venue.venueCost.minSpendMyr.toFixed(0)}` : "None"} />
                </div>
              </div>
            )}

            {/* Transit Links */}
            {venue.transitLinks && venue.transitLinks.length > 0 && (
              <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
                <div className="flex items-center gap-2 mb-3">
                  <TrainFront className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-[#e0c97f]/70">Nearest Transit</span>
                </div>
                <div className="space-y-2">
                  {venue.transitLinks.map((transit, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[#e0c97f]/70">{transit.nearestStationName}</p>
                        <p className="text-[#e0c97f]/40">{transit.stationLine}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#e0c97f] font-medium">{transit.walkTimeMins} min</span>
                        <span className="text-[#e0c97f]/30 ml-1">walk</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps link */}
            {venue.googleMapsUrl && (
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#e0c97f]/10 border border-[#e0c97f]/20 text-[#e0c97f] text-sm font-medium hover:bg-[#e0c97f]/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#e0c97f]/5 rounded-lg p-3 border border-[#e0c97f]/5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-[#e0c97f]/40">{label}</span>
      </div>
      <p className="text-xs font-medium capitalize" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function CostItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-[#e0c97f]/40 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#e0c97f]">{value}</p>
    </div>
  );
}
