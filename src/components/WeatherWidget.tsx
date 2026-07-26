"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Cloud, CloudRain, CloudSun, CloudDrizzle, CloudLightning, Droplets, Loader2 } from "lucide-react";
import { useMapStore, STATE_DISPLAY_NAMES } from "@/lib/map-store";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  icon: string;
}

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const props = { className };
  switch (icon) {
    case "sunny":
      return <Sun {...props} />;
    case "cloudy":
      return <Cloud {...props} />;
    case "partly-cloudy":
      return <CloudSun {...props} />;
    case "rainy":
      return <CloudRain {...props} />;
    case "drizzle":
      return <CloudDrizzle {...props} />;
    case "thunderstorm":
      return <CloudLightning {...props} />;
    default:
      return <CloudSun {...props} />;
  }
}

function parseWeatherFromText(text: string): Omit<WeatherData, "humidity"> {
  const lower = text.toLowerCase();
  let temperature = 30;
  let condition = "Partly Cloudy";
  let icon = "partly-cloudy";

  const tempMatch = text.match(/(\d{2,3})\s*°?[Cc]/);
  if (tempMatch) {
    temperature = parseInt(tempMatch[1], 10);
  }

  if (lower.includes("thunderstorm") || lower.includes("thunder")) {
    condition = "Thunderstorm";
    icon = "thunderstorm";
  } else if (lower.includes("heavy rain") || lower.includes("rainy") || lower.includes("rain")) {
    condition = "Rainy";
    icon = "rainy";
  } else if (lower.includes("drizzle") || lower.includes("light rain")) {
    condition = "Light Rain";
    icon = "drizzle";
  } else if (lower.includes("cloudy") || lower.includes("overcast")) {
    condition = "Cloudy";
    icon = "cloudy";
  } else if (lower.includes("sunny") || lower.includes("clear")) {
    condition = "Sunny";
    icon = "sunny";
  }

  return { temperature, condition, icon };
}

export function WeatherWidget() {
  const selectedState = useMapStore((s) => s.selectedState);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const stateDisplayName = selectedState
    ? STATE_DISPLAY_NAMES[selectedState] || selectedState.replace(/-/g, " ")
    : null;

  const fetchWeather = useCallback(async () => {
    if (!stateDisplayName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?state=${encodeURIComponent(stateDisplayName)}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [stateDisplayName]);

  useEffect(() => {
    setWeather(null);
    if (stateDisplayName) {
      fetchWeather();
    }
  }, [stateDisplayName, fetchWeather]);

  if (!stateDisplayName) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedState}
        initial={{ opacity: 0, x: -16, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -16, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute top-20 left-4 glass-card px-4 py-3 min-w-[160px] pointer-events-auto z-10"
      >
        {loading ? (
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-5 h-5 text-[#e0c97f]/40 animate-spin" />
            <div className="space-y-1.5">
              <div className="shimmer h-4 w-16 rounded" />
              <div className="shimmer h-3 w-24 rounded" />
            </div>
          </div>
        ) : weather ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e0c97f]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <WeatherIcon icon={weather.icon} className="w-5 h-5 text-[#e0c97f]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xl font-bold text-[#e0c97f] leading-none">
                {weather.temperature}°C
              </p>
              <p className="text-[11px] text-[#e0c97f]/50">{weather.condition}</p>
              <div className="flex items-center gap-1 mt-1">
                <Droplets className="w-3 h-3 text-[#e0c97f]/30" />
                <span className="text-[10px] text-[#e0c97f]/30">{weather.humidity}%</span>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
