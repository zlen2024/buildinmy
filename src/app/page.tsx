"use client";

import { useEffect, useCallback } from "react";
import { MalaysiaMap } from "@/components/MalaysiaMap";
import { SidebarNav } from "@/components/SidebarNav";
import { TopHeader } from "@/components/TopHeader";
import { FloatingFilterBar } from "@/components/FloatingFilterBar";
import { VenueDrawer } from "@/components/VenueDrawer";
import { VenueList } from "@/components/VenueList";
import { StatsPanel } from "@/components/StatsPanel";
import { FavoritesList } from "@/components/FavoritesList";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { useMapStore, type LocationPin } from "@/lib/map-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const setLocations = useMapStore((s) => s.setLocations);
  const setIsLoading = useMapStore((s) => s.setIsLoading);
  const isLoading = useMapStore((s) => s.isLoading);
  const selectedVenue = useMapStore((s) => s.selectedVenue);
  const setSelectedVenue = useMapStore((s) => s.setSelectedVenue);
  const activeNavSection = useMapStore((s) => s.activeNavSection);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const setSidebarOpen = useMapStore((s) => s.setSidebarOpen);
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);
  const toggleFavorite = useMapStore((s) => s.toggleFavorite);
  const favoriteIds = useMapStore((s) => s.favoriteIds);
  const locations = useMapStore((s) => s.locations);

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
      toast.error("Failed to load venues. Please try again.");
      console.error("Failed to fetch locations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setLocations, setIsLoading]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "Escape":
          if (selectedVenue) {
            setSelectedVenue(null);
          } else if (sidebarOpen) {
            setSidebarOpen(false);
          }
          break;
        case "/":
          e.preventDefault();
          // Focus the search input
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
          searchInput?.focus();
          break;
        case "f":
          if (e.ctrlKey || e.metaKey) return;
          setSidebarOpen(!sidebarOpen);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVenue, setSelectedVenue, sidebarOpen, setSidebarOpen]);

  // Determine panel content based on active nav
  const renderPanelContent = () => {
    switch (activeNavSection) {
      case "stats":
        return <StatsPanel />;
      case "favorites":
        return <FavoritesList />;
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
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-[#e0c97f] animate-spin" />
                  <div className="absolute inset-0 w-8 h-8 rounded-full border border-[#e0c97f]/20 animate-ping" />
                </div>
                <p className="text-sm text-[#e0c97f]/30">Loading venues across Malaysia...</p>
              </div>
            </div>
          ) : (
            <MalaysiaMap />
          )}
        </div>

        {/* Keyboard hint */}
        {!isLoading && (
          <div className="absolute bottom-24 left-4 hidden xl:flex items-center gap-3 pointer-events-none">
            <span className="text-[9px] text-[#e0c97f]/15">
              <kbd className="px-1 py-0.5 bg-[#0d1b2a]/50 border border-[#e0c97f]/10 rounded text-[8px]">/</kbd> Search
            </span>
            <span className="text-[9px] text-[#e0c97f]/15">
              <kbd className="px-1 py-0.5 bg-[#0d1b2a]/50 border border-[#e0c97f]/10 rounded text-[8px]">Esc</kbd> Close
            </span>
            <span className="text-[9px] text-[#e0c97f]/15">
              <kbd className="px-1 py-0.5 bg-[#0d1b2a]/50 border border-[#e0c97f]/10 rounded text-[8px]">F</kbd> Panel
            </span>
          </div>
        )}

        {/* Mobile Venue List (Bottom Sheet Style) */}
        {sidebarOpen && (
          <div className="lg:hidden absolute bottom-28 left-0 right-0 z-30 max-h-[40vh] bg-[#0d1b2a]/95 backdrop-blur-xl border-t border-[#e0c97f]/10 overflow-hidden rounded-t-xl">
            {renderPanelContent()}
          </div>
        )}
      </main>

      {/* Floating Filter Bar */}
      <FloatingFilterBar />

      {/* Welcome Overlay (first visit only) */}
      <WelcomeOverlay />

      {/* Venue Detail Drawer */}
      {selectedVenue && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
