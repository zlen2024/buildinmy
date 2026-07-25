"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createMalaysiaMap } from "krackedmaps";
import "krackedmaps/css";
import { useMapStore, STATE_DISPLAY_NAMES, CATEGORY_CONFIG, SLUG_TO_STATE } from "@/lib/map-store";
import type { LocationPin } from "@/lib/map-store";
import { MapPinTooltip } from "@/components/MapPinTooltip";
import { QuickStatsOverlay } from "@/components/QuickStatsOverlay";
import { WeatherWidget } from "@/components/WeatherWidget";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { Wifi, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const selectedVenue = useMapStore((s) => s.selectedVenue);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const showWifiHeatmap = useMapStore((s) => s.showWifiHeatmap);
  const toggleWifiHeatmap = useMapStore((s) => s.toggleWifiHeatmap);

  const [mapReady, setMapReady] = useState(false);
  const [hoveredVenue, setHoveredVenue] = useState<LocationPin | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

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

  // Pin hover tooltip — event delegation on SVG .pin[data-id] groups
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const map = mapInstanceRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const pinEl = (e.target as Element).closest('.pin[data-id]');
      if (!pinEl) return;

      const venueId = pinEl.getAttribute('data-id');
      if (!venueId) return;

      const venue = venueById.get(venueId);
      if (venue) {
        setHoveredVenue(venue);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseLeave = () => {
      setHoveredVenue(null);
      setTooltipPosition(null);
    };

    map.root.addEventListener('mousemove', handleMouseMove);
    map.root.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      map.root.removeEventListener('mousemove', handleMouseMove);
      map.root.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mapReady, venueById]);

  // Venue count for selected state
  const venueCount = visibleLocations.length;

  // Wi-Fi speed by state for heatmap
  const wifiSpeedByState = useMemo(() => {
    const stateMap = new Map<string, { total: number; count: number }>();
    for (const loc of locations) {
      const existing = stateMap.get(loc.state) || { total: 0, count: 0 };
      stateMap.set(loc.state, { total: existing.total + loc.avgDownloadMbps, count: existing.count + 1 });
    }
    return Array.from(stateMap.entries())
      .map(([state, { total, count }]) => ({
        state,
        avgSpeed: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgSpeed - a.avgSpeed);
  }, [locations]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0a0a0f] overflow-hidden">
      <StarfieldBackground />
      <div ref={mapRef} className="w-full h-full min-h-screen" />

      {/* Vignette effect around map edges */}
      <div className="vignette-overlay" />

      {/* Map pin hover tooltip — hidden when venue drawer is open */}
      <MapPinTooltip venue={selectedVenue ? null : hoveredVenue} position={selectedVenue ? null : tooltipPosition} />

      {/* Map overlay gradient for readability */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a0a0f]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#0a0a0f]/90 to-transparent" />
      </div>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Quick Stats Overlay */}
      <QuickStatsOverlay
        visibleLocations={visibleLocations}
        selectedState={selectedState}
        sidebarOpen={sidebarOpen}
      />

      {/* Floating legend — glass-card enhanced with hover animations */}
      <div className="absolute top-20 right-4 glass-card p-4 pointer-events-auto min-w-[140px]">
        <p className="text-[10px] text-[#e0c97f]/50 mb-3 font-semibold uppercase tracking-widest">Legend</p>
        <div className="space-y-2">
          {(Object.entries(CATEGORY_CONFIG) as [string, { label: string; color: string; emoji: string }][]).map(([key, cfg]) => (
            <div
              key={key}
              className="flex items-center gap-2.5 min-w-0 legend-item-hover cursor-default"
              style={{ '--legend-color': cfg.color + '30' } as React.CSSProperties}
            >
              <div
                className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs legend-icon"
                style={{ backgroundColor: cfg.color + '20' }}
              >
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

        {/* Wi-Fi Heatmap Toggle */}
        <div className="mt-3 pt-3 border-t border-[#e0c97f]/10">
          <button
            onClick={toggleWifiHeatmap}
            className={cn(
              "flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-300 border",
              showWifiHeatmap
                ? "bg-[#22c55e]/12 border-[#22c55e]/30 text-[#22c55e]"
                : "bg-transparent border-[#e0c97f]/8 text-[#e0c97f]/35 hover:text-[#e0c97f]/60 hover:border-[#e0c97f]/15"
            )}
          >
            {showWifiHeatmap ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <Activity className="w-3.5 h-3.5" />
            )}
            {showWifiHeatmap ? "Heatmap On" : "Wi-Fi Heatmap"}
          </button>
        </div>
      </div>

      {/* Wi-Fi Speed Heatmap Overlay */}
      <AnimatePresence>
        {showWifiHeatmap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-52 right-4 glass-card p-4 pointer-events-auto min-w-[200px] max-w-[240px]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-[#22c55e]" />
              <p className="text-[11px] text-[#e0c97f]/60 font-semibold">Avg Wi-Fi by State</p>
            </div>
            <div className="space-y-1.5">
              {wifiSpeedByState.map(({ state, avgSpeed, count }) => (
                <div key={state} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#e0c97f]/50 w-12 truncate">{state.replace('Kuala Lumpur', 'KL')}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#e0c97f]/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (avgSpeed / 300) * 100)}%`,
                        background: avgSpeed > 100
                          ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                          : avgSpeed > 50
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#e0c97f]/60 w-16 text-right">{avgSpeed} <span className="text-[#e0c97f]/30">Mbps</span></span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[#e0c97f]/8 flex items-center justify-between">
              <span className="text-[8px] text-[#e0c97f]/20">Slower</span>
              <div className="flex gap-px">
                <div className="w-3 h-1.5 rounded-sm bg-[#ef4444]/60" />
                <div className="w-3 h-1.5 rounded-sm bg-[#f59e0b]/60" />
                <div className="w-3 h-1.5 rounded-sm bg-[#22c55e]/60" />
              </div>
              <span className="text-[8px] text-[#e0c97f]/20">Faster</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="bg-[#0d1b2a]/85 backdrop-blur-md border border-[#e0c97f]/30 rounded-full px-5 py-2.5 shadow-lg state-badge-glow"
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
