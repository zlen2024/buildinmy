"use client";

import { motion } from "framer-motion";
import { Plus, Minus, LocateFixed } from "lucide-react";
import { useMapStore } from "@/lib/map-store";

export function MapZoomControls() {
  const selectedState = useMapStore((s) => s.selectedState);
  const selectedDistrict = useMapStore((s) => s.selectedDistrict);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const setSelectedDistrict = useMapStore((s) => s.setSelectedDistrict);

  const handleZoomIn = () => {
    if (!selectedState) {
      setSelectedState("kuala-lumpur");
    }
  };

  const handleZoomOut = () => {
    if (selectedDistrict) {
      setSelectedDistrict(null);
    } else if (selectedState) {
      setSelectedState(null);
    }
  };

  const handleReset = () => {
    setSelectedDistrict(null);
    setSelectedState(null);
  };

  const btnBase =
    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-[#e0c97f]/60 hover:text-[#e0c97f] hover:bg-[#e0c97f]/10 hover:border-[#e0c97f]/25";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", damping: 25, stiffness: 300 }}
      className="absolute bottom-20 right-4 z-20 pointer-events-auto"
    >
      <div className="glass-card p-1.5 flex flex-col gap-1">
        <button onClick={handleZoomIn} aria-label="Zoom in" className={btnBase}>
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[#e0c97f]/10 mx-1" />
        <button onClick={handleZoomOut} aria-label="Zoom out" className={btnBase}>
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[#e0c97f]/10 mx-1" />
        <button onClick={handleReset} aria-label="Reset zoom" className={btnBase}>
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
