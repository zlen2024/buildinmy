"use client";

import { useMapStore, STATE_DISPLAY_NAMES, type LocationPin } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Wifi,
  Coffee,
  Building2,
  TrendingUp,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

export function StatsPanel() {
  const locations = useMapStore((s) => s.locations);
  const selectedState = useMapStore((s) => s.selectedState);

  // State filter
  const filteredLocations = selectedState
    ? (() => {
        const stateNameMap: Record<string, string> = {
          'kuala-lumpur': 'Kuala Lumpur',
          'putrajaya': 'Kuala Lumpur',
          'selangor': 'Selangor',
          'penang': 'Penang',
          'johor': 'Johor',
          'melaka': 'Melaka',
          'sabah': 'Sabah',
          'sarawak': 'Sarawak',
          'perlis': 'Perlis',
          'kedah': 'Kedah',
          'pahang': 'Pahang',
          'terengganu': 'Terengganu',
          'negeri-sembilan': 'Negeri Sembilan',
        };
        const mappedState = stateNameMap[selectedState] || selectedState;
        return locations.filter((l) => l.state === mappedState);
      })()
    : locations;

  // Stats
  const total = filteredLocations.length;
  const coworking = filteredLocations.filter((l) => l.category === "coworking").length;
  const cafes = filteredLocations.filter((l) => l.category === "cafe").length;
  const avgWifi = filteredLocations.length > 0
    ? Math.round(filteredLocations.reduce((sum, l) => sum + l.avgDownloadMbps, 0) / filteredLocations.length)
    : 0;
  const avgCoffee = filteredLocations.filter((l) => l.venueCost).length > 0
    ? Math.round(filteredLocations.filter((l) => l.venueCost).reduce((sum, l) => sum + (l.venueCost?.coffeePriceMyr || 0), 0) / filteredLocations.filter((l) => l.venueCost).length * 10) / 10
    : 0;
  const avgRating = filteredLocations.filter((l) => l.googleRating).length > 0
    ? Math.round(filteredLocations.filter((l) => l.googleRating).reduce((sum, l) => sum + (l.googleRating || 0), 0) / filteredLocations.filter((l) => l.googleRating).length * 10) / 10
    : 0;

  // States with data
  const states = [...new Set(locations.map((l) => l.state))];

  return (
    <div className="p-5 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[#e0c97f] flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Platform Stats
        </h2>
        <p className="text-[10px] text-[#e0c97f]/40 mt-0.5">
          {selectedState
            ? `Showing data for ${STATE_DISPLAY_NAMES[selectedState] || selectedState}`
            : "Malaysia-wide overview"}
        </p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          label="Total Venues"
          value={total}
          color="#e0c97f"
        />
        <StatCard
          icon={<Wifi className="w-5 h-5" />}
          label="Avg Wi-Fi"
          value={`${avgWifi} Mbps`}
          color="#22c55e"
        />
        <StatCard
          icon={<Coffee className="w-5 h-5" />}
          label="Avg Coffee"
          value={`RM ${avgCoffee}`}
          color="#f59e0b"
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Avg Rating"
          value={`${avgRating}/5`}
          color="#3b82f6"
        />
      </div>

      {/* Category breakdown */}
      <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
        <p className="text-xs font-medium text-[#e0c97f]/60 mb-3">Categories</p>
        <div className="space-y-2">
          <CategoryBar label="Coworking" count={coworking} total={total} color="#22c55e" />
          <CategoryBar label="Work Cafes" count={cafes} total={total} color="#f59e0b" />
          <CategoryBar label="Public Spaces" count={filteredLocations.filter((l) => l.category === "public_space").length} total={total} color="#3b82f6" />
          <CategoryBar label="Co-living" count={filteredLocations.filter((l) => l.category === "coliving").length} total={total} color="#a855f7" />
        </div>
      </div>

      {/* State distribution */}
      <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
        <p className="text-xs font-medium text-[#e0c97f]/60 mb-3">Coverage by State</p>
        <div className="space-y-1.5">
          {states.map((state) => {
            const count = locations.filter((l) => l.state === state).length;
            return (
              <div key={state} className="flex items-center justify-between text-xs">
                <span className="text-[#e0c97f]/50">{state}</span>
                <span className="text-[#e0c97f] font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-[#e0c97f]/5 rounded-xl p-4 border-t-2 overflow-hidden"
      style={{ borderColor: color, borderTopColor: `${color}40` }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
      </div>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[11px] text-[#e0c97f]/40 mt-0.5 font-medium">{label}</p>
    </motion.div>
  );
}

function CategoryBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-[#e0c97f]/50">{label}</span>
        <span className="text-[#e0c97f]/70 font-medium">{count} ({pct}%)</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#e0c97f]/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
