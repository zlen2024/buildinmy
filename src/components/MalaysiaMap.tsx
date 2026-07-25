"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createMalaysiaMap } from "krackedmaps";
import "krackedmaps/css";
import { useMapStore, STATE_DISPLAY_NAMES, type LocationPin } from "@/lib/map-store";
import { CATEGORY_CONFIG, type VenueCategory } from "@/lib/map-store";
import {
  Building2,
  Coffee,
  Library,
  Home,
} from "lucide-react";

interface StateSelectPayload {
  state?: string;
  district?: string;
  code?: string;
  type?: string;
  slug?: string;
  name?: string;
  [key: string]: unknown;
}

const CATEGORY_ICONS: Record<string, string> = {
  coworking: "🏢",
  cafe: "☕",
  public_space: "📚",
  coliving: "🏠",
};

export function MalaysiaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof createMalaysiaMap> | null>(null);
  const pinsRef = useRef<Map<string, string>>(new Map());

  const locations = useMapStore((s) => s.locations);
  const selectedState = useMapStore((s) => s.selectedState);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const setIsLoading = useMapStore((s) => s.setIsLoading);

  const [mapReady, setMapReady] = useState(false);

  // Custom dark theme for the map
  const customTheme: Record<string, string> = {
    "--km-fill": "#1a1a2e",
    "--km-stroke": "#e0c97f",
    "--km-fill-hover": "#16213e",
    "--km-fill-selected": "#e0c97f",
    "--km-fill-district": "#0f3460",
    "--km-stroke-district": "#e0c97f",
    "--km-fill-hover-district": "#1a1a4e",
    "--km-text-fill": "#e0c97f",
    "--km-tooltip-bg": "#0d1b2a",
    "--km-tooltip-text": "#e0c97f",
    "--km-tooltip-border": "#e0c97f",
    "--km-pin-fill": "#e94560",
    "--km-pin-stroke": "#ffffff",
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = createMalaysiaMap(mapRef.current, {
      theme: customTheme,
      panel: false,
      tooltip: true,
      showDistricts: true,
      interactive: true,
      labels: false,
    });

    mapInstanceRef.current = map;
    queueMicrotask(() => setMapReady(true));

    // Handle state selection
    map.on("select", (payload: StateSelectPayload) => {
      if (payload.slug) {
        setSelectedState(payload.slug);
      } else {
        setSelectedState(null);
      }
    });

    return () => {
      if (map && typeof map.destroy === "function") {
        map.destroy();
      }
    };
  }, []);

  // Update pins when locations or state changes
  const updatePins = useCallback(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    // Clear existing pins
    pinsRef.current.forEach((pinId) => {
      try { map.removePin(pinId); } catch { /* ignore */ }
    });
    pinsRef.current.clear();

    // Add filtered location pins
    for (const loc of locations) {
      // Check state filter
      if (selectedState) {
        const stateMap: Record<string, string[]> = {
          'Kuala Lumpur': ['kuala-lumpur', 'putrajaya'],
          'Selangor': ['selangor'],
          'Penang': ['penang'],
          'Johor': ['johor'],
          'Melaka': ['melaka'],
          'Sabah': ['sabah'],
          'Sarawak': ['sarawak'],
        }
        const stateSlugs = stateMap[loc.state] || [];
        if (!stateSlugs.includes(selectedState)) continue;
      }

      try {
        const pinId = map.addPin({
          lng: loc.longitude,
          lat: loc.latitude,
          label: loc.name,
          id: loc.id,
        });
        pinsRef.current.set(loc.id, pinId);
      } catch (e) {
        // Skip pins that can't be placed (e.g., outside Malaysia bounds for East Malaysia)
      }
    }
  }, [locations, selectedState, mapReady]);

  useEffect(() => {
    updatePins();
  }, [updatePins]);

  // Focus on state when selected
  useEffect(() => {
    if (mapInstanceRef.current && selectedState) {
      try {
        mapInstanceRef.current.focus(selectedState);
      } catch {
        // Focus might fail for states not in the main map
      }
    }
  }, [selectedState]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div ref={mapRef} className="w-full h-full min-h-screen" />

      {/* Map overlay gradient for readability */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a0a0f]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0a0a0f]/90 to-transparent" />
      </div>

      {/* Floating legend */}
      <div className="absolute top-20 right-4 bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 rounded-lg p-3 pointer-events-auto">
        <p className="text-xs text-[#e0c97f]/60 mb-2 font-medium uppercase tracking-wider">Legend</p>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm">{CATEGORY_ICONS[key]}</span>
              <span className="text-xs text-[#e0c97f]/80">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* State name overlay */}
      {selectedState && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-[#0d1b2a]/80 backdrop-blur-md border border-[#e0c97f]/30 rounded-full px-5 py-2">
            <p className="text-[#e0c97f] font-semibold text-sm">
              {STATE_DISPLAY_NAMES[selectedState] || selectedState.replace(/-/g, " ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
