"use client";

import { useMapStore } from "@/lib/map-store";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export function TopHeader() {
  const selectedState = useMapStore((s) => s.selectedState);
  const locations = useMapStore((s) => s.locations);
  const { theme, setTheme } = useTheme();
  const [showLang, setShowLang] = useState(false);

  const activeVenueCount = selectedState
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
        return locations.filter((l) => l.state === mappedState).length;
      })()
    : locations.length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-16 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left spacer (for sidebar on mobile) */}
        <div className="w-10 lg:w-0" />

        {/* Center - Status badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {selectedState ? (
            <div className="flex items-center gap-2 bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e0c97f] animate-pulse" />
              <span className="text-xs font-medium text-[#e0c97f]">
                {selectedState.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span className="text-[10px] text-[#e0c97f]/40">
                {activeVenueCount} venues
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-xs font-medium text-[#e0c97f]">
                Malaysia
              </span>
              <span className="text-[10px] text-[#e0c97f]/40">
                {activeVenueCount} venues
              </span>
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 text-[#e0c97f]/60 hover:text-[#e0c97f] transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="p-2 rounded-lg bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 text-[#e0c97f]/60 hover:text-[#e0c97f] transition-colors"
            >
              <Globe className="w-4 h-4" />
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-1 bg-[#0d1b2a] border border-[#e0c97f]/20 rounded-lg overflow-hidden shadow-xl">
                <button className="block w-full px-4 py-2 text-xs text-[#e0c97f] hover:bg-[#e0c97f]/10 text-left">
                  English
                </button>
                <button className="block w-full px-4 py-2 text-xs text-[#e0c97f]/50 hover:bg-[#e0c97f]/10 text-left">
                  Bahasa Melayu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
