import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const locations = await db.location.findMany({
      where: {
        isOperational: true,
      },
      include: {
        workProfile: true,
        venueCost: true,
        wifiMetrics: true,
      },
      orderBy: { name: 'asc' },
    })

    // Build CSV rows
    const header = [
      'Name',
      'Category',
      'State',
      'District',
      'Area',
      'Latitude',
      'Longitude',
      'Wi-Fi Speed (Mbps)',
      'Rating',
      'Coffee Price (MYR)',
      'Day Pass (MYR)',
      'Power Outlets',
      'Noise Level',
    ]

    const rows = locations.map((loc) => {
      const avgWifi =
        loc.wifiMetrics.length > 0
          ? (loc.wifiMetrics.reduce((sum, m) => sum + m.downloadMbps, 0) / loc.wifiMetrics.length).toFixed(1)
          : '0'

      return [
        `"${(loc.name || '').replace(/"/g, '""')}"`,
        loc.category || '',
        `"${(loc.state || '').replace(/"/g, '""')}"`,
        `"${(loc.district || '').replace(/"/g, '""')}"`,
        `"${(loc.area || '').replace(/"/g, '""')}"`,
        String(loc.latitude),
        String(loc.longitude),
        avgWifi,
        loc.googleRating ? String(loc.googleRating) : '',
        loc.venueCost ? String(loc.venueCost.coffeePriceMyr) : '',
        loc.venueCost?.dayPassMyr ? String(loc.venueCost.dayPassMyr) : '',
        loc.workProfile?.powerOutlets || '',
        loc.workProfile?.noiseLevel || '',
      ].join(',')
    })

    const csv = [header.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nomadmy-venues.csv"',
      },
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json({ error: 'Failed to export venues' }, { status: 500 })
  }
}
