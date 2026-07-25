"use client";

import { useMemo, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Wifi,
  Plug,
  Volume2,
  Armchair,
  Snowflake,
  Phone,
  Coffee,
  Ticket,
  Train,
  Eye,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import {
  useMapStore,
  CATEGORY_CONFIG,
  type LocationPin,
  type VenueCategory,
  type PowerDensity,
  type NoiseLevel,
} from "@/lib/map-store";

type BestDirection = "higher" | "lower";

interface MetricRow {
  key: string;
  label: string;
  icon: React.ReactNode;
  direction: BestDirection;
  getValue: (v: LocationPin) => number | null;
  render: (v: LocationPin, isBest: boolean) => React.ReactNode;
}

const NOISE_ORDER: Record<NoiseLevel, number> = {
  silent: 4,
  quiet: 3,
  moderate: 2,
  loud: 1,
};

const POWER_ORDER: Record<PowerDensity, number> = {
  high: 4,
  moderate: 3,
  sparse: 2,
  none: 1,
};

function getWifiColor(mbps: number): string {
  if (mbps >= 100) return "#22c55e";
  if (mbps >= 50) return "#f59e0b";
  return "#e94560";
}

function getWifiBarWidth(mbps: number): number {
  return Math.min(100, (mbps / 200) * 100);
}

function getNoiseColor(level: NoiseLevel): string {
  switch (level) {
    case "silent": return "#22c55e";
    case "quiet": return "#3b82f6";
    case "moderate": return "#f59e0b";
    case "loud": return "#e94560";
  }
}

function getPowerColor(density: PowerDensity): string {
  switch (density) {
    case "high": return "#22c55e";
    case "moderate": return "#f59e0b";
    case "sparse": return "#e94560";
    case "none": return "#6b7280";
  }
}

function renderStars(rating: number | null): React.ReactNode {
  if (rating === null) return <span className="text-[11px] text-white/20">N/A</span>;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < full
                ? "text-[#f59e0b] fill-[#f59e0b]"
                : i === full && hasHalf
                  ? "text-[#f59e0b]/50 fill-[#f59e0b]/50"
                  : "text-white/10"
            }`}
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold text-white/80">{rating.toFixed(1)}</span>
    </div>
  );
}

const METRIC_ROWS: MetricRow[] = [
  {
    key: "wifi",
    label: "Wi-Fi Speed",
    icon: <Wifi className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => v.avgDownloadMbps,
    render: (v, isBest) => {
      const mbps = v.avgDownloadMbps;
      const color = getWifiColor(mbps);
      const width = getWifiBarWidth(mbps);
      return (
        <div className={`flex flex-col gap-1.5 ${isBest ? "compare-best-cell" : ""}`}>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold" style={{ color: isBest ? "#e0c97f" : color }}>
              {mbps}
            </span>
            <span className="text-[11px] text-white/30">Mbps</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isBest ? "#e0c97f" : color, width: `${width}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      );
    },
  },
  {
    key: "rating",
    label: "Rating",
    icon: <Star className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => v.googleRating,
    render: (v, isBest) => (
      <div className={isBest ? "compare-best-cell" : ""}>
        {renderStars(v.googleRating)}
      </div>
    ),
  },
  {
    key: "power",
    label: "Power Outlets",
    icon: <Plug className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => v.workProfile ? POWER_ORDER[v.workProfile.powerOutlets] : null,
    render: (v, isBest) => {
      const density = v.workProfile?.powerOutlets;
      if (!density) return <span className="text-[11px] text-white/20">N/A</span>;
      const color = isBest ? "#e0c97f" : getPowerColor(density);
      return (
        <div className={`flex items-center gap-1.5 ${isBest ? "compare-best-cell" : ""}`}>
          <Plug className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[12px] font-medium capitalize" style={{ color }}>{density}</span>
        </div>
      );
    },
  },
  {
    key: "noise",
    label: "Noise Level",
    icon: <Volume2 className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => v.workProfile ? NOISE_ORDER[v.workProfile.noiseLevel] : null,
    render: (v, isBest) => {
      const level = v.workProfile?.noiseLevel;
      if (!level) return <span className="text-[11px] text-white/20">N/A</span>;
      const color = isBest ? "#e0c97f" : getNoiseColor(level);
      return (
        <div className={`flex items-center gap-1.5 ${isBest ? "compare-best-cell" : ""}`}>
          <Volume2 className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[12px] font-medium capitalize" style={{ color }}>{level}</span>
        </div>
      );
    },
  },
  {
    key: "seating",
    label: "Seating",
    icon: <Armchair className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: () => null,
    render: (v, _isBest) => {
      const seating = v.workProfile?.seatingType;
      if (!seating) return <span className="text-[11px] text-white/20">N/A</span>;
      return <span className="text-[12px] text-white/60 capitalize">{seating}</span>;
    },
  },
  {
    key: "aircon",
    label: "Air Con",
    icon: <Snowflake className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => (v.workProfile?.hasAirCon ? 1 : 0),
    render: (v, isBest) => {
      const has = v.workProfile?.hasAirCon;
      if (has === undefined || has === null) return <span className="text-[11px] text-white/20">N/A</span>;
      return (
        <div className={isBest && has ? "compare-best-cell" : ""}>
          {has ? (
            <span className="text-[12px] font-medium text-[#22c55e]">✓ Yes</span>
          ) : (
            <span className="text-[12px] text-white/20">✗ No</span>
          )}
        </div>
      );
    },
  },
  {
    key: "callfriendly",
    label: "Call Friendly",
    icon: <Phone className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => (v.workProfile?.callFriendly ? 1 : 0),
    render: (v, isBest) => {
      const is = v.workProfile?.callFriendly;
      if (is === undefined || is === null) return <span className="text-[11px] text-white/20">N/A</span>;
      return (
        <div className={isBest && is ? "compare-best-cell" : ""}>
          {is ? (
            <span className="text-[12px] font-medium text-[#22c55e]">✓ Yes</span>
          ) : (
            <span className="text-[12px] text-white/20">✗ No</span>
          )}
        </div>
      );
    },
  },
  {
    key: "coffee",
    label: "Coffee Price",
    icon: <Coffee className="w-3.5 h-3.5" />,
    direction: "lower",
    getValue: (v) => v.venueCost?.coffeePriceMyr ?? null,
    render: (v, isBest) => {
      const price = v.venueCost?.coffeePriceMyr;
      if (price === null || price === undefined) return <span className="text-[11px] text-white/20">N/A</span>;
      return (
        <div className={isBest ? "compare-best-cell" : ""}>
          <span className={`text-[16px] font-bold ${isBest ? "text-[#e0c97f]" : "text-white/70"}`}>
            RM {price.toFixed(1)}
          </span>
        </div>
      );
    },
  },
  {
    key: "daypass",
    label: "Day Pass",
    icon: <Ticket className="w-3.5 h-3.5" />,
    direction: "lower",
    getValue: (v) => v.venueCost?.dayPassMyr ?? null,
    render: (v, isBest) => {
      const price = v.venueCost?.dayPassMyr;
      if (price === null || price === undefined) return <span className="text-[11px] text-white/20">N/A</span>;
      return (
        <div className={isBest ? "compare-best-cell" : ""}>
          <span className={`text-[16px] font-bold ${isBest ? "text-[#e0c97f]" : "text-white/70"}`}>
            RM {price.toFixed(0)}
          </span>
        </div>
      );
    },
  },
  {
    key: "transit",
    label: "Transit",
    icon: <Train className="w-3.5 h-3.5" />,
    direction: "higher",
    getValue: (v) => {
      if (!v.transitLinks || v.transitLinks.length === 0) return null;
      return -Math.min(...v.transitLinks.map((t) => t.walkTimeMins));
    },
    render: (v, isBest) => {
      const links = v.transitLinks;
      if (!links || links.length === 0) return <span className="text-[11px] text-white/20">No data</span>;
      const nearest = links.reduce((a, b) => (a.walkTimeMins < b.walkTimeMins ? a : b));
      return (
        <div className={`flex flex-col gap-0.5 ${isBest ? "compare-best-cell" : ""}`}>
          <span className={`text-[12px] font-medium ${isBest ? "text-[#e0c97f]" : "text-white/60"}`}>
            {nearest.nearestStationName}
          </span>
          <span className="text-[11px] text-white/30">
            {nearest.stationLine} · {nearest.walkTimeMins} min walk
          </span>
        </div>
      );
    },
  },
];

export function VenueCompareModal() {
  const showCompareModal = useMapStore((s) => s.showCompareModal);
  const setShowCompareModal = useMapStore((s) => s.setShowCompareModal);
  const compareIds = useMapStore((s) => s.compareIds);
  const locations = useMapStore((s) => s.locations);
  const clearCompare = useMapStore((s) => s.clearCompare);
  const toggleCompare = useMapStore((s) => s.toggleCompare);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);
  const setSidebarOpen = useMapStore((s) => s.setSidebarOpen);

  const venues = useMemo(
    () => compareIds.map((id) => locations.find((l) => l.id === id)).filter(Boolean) as LocationPin[],
    [compareIds, locations]
  );

  // Determine best values for each metric
  const bestMap = useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const metric of METRIC_ROWS) {
      const values = venues
        .map((v) => ({ id: v.id, val: metric.getValue(v) }))
        .filter((x) => x.val !== null);

      if (values.length < 2) {
        result[metric.key] = null;
        continue;
      }

      if (metric.direction === "higher") {
        const best = values.reduce((a, b) => (a.val! > b.val! ? a : b));
        const isTied = values.some((x) => x.id !== best.id && x.val === best.val);
        result[metric.key] = isTied ? null : best.id;
      } else {
        const best = values.reduce((a, b) => (a.val! < b.val! ? a : b));
        const isTied = values.some((x) => x.id !== best.id && x.val === best.val);
        result[metric.key] = isTied ? null : best.id;
      }
    }
    return result;
  }, [venues]);

  const handleClose = useCallback(() => {
    setShowCompareModal(false);
  }, [setShowCompareModal]);

  const handleViewDetails = useCallback(
    (venue: LocationPin) => {
      setShowCompareModal(false);
      setSelectedVenue(venue);
    },
    [setShowCompareModal, setSelectedVenue]
  );

  const handleRemove = useCallback(
    (id: string) => {
      toggleCompare(id);
    },
    [toggleCompare]
  );

  const handleClearAll = useCallback(() => {
    clearCompare();
  }, [clearCompare]);

  const handleAddVenue = useCallback(() => {
    setShowCompareModal(false);
    setSearchQuery("");
    setSidebarOpen(true);
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
      input?.focus();
    }, 400);
  }, [setShowCompareModal, setSearchQuery, setSidebarOpen]);

  return (
    <AnimatePresence>
      {showCompareModal && venues.length >= 2 && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#0d1b2a]/95 backdrop-blur-xl"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-[#e0c97f]/15 bg-[#0a0a0f] shadow-2xl shadow-black/60 overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0c97f]/10 shrink-0">
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-bold text-white tracking-tight">Venue Comparison</h2>
                <p className="text-[11px] text-[#e0c97f]/40 mt-0.5">
                  Comparing {venues.length} venue{venues.length > 1 ? "s" : ""} side by side
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#e94560]/70 hover:text-[#e94560] hover:bg-[#e94560]/10 border border-[#e94560]/10 hover:border-[#e94560]/20 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                  aria-label="Close comparison"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Desktop: table-like grid */}
              <div className="hidden md:block">
                <div className="grid" style={{ gridTemplateColumns: `180px repeat(${venues.length}, 1fr)` }}>
                  {/* Header row: venue cards */}
                  <div className="p-4 border-b border-[#e0c97f]/8" />
                  {venues.map((venue) => {
                    const catConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
                    return (
                      <div key={venue.id} className="p-4 border-b border-[#e0c97f]/8 border-l border-[#e0c97f]/5">
                        <div className="flex flex-col items-center text-center gap-2">
                          <span className="text-[24px]">{catConfig?.emoji}</span>
                          <h3 className="text-[13px] font-bold text-white leading-tight">{venue.name}</h3>
                          <span className="text-[10px] text-white/30 font-medium">{venue.area}, {venue.state}</span>
                          <button
                            onClick={() => handleRemove(venue.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-[#e94560]/50 hover:text-[#e94560] hover:bg-[#e94560]/8 transition-all mt-1"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Metric rows */}
                  {METRIC_ROWS.map((metric, idx) => (
                    <Fragment key={metric.key}>
                      {/* Label cell */}
                      <div
                        key={`label-${metric.key}`}
                        className={`flex items-center gap-2 px-4 py-3 text-[11px] font-medium text-white/40 border-b border-[#e0c97f]/5 ${idx % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                      >
                        <span className="text-[#e0c97f]/30">{metric.icon}</span>
                        <span className="whitespace-nowrap">{metric.label}</span>
                        {metric.direction === "lower" && (
                          <span className="text-[9px] text-[#22c55e]/40 ml-auto">↓ lower better</span>
                        )}
                      </div>

                      {/* Value cells */}
                      {venues.map((venue) => {
                        const isBest = bestMap[metric.key] === venue.id;
                        return (
                          <div
                            key={`${metric.key}-${venue.id}`}
                            className={`px-4 py-3 flex items-center justify-center border-b border-[#e0c97f]/5 border-l border-[#e0c97f]/5 ${idx % 2 === 0 ? "bg-white/[0.01]" : ""} ${isBest ? "compare-best-row" : ""}`}
                          >
                            {metric.render(venue, isBest)}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}

                  {/* Actions row */}
                  <div className="p-4" />
                  {venues.map((venue) => (
                    <div key={`actions-${venue.id}`} className="p-4 flex flex-col items-center gap-2 border-l border-[#e0c97f]/5">
                      <button
                        onClick={() => handleViewDetails(venue)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#e0c97f] bg-[#e0c97f]/8 border border-[#e0c97f]/15 hover:bg-[#e0c97f]/15 transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile: horizontal scrollable cards */}
              <div className="md:hidden">
                <div className="flex gap-4 overflow-x-auto px-4 pt-4 pb-2 snap-x snap-mandatory custom-scrollbar">
                  {venues.map((venue) => {
                    const catConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
                    return (
                      <div key={venue.id} className="shrink-0 w-[280px] snap-start rounded-xl border border-[#e0c97f]/10 bg-[#0d1b2a]/80 overflow-hidden">
                        {/* Card header */}
                        <div className="px-4 pt-4 pb-3 border-b border-[#e0c97f]/8">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[20px]">{catConfig?.emoji}</span>
                              <div>
                                <h3 className="text-[13px] font-bold text-white leading-tight">{venue.name}</h3>
                                <span className="text-[10px] text-white/30">{venue.area}, {venue.state}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemove(venue.id)}
                              className="p-1.5 rounded-md text-white/20 hover:text-[#e94560] hover:bg-[#e94560]/10 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card metrics */}
                        <div className="px-4 py-3 flex flex-col gap-3">
                          {METRIC_ROWS.map((metric) => {
                            const isBest = bestMap[metric.key] === venue.id;
                            return (
                              <div
                                key={metric.key}
                                className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg ${isBest ? "bg-[#e0c97f]/5 border border-[#e0c97f]/15" : ""}`}
                              >
                                <div className="flex items-center gap-1.5 text-[11px] text-white/40 shrink-0">
                                  {metric.icon}
                                  <span className="hidden sm:inline">{metric.label}</span>
                                </div>
                                <div className="flex-1 flex justify-end">
                                  {metric.render(venue, isBest)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Card actions */}
                        <div className="px-4 pb-4">
                          <button
                            onClick={() => handleViewDetails(venue)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-[#e0c97f] bg-[#e0c97f]/8 border border-[#e0c97f]/15 hover:bg-[#e0c97f]/15 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add venue card (if < 3 items) */}
                  {compareIds.length < 3 && (
                    <div
                      className="shrink-0 w-[280px] snap-start rounded-xl border border-dashed border-[#e0c97f]/15 bg-[#0d1b2a]/40 flex flex-col items-center justify-center gap-3 min-h-[300px] cursor-pointer hover:border-[#e0c97f]/30 hover:bg-[#0d1b2a]/60 transition-all"
                      onClick={handleAddVenue}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#e0c97f]/8 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-[#e0c97f]/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-[12px] font-medium text-[#e0c97f]/50">Add venue</p>
                        <p className="text-[10px] text-white/20 mt-0.5">
                          {3 - compareIds.length} slot{3 - compareIds.length > 1 ? "s" : ""} left
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e0c97f]/8 border border-[#e0c97f]/15 text-[10px] text-[#e0c97f]/50">
                        <Search className="w-3 h-3" />
                        Search
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile hint */}
                <p className="text-center text-[10px] text-white/15 mt-2 pb-2">← Swipe to compare →</p>
              </div>

              {/* Desktop: Add venue button (if < 3) */}
              {compareIds.length < 3 && (
                <div className="hidden md:flex justify-center py-4">
                  <button
                    onClick={handleAddVenue}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#e0c97f]/15 bg-[#e0c97f]/5 text-[12px] font-medium text-[#e0c97f]/50 hover:text-[#e0c97f] hover:border-[#e0c97f]/30 hover:bg-[#e0c97f]/8 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add venue to compare
                    <span className="text-[10px] text-white/20">
                      ({3 - compareIds.length} slot{3 - compareIds.length > 1 ? "s" : ""} left)
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
