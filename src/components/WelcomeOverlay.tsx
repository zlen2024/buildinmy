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
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[#e0c97f]/10 text-[#e0c97f]/60 hover:text-[#e0c97f] hover:bg-[#e0c97f]/20 transition-colors"
                aria-label="Close welcome overlay"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8 md:p-10">
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
                    className="text-3xl sm:text-4xl font-bold text-[#e0c97f] mb-3"
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
                      className="flex flex-col items-center text-center p-4 rounded-xl bg-[#0a0a0f]/40 border border-[#e0c97f]/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
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
                  <button
                    onClick={handleDismiss}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[#0a0a0f] font-semibold text-sm shadow-lg shadow-[#e0c97f]/20 hover:shadow-[#e0c97f]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-[#e0c97f] hover:bg-[#d4b86e]"
                  >
                    Start Exploring
                    <ChevronRight className="w-4 h-4" />
                  </button>

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
