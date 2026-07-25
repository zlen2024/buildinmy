"use client";

import { useMemo } from "react";
import { useMapStore, CATEGORY_CONFIG, type LocationPin } from "@/lib/map-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Coffee, Ticket, Trophy, ArrowDown, Star } from "lucide-react";

const GOLD = "#e0c97f";
const GOLD_DIM = "#e0c97f40";
const CHART_COLORS = ["#e0c97f", "#22c55e", "#f59e0b", "#e94560", "#3b82f6", "#a855f7", "#ec4899"];

interface StateCostData {
  state: string;
  avgCoffee: number;
  avgDayPass: number;
  avgRating: number;
  venueCount: number;
  costEfficiency: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0f]/95 border border-[#e0c97f]/20 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-semibold text-[#e0c97f] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[11px] text-[#e0c97f]/70">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

export function CostExplorer() {
  const locations = useMapStore((s) => s.locations);

  const stateData = useMemo((): StateCostData[] => {
    const stateMap = new Map<string, LocationPin[]>();
    for (const loc of locations) {
      const existing = stateMap.get(loc.state) || [];
      existing.push(loc);
      stateMap.set(loc.state, existing);
    }

    const results: StateCostData[] = [];
    for (const [state, locs] of stateMap) {
      const withCost = locs.filter((l) => l.venueCost);
      const withRating = locs.filter((l) => l.googleRating);
      const withDayPass = locs.filter((l) => l.venueCost?.dayPassMyr);

      const avgCoffee =
        withCost.length > 0
          ? withCost.reduce((s, l) => s + (l.venueCost?.coffeePriceMyr ?? 0), 0) / withCost.length
          : 0;

      const avgDayPass =
        withDayPass.length > 0
          ? withDayPass.reduce((s, l) => s + (l.venueCost?.dayPassMyr ?? 0), 0) / withDayPass.length
          : 0;

      const avgRating =
        withRating.length > 0
          ? withRating.reduce((s, l) => s + (l.googleRating ?? 0), 0) / withRating.length
          : 0;

      const costEfficiency =
        avgCoffee + avgDayPass > 0 ? (avgRating * 10) / (avgCoffee + avgDayPass) * 100 : 0;

      results.push({
        state,
        avgCoffee: Math.round(avgCoffee * 10) / 10,
        avgDayPass: Math.round(avgDayPass * 10) / 10,
        avgRating: Math.round(avgRating * 10) / 10,
        venueCount: locs.length,
        costEfficiency: Math.round(costEfficiency * 10) / 10,
      });
    }

    return results;
  }, [locations]);

  const coffeeSorted = useMemo(
    () => [...stateData].filter((d) => d.avgCoffee > 0).sort((a, b) => a.avgCoffee - b.avgCoffee),
    [stateData]
  );

  const dayPassSorted = useMemo(
    () => [...stateData].filter((d) => d.avgDayPass > 0).sort((a, b) => a.avgDayPass - b.avgDayPass),
    [stateData]
  );

  const efficiencySorted = useMemo(
    () => [...stateData].filter((d) => d.costEfficiency > 0).sort((a, b) => b.costEfficiency - a.costEfficiency),
    [stateData]
  );

  const cheapestStates = useMemo(
    () =>
      [...stateData]
        .filter((d) => d.avgCoffee > 0 && d.avgDayPass > 0)
        .sort((a, b) => a.avgCoffee + a.avgDayPass - (b.avgCoffee + b.avgDayPass))
        .slice(0, 3),
    [stateData]
  );

  const bestRatedStates = useMemo(
    () =>
      [...stateData]
        .filter((d) => d.avgRating > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 3),
    [stateData]
  );

  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  };

  return (
    <div className="p-5 space-y-6 overflow-y-auto max-h-full">
      {/* Header */}
      <motion.div {...fadeIn}>
        <h2 className="text-sm font-semibold text-[#e0c97f] flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Cost Explorer
        </h2>
        <p className="text-[10px] text-[#e0c97f]/40 mt-0.5">
          Cost of living analysis by state
        </p>
      </motion.div>

      {/* Top 3 Cheapest States */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.05 }}>
        <p className="text-[10px] font-semibold text-[#e0c97f]/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <ArrowDown className="w-3 h-3" /> Top 3 Cheapest States
        </p>
        <div className="grid grid-cols-3 gap-2">
          {cheapestStates.map((s, i) => (
            <motion.div
              key={s.state}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-[#e0c97f]/5 rounded-lg p-3 border border-[#e0c97f]/8 text-center"
            >
              <p className="text-[9px] text-[#e0c97f]/40 font-medium">{s.state}</p>
              <p className="text-base font-bold text-[#22c55e] mt-1">
                RM{s.avgCoffee + s.avgDayPass}
              </p>
              <p className="text-[8px] text-[#e0c97f]/30 mt-0.5">coffee+daypass</p>
            </motion.div>
          ))}
          {cheapestStates.length === 0 && (
            <p className="text-[10px] text-[#e0c97f]/30 col-span-3 text-center py-3">No cost data available</p>
          )}
        </div>
      </motion.div>

      {/* Top 3 Best-Rated States */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <p className="text-[10px] font-semibold text-[#e0c97f]/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Star className="w-3 h-3" /> Top 3 Best-Rated States
        </p>
        <div className="grid grid-cols-3 gap-2">
          {bestRatedStates.map((s, i) => (
            <motion.div
              key={s.state}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="bg-[#e0c97f]/5 rounded-lg p-3 border border-[#e0c97f]/8 text-center"
            >
              <p className="text-[9px] text-[#e0c97f]/40 font-medium">{s.state}</p>
              <p className="text-base font-bold text-[#f59e0b] mt-1">
                {s.avgRating}<span className="text-[10px] text-[#e0c97f]/40">/5</span>
              </p>
              <p className="text-[8px] text-[#e0c97f]/30 mt-0.5">{s.venueCount} venues</p>
            </motion.div>
          ))}
          {bestRatedStates.length === 0 && (
            <p className="text-[10px] text-[#e0c97f]/30 col-span-3 text-center py-3">No rating data available</p>
          )}
        </div>
      </motion.div>

      {/* Average Coffee Price by State - Bar Chart */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.15 }}>
        <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
          <p className="text-xs font-medium text-[#e0c97f]/60 mb-1 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5" /> Avg Coffee Price by State
          </p>
          <p className="text-[9px] text-[#e0c97f]/30 mb-3">Sorted by price (RM)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={coffeeSorted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="state"
                tick={{ fill: GOLD_DIM, fontSize: 9 }}
                axisLine={{ stroke: GOLD_DIM }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: GOLD_DIM, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `RM${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgCoffee" name="Coffee (RM)" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {coffeeSorted.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Average Day Pass Price - Horizontal Bar Chart */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
          <p className="text-xs font-medium text-[#e0c97f]/60 mb-1 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" /> Avg Day Pass by State
          </p>
          <p className="text-[9px] text-[#e0c97f]/30 mb-3">Sorted by price (RM)</p>
          <ResponsiveContainer width="100%" height={dayPassSorted.length * 36}>
            <BarChart
              data={dayPassSorted}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill: GOLD_DIM, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `RM${v}`}
              />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fill: GOLD_DIM, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgDayPass" name="Day Pass (RM)" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {dayPassSorted.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Cost Efficiency Score */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.25 }}>
        <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
          <p className="text-xs font-medium text-[#e0c97f]/60 mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Cost Efficiency Score
          </p>
          <p className="text-[9px] text-[#e0c97f]/30 mb-3">(rating × 10) / (coffee + daypass) × 100</p>
          {efficiencySorted.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={efficiencySorted}
                    dataKey="costEfficiency"
                    nameKey="state"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {efficiencySorted.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value.toFixed(1), name]}
                    contentStyle={{
                      backgroundColor: "#0a0a0f",
                      border: "1px solid #e0c97f20",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#e0c97f",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
                {efficiencySorted.slice(0, 5).map((s, i) => (
                  <span key={s.state} className="flex items-center gap-1 text-[9px] text-[#e0c97f]/50">
                    <span
                      className="w-2 h-2 rounded-sm inline-block"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {s.state} ({s.costEfficiency})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-[#e0c97f]/30 text-center py-6">No efficiency data</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
