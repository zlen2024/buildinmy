import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/lib/i18n'

export type VenueCategory = 'coworking' | 'cafe' | 'public_space' | 'coliving'
export type PowerDensity = 'high' | 'moderate' | 'sparse' | 'none'
export type NoiseLevel = 'silent' | 'quiet' | 'moderate' | 'loud'

export interface TransitLink {
  nearestStationName: string
  stationLine: string
  walkTimeMins: number
  distanceMeters: number
}

export interface LocationPin {
  id: string
  googlePlaceId: string
  name: string
  formattedAddress: string
  category: VenueCategory
  state: string
  area: string
  latitude: number
  longitude: number
  googleRating: number | null
  googleUserRatingsTotal: number
  googleMapsUrl: string | null
  isOperational: boolean
  avgDownloadMbps: number
  workProfile?: {
    powerOutlets: PowerDensity
    noiseLevel: NoiseLevel
    seatingType: string
    laptopPolicy: string
    hasAirCon: boolean
    callFriendly: boolean
    operatingHours: string
  } | null
  venueCost?: {
    coffeePriceMyr: number
    dayPassMyr: number | null
    minSpendMyr: number
  } | null
  transitLinks?: TransitLink[]
}

interface MapState {
  // Selected state on the map
  selectedState: string | null
  // Selected district
  selectedDistrict: string | null
  // Search query
  searchQuery: string
  // Category filters
  activeCategories: VenueCategory[]
  // Wi-Fi speed filter (minimum)
  minWifiSpeed: number
  // Productivity filters
  highPowerSockets: boolean
  quietEnvironment: boolean
  callFriendly: boolean
  // Selected venue (for drawer)
  selectedVenue: LocationPin | null
  // All locations from API
  locations: LocationPin[]
  // Loading state
  isLoading: boolean
  // Sidebar open
  sidebarOpen: boolean
  // Mobile nav active section
  activeNavSection: string
  // Favorites (persisted)
  favoriteIds: string[]
  // Comparison list
  compareIds: string[]
  // Compare modal visibility
  showCompareModal: boolean
  // Locale for i18n
  locale: Locale
  // Wi-Fi heatmap mode
  showWifiHeatmap: boolean

  // Actions
  setSelectedState: (state: string | null) => void
  setSelectedDistrict: (district: string | null) => void
  setSearchQuery: (query: string) => void
  toggleCategory: (category: VenueCategory) => void
  setCategories: (categories: VenueCategory[]) => void
  setMinWifiSpeed: (speed: number) => void
  setHighPowerSockets: (value: boolean) => void
  setQuietEnvironment: (value: boolean) => void
  setCallFriendly: (value: boolean) => void
  setSelectedVenue: (venue: LocationPin | null) => void
  setLocations: (locations: LocationPin[]) => void
  setIsLoading: (loading: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setActiveNavSection: (section: string) => void
  resetFilters: () => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleCompare: (id: string) => void
  isCompared: (id: string) => boolean
  clearCompare: () => void
  setShowCompareModal: (show: boolean) => void
  // Locale action
  setLocale: (locale: Locale) => void
  // Wi-Fi heatmap toggle
  setShowWifiHeatmap: (show: boolean) => void
  toggleWifiHeatmap: () => void
}

const defaultFilters = {
  searchQuery: '',
  activeCategories: [] as VenueCategory[],
  minWifiSpeed: 0,
  highPowerSockets: false,
  quietEnvironment: false,
  callFriendly: false,
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      selectedState: null,
      selectedDistrict: null,
      searchQuery: '',
      activeCategories: [],
      minWifiSpeed: 0,
      highPowerSockets: false,
      quietEnvironment: false,
      callFriendly: false,
      selectedVenue: null,
      locations: [],
      isLoading: false,
      sidebarOpen: true,
      activeNavSection: 'map',
      favoriteIds: [],
      compareIds: [],
      showCompareModal: false,
      locale: 'en' as Locale,
      showWifiHeatmap: false,

      setSelectedState: (state) => set({ selectedState: state }),
      setSelectedDistrict: (district) => set({ selectedDistrict: district }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleCategory: (category) =>
        set((state) => ({
          activeCategories: state.activeCategories.includes(category)
            ? state.activeCategories.filter((c) => c !== category)
            : [...state.activeCategories, category],
        })),
      setCategories: (categories) => set({ activeCategories: categories }),
      setMinWifiSpeed: (speed) => set({ minWifiSpeed: speed }),
      setHighPowerSockets: (value) => set({ highPowerSockets: value }),
      setQuietEnvironment: (value) => set({ quietEnvironment: value }),
      setCallFriendly: (value) => set({ callFriendly: value }),
      setSelectedVenue: (venue) => set({ selectedVenue: venue }),
      setLocations: (locations) => set({ locations }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveNavSection: (section) => set({ activeNavSection: section }),
      resetFilters: () => set(defaultFilters),
      toggleFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((f) => f !== id)
            : [...state.favoriteIds, id],
        })),
      isFavorite: (id) => get().favoriteIds.includes(id),
      toggleCompare: (id) =>
        set((state) => {
          if (state.compareIds.includes(id)) {
            return { compareIds: state.compareIds.filter((c) => c !== id) }
          }
          if (state.compareIds.length >= 3) {
            return state // max 3 items
          }
          return { compareIds: [...state.compareIds, id] }
        }),
      isCompared: (id) => get().compareIds.includes(id),
      clearCompare: () => set({ compareIds: [], showCompareModal: false }),
      setShowCompareModal: (show) => set({ showCompareModal: show }),
      setLocale: (locale) => set({ locale }),
      setShowWifiHeatmap: (show) => set({ showWifiHeatmap: show }),
      toggleWifiHeatmap: () => set((state) => ({ showWifiHeatmap: !state.showWifiHeatmap })),
    }),
    {
      name: 'nomadmy-storage',
      partialize: (state) => ({
        favoriteIds: state.favoriteIds,
        locale: state.locale,
      }),
    }
  )
)

// Filtered locations selector
export function useFilteredLocations(): LocationPin[] {
  const locations = useMapStore((s) => s.locations)
  const selectedState = useMapStore((s) => s.selectedState)
  const activeCategories = useMapStore((s) => s.activeCategories)
  const minWifiSpeed = useMapStore((s) => s.minWifiSpeed)
  const highPowerSockets = useMapStore((s) => s.highPowerSockets)
  const quietEnvironment = useMapStore((s) => s.quietEnvironment)
  const callFriendly = useMapStore((s) => s.callFriendly)
  const searchQuery = useMapStore((s) => s.searchQuery)

  return locations.filter((loc) => {
    // State filter
    if (selectedState) {
      const stateMap: Record<string, string[]> = {
        'Kuala Lumpur': ['kuala-lumpur', 'putrajaya'],
        'Selangor': ['selangor'],
        'Penang': ['penang'],
        'Johor': ['johor'],
        'Melaka': ['melaka'],
        'Sabah': ['sabah'],
        'Sarawak': ['sarawak'],
        'Perlis': ['perlis'],
        'Kedah': ['kedah'],
        'Pahang': ['pahang'],
        'Terengganu': ['terengganu'],
        'Negeri Sembilan': ['negeri-sembilan'],
      }
      const stateSlugs = stateMap[loc.state] || []
      if (!stateSlugs.includes(selectedState)) return false
    }

    // Category filter
    if (activeCategories.length > 0) {
      if (!activeCategories.includes(loc.category)) return false
    }

    // Wi-Fi speed filter
    if (minWifiSpeed > 0 && loc.avgDownloadMbps < minWifiSpeed) return false

    // Productivity filters
    if (highPowerSockets && loc.workProfile?.powerOutlets !== 'high') return false
    if (quietEnvironment && loc.workProfile?.noiseLevel !== 'silent' && loc.workProfile?.noiseLevel !== 'quiet') return false
    if (callFriendly && !loc.workProfile?.callFriendly) return false

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !loc.name.toLowerCase().includes(q) &&
        !loc.area.toLowerCase().includes(q) &&
        !loc.state.toLowerCase().includes(q) &&
        !loc.formattedAddress.toLowerCase().includes(q)
      ) {
        return false
      }
    }

    return true
  })
}

// State display name mapping
export const STATE_DISPLAY_NAMES: Record<string, string> = {
  'johor': 'Johor',
  'kedah': 'Kedah',
  'kelantan': 'Kelantan',
  'melaka': 'Melaka',
  'negeri-sembilan': 'N. Sembilan',
  'pahang': 'Pahang',
  'penang': 'Penang',
  'perak': 'Perak',
  'perlis': 'Perlis',
  'selangor': 'Selangor',
  'terengganu': 'Terengganu',
  'kuala-lumpur': 'Kuala Lumpur',
  'putrajaya': 'Putrajaya',
  'labuan': 'Labuan',
  'sabah': 'Sabah',
  'sarawak': 'Sarawak',
}

// Slug → display name
export const SLUG_TO_STATE: Record<string, string> = {
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
}

// Malaysian states with venue data
export const ACTIVE_STATES = [
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', count: 0 },
  { slug: 'selangor', name: 'Selangor', count: 0 },
  { slug: 'penang', name: 'Penang', count: 0 },
  { slug: 'johor', name: 'Johor', count: 0 },
  { slug: 'melaka', name: 'Melaka', count: 0 },
  { slug: 'sabah', name: 'Sabah', count: 0 },
  { slug: 'sarawak', name: 'Sarawak', count: 0 },
  { slug: 'perlis', name: 'Perlis', count: 0 },
  { slug: 'kedah', name: 'Kedah', count: 0 },
  { slug: 'pahang', name: 'Pahang', count: 0 },
  { slug: 'terengganu', name: 'Terengganu', count: 0 },
  { slug: 'negeri-sembilan', name: 'N. Sembilan', count: 0 },
]

export const CATEGORY_CONFIG: Record<VenueCategory, { label: string; icon: string; color: string; emoji: string }> = {
  coworking: { label: 'Coworking', icon: 'Building2', color: '#22c55e', emoji: '🏢' },
  cafe: { label: 'Work Cafe', icon: 'Coffee', color: '#f59e0b', emoji: '☕' },
  public_space: { label: 'Public Space', icon: 'Library', color: '#3b82f6', emoji: '📚' },
  coliving: { label: 'Co-living', icon: 'Home', color: '#a855f7', emoji: '🏠' },
}
