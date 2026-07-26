"use client";

import { useMemo } from "react";
import { useMapStore, type LocationPin } from "@/lib/map-store";

interface CoordinateDisplayProps {
  hoveredVenue: LocationPin | null;
}

export function CoordinateDisplay({ hoveredVenue }: CoordinateDisplayProps) {
  const locations = useMapStore((s) => s.locations);

  const centerCoords = useMemo(() => {
    if (locations.length === 0) return { lat: 4.2105, lng: 101.9758 };
    const lat = locations.reduce((s, l) => s + l.latitude, 0) / locations.length;
    const lng = locations.reduce((s, l) => s + l.longitude, 0) / locations.length;
    return { lat, lng };
  }, [locations]);

  const lat = hoveredVenue ? hoveredVenue.latitude : centerCoords.lat;
  const lng = hoveredVenue ? hoveredVenue.longitude : centerCoords.lng;

  return (
    <div className="glass-card px-3 py-1.5">
      <p className="font-mono text-[9px] text-[#e0c97f]/60 leading-none">
        lat: {lat.toFixed(4)},{" "}
        lng: {lng.toFixed(4)}
      </p>
    </div>
  );
}
