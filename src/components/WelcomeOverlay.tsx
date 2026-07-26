"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Wifi, Coffee, X, ChevronRight, Sparkles } from "lucide-react";

const STORAGE_KEY = "nomadmy-welcomed";

const features = [
  {
    icon: Map,
    title: "Interactive Malaysia Map",
    description: "Click states to explore venues",
  },
  {
    icon: Wifi,
    title: "Verified Wi-Fi Speeds",
    description: "Real speed test data from nomads",
  },
  {
    icon: Coffee,
    title: "Cost Index",
    description: "Coffee prices, day passes & more",
  },
];

// Decorative floating dot positions
const floatingDots = [
  { top: "10%", left: "15%", size: 6, delay: 0 },
  { top: "20%", right: "20%", size: 4, delay: 0.8 },
  { top: "60%", left: "10%", size: 5, delay: 1.6 },
  { top: "75%", right: "12%", size: 7, delay: 0.4 },
  { top: "40%", right: "8%", size: 3, delay: 1.2 },
  { top: "85%", left: "25%", size: 4, delay: 2.0 },
  { top: "15%", left: "40%", size: 3, delay: 0.6 },
  { top: "50%", right: "30%", size: 5, delay: 1.4 },
];

export function WelcomeOverlay() {
  // Lazy initializer reads localStorage once at mount — avoids useEffect + setState
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === null;
  });

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — pointer-events-none so map stays interactive */}
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ backgroundColor: "rgba(10, 10, 15, 0.95)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Centered Card */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-full max-w-2xl pointer-events-auto rounded-2xl border border-[#e0c97f]/20 shadow-2xl shadow-black/40 overflow-hidden"
              style={{
                backgroundColor: "rgba(13, 27, 42, 0.8)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Decorative floating dots */}
              {floatingDots.map((dot, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-[#e0c97f] opacity-0"
                  style={{
                    [dot.top.includes("right") ? "right" : "left"]: dot[dot.top.includes("right") ? "right" : "left"],
                    top: dot.top.replace("%", "%"),
                    width: dot.size,
                    height: dot.size,
                    animation: `floatDot 4s ease-in-out ${dot.delay}s infinite`,
                  }}
                />
              ))}

              {/* Dot grid background */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #e0c97f 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[#e0c97f]/10 text-[#e0c97f]/60 hover:text-[#e0c97f] hover:bg-[#e0c97f]/20 transition-colors z-10"
                aria-label="Close welcome overlay"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="relative p-6 sm:p-8 md:p-10">
                {/* Sparkles + Heading */}
                <div className="text-center mb-2">
                  <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0c97f]/10 border border-[#e0c97f]/20 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e0c97f]" />
                    <span className="text-xs font-medium text-[#e0c97f]/80">
                      Nomad Workspace Finder
                    </span>
                  </motion.div>

                  <motion.h1
                    className="text-3xl sm:text-4xl font-bold text-[#e0c97f] mb-3 text-glow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    Welcome to NomadMY
                  </motion.h1>

                  <motion.p
                    className="text-sm sm:text-base text-[#e0c97f]/50 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    Your interactive guide to work-friendly spaces across Malaysia
                  </motion.p>
                </div>

                {/* Feature highlights */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="flex flex-col items-center text-center p-4 rounded-xl bg-[#0a0a0f]/40 border border-[#e0c97f]/10 hover:bg-[#0a0a0f]/60 hover:border-[#e0c97f]/20 transition-all duration-300 cursor-default"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.3)" }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#e0c97f]/10 flex items-center justify-center mb-3">
                        <feature.icon className="w-5 h-5 text-[#e0c97f]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#e0c97f]/90 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-[#e0c97f]/40 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <motion.button
                    onClick={handleDismiss}
                    className="relative inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[#0a0a0f] font-semibold text-sm shadow-lg shadow-[#e0c97f]/20 hover:shadow-[#e0c97f]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-[#e0c97f] hover:bg-[#d4b86e] overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shine sweep effect on hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-2">
                      Start Exploring
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </motion.button>

                  <p className="mt-4 text-xs text-[#e0c97f]/25">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 bg-[#0a0a0f]/60 border border-[#e0c97f]/15 rounded text-[10px] font-mono">
                      F
                    </kbd>{" "}
                    to toggle this panel anytime
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
