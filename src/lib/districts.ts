/**
 * District data helpers for NomadMY.
 *
 * Krackedmaps exposes a `DISTRICTS` array containing every Malaysian district
 * (slug, name, state, path, centroid). We use this to:
 *  - list districts per state for the district filter UI
 *  - find a district's slug given its display name + state
 *  - compute venue counts per district for the heatmap/badges
 *
 * NOTE: The slug scheme used by krackedmaps for `selectDistrict(key)` is the
 * district NAME (not a slugified version) — verified by inspecting
 * `krackedmaps-districts.geojson` properties.slug field which equals the name.
 */

import type { LocationPin } from './map-store'

/** State slug → array of district display names available in krackedmaps. */
export const STATE_DISTRICTS: Record<string, string[]> = {
  'kuala-lumpur': ['Kuala Lumpur'],
  'putrajaya': [],
  'selangor': ['Kuala Selangor', 'Ulu Selangor', 'Sepang', 'Klang', 'Kuala Langat', 'Petaling', 'Gombak', 'Ulu Langat'],
  'penang': ['Seberang Perai Selatan', 'Seberang Perai Tengah', 'Seberang Perai Utara', 'Barat Daya', 'Timur Laut'],
  'johor': ['Segamat', 'Ledang', 'Muar', 'Batu Pahat', 'Kluang', 'Kulaijaya', 'Pontian', 'Johor Bahru', 'Kota Tinggi', 'Rompin', 'Mersing'],
  'melaka': ['Alor Gajah', 'Melaka Tengah', 'Jasin'],
  'sabah': ['Sipitang', 'Tenom', 'Beaufort', 'Kuala Penyu', 'Nabawan / Persiangan', 'Keningau', 'Papar', 'Putatan', 'Tambunan', 'Penampang', 'Kota Kinabalu', 'Tuaran', 'Kota Belud', 'Ranau', 'Kota Marudu', 'Kudat', 'Kalabakan', 'Tawau', 'Kunak', 'Semporna', 'Lahad Datu', 'Tongod', 'Kinabatangan', 'Sandakan', 'Telupid', 'Beluran', 'Pitas'],
  'sarawak': ['Lundu', 'Bau', 'Kuching', 'Samarahan', 'Asajaya', 'Tebedu', 'Serian', 'Simunjan', 'Sri Aman', 'Betong', 'Pusa', 'Saratok', 'Kabong', 'Sarikei', 'Pakan', 'Lubok Antu', 'Julau', 'Maradong', 'Kanowit', 'Sibu', 'Song', 'Selangau', 'Dalat', 'Kapit', 'Tatau', 'Mukah', 'Matu', 'Daro', 'Bintulu', 'Sebauh', 'Bukit Mabong', 'Belaga', 'Beluru', 'Subis', 'Miri', 'Telang Usan', 'Marudi', 'Lawas', 'Limbang', 'Tanjung Manis'],
  'perlis': ['Perlis', 'Langkawi'],
  'kedah': ['Bandar Baharu', 'Kulim', 'Baling', 'Kuala Muda', 'Yan', 'Pendang', 'Sik', 'Kota Setar', 'Pokok Sena', 'Padang Terap', 'Kubang Pasu'],
  'pahang': ['Cameron Highlands', 'Lipis', 'Jerantut', 'Raub', 'Kuantan', 'Temerloh', 'Maran', 'Pekan', 'Bentong', 'Bera'],
  'terengganu': ['Hulu Terengganu', 'Setiu', 'Kuala Terengganu', 'Dungun', 'Kemaman', 'Besut', 'Kuala Nerus', 'Marang'],
  'negeri-sembilan': ['Jelebu', 'Jempol', 'Kuala Pilah', 'Rembau', 'Tampin', 'Seremban', 'Port Dickson'],
  'kelantan': ['Tumpat', 'Kota Bharu', 'Pasir Puteh', 'Pasir Mas', 'Machang', 'Tanah Merah', 'Jeli', 'Kuala Krai', 'Kecil Lojing', 'Gua Musang', 'Bachok'],
  'perak': ['Hulu Perak', 'Selama', 'Kerian', 'Larut dan Matang', 'Kuala Kangsar', 'Kampar', 'Kinta', 'Perak Tengah', 'Hilir Perak', 'Muallim', 'Batang Padang', 'Bagan Datuk', 'Sabak Bernam', 'Manjung'],
  'labuan': [],
}

/** Reverse lookup: state slug → district display name → district slug.
 *  In krackedmaps, district `slug` equals the district `name` (case-sensitive). */
export function getDistrictSlug(stateSlug: string, districtName: string): string | null {
  const districts = STATE_DISTRICTS[stateSlug]
  if (!districts) return null
  return districts.includes(districtName) ? districtName : null
}

/** Build a list of districts in the selected state that actually have venues. */
export interface DistrictInfo {
  name: string
  count: number
  avgWifi: number
  topCategory: string | null
}

export function getDistrictSummaries(
  stateSlug: string,
  stateDisplayName: string,
  locations: LocationPin[],
): DistrictInfo[] {
  // Map state slug to display name(s) we filter on
  const stateDisplayMap: Record<string, string[]> = {
    'kuala-lumpur': ['Kuala Lumpur'],
    'putrajaya': ['Kuala Lumpur'],
    'selangor': ['Selangor'],
    'penang': ['Penang'],
    'johor': ['Johor'],
    'melaka': ['Melaka'],
    'sabah': ['Sabah'],
    'sarawak': ['Sarawak'],
    'perlis': ['Perlis'],
    'kedah': ['Kedah'],
    'pahang': ['Pahang'],
    'terengganu': ['Terengganu'],
    'negeri-sembilan': ['Negeri Sembilan'],
  }
  const allowedStates = stateDisplayMap[stateSlug] || []
  const stateLocations = locations.filter(
    (l) => allowedStates.includes(l.state) || (stateSlug === 'putrajaya' && l.state === stateDisplayName),
  )

  const byDistrict = new Map<string, LocationPin[]>()
  for (const loc of stateLocations) {
    if (!loc.district) continue
    const arr = byDistrict.get(loc.district) || []
    arr.push(loc)
    byDistrict.set(loc.district, arr)
  }

  const out: DistrictInfo[] = []
  for (const [name, locs] of byDistrict) {
    const avgWifi = Math.round(
      locs.reduce((s, l) => s + l.avgDownloadMbps, 0) / Math.max(1, locs.length),
    )
    const catCount: Record<string, number> = {}
    for (const l of locs) catCount[l.category] = (catCount[l.category] || 0) + 1
    const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    out.push({ name, count: locs.length, avgWifi, topCategory })
  }
  // Sort by count desc, then by name
  out.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  return out
}

/**
 * Zoom the krackedmaps SVG viewBox into a specific district path.
 *
 * krackedmaps doesn't expose a `focusDistrict()` method, so we manually:
 *  1. Find the district `<path>` element via its DOM id (`district-${state}-${slug}`)
 *  2. Call getBBox() to measure its bounds in SVG user units
 *  3. Animate the SVG's viewBox to a tighter crop centred on the district
 *
 * The zoom factor controls how close we zoom:
 *  - 0.05 padding (5%) → very close "district" view
 *  - 0.35 of district size → "street" view (zoomed 2-3x closer than district)
 *
 * The animation uses requestAnimationFrame with cubic ease-out, mirroring
 * krackedmaps' internal `i1()` viewBox animator for visual consistency.
 */
export interface ViewBox { x: number; y: number; w: number; h: number }

export function parseViewBox(svg: SVGSVGElement): ViewBox | null {
  const vb = svg.getAttribute('viewBox')
  if (!vb) return null
  const [x, y, w, h] = vb.split(/[\s,]+/).map(Number)
  if ([x, y, w, h].some((n) => Number.isNaN(n))) return null
  return { x, y, w, h }
}

/**
 * Find a district path element in the rendered krackedmaps SVG.
 *
 * krackedmaps district paths have:
 *   - id = `district-${stateSlug}-${districtSlug}` where districtSlug is
 *     slugified (lowercase, hyphens for spaces) — e.g. `district-selangor-petaling`
 *   - data-slug attribute = the slugified district name (e.g. `petaling`)
 *
 * The `districtName` parameter we receive is the DISPLAY name (e.g.
 * "Petaling" or "Kota Bharu"), so we slugify it before matching.
 */
export function slugifyDistrict(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Build the composite key krackedmaps uses internally: "state/slug"
 */
export function districtCompositeKey(stateSlug: string, districtName: string): string {
  return `${slugifyDistrict(stateSlug)}/${slugifyDistrict(districtName)}`
}

export function findDistrictPath(
  svg: SVGSVGElement,
  stateSlug: string,
  districtName: string,
): SVGPathElement | null {
  if (!svg || !districtName) return null
  const districtSlug = slugifyDistrict(districtName)
  const compositeKey = districtCompositeKey(stateSlug, districtName)

  // 1. Try direct ID selector first (fastest): id="district-{state}-{slug}"
  const directId = `district-${slugifyDistrict(stateSlug)}-${districtSlug}`
  try {
    const byId = svg.querySelector<SVGPathElement>(`#${CSS.escape(directId)}`)
    if (byId) return byId
  } catch {
    /* ignore */
  }

  // 2. Try composite key selector: data-key="state/slug"
  try {
    const byComposite = svg.querySelector<SVGPathElement>(
      `path.district[data-key="${CSS.escape(compositeKey)}"]`
    )
    if (byComposite) return byComposite
  } catch {
    /* ignore */
  }

  // 3. Try data-slug selector
  try {
    const bySlug = svg.querySelector<SVGPathElement>(
      `path.district[data-slug="${CSS.escape(districtSlug)}"]`
    )
    if (bySlug) return bySlug
  } catch {
    /* ignore */
  }

  // 4. Brute-force scan all .district paths
  const allDistricts = svg.querySelectorAll<SVGPathElement>('path.district')
  for (const path of allDistricts) {
    const slug = path.getAttribute('data-slug') || ''
    const name = path.getAttribute('data-name') || ''
    const key = path.getAttribute('data-key') || ''
    // data-key is "state/slug" in krackedmaps — extract the slug portion
    const keySlugPart = key.includes('/') ? key.split('/').pop() || '' : key

    if (
      slugifyDistrict(slug) === districtSlug ||
      slugifyDistrict(name) === districtSlug ||
      slugifyDistrict(keySlugPart) === districtSlug ||
      name.toLowerCase() === districtName.toLowerCase()
    ) {
      return path
    }
  }

  return null
}

/**
 * Compute a target viewBox for a district given its bounding box.
 * Padding ratio 0.05 = very tight (street-ish), 0.15 = comfortable (district).
 */
export function computeDistrictViewBox(
  bbox: DOMRect | { x: number; y: number; width: number; height: number },
  aspectRatio: number,
  paddingRatio = 0.15,
): ViewBox {
  const padW = bbox.width * paddingRatio
  const padH = bbox.height * paddingRatio
  let w = bbox.width + padW * 2
  let h = bbox.height + padH * 2
  // Maintain aspect ratio to avoid distortion
  if (w / h < aspectRatio) {
    w = h * aspectRatio
  } else {
    h = w / aspectRatio
  }
  return {
    x: bbox.x + bbox.width / 2 - w / 2,
    y: bbox.y + bbox.height / 2 - h / 2,
    w,
    h,
  }
}

/**
 * Animate an SVG's viewBox from its current value to a target using rAF
 * with cubic ease-out. Returns a cancel function.
 */
export function animateViewBox(
  svg: SVGSVGElement,
  target: ViewBox,
  durationMs = 600,
  onUpdate?: (vb: ViewBox) => void,
): () => void {
  const start = parseViewBox(svg)
  if (!start) {
    svg.setAttribute('viewBox', `${target.x} ${target.y} ${target.w} ${target.h}`)
    onUpdate?.(target)
    return () => {}
  }
  let raf = 0
  const startTime = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - startTime) / durationMs)
    const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
    const cur: ViewBox = {
      x: start.x + (target.x - start.x) * eased,
      y: start.y + (target.y - start.y) * eased,
      w: start.w + (target.w - start.w) * eased,
      h: start.h + (target.h - start.h) * eased,
    }
    svg.setAttribute('viewBox', `${cur.x} ${cur.y} ${cur.w} ${cur.h}`)
    onUpdate?.(cur)
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
