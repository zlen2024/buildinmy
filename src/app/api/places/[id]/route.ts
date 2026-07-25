import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const location = await db.location.findUnique({
      where: { id },
      include: {
        workProfile: true,
        venueCost: true,
        wifiMetrics: {
          orderBy: { createdAt: 'desc' },
        },
        transitLinks: true,
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const avgDownload =
      location.wifiMetrics.length > 0
        ? Math.round(location.wifiMetrics.reduce((sum, m) => sum + m.downloadMbps, 0) / location.wifiMetrics.length)
        : 0
    const avgUpload =
      location.wifiMetrics.length > 0
        ? Math.round(location.wifiMetrics.reduce((sum, m) => sum + m.uploadMbps, 0) / location.wifiMetrics.length)
        : 0
    const avgPing =
      location.wifiMetrics.length > 0
        ? Math.round(location.wifiMetrics.reduce((sum, m) => sum + (m.pingMs || 0), 0) / location.wifiMetrics.length)
        : 0

    return NextResponse.json({
      id: location.id,
      googlePlaceId: location.googlePlaceId,
      name: location.name,
      formattedAddress: location.formattedAddress,
      category: location.category,
      state: location.state,
      area: location.area,
      latitude: location.latitude,
      longitude: location.longitude,
      googleRating: location.googleRating,
      googleUserRatingsTotal: location.googleUserRatingsTotal,
      googleMapsUrl: location.googleMapsUrl,
      isOperational: location.isOperational,
      workProfile: location.workProfile,
      venueCost: location.venueCost,
      wifiMetrics: location.wifiMetrics,
      transitLinks: location.transitLinks,
      wifiSummary: {
        avgDownload,
        avgUpload,
        avgPing,
        testCount: location.wifiMetrics.length,
      },
    })
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 })
  }
}
