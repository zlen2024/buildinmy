"use client";

import { useMapStore, CATEGORY_CONFIG, type VenueCategory } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import { StateHeatmap } from "@/components/StateHeatmap";
import {
  Map,
  Building2,
  Coffee,
  Library,
  Home,
  TrainFront,
  BarChart3,
  Heart,
  X,
  ChevronLeft,
  Zap,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { id: "map", icon: Map, label: "Map" },
  { id: "coworking", icon: Building2, label: "Workspaces" },
  { id: "cafe", icon: Coffee, label: "Cafes" },
  { id: "public_space", icon: Library, label: "Public" },
  { id: "coliving", icon: Home, label: "Co-living" },
  { id: "transport", icon: TrainFront, label: "Transport" },
  { id: "leaderboard", icon: Zap, label: "Speed Rank" },
  { id: "ranking", icon: Trophy, label: "Top 10" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "favorites", icon: Heart, label: "Favorites" },
];

export function SidebarNav() {
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const setSidebarOpen = useMapStore((s) => s.setSidebarOpen);
  const setSelectedState = useMapStore((s) => s.setSelectedState);
  const selectedState = useMapStore((s) => s.selectedState);
  const toggleCategory = useMapStore((s) => s.toggleCategory);
  const activeCategories = useMapStore((s) => s.activeCategories);
  const activeNavSection = useMapStore((s) => s.activeNavSection);
  const setActiveNavSection = useMapStore((s) => s.setActiveNavSection);
  const favoriteIds = useMapStore((s) => s.favoriteIds);
  const locations = useMapStore((s) => s.locations);

  const handleNavClick = (id: string) => {
    if (id === "map") {
      setSelectedState(null);
    } else if (Object.keys(CATEGORY_CONFIG).includes(id)) {
      toggleCategory(id as VenueCategory);
    }
    setActiveNavSection(id);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col",
          "bg-[#0d1b2a] border-r border-[#e0c97f]/10",
          "transition-all duration-300 ease-in-out",
          "lg:relative lg:z-auto",
          sidebarOpen ? "w-64" : "w-16",
          "max-lg:-translate-x-full",
          sidebarOpen && "max-lg:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between p-4 border-b border-[#e0c97f]/10 min-h-[60px]">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e0c97f] to-[#e94560] flex items-center justify-center shadow-lg shadow-[#e0c97f]/10">
                <Map className="w-4 h-4 text-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#e0c97f] tracking-tight">NomadMY</h1>
                <p className="text-[9px] text-[#e0c97f]/30 font-medium tracking-wider uppercase">Digital Nomad Hub</p>
              </div>
            </motion.div>
          )}
          {!sidebarOpen && (
            <div className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e0c97f] to-[#e94560] flex items-center justify-center">
                <Map className="w-3.5 h-3.5 text-[#0a0a0f]" />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f] transition-colors lg:block hidden"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f] transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2.5 px-2.5 space-y-0.5 overflow-y-auto nav-scrollable">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavSection === item.id;
            const isCategoryActive = Object.keys(CATEGORY_CONFIG).includes(item.id)
              ? activeCategories.includes(item.id as VenueCategory)
              : false;

            // Show favorite count badge
            const showFavBadge = item.id === "favorites" && favoriteIds.length > 0;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                  isActive || isCategoryActive
                    ? "bg-[#e0c97f]/12 text-[#e0c97f]"
                    : "text-[#e0c97f]/40 hover:bg-[#e0c97f]/6 hover:text-[#e0c97f]/70"
                )}
              >
                {/* Active indicator line */}
                {(isActive || isCategoryActive) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#e0c97f]"
                  />
                )}

                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0 transition-colors", isCategoryActive && "text-[#e0c97f]")} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium truncate overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Favorite count */}
                {showFavBadge && (
                  <span className={cn(
                    "ml-auto min-w-[18px] h-[18px] rounded-full bg-[#e94560] text-[10px] font-bold text-white flex items-center justify-center px-1",
                    !sidebarOpen && "absolute -top-1 -right-1 w-4 h-4 text-[8px] min-w-0 px-0"
                  )}>
                    {favoriteIds.length}
                  </span>
                )}

                {/* Category active dot */}
                {sidebarOpen && isCategoryActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#e0c97f] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* State Coverage Heatmap (when sidebar is open) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <StateHeatmap />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-30 p-2.5 rounded-xl",
          "bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20",
          "text-[#e0c97f] shadow-lg shadow-black/20 lg:hidden",
          sidebarOpen && "hidden"
        )}
      >
        <Map className="w-5 h-5" />
      </button>
    </>
  );
}

const SLUG_TO_STATE_MAP: Record<string, string> = {
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
