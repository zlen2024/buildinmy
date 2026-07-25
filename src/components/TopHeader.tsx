"use client";

import { useMapStore } from "@/lib/map-store";
import { t } from "@/lib/i18n";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/i18n";

const LANG_OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "bm", label: "Bahasa Melayu" },
];

export function TopHeader() {
  const selectedState = useMapStore((s) => s.selectedState);
  const locations = useMapStore((s) => s.locations);
  const locale = useMapStore((s) => s.locale);
  const setLocale = useMapStore((s) => s.setLocale);
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

  const handleLangSelect = (code: Locale) => {
    setLocale(code);
    setShowLang(false);
  };

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
                {activeVenueCount} {t('header.venues', locale)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-xs font-medium text-[#e0c97f]">
                {t('header.malaysia', locale)}
              </span>
              <span className="text-[10px] text-[#e0c97f]/40">
                {activeVenueCount} {t('header.venues', locale)}
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
              className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0d1b2a]/90 backdrop-blur-md border border-[#e0c97f]/20 text-[#e0c97f]/60 hover:text-[#e0c97f] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-wider">
                {locale === 'en' ? 'EN' : 'BM'}
              </span>
            </button>

            <AnimatePresence>
              {showLang && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 bg-[#0d1b2a]/95 backdrop-blur-xl border border-[#e0c97f]/20 rounded-xl overflow-hidden shadow-xl shadow-black/30 min-w-[160px] z-50"
                >
                  <div className="p-1.5">
                    {LANG_OPTIONS.map((lang) => {
                      const isActive = locale === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLangSelect(lang.code)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? "bg-[#e0c97f]/12 text-[#e0c97f]"
                              : "text-[#e0c97f]/50 hover:bg-[#e0c97f]/8 hover:text-[#e0c97f]/80"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isActive ? "bg-[#e0c97f]" : "bg-[#e0c97f]/20"
                            }`}
                          />
                          <span className="font-medium">{lang.label}</span>
                          {isActive && (
                            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-[#e0c97f]/50">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click-away backdrop */}
            <AnimatePresence>
              {showLang && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLang(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
