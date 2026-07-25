"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createMalaysiaMap } from "krackedmaps";
import "krackedmaps/css";
import { useMapStore, STATE_DISPLAY_NAMES, CATEGORY_CONFIG, SLUG_TO_STATE } from "@/lib/map-store";
import type { LocationPin } from "@/lib/map-store";

interface StateSelectPayload {
  state?: string;
  district?: string;
  code?: string;
  type?: string;
  slug?: string;
  name?: string;
  [key: string]: unknown;
}

export function MalaysiaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof createMalaysiaMap> | null>(null);
  const pinsRef = useRef<Map<string, string>>(new Map());

  const locations = useMapStore((s) => s.locations);
  const selectedState = useMapStore((s) => s.selectedState);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);

  const [mapReady, setMapReady] = useState(false);

  // Custom dark theme for the map
  const customTheme: Record<string, string> = {
    "--km-fill": "#1a1a2e",
    "--km-stroke": "rgba(224, 201, 127, 0.6)",
    "--km-fill-hover": "#16213e",
    "--km-fill-selected": "#e0c97f",
    "--km-fill-district": "#0f3460",
    "--km-stroke-district": "rgba(224, 201, 127, 0.4)",
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

  // Build a lookup map from venue ID → venue object (stable, avoids stale closures)
  const venueById = useMemo(() => {
    const map = new Map<string, LocationPin>();
    for (const loc of locations) {
      map.set(loc.id, loc);
    }
    return map;
  }, [locations]);

  // Get locations for selected state
  const visibleLocations = selectedState
    ? locations.filter((loc) => {
        const mappedState = SLUG_TO_STATE[selectedState] || selectedState;
        return loc.state === mappedState;
      })
    : locations;

  // Determine whether to abbreviate labels based on pin density
  const shouldAbbreviate = !selectedState && visibleLocations.length > 8;

  // Label resolver: full name when state-focused, abbreviated when too many pins
  const getPinLabel = useCallback(
    (loc: LocationPin): string => {
      if (!shouldAbbreviate) return loc.name;
      // Use area name (shorter, reduces overlap) — fall back to truncated name
      return loc.area.length <= 15 ? loc.area : loc.area.slice(0, 15) + '…';
    },
    [shouldAbbreviate],
  );

  // Update pins when locations or state changes
  const updatePins = useCallback(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    // Clear existing pins
    pinsRef.current.forEach((pinId) => {
      try { map.removePin(pinId); } catch { /* ignore */ }
    });
    pinsRef.current.clear();

    // Add filtered location pins with label optimization
    for (const loc of visibleLocations) {
      try {
        const pinId = map.addPin({
          lng: loc.longitude,
          lat: loc.latitude,
          label: getPinLabel(loc),
          id: loc.id,
        });
        pinsRef.current.set(loc.id, pinId);
      } catch {
        // Skip pins outside bounds
      }
    }
  }, [visibleLocations, mapReady, getPinLabel]);

  useEffect(() => {
    updatePins();
  }, [updatePins]);

  // Pin click handler — krackedmaps has no pinClick event, so we use DOM delegation
  // Pins are rendered as <g class="pin" data-id="venueId"> in the SVG
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const handlePinClick = (e: MouseEvent) => {
      const pinEl = (e.target as Element).closest('.pin');
      if (!pinEl) return;

      const venueId = pinEl.getAttribute('data-id');
      if (!venueId) return;

      const venue = venueById.get(venueId);
      if (venue) {
        setSelectedVenue(venue);
      }
    };

    mapInstanceRef.current.root.addEventListener('click', handlePinClick);
    return () => {
      mapInstanceRef.current?.root.removeEventListener('click', handlePinClick);
    };
  }, [mapReady, venueById, setSelectedVenue]);

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

  // Venue count for selected state
  const venueCount = visibleLocations.length;

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0a0a0f] overflow-hidden">
      <div ref={mapRef} className="w-full h-full min-h-screen" />

      {/* Map overlay gradient for readability */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a0a0f]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#0a0a0f]/90 to-transparent" />
      </div>

      {/* Floating legend — glass-card enhanced */}
      <div className="absolute top-20 right-4 glass-card p-4 pointer-events-auto min-w-[140px]">
        <p className="text-[10px] text-[#e0c97f]/50 mb-3 font-semibold uppercase tracking-widest">Legend</p>
        <div className="space-y-2">
          {(Object.entries(CATEGORY_CONFIG) as [string, { label: string; color: string; emoji: string }][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2.5 min-w-0">
              <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs card-hover-lift" style={{ backgroundColor: cfg.color + '20' }}>
                {cfg.emoji}
              </div>
              <span className="text-[11px] text-[#e0c97f]/70 whitespace-nowrap truncate">{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Animated venue count in view */}
        <div className="mt-3 pt-3 border-t border-[#e0c97f]/10">
          <p className="text-[10px] text-[#e0c97f]/30 whitespace-nowrap">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={venueCount}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="inline-block font-semibold text-[#e0c97f]/50"
              >
                {venueCount}
              </motion.span>
            </AnimatePresence>{" "}
            venue{venueCount !== 1 ? "s" : ""} in view
          </p>
        </div>
      </div>

      {/* State name overlay — animated with gold glow */}
      <AnimatePresence>
        {selectedState && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="bg-[#0d1b2a]/80 backdrop-blur-md border border-[#e0c97f]/30 rounded-full px-5 py-2 shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(224,201,127,0.08)' }}
            >
              <p className="text-[#e0c97f] font-semibold text-sm tracking-wide gold-gradient-text">
                {STATE_DISPLAY_NAMES[selectedState] || selectedState.replace(/-/g, " ")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
