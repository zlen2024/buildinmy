"use client";

import { useMapStore } from "@/lib/map-store";

export function ScaleBar() {
  const selectedState = useMapStore((s) => s.selectedState);
  const selectedDistrict = useMapStore((s) => s.selectedDistrict);

  // Approximate scale: at state level ~200km, at district level ~50km
  let scaleKm = 200;
  if (selectedState && selectedDistrict) scaleKm = 20;
  else if (selectedState) scaleKm = 80;

  return (
    <div className="flex items-center gap-2">
      <div className="map-scale-bar h-1 w-16" />
      <span className="text-[8px] font-mono text-[#e0c97f]/40">{scaleKm}km</span>
    </div>
  );
}
