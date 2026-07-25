"use client";

import { useEffect, useState, useCallback } from "react";
import { MalaysiaMap } from "@/components/MalaysiaMap";
import { SidebarNav } from "@/components/SidebarNav";
import { TopHeader } from "@/components/TopHeader";
import { FloatingFilterBar } from "@/components/FloatingFilterBar";
import { VenueDrawer } from "@/components/VenueDrawer";
import { VenueList } from "@/components/VenueList";
import { StatsPanel } from "@/components/StatsPanel";
import { useMapStore, type LocationPin } from "@/lib/map-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  MapPin,
} from "lucide-react";

export default function HomePage() {
  const setLocations = useMapStore((s) => s.setLocations);
  const setIsLoading = useMapStore((s) => s.setIsLoading);
  const isLoading = useMapStore((s) => s.isLoading);
  const selectedVenue = useMapStore((s) => s.selectedVenue);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const activeNavSection = useMapStore((s) => s.activeNavSection);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);

  // Fetch locations on mount
  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/places");
      const data = await res.json();
      if (data.locations) {
        setLocations(data.locations as LocationPin[]);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setLocations, setIsLoading]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Determine panel content based on active nav
  const renderPanelContent = () => {
    switch (activeNavSection) {
      case "stats":
        return <StatsPanel />;
      case "coworking":
      case "cafe":
      case "public_space":
      case "coliving":
      case "transport":
      case "map":
      default:
        return <VenueList />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      {/* Left Navigation Sidebar */}
      <SidebarNav />

      {/* Right Side Panel (Desktop) */}
      {sidebarOpen && (
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 bg-[#0d1b2a] border-l border-[#e0c97f]/10 overflow-hidden flex-shrink-0">
          {renderPanelContent()}
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Map Canvas */}
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#e0c97f] animate-spin" />
                <p className="text-sm text-[#e0c97f]/40">Loading venues...</p>
              </div>
            </div>
          ) : (
            <MalaysiaMap />
          )}
        </div>

        {/* Mobile Venue List (Bottom Sheet Style) */}
        {sidebarOpen && (
          <div className="lg:hidden absolute bottom-28 left-0 right-0 z-30 max-h-[40vh] bg-[#0d1b2a]/95 backdrop-blur-xl border-t border-[#e0c97f]/10 overflow-hidden">
            {renderPanelContent()}
          </div>
        )}
      </main>

      {/* Floating Filter Bar */}
      <FloatingFilterBar />

      {/* Venue Detail Drawer */}
      {selectedVenue && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedVenue(null)}
          />
          <VenueDrawer
            venue={selectedVenue}
            onClose={() => setSelectedVenue(null)}
          />
        </>
      )}
    </div>
  );
}
