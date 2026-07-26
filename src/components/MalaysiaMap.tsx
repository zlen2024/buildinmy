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
import { DistrictPanel } from "@/components/DistrictPanel";
import { Wifi, Activity, ZoomIn, ZoomOut, Crosshair, Plus, Minus, LocateFixed, ChevronDown } from "lucide-react";
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

interface DrillPayload {
  state?: string;
  district?: string;
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
  const selectedDistrict = useMapStore((s) => s.selectedDistrict);
  const selectedVenue = useMapStore((s) => s.selectedVenue);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const setSelectedDistrict = useMapStore((s) => s.setSelectedDistrict);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const showWifiHeatmap = useMapStore((s) => s.showWifiHeatmap);
  const toggleWifiHeatmap = useMapStore((s) => s.toggleWifiHeatmap);
  const resetFilters = useMapStore((s) => s.resetFilters);

  const [mapReady, setMapReady] = useState(false);
  const [hoveredVenue, setHoveredVenue] = useState<LocationPin | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  // Custom dark theme for the map (uses krackedmaps' actual CSS variable names)
  const customTheme: Record<string, string> = {
    "--sea": "#06080f",
    "--grid": "rgba(224, 201, 127, 0.04)",
    "--grid-size": "44px",
    "--land": "#0f1830",
    "--land-hover": "#1a2548",
    "--land-active": "#e0c97f",
    "--stroke": "rgba(224, 201, 127, 0.45)",
    "--stroke-w": "1",
    "--district": "#0d1b3a",
    "--carve": "rgba(224, 201, 127, 0.35)",
    "--carve-w": "0.6",
    "--district-hi": "#e0c97f",
    "--label": "#e0c97f",
    "--label-dim": "rgba(224, 201, 127, 0.5)",
    "--pin": "#e94560",
    "--pin-ring": "rgba(233, 69, 96, 0.45)",
    "--accent": "#e0c97f",
    "--panel-bg": "#0d1b2a",
    "--panel-edge": "rgba(224, 201, 127, 0.25)",
  };

  // Track whether we've drilled into a state (district view active)
  // Derived from selectedState + drill event flag for more accuracy
  const [drillEventFired, setDrillEventFired] = useState(false);

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

    // Handle drill into state (zoom to district view).
    // krackedmaps emits `drill` with payload = state slug string (when drilling in)
    // or null (when drilling out). We also support object payload for forward-compat.
    map.on("drill", (payload: string | DrillPayload | null) => {
      const stateSlug = typeof payload === "string"
        ? payload
        : (payload && (payload.state || payload.slug)) || null;
      setDrillEventFired(!!stateSlug);
      if (!stateSlug) {
        // Drill-out event — clear district selection
        setSelectedDistrict(null);
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

  // Get locations for selected state (+ district)
  const visibleLocations = useMemo(() => {
    if (!selectedState) return locations;
    const mappedState = SLUG_TO_STATE[selectedState] || selectedState;
    return locations.filter((loc) => {
      if (loc.state !== mappedState) return false;
      if (selectedDistrict && loc.district !== selectedDistrict) return false;
      return true;
    });
  }, [locations, selectedState, selectedDistrict]);

  // Determine label visibility based on density and zoom level.
  // - No state selected + few pins (<=4): show full names
  // - Otherwise: HIDE labels — too dense or too zoomed in, use hover tooltips only
  // This keeps the map clean and avoids overlap; the MapPinTooltip + bottom-left
  // coordinate display provide context on hover.
  const labelMode: 'full' | 'hidden' =
    !selectedState && visibleLocations.length <= 4 ? 'full' : 'hidden';

  // Label resolver based on mode
  const getPinLabel = useCallback(
    (loc: LocationPin): string => {
      switch (labelMode) {
        case 'full':
          return loc.name.length <= 24 ? loc.name : loc.name.slice(0, 24) + '…';
        case 'hidden':
        default:
          return ''; // No label — pins show on hover only
      }
    },
    [labelMode],
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

  // Derived: are we drilled into a state?
  const isDrilledIn = !!selectedState && drillEventFired;

  // Focus + drill into state when selected (district-level zoom)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (selectedState) {
      try {
        map.focus(selectedState);
        // Drill into the state to reveal district boundaries
        if (typeof map.drillInto === "function") {
          map.drillInto(selectedState);
        }
      } catch {
        // Focus might fail for states not in the main map
      }
    } else {
      // Exit district view
      try {
        if (typeof map.drillInto === "function") {
          map.drillInto(null);
        }
        map.focus(null);
      } catch {
        /* ignore */
      }
    }
  }, [selectedState]);

  // Highlight selected district on the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    try {
      if (selectedDistrict && typeof map.selectDistrict === "function") {
        map.selectDistrict(selectedDistrict);
      } else if (typeof map.selectDistrict === "function") {
        // Deselect district when null — call with empty string or skip
        // krackedmaps selectDistrict(key) — passing empty string clears highlight
        map.selectDistrict("");
      }
    } catch {
      /* ignore */
    }
  }, [selectedDistrict, isDrilledIn]);

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

      {/* District panel — shown when state is selected */}
      <DistrictPanel />

      {/* Drill controls — visible only when drilled in */}
      <AnimatePresence>
        {isDrilledIn && selectedState && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
            style={{ marginLeft: "130px" }}
          >
            <div className="flex items-center gap-1.5 bg-[#0d1b2a]/85 backdrop-blur-md border border-[#e0c97f]/30 rounded-full p-1 shadow-lg state-badge-glow">
              <button
                onClick={() => {
                  setSelectedDistrict(null);
                  setSelectedState(null);
                }}
                aria-label="Exit district zoom"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#e0c97f]/70 hover:text-[#e0c97f] hover:bg-[#e0c97f]/10 transition-all"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                Exit zoom
              </button>
              {selectedDistrict && (
                <>
                  <div className="w-px h-4 bg-[#e0c97f]/15" />
                  <button
                    onClick={() => setSelectedDistrict(null)}
                    aria-label="Show all districts"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#e0c97f]/70 hover:text-[#e0c97f] hover:bg-[#e0c97f]/10 transition-all"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    All districts
                  </button>
                </>
              )}
              <div className="w-px h-4 bg-[#e0c97f]/15" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#e0c97f]/40">
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="font-mono">
                  {selectedDistrict || "District view"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Floating legend — glass-card enhanced with hover animations + collapse toggle */}
      <div className="absolute top-20 right-4 glass-card pointer-events-auto min-w-[140px] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <p className="text-[10px] text-[#e0c97f]/50 font-semibold uppercase tracking-widest">Legend</p>
          <button
            onClick={() => setLegendCollapsed((v) => !v)}
            aria-label={legendCollapsed ? "Expand legend" : "Collapse legend"}
            title={legendCollapsed ? "Expand" : "Collapse"}
            className="w-5 h-5 rounded flex items-center justify-center text-[#e0c97f]/40 hover:text-[#e0c97f] hover:bg-[#e0c97f]/8 transition-colors"
          >
            <motion.div animate={{ rotate: legendCollapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </button>
        </div>
        <AnimatePresence initial={false}>
          {!legendCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
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
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Bottom-center context strip — shows state + district breadcrumb */}
      <AnimatePresence>
        {selectedState && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="absolute bottom-44 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          >
            <div className="bg-[#0d1b2a]/85 backdrop-blur-md border border-[#e0c97f]/25 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 state-badge-glow">
              <span className="text-[11px] text-[#e0c97f]/45 uppercase tracking-widest font-semibold">
                {STATE_DISPLAY_NAMES[selectedState] || selectedState.replace(/-/g, ' ')}
              </span>
              {selectedDistrict && (
                <>
                  <span className="text-[#e0c97f]/20">/</span>
                  <span className="text-[11px] text-[#e0c97f] font-semibold gold-gradient-text">
                    {selectedDistrict}
                  </span>
                </>
              )}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#e0c97f]/10 text-[9px] text-[#e0c97f]/60 font-mono">
                {visibleLocations.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map zoom controls — bottom-right above filter bar */}
      <div className="absolute bottom-32 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            if (selectedState && mapInstanceRef.current) {
              try { mapInstanceRef.current.focus(selectedState); } catch { /* ignore */ }
            }
          }}
          disabled={!selectedState}
          aria-label="Zoom in"
          title="Zoom in (focus selected state)"
          className={cn(
            "w-9 h-9 rounded-lg glass-card flex items-center justify-center transition-all duration-200 group",
            selectedState
              ? "hover:border-[#e0c97f]/40 hover:bg-[#e0c97f]/8 text-[#e0c97f]/80 hover:text-[#e0c97f]"
              : "opacity-40 cursor-not-allowed text-[#e0c97f]/40"
          )}
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => {
            setSelectedDistrict(null);
            setSelectedState(null);
          }}
          disabled={!selectedState}
          aria-label="Zoom out"
          title="Zoom out (exit state)"
          className={cn(
            "w-9 h-9 rounded-lg glass-card flex items-center justify-center transition-all duration-200 group",
            selectedState
              ? "hover:border-[#e0c97f]/40 hover:bg-[#e0c97f]/8 text-[#e0c97f]/80 hover:text-[#e0c97f]"
              : "opacity-40 cursor-not-allowed text-[#e0c97f]/40"
          )}
        >
          <Minus className="w-4 h-4 transition-transform group-hover:scale-110" />
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            setSelectedDistrict(null);
            setSelectedState(null);
            resetFilters();
          }}
          aria-label="Reset view"
          title="Reset all filters"
          className="w-9 h-9 rounded-lg glass-card flex items-center justify-center transition-all duration-200 group hover:border-[#e94560]/40 hover:bg-[#e94560]/8 text-[#e0c97f]/80 hover:text-[#e94560]"
        >
          <LocateFixed className="w-4 h-4 transition-transform group-hover:rotate-90" />
        </motion.button>
      </div>

      {/* Pin density indicator — top-right below legend */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-[280px] right-4 z-20 pointer-events-auto"
      >
        <div className="glass-card px-3 py-2 min-w-[140px]">
          <p className="text-[9px] text-[#e0c97f]/40 mb-1.5 font-semibold uppercase tracking-widest">
            Pin Density
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-4">
              {[0.4, 0.65, 0.85, 1].map((threshold, i) => {
                const fillRatio = Math.min(1, visibleLocations.length / 30);
                const isFilled = fillRatio >= threshold;
                const colors = ['#22c55e', '#84cc16', '#f59e0b', '#ef4444'];
                const labels = ['Sparse', 'Moderate', 'Dense', 'Very Dense'];
                const activeIdx = fillRatio < 0.25 ? 0 : fillRatio < 0.5 ? 1 : fillRatio < 0.75 ? 2 : 3;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(i + 1) * 25}%` }}
                    transition={{ delay: 0.3 + i * 0.05, type: 'spring', damping: 18 }}
                    className="w-1 rounded-sm transition-colors"
                    style={{
                      backgroundColor: isFilled ? colors[activeIdx] : 'rgba(224, 201, 127, 0.12)',
                    }}
                  />
                );
              })}
            </div>
            <span
              className="text-[10px] font-medium ml-1"
              style={{
                color:
                  visibleLocations.length < 8 ? '#22c55e'
                  : visibleLocations.length < 16 ? '#84cc16'
                  : visibleLocations.length < 24 ? '#f59e0b'
                  : '#ef4444',
              }}
            >
              {visibleLocations.length < 8 ? 'Sparse'
                : visibleLocations.length < 16 ? 'Moderate'
                : visibleLocations.length < 24 ? 'Dense'
                : 'Very Dense'}
            </span>
            <span className="ml-auto text-[10px] text-[#e0c97f]/40 font-mono">
              {visibleLocations.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Coordinate + scale display — bottom-left */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-32 left-4 z-20 pointer-events-none"
      >
        <div className="glass-card px-3 py-2 min-w-[180px]">
          <p className="text-[9px] text-[#e0c97f]/40 mb-1 font-semibold uppercase tracking-widest">
            {hoveredVenue ? 'Hovered Pin' : 'Map Center'}
          </p>
          <p className="text-[10px] text-[#e0c97f]/70 font-mono">
            {hoveredVenue
              ? `${hoveredVenue.latitude.toFixed(4)}, ${hoveredVenue.longitude.toFixed(4)}`
              : selectedState
                ? `${STATE_DISPLAY_NAMES[selectedState] || selectedState} region`
                : 'Malaysia (3.1390°N, 101.6869°E)'}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="map-scale-bar h-1 w-12 rounded-sm" />
            <span className="text-[9px] text-[#e0c97f]/40 font-mono">
              {selectedState ? '20km' : '200km'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
