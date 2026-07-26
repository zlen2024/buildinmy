import { NextRequest, NextResponse } from 'next/server';

// Realistic weather profiles for Malaysian states
// Based on typical conditions: tropical, high humidity, warm year-round
interface WeatherProfile {
  baseTemp: number;
  tempRange: number;
  conditions: { text: string; icon: string; weight: number }[];
  baseHumidity: number;
  humidityRange: number;
}

const STATE_WEATHER: Record<string, WeatherProfile> = {
  'kuala lumpur': {
    baseTemp: 32,
    tempRange: 4,
    conditions: [
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 40 },
      { text: 'Thunderstorm', icon: 'thunderstorm', weight: 20 },
      { text: 'Rainy', icon: 'rainy', weight: 15 },
      { text: 'Sunny', icon: 'sunny', weight: 25 },
    ],
    baseHumidity: 78,
    humidityRange: 12,
  },
  'penang': {
    baseTemp: 31,
    tempRange: 3,
    conditions: [
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 35 },
      { text: 'Sunny', icon: 'sunny', weight: 30 },
      { text: 'Rainy', icon: 'rainy', weight: 20 },
      { text: 'Light Rain', icon: 'drizzle', weight: 15 },
    ],
    baseHumidity: 80,
    humidityRange: 10,
  },
  'selangor': {
    baseTemp: 33,
    tempRange: 4,
    conditions: [
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 35 },
      { text: 'Thunderstorm', icon: 'thunderstorm', weight: 25 },
      { text: 'Rainy', icon: 'rainy', weight: 15 },
      { text: 'Sunny', icon: 'sunny', weight: 25 },
    ],
    baseHumidity: 76,
    humidityRange: 12,
  },
  'johor': {
    baseTemp: 31,
    tempRange: 3,
    conditions: [
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 30 },
      { text: 'Sunny', icon: 'sunny', weight: 35 },
      { text: 'Rainy', icon: 'rainy', weight: 20 },
      { text: 'Light Rain', icon: 'drizzle', weight: 15 },
    ],
    baseHumidity: 82,
    humidityRange: 10,
  },
  'melaka': {
    baseTemp: 32,
    tempRange: 3,
    conditions: [
      { text: 'Sunny', icon: 'sunny', weight: 35 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 30 },
      { text: 'Light Rain', icon: 'drizzle', weight: 20 },
      { text: 'Rainy', icon: 'rainy', weight: 15 },
    ],
    baseHumidity: 79,
    humidityRange: 10,
  },
  'sabah': {
    baseTemp: 30,
    tempRange: 3,
    conditions: [
      { text: 'Rainy', icon: 'rainy', weight: 30 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 30 },
      { text: 'Thunderstorm', icon: 'thunderstorm', weight: 15 },
      { text: 'Light Rain', icon: 'drizzle', weight: 25 },
    ],
    baseHumidity: 85,
    humidityRange: 8,
  },
  'sarawak': {
    baseTemp: 31,
    tempRange: 3,
    conditions: [
      { text: 'Rainy', icon: 'rainy', weight: 25 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 30 },
      { text: 'Thunderstorm', icon: 'thunderstorm', weight: 20 },
      { text: 'Light Rain', icon: 'drizzle', weight: 25 },
    ],
    baseHumidity: 84,
    humidityRange: 8,
  },
  'pahang': {
    baseTemp: 32,
    tempRange: 5,
    conditions: [
      { text: 'Sunny', icon: 'sunny', weight: 35 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 30 },
      { text: 'Rainy', icon: 'rainy', weight: 20 },
      { text: 'Thunderstorm', icon: 'thunderstorm', weight: 15 },
    ],
    baseHumidity: 77,
    humidityRange: 14,
  },
  'terengganu': {
    baseTemp: 31,
    tempRange: 4,
    conditions: [
      { text: 'Sunny', icon: 'sunny', weight: 40 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 25 },
      { text: 'Rainy', icon: 'rainy', weight: 20 },
      { text: 'Light Rain', icon: 'drizzle', weight: 15 },
    ],
    baseHumidity: 80,
    humidityRange: 10,
  },
  'kedah': {
    baseTemp: 32,
    tempRange: 3,
    conditions: [
      { text: 'Sunny', icon: 'sunny', weight: 40 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 30 },
      { text: 'Light Rain', icon: 'drizzle', weight: 15 },
      { text: 'Rainy', icon: 'rainy', weight: 15 },
    ],
    baseHumidity: 78,
    humidityRange: 12,
  },
  'perlis': {
    baseTemp: 32,
    tempRange: 3,
    conditions: [
      { text: 'Sunny', icon: 'sunny', weight: 40 },
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 35 },
      { text: 'Light Rain', icon: 'drizzle', weight: 15 },
      { text: 'Rainy', icon: 'rainy', weight: 10 },
    ],
    baseHumidity: 76,
    humidityRange: 12,
  },
  'negeri sembilan': {
    baseTemp: 32,
    tempRange: 4,
    conditions: [
      { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 35 },
      { text: 'Sunny', icon: 'sunny', weight: 30 },
      { text: 'Rainy', icon: 'rainy', weight: 20 },
      { text: 'Thunderstorm', icon: 'thunderstorm', weight: 15 },
    ],
    baseHumidity: 78,
    humidityRange: 12,
  },
};

// Default tropical profile for unknown states
const DEFAULT_PROFILE: WeatherProfile = {
  baseTemp: 31,
  tempRange: 4,
  conditions: [
    { text: 'Partly Cloudy', icon: 'partly-cloudy', weight: 40 },
    { text: 'Sunny', icon: 'sunny', weight: 25 },
    { text: 'Rainy', icon: 'rainy', weight: 20 },
    { text: 'Thunderstorm', icon: 'thunderstorm', weight: 15 },
  ],
  baseHumidity: 80,
  humidityRange: 10,
};

interface CacheEntry {
  data: {
    temperature: number;
    condition: string;
    humidity: number;
    icon: string;
  };
  timestamp: number;
}

const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getWeatherForState(state: string): { temperature: number; condition: string; humidity: number; icon: string } {
  const key = state.toLowerCase().trim();
  const profile = STATE_WEATHER[key] || DEFAULT_PROFILE;

  // Use date-based seed so weather is consistent throughout the day
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const stateHash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = daySeed + stateHash;

  // Pick condition based on weighted random
  const conditionRand = seededRandom(seed);
  let cumulativeWeight = 0;
  let selectedCondition = profile.conditions[0];
  for (const condition of profile.conditions) {
    cumulativeWeight += condition.weight;
    if (conditionRand * 100 <= cumulativeWeight) {
      selectedCondition = condition;
      break;
    }
  }

  // Calculate temperature and humidity with slight variation
  const tempVar = seededRandom(seed + 1) * profile.tempRange;
  const humidityVar = seededRandom(seed + 2) * profile.humidityRange;

  return {
    temperature: Math.round(profile.baseTemp + tempVar - profile.tempRange / 2),
    condition: selectedCondition.text,
    humidity: Math.round(profile.baseHumidity + humidityVar - profile.humidityRange / 2),
    icon: selectedCondition.icon,
  };
}

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('state');
  if (!state) {
    return NextResponse.json({ error: 'State parameter required' }, { status: 400 });
  }

  const cacheKey = state.toLowerCase().trim();
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const weatherData = getWeatherForState(state);
  weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

  return NextResponse.json(weatherData);
}
