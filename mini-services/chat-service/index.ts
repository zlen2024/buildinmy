import { createServer } from 'http'
import { Server } from 'socket.io'
import ZAI from 'z-ai-web-dev-sdk'

// Reusable ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null
async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ---- Venue data cache ----
interface VenueData {
  id: string
  name: string
  category: string
  state: string
  area: string
  avgDownloadMbps: number
  googleRating: number | null
  googleUserRatingsTotal: number
  formattedAddress: string
  workProfile: {
    powerOutlets: string
    noiseLevel: string
    seatingType: string
    laptopPolicy: string
    hasAirCon: boolean
    callFriendly: boolean
  } | null
  venueCost: {
    coffeePriceMyr: number
    dayPassMyr: number | null
    minSpendMyr: number
  } | null
  transitLinks: Array<{
    nearestStationName: string
    stationLine: string
    walkTimeMins: number
  }>
}

let cachedVenueData: VenueData[] | null = null
let venueDataCacheTime: number = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function fetchVenueData(): Promise<VenueData[]> {
  const now = Date.now()
  if (cachedVenueData && now - venueDataCacheTime < CACHE_TTL_MS) {
    return cachedVenueData
  }
  try {
    const res = await fetch('http://localhost:3000/api/places')
    const data = await res.json()
    cachedVenueData = data.locations || []
    venueDataCacheTime = now
    console.log(`[ChatService] Fetched ${cachedVenueData.length} venues, cached.`)
    return cachedVenueData
  } catch (err) {
    console.error('[ChatService] Failed to fetch venue data:', err)
    return cachedVenueData || []
  }
}

function buildVenueContext(venues: VenueData[]): string {
  if (!venues || venues.length === 0) {
    return 'No venue data is currently available.'
  }

  // Sort by Wi-Fi speed for quick reference
  const sorted = [...venues].sort((a, b) => b.avgDownloadMbps - a.avgDownloadMbps)

  // Build a concise summary
  const topWifi = sorted.slice(0, 15).map((v) => {
    let line = `• ${v.name} (${v.category}) in ${v.area}, ${v.state} — ${v.avgDownloadMbps} Mbps`
    if (v.venueCost) {
      line += ` | Coffee: RM${v.venueCost.coffeePriceMyr}`
      if (v.venueCost.dayPassMyr) line += `, Day Pass: RM${v.venueCost.dayPassMyr}`
    }
    if (v.workProfile) {
      line += ` | Power: ${v.workProfile.powerOutlets}, Noise: ${v.workProfile.noiseLevel}, ${v.workProfile.hasAirCon ? 'AC ✓' : 'AC ✗'}`
    }
    if (v.transitLinks && v.transitLinks.length > 0) {
      line += ` | Near: ${v.transitLinks[0].nearestStationName} (${v.transitLinks[0].walkTimeMins}min walk)`
    }
    return line
  })

  // Category breakdown
  const categories: Record<string, number> = {}
  const states: Record<string, number> = {}
  for (const v of venues) {
    categories[v.category] = (categories[v.category] || 0) + 1
    states[v.state] = (states[v.state] || 0) + 1
  }

  const categorySummary = Object.entries(categories)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
  const stateSummary = Object.entries(states)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')

  return `VENUE DATABASE (${venues.length} total):

STATES: ${stateSummary}
CATEGORIES: ${categorySummary}

TOP WI-FI VENUES:
${topWifi.join('\n')}

CHEAPEST COFFEE VENUES:
${[...venues]
  .filter((v) => v.venueCost)
  .sort((a, b) => a.venueCost!.coffeePriceMyr - b.venueCost!.coffeePriceMyr)
  .slice(0, 10)
  .map((v) => `• ${v.name} (${v.area}, ${v.state}) — RM${v.venueCost!.coffeePriceMyr} coffee, ${v.avgDownloadMbps} Mbps`)
  .join('\n')}

QUIETEST VENUES (noise level: silent/quiet):
${venues
  .filter((v) => v.workProfile && (v.workProfile.noiseLevel === 'silent' || v.workProfile.noiseLevel === 'quiet'))
  .slice(0, 10)
  .map((v) => `• ${v.name} (${v.area}, ${v.state}) — Noise: ${v.workProfile!.noiseLevel}, ${v.avgDownloadMbps} Mbps`)
  .join('\n') || 'No quiet venues found.'}

COWORKING SPACES:
${venues
  .filter((v) => v.category === 'coworking')
  .map((v) => `• ${v.name} (${v.area}, ${v.state}) — ${v.avgDownloadMbps} Mbps${v.venueCost?.dayPassMyr ? `, Day Pass: RM${v.venueCost.dayPassMyr}` : ''}`)
  .join('\n') || 'No coworking spaces found.'}
`
}

const SYSTEM_PROMPT = `You are the NomadMY AI Assistant — a friendly, knowledgeable digital nomad guide for Malaysia. You help remote workers, freelancers, and digital nomads find the best workspaces, cafes, and coworking spaces across Malaysia.

Your tone is warm, helpful, and practical. You give specific venue names, numbers, and actionable advice. When referencing venues, always mention the area and state.

Key things you can help with:
- Recommending workspaces based on criteria (Wi-Fi speed, noise level, price, location, power outlets, AC, transit access)
- Comparing venues
- Digital nomad tips for Malaysia (visas, SIM cards, transport, cost of living, neighborhoods)
- Suggesting areas to live and work in different Malaysian cities
- Best cafes for deep work vs. meetings
- Budget-friendly options

Always format responses in clean, readable markdown. Use bullet points and short paragraphs. Be concise but thorough.

When the user asks about venues, refer to the venue database below. If a question is outside the venue data (e.g., visa tips, SIM cards), use your general knowledge about Malaysia for digital nomads.

{VENUE_CONTEXT}`

// ---- Socket.IO handlers ----
io.on('connection', async (socket) => {
  console.log(`[ChatService] Client connected: ${socket.id}`)

  // Welcome message
  socket.emit('ai-message', {
    role: 'assistant',
    content:
      "👋 **Welcome to NomadMY!** I'm your AI workspace guide for Malaysia.\n\nI can help you find:\n• 🏢 Best coworking spaces with fast Wi-Fi\n• ☕ Quiet cafes for deep work\n• 💰 Budget-friendly options\n• 🇲🇾 Digital nomad tips for Malaysia\n\nTry asking me something or tap a quick question below!",
    timestamp: new Date().toISOString(),
  })

  // Fetch venue data on first connection (cache)
  const venues = await fetchVenueData()
  if (venues.length > 0) {
    console.log(`[ChatService] ${venues.length} venues ready for ${socket.id}`)
  }

  socket.on('message', async (data: { content: string }) => {
    const { content } = data
    if (!content || !content.trim()) return

    console.log(`[ChatService] User message: ${content.substring(0, 80)}`)

    // Emit typing indicator
    socket.emit('typing', { isTyping: true })

    try {
      // Get latest venue data
      const currentVenues = await fetchVenueData()
      const venueContext = buildVenueContext(currentVenues)

      const systemPrompt = SYSTEM_PROMPT.replace('{VENUE_CONTEXT}', venueContext)

      const zai = await getZAI()

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        thinking: { type: 'disabled' },
      })

      const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

      socket.emit('typing', { isTyping: false })
      socket.emit('ai-message', {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      })

      console.log(`[ChatService] AI reply sent (${reply.length} chars)`)
    } catch (err) {
      console.error('[ChatService] LLM error:', err)
      socket.emit('typing', { isTyping: false })
      socket.emit('ai-message', {
        role: 'assistant',
        content:
          "⚠️ I'm having trouble generating a response right now. Please try again in a moment. In the meantime, feel free to explore the map or use the filters to find venues!",
        timestamp: new Date().toISOString(),
      })
    }
  })

  socket.on('disconnect', () => {
    console.log(`[ChatService] Client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`[ChatService] Socket error (${socket.id}):`, error)
  })
})

const PORT = 3005
httpServer.listen(PORT, () => {
  console.log(`[ChatService] AI Chat service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[ChatService] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[ChatService] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[ChatService] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[ChatService] Server closed')
    process.exit(0)
  })
})
