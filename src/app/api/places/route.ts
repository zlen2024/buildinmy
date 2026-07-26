import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const category = searchParams.get('category')
    const minWifi = searchParams.get('minWifi')
    const query = searchParams.get('q')

    const locations = await db.location.findMany({
      where: {
        isOperational: true,
        ...(state && { state }),
        ...(category && category !== 'all' && { category }),
      },
      include: {
        workProfile: true,
        venueCost: true,
        wifiMetrics: true,
        transitLinks: true,
      },
      orderBy: { name: 'asc' },
    })

    // Calculate average Wi-Fi speed per location
    const enriched = locations.map((loc) => {
      const avgDownload =
        loc.wifiMetrics.length > 0
          ? Math.round(loc.wifiMetrics.reduce((sum, m) => sum + m.downloadMbps, 0) / loc.wifiMetrics.length)
          : 0

      return {
        id: loc.id,
        googlePlaceId: loc.googlePlaceId,
        name: loc.name,
        formattedAddress: loc.formattedAddress,
        category: loc.category,
        state: loc.state,
        district: loc.district,
        area: loc.area,
        latitude: loc.latitude,
        longitude: loc.longitude,
        googleRating: loc.googleRating,
        googleUserRatingsTotal: loc.googleUserRatingsTotal,
        googleMapsUrl: loc.googleMapsUrl,
        isOperational: loc.isOperational,
        avgDownloadMbps: avgDownload,
        workProfile: loc.workProfile
          ? {
              powerOutlets: loc.workProfile.powerOutlets,
              noiseLevel: loc.workProfile.noiseLevel,
              seatingType: loc.workProfile.seatingType,
              laptopPolicy: loc.workProfile.laptopPolicy,
              hasAirCon: loc.workProfile.hasAirCon,
              callFriendly: loc.workProfile.callFriendly,
              operatingHours: loc.workProfile.operatingHours,
            }
          : null,
        venueCost: loc.venueCost
          ? {
              coffeePriceMyr: loc.venueCost.coffeePriceMyr,
              dayPassMyr: loc.venueCost.dayPassMyr,
              minSpendMyr: loc.venueCost.minSpendMyr,
            }
          : null,
        transitLinks: loc.transitLinks.map((t) => ({
          nearestStationName: t.nearestStationName,
          stationLine: t.stationLine,
          walkTimeMins: t.walkTimeMins,
          distanceMeters: t.distanceMeters,
        })),
      }
    })

    // Client-side filtering for search query and wifi
    let filtered = enriched
    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.area.toLowerCase().includes(q) ||
          loc.state.toLowerCase().includes(q) ||
          loc.formattedAddress.toLowerCase().includes(q)
      )
    }
    if (minWifi && parseInt(minWifi) > 0) {
      const speed = parseInt(minWifi)
      filtered = filtered.filter((loc) => loc.avgDownloadMbps >= speed)
    }

    // Get counts by state
    const stateCounts: Record<string, number> = {}
    for (const loc of enriched) {
      stateCounts[loc.state] = (stateCounts[loc.state] || 0) + 1
    }

    return NextResponse.json({
      locations: filtered,
      total: enriched.length,
      stateCounts,
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}
