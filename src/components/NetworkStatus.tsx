"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine ?? true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online", { description: "Connection restored" });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline", { description: "Check your internet connection" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-28 left-4 z-30 flex items-center gap-1.5 glass-card px-3 py-1.5"
        >
          <WifiOff className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400/80 font-medium">Offline</span>
        </motion.div>
      )}
      {isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-28 left-4 z-30 flex items-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto"
        >
          <div className="glass-subtle rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400/50" />
            <span className="text-[9px] text-emerald-400/40 font-medium">Online</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
