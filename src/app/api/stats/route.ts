import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const totalLocations = await db.location.count({ where: { isOperational: true } })

    const categoryCounts = await db.location.groupBy({
      by: ['category'],
      where: { isOperational: true },
      _count: true,
    })

    const stateCounts = await db.location.groupBy({
      by: ['state'],
      where: { isOperational: true },
      _count: true,
    })

    // Average Wi-Fi speed
    const wifiMetrics = await db.wifiMetric.findMany()
    const avgWifi =
      wifiMetrics.length > 0
        ? Math.round(wifiMetrics.reduce((sum, m) => sum + m.downloadMbps, 0) / wifiMetrics.length)
        : 0

    // Average coffee price
    const venueCosts = await db.venueCost.findMany()
    const avgCoffee =
      venueCosts.length > 0
        ? Math.round((venueCosts.reduce((sum, c) => sum + c.coffeePriceMyr, 0) / venueCosts.length) * 100) / 100
        : 0

    return NextResponse.json({
      totalLocations,
      categories: categoryCounts.map((c) => ({ name: c.category, count: c._count })),
      states: stateCounts.map((s) => ({ name: s.state, count: s._count })),
      avgWifiSpeed: avgWifi,
      avgCoffeePrice: avgCoffee,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
