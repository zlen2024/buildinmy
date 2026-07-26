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
