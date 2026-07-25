"use client";

import { useMapStore, CATEGORY_CONFIG, type VenueCategory } from "@/lib/map-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompareArrows } from "lucide-react";

export function CompareFloatingBar() {
  const compareIds = useMapStore((s) => s.compareIds);
  const locations = useMapStore((s) => s.locations);
  const setActiveNavSection = useMapStore((s) => s.setActiveNavSection);
  const setSidebarOpen = useMapStore((s) => s.setSidebarOpen);
  const clearCompare = useMapStore((s) => s.clearCompare);

  if (compareIds.length === 0) return null;

  const comparedVenues = compareIds
    .map((id) => locations.find((l) => l.id === id))
    .filter(Boolean);

  const handleCompareNow = () => {
    setActiveNavSection("favorites");
    setSidebarOpen(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-14 left-0 right-0 z-[35] pointer-events-none"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="pointer-events-auto glass-card flex items-center gap-3 px-4 py-2.5 shadow-2xl shadow-black/40">
            {/* Label - hidden on mobile */}
            <span className="hidden sm:inline text-[11px] font-medium text-[#e0c97f]/50 whitespace-nowrap">
              Comparing {compareIds.length} venue{compareIds.length > 1 ? "s" : ""}
            </span>

            {/* Compact label on mobile */}
            <span className="sm:hidden text-[11px] font-medium text-[#e0c97f]/50">
              {compareIds.length}
            </span>

            {/* Venue avatar badges */}
            <div className="hidden sm:flex items-center gap-1.5">
              {comparedVenues.map((venue) => {
                if (!venue) return null;
                const catConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
                return (
                  <div
                    key={venue.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: catConfig?.color + "30", border: `1.5px solid ${catConfig?.color}60` }}
                    title={venue.name}
                  >
                    {venue.name.charAt(0).toUpperCase()}
                  </div>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Compare Now button */}
            <button
              onClick={handleCompareNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e0c97f]/12 border border-[#e0c97f]/20 text-[#e0c97f] text-[11px] font-medium hover:bg-[#e0c97f]/20 transition-all"
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare Now</span>
              <span className="sm:hidden">Compare</span>
            </button>

            {/* Clear button */}
            <button
              onClick={clearCompare}
              className="p-1.5 rounded-lg text-[#e0c97f]/30 hover:text-[#e94560] hover:bg-[#e94560]/10 transition-all"
              title="Clear comparison"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
