"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useMapStore, CATEGORY_CONFIG, type VenueCategory, type LocationPin } from "@/lib/map-store";
import { cn } from "@/lib/utils";
import {
  X,
  Star,
  Wifi,
  Plug,
  Volume2,
  Phone,
  Armchair,
  Clock,
  Coffee,
  CreditCard,
  TrainFront,
  ExternalLink,
  Navigation,
  ThermometerSun,
  Laptop,
  MapPin,
  Heart,
  GitCompareArrows,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { NearbyVenues } from "@/components/NearbyVenues";

// Category hero images (generated for NomadMY)
const CATEGORY_HERO_IMAGES: Record<string, string> = {
  coworking: '/venue-images/coworking-hero.png',
  cafe: '/venue-images/cafe-hero.png',
  public_space: '/venue-images/public-hero.png',
  coliving: '/venue-images/coliving-hero.png',
};

interface VenueDrawerProps {
  venue: LocationPin;
  onClose: () => void;
}

export function VenueDrawer({ venue, onClose }: VenueDrawerProps) {
  const categoryConfig = CATEGORY_CONFIG[venue.category as VenueCategory];
  const favoriteIds = useMapStore((s) => s.favoriteIds);
  const toggleFavorite = useMapStore((s) => s.toggleFavorite);
  const isFav = favoriteIds.includes(venue.id);
  const compareIds = useMapStore((s) => s.compareIds);
  const toggleCompare = useMapStore((s) => s.toggleCompare);
  const isCompared = compareIds.includes(venue.id);
  const locations = useMapStore((s) => s.locations);
  const [shared, setShared] = useState(false);

  // Drag-to-dismiss gesture state
  const dragRef = useRef({ startY: 0, isDragging: false });
  const [dragDelta, setDragDelta] = useState(0);

  const handleDragTouchStart = useCallback((e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY;
    dragRef.current.isDragging = true;
  }, []);

  const handleDragTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    const delta = e.touches[0].clientY - dragRef.current.startY;
    // Only allow downward drag
    if (delta > 0) {
      setDragDelta(delta);
    }
  }, []);

  const handleDragTouchEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    if (dragDelta > 100) {
      onClose();
    }
    setDragDelta(0);
  }, [dragDelta, onClose]);

  // Animated Wi-Fi bar width percentage
  const wifiBarWidth = useMemo(() => Math.min(100, (venue.avgDownloadMbps / 300) * 100), [venue.avgDownloadMbps]);
  const wifiBarColor = venue.avgDownloadMbps > 100 ? "#22c55e" : venue.avgDownloadMbps > 50 ? "#f59e0b" : "#ef4444";
  const heroImage = CATEGORY_HERO_IMAGES[venue.category];

  // Scroll progress state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const progress = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
    setScrollProgress(Math.min(1, Math.max(0, progress)));
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden"
      >
        <div className="bg-[#0d1b2a]/98 backdrop-blur-2xl border-t border-[#e0c97f]/15 rounded-t-3xl shadow-2xl shadow-black/60"
          style={{ transform: dragDelta > 0 ? `translateY(${dragDelta}px)` : undefined, transition: dragDelta > 0 ? 'none' : undefined }}
        >
          {/* Drag handle zone — only the header area triggers dismiss gesture */}
          <div
            onTouchStart={handleDragTouchStart}
            onTouchMove={handleDragTouchMove}
            onTouchEnd={handleDragTouchEnd}
          >
          {/* Photo Banner with Category Gradient + Animated Top Gradient */}
          <div className="relative h-28 overflow-hidden rounded-t-3xl">
            {/* Animated gradient sweep at the top */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${categoryConfig.color}15 30%, ${categoryConfig.color}25 50%, ${categoryConfig.color}15 70%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: 'gradientFlow 4s ease-in-out infinite',
              }}
            />
            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${categoryConfig.color}18 0%, ${categoryConfig.color}08 40%, #0d1b2a 100%)`,
              }}
            />
            {/* Hero image overlay */}
            {heroImage && (
              <img
                src={heroImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                loading="lazy"
              />
            )}
            {/* Category pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, ${categoryConfig.color} 1px, transparent 1px), radial-gradient(circle at 80% 20%, ${categoryConfig.color} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
              }}
            />
            {/* Large category emoji */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2">
              <span className="text-5xl opacity-30">
                {categoryConfig.emoji}
              </span>
            </div>
            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d1b2a]/98 to-transparent" />
          </div>

          {/* Handle bar — wider with subtle pulse */}
          <div className="flex justify-center -mt-5 relative z-10">
            <motion.div
              className="w-14 h-1.5 rounded-full bg-[#e0c97f]/25"
              animate={{ boxShadow: ['0 0 0 0 rgba(224,201,127,0.2)', '0 0 0 4px rgba(224,201,127,0)', '0 0 0 0 rgba(224,201,127,0.2)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Header */}
          <div className="flex items-start gap-3 px-5 pb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: categoryConfig.color + "20" }}
            >
              <span className="text-xl">
                {venue.category === "coworking" ? "🏢" : venue.category === "cafe" ? "☕" : venue.category === "public_space" ? "📚" : "🏠"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[#e0c97f] truncate">{venue.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-3 h-3 text-[#e0c97f]/40" />
                <p className="text-xs text-[#e0c97f]/50 truncate">{venue.area}, {venue.state}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-[#e0c97f]/20 text-[#e0c97f]/60 bg-[#e0c97f]/5"
                >
                  {categoryConfig.label}
                </Badge>
                {venue.workProfile?.operatingHours && (
                  <span className={cn(
                    "flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                    isVenueOpen(venue.workProfile.operatingHours)
                      ? "text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/15"
                      : "text-[#ef4444]/70 bg-[#ef4444]/8 border border-[#ef4444]/10"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isVenueOpen(venue.workProfile.operatingHours)
                        ? "bg-[#22c55e] pulse-soft"
                        : "bg-[#ef4444]/50"
                    )} />
                    {isVenueOpen(venue.workProfile.operatingHours) ? "Open Now" : "Closed"}
                  </span>
                )}
                {venue.googleRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] text-[#e0c97f]/60">{venue.googleRating}</span>
                    <span className="text-[10px] text-[#e0c97f]/30">({venue.googleUserRatingsTotal})</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleCompare(venue.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isCompared
                    ? "bg-[#e0c97f]/15 text-[#e0c97f]"
                    : "hover:bg-[#e0c97f]/10 text-[#e0c97f]/30 hover:text-[#e0c97f]/60"
                )}
                title={isCompared ? "Remove from comparison" : "Add to comparison"}
              >
                <GitCompareArrows className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}?venue=${venue.id}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setShared(true);
                    setTimeout(() => setShared(false), 2000);
                  });
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors relative",
                  shared
                    ? "bg-[#22c55e]/15 text-[#22c55e]"
                    : "hover:bg-[#e0c97f]/10 text-[#e0c97f]/30 hover:text-[#e0c97f]/60"
                )}
                title="Copy share link"
              >
                <Share2 className="w-4 h-4" />
                {shared && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] bg-[#22c55e] text-white px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    Copied!
                  </motion.span>
                )}
              </button>
              <button
                onClick={() => toggleFavorite(venue.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isFav
                    ? "bg-[#e94560]/15 text-[#e94560]"
                    : "hover:bg-[#e0c97f]/10 text-[#e0c97f]/30 hover:text-[#e0c97f]/60"
                )}
              >
                <Heart className={cn("w-4 h-4", isFav && "fill-[#e94560]")} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#e0c97f]/10 text-[#e0c97f]/40 hover:text-[#e0c97f] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          </div>{/* end drag handle zone */}

          {/* Content */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="px-5 pb-6 overflow-y-auto max-h-[55vh] space-y-5"
          >
            {/* Section Divider */}
            <SectionDivider />

            {/* Operating Hours */}
            {venue.workProfile?.operatingHours && (
              <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#e0c97f]/50" />
                  <span className="text-xs font-medium text-[#e0c97f]/70">Operating Hours</span>
                </div>
                <p className="text-sm font-medium text-[#e0c97f] tabular-nums">{venue.workProfile.operatingHours}</p>
              </div>
            )}

            {/* Section Divider */}
            <SectionDivider />

            {/* Wi-Fi Speed — Animated Bar */}
            <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="w-4 h-4" style={{ color: wifiBarColor }} />
                <span className="text-xs font-medium text-[#e0c97f]/70">Wi-Fi Speed</span>
                <motion.span
                  key={venue.avgDownloadMbps}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e0c97f]/5"
                  style={{ color: wifiBarColor }}
                >
                  {venue.avgDownloadMbps > 200 ? 'Excellent' : venue.avgDownloadMbps > 100 ? 'Fast' : venue.avgDownloadMbps > 50 ? 'Good' : 'Moderate'}
                </motion.span>
              </div>
              <div className="flex items-baseline gap-2">
                <motion.span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: wifiBarColor }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                >
                  {venue.avgDownloadMbps}
                </motion.span>
                <span className="text-sm text-[#e0c97f]/40">Mbps avg download</span>
              </div>
              <div className="mt-2.5 h-2.5 rounded-full bg-[#e0c97f]/10 overflow-hidden progress-glow">
                <motion.div
                  className="h-full rounded-full wifi-bar-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${wifiBarWidth}%` }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.2 }}
                  style={{
                    '--wifi-bar-color': wifiBarColor,
                    '--wifi-bar-color-light': wifiBarColor + 'cc',
                  } as React.CSSProperties}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-[#e0c97f]/25">
                <span>0</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
              </div>
            </div>

            {/* Section Divider */}
            <SectionDivider />

            {/* Work Profile */}
            {venue.workProfile && (
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  icon={<Plug className="w-4 h-4" />}
                  label="Power Outlets"
                  value={venue.workProfile.powerOutlets}
                  color={venue.workProfile.powerOutlets === "high" ? "#22c55e" : venue.workProfile.powerOutlets === "moderate" ? "#f59e0b" : "#ef4444"}
                />
                <MetricCard
                  icon={<Volume2 className="w-4 h-4" />}
                  label="Noise Level"
                  value={venue.workProfile.noiseLevel}
                  color={venue.workProfile.noiseLevel === "silent" || venue.workProfile.noiseLevel === "quiet" ? "#22c55e" : venue.workProfile.noiseLevel === "moderate" ? "#f59e0b" : "#ef4444"}
                />
                <MetricCard
                  icon={<Armchair className="w-4 h-4" />}
                  label="Seating"
                  value={venue.workProfile.seatingType}
                  color="#3b82f6"
                />
                <MetricCard
                  icon={<Laptop className="w-4 h-4" />}
                  label="Laptop Policy"
                  value={venue.workProfile.laptopPolicy.replace(/_/g, " ")}
                  color="#a855f7"
                />
                <MetricCard
                  icon={<ThermometerSun className="w-4 h-4" />}
                  label="Air Con"
                  value={venue.workProfile.hasAirCon ? "Yes" : "No"}
                  color={venue.workProfile.hasAirCon ? "#22c55e" : "#ef4444"}
                />
                <MetricCard
                  icon={<Phone className="w-4 h-4" />}
                  label="Call Friendly"
                  value={venue.workProfile.callFriendly ? "Yes" : "No"}
                  color={venue.workProfile.callFriendly ? "#22c55e" : "#ef4444"}
                />
              </div>
            )}

            {/* Section Divider */}
            <SectionDivider />

            {/* Cost Info */}
            {venue.venueCost && (
              <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-[#e0c97f]/70">Cost Index</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <CostItem label="Coffee" value={`RM ${venue.venueCost.coffeePriceMyr.toFixed(0)}`} />
                  {venue.venueCost.dayPassMyr && (
                    <CostItem label="Day Pass" value={`RM ${venue.venueCost.dayPassMyr.toFixed(0)}`} />
                  )}
                  <CostItem label="Min Spend" value={venue.venueCost.minSpendMyr > 0 ? `RM ${venue.venueCost.minSpendMyr.toFixed(0)}` : "None"} />
                </div>
              </div>
            )}

            {/* Section Divider */}
            <SectionDivider />

            {/* Transit Links */}
            {venue.transitLinks && venue.transitLinks.length > 0 && (
              <div className="bg-[#e0c97f]/5 rounded-xl p-4 border border-[#e0c97f]/8">
                <div className="flex items-center gap-2 mb-3">
                  <TrainFront className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-[#e0c97f]/70">Nearest Transit</span>
                </div>
                <div className="space-y-2">
                  {venue.transitLinks.map((transit, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[#e0c97f]/70">{transit.nearestStationName}</p>
                        <p className="text-[#e0c97f]/40">{transit.stationLine}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#e0c97f] font-medium">{transit.walkTimeMins} min</span>
                        <span className="text-[#e0c97f]/30 ml-1">walk</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps link — with shine effect */}
            {venue.googleMapsUrl && (
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#e0c97f]/10 border border-[#e0c97f]/20 text-[#e0c97f] text-sm font-medium hover:bg-[#e0c97f]/15 transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e0c97f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                <ExternalLink className="w-4 h-4 relative" />
                <span className="relative">Open in Google Maps</span>
              </a>
            )}

            {/* Section Divider */}
            <SectionDivider />

            {/* Nearby Venues */}
            <NearbyVenues currentVenue={venue} allVenues={locations} />
          </div>

          {/* Scroll progress indicator */}
          <div className="px-5 pb-3">
            <div className="scroll-progress-track">
              <div
                className="scroll-progress-fill"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#e0c97f]/5 rounded-lg p-3 border border-[#e0c97f]/5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="icon-badge-glass p-1.5" style={{ color }}>{icon}</span>
        <span className="text-[10px] text-[#e0c97f]/40">{label}</span>
      </div>
      <p className="text-xs font-medium capitalize" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function CostItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-[#e0c97f]/40 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#e0c97f] tabular-nums">{value}</p>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="flex-1 h-px animated-gradient-divider" />
      <div className="w-1 h-1 rounded-full bg-[#e0c97f]/20 pulse-soft" />
      <div className="flex-1 h-px animated-gradient-divider" />
    </div>
  );
}

/** Open/closed checker based on hours string. Uses Malaysia time (Asia/Kuala_Lumpur). */
function isVenueOpen(hours: string): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)?.value || '';
  let hour = parseInt(get('hour'));
  if (hour === 24) hour = 0;
  const minutes = parseInt(get('minute'));
  const currentMinutes = hour * 60 + minutes;
  const weekdayStr = get('weekday').toLowerCase();
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const day = dayMap[weekdayStr] ?? 0;

  // Simple format: "8:00-22:00"
  const simpleMatch = hours.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const openMin = parseInt(simpleMatch[1]) * 60 + parseInt(simpleMatch[2]);
    const closeMin = parseInt(simpleMatch[3]) * 60 + parseInt(simpleMatch[4]);
    return currentMinutes >= openMin && currentMinutes < closeMin;
  }

  // Complex format: "9:00-18:00 Mon-Fri 10:00-20:00 Sat-Sun"
  const parts2 = hours.split(/\s+/);
  if (parts2.length >= 3) {
    const rangeMatch = parts2[0].match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
    if (rangeMatch) {
      const openMin = parseInt(rangeMatch[1]) * 60 + parseInt(rangeMatch[2]);
      const closeMin = parseInt(rangeMatch[3]) * 60 + parseInt(rangeMatch[4]);
      const daysPart = parts2.slice(1).join(' ').toLowerCase();
      const isWeekday = day >= 1 && day <= 5;
      const isWeekend = day === 0 || day === 6;
      if ((daysPart.includes('mon-fri') || daysPart.includes('weekday')) && isWeekday) {
        return currentMinutes >= openMin && currentMinutes < closeMin;
      }
      if ((daysPart.includes('sat-sun') || daysPart.includes('weekend')) && isWeekend) {
        return currentMinutes >= openMin && currentMinutes < closeMin;
      }
    }
  }
  return true;
}
