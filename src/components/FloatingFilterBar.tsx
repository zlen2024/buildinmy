"use client";

import { useMapStore, STATE_DISPLAY_NAMES, CATEGORY_CONFIG, SLUG_TO_STATE, useFilteredLocations, type VenueCategory } from "@/lib/map-store";
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
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search suggestions - memoized
  const suggestions = useMemo(() => {
    if (searchQuery.length === 0) return [];
    const q = searchQuery.toLowerCase();
    return locations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.area.toLowerCase().includes(q) ||
          loc.state.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, locations]);

  // Keyboard navigation handler for search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          setSearchQuery(suggestions[highlightedIndex].name);
          setShowSuggestions(false);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
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

  // Count of active filters for badge
  const activeFilterCount = [
    activeCategories.length > 0 ? activeCategories.length : 0,
    minWifiSpeed > 0 ? 1 : 0,
    highPowerSockets ? 1 : 0,
    quietEnvironment ? 1 : 0,
    callFriendly ? 1 : 0,
    selectedState !== null ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Live filtered count from the actual filter selector
  const filteredLocations = useFilteredLocations();
  const filteredCount = filteredLocations.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto p-3 sm:p-4">
        <div className="pointer-events-auto glass-strong rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative">
          {/* Gradient top border accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e0c97f]/40 to-transparent" />
          {/* Search row */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3">
            <div ref={searchRef} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0c97f]/30" />
              <input
                type="text"
                placeholder="Search places, areas, states..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#e0c97f]/5 border border-[#e0c97f]/10 rounded-xl text-sm text-[#e0c97f] placeholder:text-[#e0c97f]/25 focus:outline-none focus:border-[#e0c97f]/25 focus:bg-[#e0c97f]/8 focus:shadow-[0_0_0_3px_rgba(224,201,127,0.08)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#e0c97f]/30 hover:text-[#e0c97f]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Search suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-[#0d1b2a] border border-[#e0c97f]/15 rounded-xl overflow-hidden shadow-xl shadow-black/40"
                  >
                    {suggestions.map((loc, i) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSearchQuery(loc.name);
                          setShowSuggestions(false);
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left border-b border-[#e0c97f]/5 last:border-0",
                          i === highlightedIndex
                            ? "bg-[#e0c97f]/12 text-[#e0c97f] border-l-2 border-[#e0c97f]"
                            : "hover:bg-[#e0c97f]/8"
                        )}
                      >
                        <span className="text-sm">{CATEGORY_CONFIG[loc.category as VenueCategory]?.emoji || "📍"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#e0c97f] truncate">{loc.name}</p>
                          <p className="text-[10px] text-[#e0c97f]/35">{loc.area}, {loc.state}</p>
                        </div>
                        <span className="text-[10px] text-[#e0c97f]/30">{loc.avgDownloadMbps} Mbps</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex-shrink-0",
                hasActiveFilters
                  ? "bg-[#e0c97f]/15 border-[#e0c97f]/25 text-[#e0c97f] pulse-gold"
                  : "bg-[#e0c97f]/5 border-[#e0c97f]/8 text-[#e0c97f]/40 hover:text-[#e0c97f]/70"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 rounded-full bg-[#e94560] text-[9px] font-bold text-white flex items-center justify-center px-1">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Result count */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e0c97f]/5 rounded-lg flex-shrink-0">
              <span className="text-[10px] font-medium text-[#e0c97f]/40">{filteredCount}</span>
              <span className="text-[10px] text-[#e0c97f]/25">places</span>
            </div>
          </div>

          {/* Category pills + state badge + reset */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 pb-2.5 sm:pb-3 flex-wrap">
            {(Object.entries(CATEGORY_CONFIG) as [VenueCategory, typeof CATEGORY_CONFIG[VenueCategory]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border",
                    activeCategories.includes(key)
                      ? "bg-[#e0c97f]/12 border-[#e0c97f]/25 text-[#e0c97f]"
                      : "bg-transparent border-[#e0c97f]/8 text-[#e0c97f]/35 hover:border-[#e0c97f]/15 hover:text-[#e0c97f]/55"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {cfg.label}
                </button>
              )
            )}

            {selectedState && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#e0c97f]/12 border border-[#e0c97f]/25 text-[11px] font-medium text-[#e0c97f]">
                {STATE_DISPLAY_NAMES[selectedState] || selectedState}
                <button onClick={() => setSelectedState(null)} className="ml-0.5 hover:text-[#e0c97f]/60">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] text-[#e94560]/70 hover:text-[#e94560] hover:bg-[#e94560]/8 transition-all border border-[#e94560]/15"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>

          {/* Expanded filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-[#e0c97f]/8 overflow-hidden"
              >
                <div className="p-4 space-y-5 bg-[#0d1b2a]/50">
                  {/* Wi-Fi Speed Slider */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#e0c97f]/50">
                        <Wifi className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span className="font-medium">Min Wi-Fi Speed</span>
                      </div>
                      <span className="text-xs font-mono text-[#e0c97f] bg-[#e0c97f]/5 px-2 py-0.5 rounded">
                        {minWifiSpeed === 0 ? "Any" : `> ${minWifiSpeed} Mbps`}
                      </span>
                    </div>
                    <Slider
                      value={[minWifiSpeed]}
                      onValueChange={([val]) => setMinWifiSpeed(val)}
                      max={300}
                      step={10}
                      className="[&_[role=slider]]:bg-[#e0c97f] [&_[role=slider]]:border-[#e0c97f] [&>.bg-border]:bg-[#e0c97f]/15"
                    />
                    <div className="flex justify-between text-[9px] text-[#e0c97f]/25 px-0.5">
                      <span>Any</span>
                      <span>50</span>
                      <span>100</span>
                      <span>200</span>
                      <span>300</span>
                    </div>
                  </div>

                  {/* Productivity toggles */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-[#e0c97f]/35 font-semibold uppercase tracking-wider">Productivity Filters</p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        active={highPowerSockets}
                        onClick={() => setHighPowerSockets(!highPowerSockets)}
                        icon={<Plug className="w-3.5 h-3.5" />}
                        label="High Socket Density"
                        activeColor="#22c55e"
                      />
                      <FilterChip
                        active={quietEnvironment}
                        onClick={() => setQuietEnvironment(!quietEnvironment)}
                        icon={<Volume2 className="w-3.5 h-3.5" />}
                        label="Quiet Environment"
                        activeColor="#3b82f6"
                      />
                      <FilterChip
                        active={callFriendly}
                        onClick={() => setCallFriendly(!callFriendly)}
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Call Friendly"
                        activeColor="#a855f7"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function FilterChip({ active, onClick, icon, label, activeColor }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  activeColor: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200",
        active
          ? "border-opacity-30 shadow-sm"
          : "bg-transparent border-[#e0c97f]/8 text-[#e0c97f]/35 hover:text-[#e0c97f]/55 hover:border-[#e0c97f]/15"
      )}
      style={active ? {
        backgroundColor: activeColor + "12",
        borderColor: activeColor + "40",
        color: activeColor,
      } : undefined}
    >
      {icon}
      {label}
    </button>
  );
}
