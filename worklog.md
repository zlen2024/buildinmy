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

---

## Phase 3 — Welcome Overlay & Legend Fix (Task 3c)

### WelcomeOverlay Component (`src/components/WelcomeOverlay.tsx`)
- New `"use client"` component that shows on first visit only
- Checks `localStorage` for `"nomadmy-welcomed"` key on mount; if absent, displays overlay
- Full-viewport overlay with semi-transparent dark background (`#0a0a0f` at 95% opacity)
- Centered glassmorphism card (`bg-[#0d1b2a]/80`, `backdrop-blur-2xl`)
- Animated entrance via Framer Motion (`AnimatePresence`, fade-in + scale-up with spring easing)
- Content:
  - Gold `Sparkles` badge ("Nomad Workspace Finder")
  - "Welcome to NomadMY" heading in `#e0c97f`
  - Tagline: "Your interactive guide to work-friendly spaces across Malaysia"
  - 3 feature highlight cards in a responsive grid (1-col mobile, 3-col desktop):
    1. `Map` icon — "Interactive Malaysia Map" — "Click states to explore venues"
    2. `Wifi` icon — "Verified Wi-Fi Speeds" — "Real speed test data from nomads"
    3. `Coffee` icon — "Cost Index" — "Coffee prices, day passes & more"
  - "Start Exploring" CTA button with gold `#e0c97f` background and `ChevronRight` icon
  - Hint: "Press F to toggle this panel anytime"
  - Close `X` button in top-right corner
- Uses Lucide React icons: `Map`, `Wifi`, `Coffee`, `X`, `ChevronRight`, `Sparkles`
- On dismiss (button click or X), sets `localStorage("nomadmy-welcomed", "true")`
- Backdrop uses `pointer-events-none` so the map underneath is still scrollable/interactive
- Card uses `pointer-events-auto` for full interactivity

### Integration into `src/app/page.tsx`
- Imported `WelcomeOverlay` and placed after `FloatingFilterBar`, before the venue drawer
- Positioned with `z-50` so it renders above the map but is part of the main layout flow

### MalaysiaMap Legend Fix (`src/components/MalaysiaMap.tsx`)
- Increased padding from `p-3.5` to `p-4` for better breathing room
- Added `min-w-[140px]` to legend container to prevent layout collapse
- Added `flex-shrink-0` to emoji icon boxes so they don't compress
- Added `whitespace-nowrap truncate` to category labels to prevent text overflow
- Increased bottom section spacing from `pt-2.5` to `pt-3` and `mt-3` to `mt-3`
- Added `whitespace-nowrap` to venue count text

### Verification
- ✅ Lint passes clean (0 errors, 0 warnings)

---

## Task 3f — Expanded Seed Data (15 New Venues, 5 New States)

### Objective
Add 15 more Malaysian venues to the seed file, covering states that previously had NO data: Perlis, Kedah, Pahang, Terengganu, Negeri Sembilan, plus additional venues for existing states.

### New Venues Added (15 total)

| # | Name | Category | State | Area | Transit |
|---|------|----------|-------|------|--------|
| 1 | Kopi O Kangar | cafe | Perlis | Kangar | — |
| 2 | The White House Coffee | cafe | Kedah | Alor Setar | KTM ETS |
| 3 | Yellow Beach Cafe | cafe | Kedah | Langkawi | — |
| 4 | Artisan Roast Kuantan | cafe | Pahang | Kuantan | KTM ETS |
| 5 | Perpustakaan Negeri Pahang | public_space | Pahang | Kuantan | — |
| 6 | Kopitiam Kita | cafe | Terengganu | Kuala Terengganu | — |
| 7 | SpaceU Coworking KT | coworking | Terengganu | Kuala Terengganu | — |
| 8 | N9 Coffee House | cafe | Negeri Sembilan | Seremban | KTM Komuter |
| 9 | Perpustakaan Negeri Negeri Sembilan | public_space | Negeri Sembilan | Seremban | KTM Komuter |
| 10 | Ferringhi Coffee Garden | cafe | Penang | Batu Ferringhi | — |
| 11 | Muar Riverfront Cafe | cafe | Johor | Muar | KTM ETS |
| 12 | The Good Space Mont Kiara | coworking | Kuala Lumpur | Mont Kiara | MRT Putrajaya Line |
| 13 | Sim Sim Waterfront Cafe | cafe | Sabah | Sandakan | — |
| 14 | Miri City Public Library | public_space | Sarawak | Miri | — |
| 15 | Common Ground Shah Alam | coworking | Selangor | Shah Alam | LRT Shah Alam Line |

### State Coverage
- **Before**: 7 states (Kuala Lumpur, Selangor, Penang, Johor, Melaka, Sabah, Sarawak)
- **After**: 12 states (+ Perlis, Kedah, Pahang, Terengganu, Negeri Sembilan)
- **Total venues**: 40 (up from 25)

### Data Details
- All venues include: workProfile, venueCost (MYR pricing), wifiMetrics (1-2 entries), realistic Google Place IDs
- Transit links added where applicable (KTM ETS, KTM Komuter, MRT Putrajaya Line, LRT Shah Alam Line)
- Ratings range 4.0-4.6, user ratings 78-1873
- Coordinates are realistic WGS84 for each area
- Wi-Fi speeds reflect regional differences (lower in East Malaysia/rural areas, higher in KL/Selangor)

### Verification
- Seed ran successfully: 40 locations across 12 states
- No errors during seeding
- All new states (Perlis, Kedah, Pahang, Terengganu, Negeri Sembilan) populated
