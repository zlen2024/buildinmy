"use client";

import { useMapStore, ACTIVE_STATES, STATE_DISPLAY_NAMES, CATEGORY_CONFIG, type VenueCategory } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  Map,
  Building2,
  Coffee,
  Library,
  Home,
  TrainFront,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "map", icon: Map, label: "Map" },
  { id: "coworking", icon: Building2, label: "Workspaces" },
  { id: "cafe", icon: Coffee, label: "Cafes" },
  { id: "public_space", icon: Library, label: "Public" },
  { id: "coliving", icon: Home, label: "Co-living" },
  { id: "transport", icon: TrainFront, label: "Transport" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "settings", icon: Settings, label: "Settings" },
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
        <div className="flex items-center justify-between p-4 border-b border-[#e0c97f]/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e0c97f] to-[#e94560] flex items-center justify-center">
                <Map className="w-4 h-4 text-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#e0c97f] tracking-tight">NomadMY</h1>
                <p className="text-[10px] text-[#e0c97f]/40">Digital Nomad Hub</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-[#e0c97f]/10 text-[#e0c97f]/60 hover:text-[#e0c97f] transition-colors lg:block hidden"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#e0c97f]/10 text-[#e0c97f]/60 hover:text-[#e0c97f] transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavSection === item.id;
            const isCategoryActive = Object.keys(CATEGORY_CONFIG).includes(item.id)
              ? activeCategories.includes(item.id as VenueCategory)
              : false;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive || isCategoryActive
                    ? "bg-[#e0c97f]/15 text-[#e0c97f]"
                    : "text-[#e0c97f]/50 hover:bg-[#e0c97f]/8 hover:text-[#e0c97f]/80"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isCategoryActive && "text-[#e0c97f]")} />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {sidebarOpen && isCategoryActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#e0c97f]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* State Quick Access (when sidebar is open) */}
        {sidebarOpen && (
          <div className="p-3 border-t border-[#e0c97f]/10">
            <p className="text-[10px] font-semibold text-[#e0c97f]/40 uppercase tracking-wider mb-2 px-1">
              Regions
            </p>
            <div className="flex flex-wrap gap-1">
              {ACTIVE_STATES.map((state) => (
                <button
                  key={state.slug}
                  onClick={() => setSelectedState(selectedState === state.slug ? null : state.slug)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                    selectedState === state.slug
                      ? "bg-[#e0c97f] text-[#0a0a0f]"
                      : "bg-[#e0c97f]/8 text-[#e0c97f]/60 hover:bg-[#e0c97f]/15 hover:text-[#e0c97f]"
                  )}
                >
                  {state.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-30 p-2.5 rounded-lg",
          "bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20",
          "text-[#e0c97f] lg:hidden",
          sidebarOpen && "hidden"
        )}
      >
        <Map className="w-5 h-5" />
      </button>
    </>
  );
}
