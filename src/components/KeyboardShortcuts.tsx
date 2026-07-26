"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

interface Shortcut {
  key: string;
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: "/", description: "Focus search" },
  { key: "Esc", description: "Close panel / drawer" },
  { key: "F", description: "Toggle sidebar" },
  { key: "D", description: "Toggle Wi-Fi heatmap" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "1", description: "Filter: Coworking" },
  { key: "2", description: "Filter: Work Cafe" },
  { key: "3", description: "Filter: Public Space" },
  { key: "4", description: "Filter: Co-living" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-strong rounded-2xl p-6 max-w-sm w-full pointer-events-auto"
              style={{ boxShadow: "0 0 40px rgba(224,201,127,0.08)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-[#e0c97f] gold-gradient-text">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[10px] text-[#e0c97f]/30 hover:text-[#e0c97f]/60 transition-colors px-2 py-1 rounded-md hover:bg-[#e0c97f]/8"
                >
                  Press Esc to close
                </button>
              </div>
              <div className="space-y-1">
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#e0c97f]/5 transition-colors"
                  >
                    <span className="text-xs text-[#e0c97f]/60">{s.description}</span>
                    <kbd className="px-2.5 py-1 bg-[#e0c97f]/8 border border-[#e0c97f]/15 rounded-md text-[11px] font-mono text-[#e0c97f] min-w-[36px] text-center">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#e0c97f]/8 text-center">
                <p className="text-[10px] text-[#e0c97f]/20">Press ? to toggle this panel</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
