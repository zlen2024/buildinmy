"use client";

import { useMapStore, STATE_DISPLAY_NAMES, CATEGORY_CONFIG, type VenueCategory, ACTIVE_STATES } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  Search,
  Wifi,
  Plug,
  Volume2,
  Phone,
  RotateCcw,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function FloatingFilterBar() {
  const searchQuery = useMapStore((s) => s.searchQuery);
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);
  const activeCategories = useMapStore((s) => s.activeCategories);
  const toggleCategory = useMapStore((s) => s.toggleCategory);
  const minWifiSpeed = useMapStore((s) => s.minWifiSpeed);
  const setMinWifiSpeed = useMapStore((s) => s.setMinWifiSpeed);
  const highPowerSockets = useMapStore((s) => s.highPowerSockets);
  const setHighPowerSockets = useMapStore((s) => s.setHighPowerSockets);
  const quietEnvironment = useMapStore((s) => s.quietEnvironment);
  const setQuietEnvironment = useMapStore((s) => s.setQuietEnvironment);
  const callFriendly = useMapStore((s) => s.callFriendly);
  const setCallFriendly = useMapStore((s) => s.setCallFriendly);
  const resetFilters = useMapStore((s) => s.resetFilters);
  const selectedState = useMapStore((s) => s.selectedState);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const locations = useMapStore((s) => s.locations);

  const [showFilters, setShowFilters] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search suggestions
  const suggestions = searchQuery.length > 0
    ? locations
        .filter(
          (loc) =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.state.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    activeCategories.length > 0 ||
    minWifiSpeed > 0 ||
    highPowerSockets ||
    quietEnvironment ||
    callFriendly ||
    selectedState !== null;

  const filteredCount = (() => {
    let count = locations.length;
    if (selectedState) {
      const stateMap: Record<string, string[]> = {
        'Kuala Lumpur': ['kuala-lumpur', 'putrajaya'],
        'Selangor': ['selangor'],
        'Penang': ['penang'],
        'Johor': ['johor'],
        'Melaka': ['melaka'],
        'Sabah': ['sabah'],
        'Sarawak': ['sarawak'],
      };
      const stateSlugs = stateMap[selectedState] || [];
      // Use actual counts
      const stateNameMap: Record<string, string> = {
        'kuala-lumpur': 'Kuala Lumpur',
        'putrajaya': 'Kuala Lumpur',
        'selangor': 'Selangor',
        'penang': 'Penang',
        'johor': 'Johor',
        'melaka': 'Melaka',
        'sabah': 'Sabah',
        'sarawak': 'Sarawak',
      };
      if (selectedState) {
        const mappedState = stateNameMap[selectedState] || selectedState;
        count = locations.filter((l) => l.state === mappedState).length;
      }
    }
    return count;
  })();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-4xl mx-auto p-4">
        <div className="pointer-events-auto bg-[#0d1b2a]/95 backdrop-blur-xl border border-[#e0c97f]/15 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Search row */}
          <div className="flex items-center gap-3 p-3">
            <div ref={searchRef} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0c97f]/40" />
              <input
                type="text"
                placeholder="Search places, areas, states..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#e0c97f]/5 border border-[#e0c97f]/10 rounded-xl text-sm text-[#e0c97f] placeholder:text-[#e0c97f]/30 focus:outline-none focus:border-[#e0c97f]/30 focus:bg-[#e0c97f]/8 transition-all"
              />
              {/* Search suggestions dropdown */}
              {showSearchSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#0d1b2a] border border-[#e0c97f]/20 rounded-xl overflow-hidden shadow-xl">
                  {suggestions.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSearchQuery(loc.name);
                        setShowSearchSuggestions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#e0c97f]/8 transition-colors text-left"
                    >
                      <span className="text-xs">
                        {CATEGORY_CONFIG[loc.category as VenueCategory]?.label || loc.category}
                      </span>
                      <span className="text-sm text-[#e0c97f] truncate">{loc.name}</span>
                      <span className="ml-auto text-[10px] text-[#e0c97f]/40">{loc.area}, {loc.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2.5 rounded-xl border transition-all",
                hasActiveFilters
                  ? "bg-[#e0c97f]/15 border-[#e0c97f]/30 text-[#e0c97f]"
                  : "bg-[#e0c97f]/5 border-[#e0c97f]/10 text-[#e0c97f]/50 hover:text-[#e0c97f]/80"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Result count */}
            <div className="flex items-center gap-2 text-xs text-[#e0c97f]/40">
              <span className="hidden sm:inline">{filteredCount} places</span>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
            {(Object.entries(CATEGORY_CONFIG) as [VenueCategory, typeof CATEGORY_CONFIG[VenueCategory]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    activeCategories.includes(key)
                      ? "bg-[#e0c97f]/15 border-[#e0c97f]/30 text-[#e0c97f]"
                      : "bg-transparent border-[#e0c97f]/10 text-[#e0c97f]/40 hover:border-[#e0c97f]/20 hover:text-[#e0c97f]/60"
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCategories.includes(key) ? cfg.color : cfg.color + "60" }} />
                  {cfg.label}
                </button>
              )
            )}

            {/* Selected state badge */}
            {selectedState && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#e0c97f]/15 border border-[#e0c97f]/30 text-xs font-medium text-[#e0c97f]">
                {STATE_DISPLAY_NAMES[selectedState] || selectedState}
                <button onClick={() => setSelectedState(null)} className="ml-1 hover:text-[#e0c97f]/60">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] text-[#e0c97f]/30 hover:text-[#e94560] hover:bg-[#e94560]/10 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Expanded filters panel */}
          {showFilters && (
            <div className="border-t border-[#e0c97f]/10 p-4 space-y-4 bg-[#0d1b2a]/50">
              {/* Wi-Fi Speed Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#e0c97f]/60">
                    <Wifi className="w-3.5 h-3.5" />
                    Min Wi-Fi Speed
                  </div>
                  <span className="text-xs font-mono text-[#e0c97f]">
                    {minWifiSpeed === 0 ? "Any" : `> ${minWifiSpeed} Mbps`}
                  </span>
                </div>
                <Slider
                  value={[minWifiSpeed]}
                  onValueChange={([val]) => setMinWifiSpeed(val)}
                  max={300}
                  step={10}
                  className="[&_[role=slider]]:bg-[#e0c97f] [&_[role=slider]]:border-[#e0c97f] [&>.bg-border]:bg-[#e0c97f]/20"
                />
                <div className="flex justify-between text-[10px] text-[#e0c97f]/30">
                  <span>Any</span>
                  <span>50 Mbps</span>
                  <span>100 Mbps</span>
                  <span>200 Mbps</span>
                  <span>300 Mbps</span>
                </div>
              </div>

              {/* Productivity toggles */}
              <div className="space-y-2">
                <p className="text-xs text-[#e0c97f]/40 font-medium">Productivity</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setHighPowerSockets(!highPowerSockets)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                      highPowerSockets
                        ? "bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]"
                        : "bg-transparent border-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f]/60"
                    )}
                  >
                    <Plug className="w-3.5 h-3.5" />
                    High Socket Density
                  </button>
                  <button
                    onClick={() => setQuietEnvironment(!quietEnvironment)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                      quietEnvironment
                        ? "bg-[#3b82f6]/15 border-[#3b82f6]/30 text-[#3b82f6]"
                        : "bg-transparent border-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f]/60"
                    )}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Quiet Environment
                  </button>
                  <button
                    onClick={() => setCallFriendly(!callFriendly)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                      callFriendly
                        ? "bg-[#a855f7]/15 border-[#a855f7]/30 text-[#a855f7]"
                        : "bg-transparent border-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f]/60"
                    )}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Friendly
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
