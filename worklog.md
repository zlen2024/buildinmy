# NomadMY — Work Log

## Project Overview
NomadMY is an interactive, full-viewport spatial dashboard for digital nomads in Malaysia. It features a krackedmaps-based interactive map of Malaysia, venue markers for coworking spaces/cafes/public spaces, filtering by Wi-Fi speed, power outlets, noise level, and more.

---

## Phase 2 — Review & Enhancement Round

### Assessment of Phase 1
Phase 1 was functionally complete with:
- 25 seeded Malaysian locations across 7 states
- Full krackedmaps integration with custom dark theme
- Sidebar nav, floating filter bar, venue drawer, venue list, stats panel
- Zustand state management with filtering
- 3 API endpoints (places, places/[id], stats)
- Clean lint (0 errors)

### Issues Identified & Fixed

1. **Cross-origin warning** (`allowedDevOrigins`)
   - Fixed in `next.config.ts` by adding the preview domain to `allowedDevOrigins`

2. **Unused imports** in `MalaysiaMap.tsx`
   - Removed unused lucide-react imports (Building2, Coffee, Library, Home)

3. **No loading state** for venue list
   - Added Skeleton-based loading state with 5 placeholder rows
   - List items now animate in sequentially with staggered delays

4. **No error toast** for API failures
   - Added `toast.error()` notification when venue fetch fails

5. **No favorites/compare functionality**
   - Added full favorites system with localStorage persistence via `zustand/persist`
   - Compare tray shows side-by-side comparison of up to 3 venues (Wi-Fi, coffee, day pass, rating, power, noise)

6. **No keyboard shortcuts**
   - `Esc` — Close drawer or sidebar
   - `/` — Focus search input
   - `F` — Toggle sidebar panel

### New Features Added

1. **Favorites System**
   - Heart button on venue list items and venue drawer
   - Dedicated "Favorites" nav section with badge count
   - Persisted to localStorage via zustand persist middleware
   - `FavoritesList.tsx` component with compare tray

2. **Venue Comparison**
   - Compare button (GitCompareArrows icon) on venues and drawer
   - Up to 3 venues can be compared simultaneously
   - Comparison table shows: Wi-Fi speed, coffee price, day pass, Google rating, power outlets, noise level
   - Color-coded metrics (green for good, amber for moderate, red for poor)

3. **Enhanced Sidebar Animations**
   - Active nav indicator line (layoutId animation)
   - Animated text reveal on sidebar open/close
   - Favorites badge with pulse animation
   - Region pills show venue counts

4. **Enhanced Filter Bar**
   - Animated search suggestions dropdown with venue details
   - Clear search button (X) in input
   - Animated filter expansion panel
   - Better filter chip styling with colored borders
   - Clear visual feedback with result counts

5. **Enhanced Venue Drawer**
   - Favorite heart button (toggle save)
   - Compare button (add to comparison)
   - Close/clear compare from Favorites panel

6. **Loading UX**
   - Skeleton loading state for venue list (5 rows)
   - Pulsing ring animation around spinner
   - Descriptive loading text

7. **Keyboard Shortcut Hints**
   - Subtle keyboard hints at bottom-left on desktop
   - `/`, `Esc`, `F` shortcuts

### Styling Improvements

- Sidebar: Active nav line indicator, animated logo, better spacing
- Filter bar: Rounded-2xl corners, subtle animations, better suggestion dropdown with venue details
- Venue list: Sequential entrance animations, better metric badges, more compact layout
- Map legend: Better styling with venue count, emoji in colored boxes
- Drawer: Additional action buttons with proper hover states
- Favorites list: Empty state with instructions, compare tray design

### Verification
- ✅ Lint passes clean (0 errors, 0 warnings)
- ✅ Server compiles successfully
- ✅ Page returns HTTP 200
- ✅ API returns 25 locations with full data
- ✅ All new features integrated into existing layout

---

## Phase 1 — Original Build (Summary)

### Completed Tasks
1. **Database Schema** — Prisma + SQLite with Location, WorkProfile, WifiMetric, VenueCost, TransitAccess
2. **Seed Data** — 25 venues across KL (9), Penang (5), Selangor (3), Johor (3), Melaka (2), Sabah (2), Sarawak (1)
3. **krackedmaps Integration** — Custom dark theme, pin markers, state selection, focus
4. **API Endpoints** — GET /api/places, GET /api/places/[id], GET /api/stats
5. **UI Components** — MalaysiaMap, SidebarNav, TopHeader, FloatingFilterBar, VenueDrawer, VenueList, StatsPanel
6. **Zustand Store** — Full state management with filtering, selections, categories
7. **Design System** — Dark theme (#0a0a0f / #0d1b2a / #e0c97f gold), responsive, Framer Motion

### Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui (46 components)
- krackedmaps, Zustand (persist), Prisma (SQLite), Framer Motion

---

## Unresolved Issues / Next Phase Recommendations

1. **East Malaysia rendering** — krackedmaps focuses on Peninsular Malaysia; Sabah/Sarawak pins may not render. Consider an inset mini-map or iframe fallback for East Malaysia.

2. **Google Maps verification pipeline** — Backend Google Places verification not yet implemented. Currently uses pre-seeded Google Place IDs.

3. **Agent-browser connectivity** — `agent-browser` cannot connect to localhost:3000 in this environment (connection refused on agent-browser side despite curl working). This may be a network namespace issue with the browser.

4. **Additional features to build:**
   - Wi-Fi speedtest mini-service
   - User authentication (NextAuth)
   - Venue submission flow with admin approval
   - Transit proximity auto-calculation
   - Community reviews/ratings system
   - Map marker clustering
   - Export venue data as PDF/CSV
   - Mobile PWA support

5. **Polish opportunities:**
   - Animated map pin placement
   - Drill-down to district level
   - Drag-and-drop comparison reordering
   - Dark/light theme fully working (currently defaults dark)
   - i18n support (English/Bahasa Melayu toggle exists but is non-functional)
