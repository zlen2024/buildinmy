"use client";

import { useEffect, useState, useMemo, useRef, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Star, Coffee, MapPin } from "lucide-react";
import { createMalaysiaMap } from "krackedmaps";
import type { LocationPin } from "@/lib/map-store";
import { CATEGORY_CONFIG } from "@/lib/map-store";
import type { ViewBox } from "@/lib/districts";
import { cn } from "@/lib/utils";

// Suppress unused-import warning for createMalaysiaMap (used only for type inference)
void createMalaysiaMap;

interface StreetVenueCardsProps {
  visible: boolean;
  venues: LocationPin[];
  mapInstance: RefObject<ReturnType<typeof createMalaysiaMap> | null>;
  currentViewBox: ViewBox | null;
  onVenueClick: (venue: LocationPin) => void;
}

interface CardPos {
  venue: LocationPin;
  x: number; // px
  y: number; // px
  flipped: boolean; // render above pin instead of below
}

/**
 * StreetVenueCards — when the map is zoomed in to "street" level, this renders
 * compact venue info cards positioned next to each visible pin on the map.
 *
 * The cards overlay the map DOM (not inside the SVG) and are positioned by
 * projecting each venue's lat/lng → SVG coords → screen px via the SVG's
 * screen CTM. This gives the user a Google-Maps-like "labelled pin" experience
 * where each venue's name + Wi-Fi + category appear inline next to its pin.
 *
 * Re-positions on every animation frame while the viewBox is animating, and
 * re-positions on viewport resize.
 */
export function StreetVenueCards({
  visible,
  venues,
  mapInstance,
  currentViewBox,
  onVenueClick,
}: StreetVenueCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<CardPos[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Compute screen positions of all venue pins.
  // Implemented as a plain function (not useMemo/useCallback) because it
  // reads `mapInstance.current` (a ref) which the React Compiler can't
  // statically track as a dependency.
  const computePositions = (): CardPos[] => {
    const inst = mapInstance.current;
    const container = containerRef.current;
    if (!inst || !container) return [];
    const svg = inst.svg;
    const containerRect = container.getBoundingClientRect();

    const out: CardPos[] = [];
    for (const venue of venues) {
      try {
        // Project lng/lat → SVG user coords using krackedmaps' project()
        const pt = inst.project(venue.longitude, venue.latitude);
        // SVG user coords → screen px using the SVG's CTM
        const ctm = svg.getScreenCTM();
        if (!ctm) continue;
        const screenX = pt.x * ctm.a + ctm.e;
        const screenY = pt.y * ctm.d + ctm.f;
        // Convert to container-relative px
        const x = screenX - containerRect.left;
        const y = screenY - containerRect.top;
        // Skip if outside container bounds (with margin)
        if (x < -50 || x > containerRect.width + 50) continue;
        if (y < -50 || y > containerRect.height + 50) continue;
        // Decide flip: if pin is in bottom half, render card above pin
        const flipped = y > containerRect.height * 0.6;
        out.push({ venue, x, y, flipped });
      } catch {
        /* skip */
      }
    }
    return out;
  };

  // Recompute on viewbox change (during animation) + on resize + when venues change
  useEffect(() => {
    if (!visible) {
      // Use a microtask to avoid synchronous setState in effect body
      queueMicrotask(() => setPositions([]));
      return;
    }
    // Recompute now (in microtask to avoid synchronous setState warning)
    queueMicrotask(() => setPositions(computePositions()));

    // Watch SVG viewBox attribute changes via MutationObserver — fires during
    // the zoom animation, letting us keep cards pinned to their venues.
    const inst = mapInstance.current;
    if (!inst) return;
    const svg = inst.svg;
    const observer = new MutationObserver(() => {
      setPositions(computePositions());
    });
    observer.observe(svg, { attributes: true, attributeFilter: ["viewBox"] });

    // Resize listener
    const onResize = () => setPositions(computePositions());
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    // Also poll briefly during animations (mutation observer covers SVG, but
    // container layout shifts may not trigger)
    const interval = setInterval(() => {
      setPositions(computePositions());
    }, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      clearInterval(interval);
    };
  }, [visible, mapInstance, currentViewBox, venues]);

  // Deduplicate by venue id (shouldn't have dups, but guard anyway)
  const uniquePositions = useMemo(() => {
    const seen = new Set<string>();
    return positions.filter((p) => {
      if (seen.has(p.venue.id)) return false;
      seen.add(p.venue.id);
      return true;
    });
  }, [positions]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden={!visible}
    >
      <AnimatePresence>
        {visible && uniquePositions.map(({ venue, x, y, flipped }) => {
          const cat = CATEGORY_CONFIG[venue.category];
          const wifiColor =
            venue.avgDownloadMbps > 100
              ? "#22c55e"
              : venue.avgDownloadMbps > 50
                ? "#f59e0b"
                : "#ef4444";
          const isHovered = hoveredId === venue.id;
          return (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, scale: 0.7, y: flipped ? 10 : -10 }}
              animate={{
                opacity: 1,
                scale: isHovered ? 1.06 : 1,
                x: x - 70, // centre horizontally (card width ~140)
                y: flipped ? y - 78 : y + 14, // offset above or below pin
              }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ width: 140 }}
              onClick={() => onVenueClick(venue)}
              onMouseEnter={() => setHoveredId(venue.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={cn(
                  "rounded-lg backdrop-blur-md border px-2.5 py-2 shadow-lg transition-all duration-200",
                  isHovered
                    ? "bg-[#0d1b2a]/95 border-[#e0c97f]/50 shadow-[0_4px_20px_rgba(224,201,127,0.25)]"
                    : "bg-[#0d1b2a]/85 border-[#e0c97f]/25",
                )}
                style={{ borderLeftColor: cat.color, borderLeftWidth: 3 }}
              >
                {/* Connector line from card to pin (small dot indicator) */}
                {flipped && (
                  <div
                    className="absolute left-1/2 -bottom-1.5 w-1 h-1.5 -translate-x-1/2 rounded-b-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                {!flipped && (
                  <div
                    className="absolute left-1/2 -top-1.5 w-1 h-1.5 -translate-x-1/2 rounded-t-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                )}

                {/* Header: emoji + name */}
                <div className="flex items-start gap-1.5 min-w-0">
                  <span className="text-xs leading-none mt-0.5 flex-shrink-0">
                    {cat.emoji}
                  </span>
                  <p className="text-[10px] font-semibold text-[#e0c97f] leading-tight line-clamp-2 min-w-0">
                    {venue.name}
                  </p>
                </div>

                {/* Meta: Wi-Fi + rating */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-mono font-medium"
                    style={{ color: wifiColor }}
                  >
                    <Wifi className="w-2.5 h-2.5" />
                    {venue.avgDownloadMbps}
                  </span>
                  {venue.googleRating && (
                    <span className="flex items-center gap-0.5 text-[9px] text-[#e0c97f]/60">
                      <Star className="w-2.5 h-2.5 fill-[#e0c97f]/60 text-[#e0c97f]/60" />
                      {venue.googleRating.toFixed(1)}
                    </span>
                  )}
                  {venue.venueCost?.coffeePriceMyr && (
                    <span className="flex items-center gap-0.5 text-[9px] text-[#e0c97f]/45 ml-auto">
                      <Coffee className="w-2.5 h-2.5" />
                      {venue.venueCost.coffeePriceMyr}
                    </span>
                  )}
                </div>

                {/* Area hint */}
                <div className="mt-0.5 flex items-center gap-0.5 text-[8px] text-[#e0c97f]/35">
                  <MapPin className="w-2 h-2" />
                  <span className="truncate">{venue.area}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
