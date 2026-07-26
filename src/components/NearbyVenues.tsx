"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Wifi } from "lucide-react";
import { useMapStore, CATEGORY_CONFIG, type LocationPin } from "@/lib/map-store";

interface NearbyVenuesProps {
  currentVenue: LocationPin;
  allVenues: LocationPin[];
}

const NEARBY_RADIUS_KM = 5;
const MAX_NEARBY = 5;

/** Haversine distance in km between two lat/lng pairs */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function NearbyVenues({ currentVenue, allVenues }: NearbyVenuesProps) {
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);

  const nearbyVenues = useMemo(() => {
    return allVenues
      .filter((v) => v.id !== currentVenue.id)
      .map((v) => ({
        venue: v,
        distance: haversineKm(
          currentVenue.latitude,
          currentVenue.longitude,
          v.latitude,
          v.longitude,
        ),
      }))
      .filter((item) => item.distance <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_NEARBY);
  }, [currentVenue, allVenues]);

  if (nearbyVenues.length === 0) {
    return (
      <div className="mt-1">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[#e0c97f]/50" />
          <span className="text-xs font-medium text-[#e0c97f]/50">
            Nearby
          </span>
        </div>
        <div className="glass-subtle rounded-xl p-4 text-center">
          <p className="text-xs text-[#e0c97f]/30">
            No other venues within {NEARBY_RADIUS_KM}km
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#e0c97f]/50" />
        <span className="text-xs font-medium text-[#e0c97f]/50">
          Nearby
        </span>
      </div>

      {/* Mobile: horizontal scroll, Desktop: vertical list */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
        {nearbyVenues.map((item, index) => {
          const cfg = CATEGORY_CONFIG[item.venue.category];
          const wifiColor =
            item.venue.avgDownloadMbps > 100
              ? "#22c55e"
              : item.venue.avgDownloadMbps > 50
                ? "#f59e0b"
                : "#ef4444";

          return (
            <motion.button
              key={item.venue.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: "spring", damping: 20, stiffness: 200 }}
              onClick={() => setSelectedVenue(item.venue)}
              className="flex-shrink-0 w-48 md:w-full glass-subtle rounded-xl p-3 text-left
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
                transition-all duration-200 cursor-pointer group"
            >
              {/* Top row: emoji + name */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{cfg.emoji}</span>
                <p className="text-xs font-medium text-[#e0c97f]/80 truncate flex-1 group-hover:text-[#e0c97f] transition-colors">
                  {item.venue.name}
                </p>
              </div>

              {/* Bottom row: distance badge + Wi-Fi speed */}
              <div className="flex items-center justify-between">
                {/* Distance badge — gold */}
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#e0c97f] bg-[#e0c97f]/10 px-1.5 py-0.5 rounded-full">
                  <MapPin className="w-2.5 h-2.5" />
                  {item.distance < 1
                    ? `${Math.round(item.distance * 1000)} m`
                    : `${item.distance.toFixed(1)} km`}
                </span>

                {/* Wi-Fi speed badge */}
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: wifiColor, backgroundColor: wifiColor + "15" }}>
                  <Wifi className="w-2.5 h-2.5" />
                  {item.venue.avgDownloadMbps} Mbps
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
