import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'trips.json')
const INDIAN_DESTINATIONS = new Set(['mumbai', 'delhi', 'goa', 'pune', 'jaipur', 'udaipur', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'agra'])

async function getTrips() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function normalizeTrip(trip: any) {
  const destination = String(trip.destination || '')
  const firstDestination = destination.split(',')[0].trim().toLowerCase()
  const isDomestic = trip.tripType === 'domestic' || INDIAN_DESTINATIONS.has(firstDestination)
  const country = !trip.country || trip.country === 'Unknown' ? (isDomestic ? 'India' : 'International') : trip.country
  const currency = trip.currency || (isDomestic ? 'INR' : 'USD')

  return {
    ...trip,
    country,
    currency,
    status: trip.status || 'upcoming',
    image: trip.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  
  const allTrips = await getTrips()
  const userTrips = allTrips.filter((t: any) => t.userEmail === email).map(normalizeTrip)
  
  return NextResponse.json(userTrips)
}

export async function POST(req: Request) {
  try {
    const trip = await req.json()
    const { userEmail } = trip
    
    if (!userEmail) return NextResponse.json({ error: 'User email required' }, { status: 400 })
    
    const trips = await getTrips()
    const normalizedTrip = normalizeTrip(trip)
    trips.unshift(normalizedTrip) // Add to beginning
    
    try {
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    } catch(e) {}
    
    await fs.writeFile(DB_PATH, JSON.stringify(trips, null, 2))
    return NextResponse.json({ success: true, trip: normalizedTrip })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const updatedTrip = await req.json()
    const { id, userEmail } = updatedTrip

    if (!id || !userEmail) {
      return NextResponse.json({ error: 'Trip id and user email required' }, { status: 400 })
    }

    const trips = await getTrips()
    const index = trips.findIndex((trip: any) => trip.id === id && trip.userEmail === userEmail)

    if (index === -1) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const normalizedTrip = normalizeTrip({
      ...trips[index],
      ...updatedTrip,
      itinerary: {
        ...trips[index].itinerary,
        ...updatedTrip.itinerary,
      },
    })

    trips[index] = normalizedTrip
    await fs.writeFile(DB_PATH, JSON.stringify(trips, null, 2))

    return NextResponse.json({ success: true, trip: normalizedTrip })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const userEmail = searchParams.get('email')

    if (!id || !userEmail) {
      return NextResponse.json({ error: 'Trip id and email required' }, { status: 400 })
    }

    const trips = await getTrips()
    const nextTrips = trips.filter((trip: any) => !(trip.id === id && trip.userEmail === userEmail))

    if (nextTrips.length === trips.length) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    await fs.writeFile(DB_PATH, JSON.stringify(nextTrips, null, 2))

    return NextResponse.json({ success: true, id })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
