import { NextResponse } from "next/server"

const OLLAMA_URL = "http://localhost:11434/api/generate"
const MODEL_NAME = "gpt-oss:20b-cloud"

type PlannerRequest = {
  origin: string
  destination: string
  budget: number
  currency: string
  days: number
  travelers: number
  tripType: "domestic" | "international"
  travelMonth?: string
}

const cityDistanceKm: Record<string, Record<string, number>> = {
  mumbai: { delhi: 1400, goa: 590, pune: 150, jaipur: 1150, bangalore: 980 },
  delhi: { mumbai: 1400, goa: 1900, jaipur: 280, agra: 230, bangalore: 2150 },
  pune: { mumbai: 150, goa: 450, delhi: 1450 },
  bangalore: { mumbai: 980, delhi: 2150, goa: 560, chennai: 350 },
}

const monthWeather: Record<string, string> = {
  January: "Cooler weather in most places; carry a light jacket for evenings.",
  February: "Pleasant travel weather with comfortable daytime sightseeing.",
  March: "Warm days begin; plan outdoor sights early in the morning.",
  April: "Hotter days in many destinations; keep hydration and shaded breaks planned.",
  May: "Peak summer in many regions; prefer air-conditioned stays and evening outings.",
  June: "Monsoon starts in many parts of India and Southeast Asia; keep rain gear ready.",
  July: "Wet season for many destinations; keep buffer time for local transport.",
  August: "Rain can affect sightseeing; choose central stays and flexible transfers.",
  September: "Post-monsoon conditions improve; expect humid but manageable weather.",
  October: "One of the most comfortable travel months for city and culture trips.",
  November: "Pleasant weather and strong festival-season demand in India.",
  December: "Cool, busy holiday season; book hotels and transport early.",
}

const domesticPlaces: Record<string, { country: string; foods: string[]; sights: string[]; areas: string[] }> = {
  mumbai: {
    country: "India",
    foods: ["Vada pav", "Bombay sandwich", "Seafood thali"],
    sights: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Bandra Fort"],
    areas: ["Colaba", "Bandra", "Andheri"],
  },
  delhi: {
    country: "India",
    foods: ["Chole bhature", "Paratha", "Butter chicken"],
    sights: ["India Gate", "Red Fort", "Qutub Minar", "Humayun's Tomb"],
    areas: ["Connaught Place", "Karol Bagh", "Saket"],
  },
  goa: {
    country: "India",
    foods: ["Goan fish curry", "Prawn balchao", "Bebinca"],
    sights: ["Baga Beach", "Fort Aguada", "Old Goa Churches", "Dudhsagar Falls"],
    areas: ["Calangute", "Panaji", "Candolim"],
  },
}

const internationalDefaults = {
  country: "International",
  foods: ["Local breakfast", "Regional lunch", "Popular dinner"],
  sights: ["Old Town", "City viewpoint", "Museum district", "Local market"],
  areas: ["City Centre", "Old Town", "Transit-friendly district"],
}

function splitDestinations(input: string) {
  return input
    .split(/,|\band\b|\+|&/i)
    .map((place) => place.trim())
    .filter(Boolean)
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(Math.max(Math.round(number), min), max)
}

function estimateDistance(origin: string, destination: string, tripType: PlannerRequest["tripType"]) {
  const from = origin.trim().toLowerCase()
  const to = destination.trim().toLowerCase()
  return cityDistanceKm[from]?.[to] || cityDistanceKm[to]?.[from] || (tripType === "international" ? 4200 : 900)
}

function buildTravelOptions(input: PlannerRequest, displayDestinations: string[], travelers: number, currency: string) {
  const firstDestination = displayDestinations[0]
  const origin = input.origin || "Your city"
  const distance = estimateDistance(origin, firstDestination, input.tripType)
  const flightBase = input.tripType === "international" ? Math.max(250, Math.round(distance * 0.09)) : Math.max(3500, Math.round(distance * 5.8))
  const trainBase = input.tripType === "international" ? Math.max(80, Math.round(distance * 0.025)) : Math.max(600, Math.round(distance * 1.3))
  const busBase = input.tripType === "international" ? Math.max(50, Math.round(distance * 0.018)) : Math.max(500, Math.round(distance * 0.9))

  return [
    {
      id: "travel-flight",
      type: "flight",
      provider: input.tripType === "international" ? "Major airline economy" : "Economy flight",
      route: `${origin} to ${firstDestination}`,
      pricePerPerson: flightBase,
      totalCost: flightBase * travelers,
      duration: input.tripType === "international" ? "4-9 hours" : "1.5-3 hours",
      baggage: input.tripType === "international" ? "Check airline baggage rules" : "15 kg check-in usually available",
      refundable: "Usually partly refundable",
      recommended: distance > 650,
      note: "Estimated fare. Live booking API is required for exact real-time prices.",
    },
    {
      id: "travel-train",
      type: "train",
      provider: input.tripType === "international" ? "Regional rail where available" : "Indian Railways AC class",
      route: `${origin} to ${firstDestination}`,
      pricePerPerson: trainBase,
      totalCost: trainBase * travelers,
      duration: input.tripType === "international" ? "Depends on route" : distance > 1000 ? "14-22 hours" : "5-12 hours",
      baggage: "Flexible baggage",
      refundable: "Cancellation rules vary",
      recommended: input.tripType === "domestic" && distance <= 1200,
      note: "Estimated fare based on distance and typical class pricing.",
    },
    {
      id: "travel-bus",
      type: "bus",
      provider: input.tripType === "international" ? "Coach transfer where available" : "AC sleeper or Volvo bus",
      route: `${origin} to ${firstDestination}`,
      pricePerPerson: busBase,
      totalCost: busBase * travelers,
      duration: distance > 900 ? "Overnight" : "4-10 hours",
      baggage: "Limited luggage",
      refundable: "Operator rules vary",
      recommended: distance <= 650,
      note: "Best for short domestic routes or tighter budgets.",
    },
  ]
}

function buildLocalTransportOptions(input: PlannerRequest, days: number, travelers: number, currency: string) {
  const metroCost = input.tripType === "international" ? 8 : 180
  const taxiCost = input.tripType === "international" ? 35 : 900
  const rentalCost = input.tripType === "international" ? 55 : 1800

  return [
    {
      id: "local-metro",
      mode: input.tripType === "domestic" ? "Metro/local train + short autos" : "Metro/public transport pass",
      totalCost: metroCost * days * travelers,
      costPerDay: metroCost * travelers,
      comfort: "Medium",
      flexibility: "Medium",
      recommended: true,
      note: "Best value when major sights are connected by public transport.",
    },
    {
      id: "local-taxi",
      mode: "Taxi/cab for daily sightseeing",
      totalCost: taxiCost * days,
      costPerDay: taxiCost,
      comfort: "High",
      flexibility: "High",
      recommended: false,
      note: "Better for families, late nights, rain, luggage or scattered attractions.",
    },
    {
      id: "local-rental",
      mode: input.tripType === "domestic" ? "Private car with driver" : "Rental car or private transfer",
      totalCost: rentalCost * days,
      costPerDay: rentalCost,
      comfort: "High",
      flexibility: "Very high",
      recommended: false,
      note: "Useful when public transport is weak or you want day trips.",
    },
  ]
}

function buildHackathonInsights(input: PlannerRequest, displayDestinations: string[], budget: number, currency: string, month: string, travelOptions: any[], localTransportOptions: any[]) {
  const destination = displayDestinations[0]
  const cheapestTravel = [...travelOptions].sort((a, b) => a.totalCost - b.totalCost)[0]
  const fastestTravel = travelOptions.find((option) => option.type === "flight") || travelOptions[0]
  const comfortTravel = travelOptions.find((option) => option.type === "flight") || travelOptions[0]
  const isRainy = ["June", "July", "August", "September"].includes(month)
  const weatherRisk = isRainy ? 74 : ["April", "May"].includes(month) ? 62 : 28
  const safetyScore = Math.max(58, 92 - Math.round(weatherRisk * 0.24) - (input.tripType === "international" ? 4 : 0))
  const flight = travelOptions.find((option) => option.type === "flight")
  const train = travelOptions.find((option) => option.type === "train")
  const bus = travelOptions.find((option) => option.type === "bus")

  return {
    livePriceStatus: {
      source: "Realistic estimates now; API-ready for Amadeus/Skyscanner, hotel APIs and rail providers.",
      lastChecked: new Date().toISOString(),
      confidence: input.tripType === "domestic" ? "Medium" : "Demo estimate",
    },
    comparisonPlans: [
      {
        id: "cheap",
        name: "Cheapest",
        totalCost: Math.round(budget * 0.72),
        travelOptionId: cheapestTravel?.id,
        hotelLevel: "Budget smart stay",
        travelTime: cheapestTravel?.duration || "Flexible",
        comfortScore: 68,
        weatherRisk,
        summary: "Lowest cost by using cheaper transfers, modest hotels and free/low-cost attractions.",
      },
      {
        id: "comfort",
        name: "Comfort",
        totalCost: Math.round(budget * 0.9),
        travelOptionId: comfortTravel?.id,
        hotelLevel: "Central higher-rated stay",
        travelTime: comfortTravel?.duration || "Balanced",
        comfortScore: 88,
        weatherRisk,
        summary: "Better stay area, easier transfers and fewer tiring route changes.",
      },
      {
        id: "fast",
        name: "Fastest",
        totalCost: Math.round(budget * 0.86),
        travelOptionId: fastestTravel?.id,
        hotelLevel: "Transit-friendly stay",
        travelTime: fastestTravel?.duration || "Fast route",
        comfortScore: 78,
        weatherRisk,
        summary: "Prioritizes low travel time and direct transfers, usually with flight or fast rail.",
      },
    ],
    optimizerSuggestions: [
      `Switch to ${cheapestTravel?.provider || "the cheapest travel option"} to reduce total travel cost.`,
      `Pick the lowest-cost hotel option and keep ${destination} sightseeing clustered by area.`,
      "Replace one paid attraction with a free local walk or market visit.",
    ],
    weatherAwarePlan: {
      risk: weatherRisk,
      summary: isRainy
        ? `${month} can bring rain or delays. Put outdoor attractions in the morning and keep indoor backups for afternoon.`
        : `${month} is workable for sightseeing. Keep outdoor walks early and leave evenings flexible.`,
      indoorAlternatives: ["Museum or gallery", "Local market", "Food trail", "Cultural show"],
    },
    safety: {
      score: safetyScore,
      weatherRisk,
      crowdLevel: ["November", "December", "January"].includes(month) ? "High" : "Medium",
      lateNightRisk: "Medium",
      emergency: input.tripType === "domestic" ? "India emergency: 112" : "Save local emergency number before departure",
      nearbyHelp: ["Major hospital near central stay", "Police station in tourist district", "24x7 pharmacy near hotel area"],
    },
    mapPoints: [
      { id: "origin", type: "origin", label: input.origin, area: input.origin, x: 12, y: 72 },
      { id: "destination", type: "destination", label: destination, area: destination, x: 74, y: 28 },
      { id: "hotel", type: "hotel", label: "Selected hotel area", area: destination, x: 62, y: 46 },
      { id: "food", type: "food", label: "Food cluster", area: destination, x: 48, y: 62 },
      { id: "sight", type: "attraction", label: "Sightseeing cluster", area: destination, x: 82, y: 58 },
    ],
    groupVoting: {
      shareCode: `TRV-${Math.abs(`${input.origin}-${destination}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0))}`,
      options: [
        { id: "vote-hotel", label: "Best hotel", votes: 2 },
        { id: "vote-food", label: "Food-first plan", votes: 1 },
        { id: "vote-budget", label: "Save money", votes: 3 },
      ],
    },
    carbon: {
      flightKg: flight ? Math.round((flight.totalCost / Math.max(input.travelers, 1)) * (input.tripType === "domestic" ? 0.035 : 0.08)) : 0,
      trainKg: train ? Math.round((train.totalCost / Math.max(input.travelers, 1)) * 0.012) : 0,
      busKg: bus ? Math.round((bus.totalCost / Math.max(input.travelers, 1)) * 0.018) : 0,
      recommendation: train ? "Train is usually the lower-carbon choice for this route." : "Prefer shared/public transport where available.",
    },
    exportText: `Traveloop plan: ${input.origin} to ${displayDestinations.join(", ")} in ${month}. Budget ${currency} ${budget}.`,
  }
}

function buildFallbackPlan(input: PlannerRequest) {
  const destinations = splitDestinations(input.destination)
  const displayDestinations = destinations.length ? destinations.map(titleCase) : [titleCase(input.destination)]
  const primaryKey = displayDestinations[0].toLowerCase()
  const placeInfo =
    input.tripType === "domestic"
      ? domesticPlaces[primaryKey] || { ...internationalDefaults, country: "India" }
      : internationalDefaults

  const days = clampNumber(input.days, 1, 30, 3)
  const travelers = clampNumber(input.travelers, 1, 20, 1)
  const budget = clampNumber(input.budget, 1, 100000000, 25000)
  const currency = input.currency || (input.tripType === "domestic" ? "INR" : "USD")
  const month = input.travelMonth || "October"
  const nights = Math.max(days - 1, 1)
  const travelOptions = buildTravelOptions(input, displayDestinations, travelers, currency)
  const localTransportOptions = buildLocalTransportOptions(input, days, travelers, currency)
  const selectedTravelOption = travelOptions.find((option) => option.recommended) || travelOptions[0]
  const selectedLocalTransport = localTransportOptions.find((option) => option.recommended) || localTransportOptions[0]

  const accommodation = Math.round(budget * 0.3)
  const food = Math.round(budget * 0.22)
  const transport = Math.min(Math.round(budget * (displayDestinations.length > 1 ? 0.24 : 0.18)), selectedTravelOption.totalCost + selectedLocalTransport.totalCost)
  const attractions = Math.round(budget * 0.12)
  const miscellaneous = Math.max(Math.round(budget * 0.08), 0)
  const total = Math.min(accommodation + food + transport + attractions + miscellaneous, budget)
  const remaining = budget - total
  const perNight = Math.max(Math.round(accommodation / nights), 1)
  const foodPerMeal = Math.max(Math.round(food / Math.max(days * travelers * 3, 1)), 1)
  const tripsPerDay = displayDestinations.length > 1 ? 5 : 4
  const transportTripCost = Math.max(Math.round(transport / Math.max(days * tripsPerDay, 1)), 1)

  const routeTip =
    displayDestinations.length > 1
      ? `Route: ${displayDestinations.join(" -> ")}. Spend at least ${Math.max(1, Math.floor(days / displayDestinations.length))} day(s) in each place and keep one transfer buffer.`
      : `Base yourself near ${placeInfo.areas[0]} to reduce daily travel time.`
  const hackathonInsights = buildHackathonInsights(input, displayDestinations, budget, currency, month, travelOptions, localTransportOptions)

  return {
    destination: displayDestinations.join(", "),
    destinations: displayDestinations,
    origin: input.origin,
    country: input.tripType === "domestic" ? "India" : placeInfo.country,
    duration: days,
    travelers,
    tripType: input.tripType,
    travelMonth: month,
    totalBudget: budget,
    currency,
    selectedTravelOptionId: selectedTravelOption.id,
    selectedAccommodationId: "hotel-1",
    selectedLocalTransportId: selectedLocalTransport.id,
    travelOptions,
    accommodations: placeInfo.areas.slice(0, 3).map((area, index) => ({
      id: `hotel-${index + 1}`,
      name: `${displayDestinations[index % displayDestinations.length]} ${index === 0 ? "Comfort Stay" : "Central Hotel"}`,
      area,
      costPerNight: Math.max(Math.round(perNight * (index === 0 ? 1 : index === 1 ? 0.82 : 1.25)), 1),
      totalCost: Math.max(Math.round(perNight * (index === 0 ? 1 : index === 1 ? 0.82 : 1.25)), 1) * nights,
      rating: index === 0 ? "4.2/5" : index === 1 ? "4.0/5" : "4.5/5",
      amenities: index === 2 ? ["Wi-Fi", "Breakfast", "Airport pickup"] : ["Wi-Fi", "Breakfast", "Air conditioning"],
      bookingTip: index === 1 ? "Lower price option; check commute time before booking." : "Choose free cancellation and check recent guest reviews before payment.",
      distanceFromCenter: index === 0 ? "Central area" : index === 1 ? "15-25 minutes from main sights" : "Premium central location",
      recommended: index === 0,
    })),
    meals: ["Breakfast", "Lunch", "Dinner"].map((mealType, index) => ({
      id: `m${index + 1}`,
      mealType,
      restaurantName: `${displayDestinations[0]} local ${mealType.toLowerCase()} spot`,
      dish: placeInfo.foods[index] || placeInfo.foods[0],
      costPerPerson: foodPerMeal,
      totalCost: foodPerMeal * travelers * days,
      occurrences: days,
      location: index === 0 ? "Near hotel" : "Near sightseeing area",
      tip: index === 0 ? "Keep breakfast close to the hotel to start early." : "Mix one popular restaurant with one local eatery each day.",
    })),
    transport: [
      {
        id: "t1",
        mode: input.tripType === "domestic" ? "Metro, cab and auto mix" : "Public transport pass plus short cabs",
        costPerTrip: transportTripCost,
        estimatedTrips: days * tripsPerDay,
        totalCost: transportTripCost * days * tripsPerDay,
        avgTime: "20-45 minutes",
        tip: "Use public transport for predictable routes and cabs late at night.",
        recommended: true,
      },
      {
        id: "t2",
        mode: displayDestinations.length > 1 ? "Intercity train or flight" : "Airport or station transfer",
        costPerTrip: Math.max(Math.round(transport * 0.35), 1),
        estimatedTrips: displayDestinations.length > 1 ? displayDestinations.length - 1 : 2,
        totalCost: Math.max(Math.round(transport * 0.35), 1) * (displayDestinations.length > 1 ? displayDestinations.length - 1 : 2),
        avgTime: displayDestinations.length > 1 ? "2-8 hours" : "45-90 minutes",
        tip: "Book transfers early in peak months.",
        recommended: displayDestinations.length > 1,
      },
    ],
    localTransportOptions,
    ...hackathonInsights,
    attractions: placeInfo.sights.map((name, index) => ({
      id: `a${index + 1}`,
      name,
      type: index < 2 ? "Must-see" : "Culture",
      entryFee: index === 0 ? 0 : Math.max(Math.round(attractions / Math.max(placeInfo.sights.length * travelers, 1)), 1),
      duration: index < 2 ? "1-2 hours" : "2-3 hours",
      bestTime: index % 2 === 0 ? "Morning" : "Evening",
      location: displayDestinations[index % displayDestinations.length],
      tip: index === 0 ? "Go early to avoid queues and heat." : "Check opening days before final booking.",
      mustVisit: index < 2,
    })),
    budgetBreakdown: {
      accommodation,
      food,
      transport,
      attractions,
      miscellaneous,
      total,
      remaining,
    },
    suggestions: [
      routeTip,
      input.tripType === "international"
        ? "Confirm visa, passport validity, travel insurance and local payment options before booking."
        : "Carry a government ID and keep train, bus or flight tickets available offline.",
      `For ${month}, ${monthWeather[month] || "check the 7-day forecast before departure and pack layers."}`,
    ],
    checklist:
      input.tripType === "international"
        ? ["Valid passport", "Visa or entry documents", "Travel insurance", "Foreign currency or forex card", "Flight tickets", "Hotel bookings", "International roaming or eSIM"]
        : ["Government ID", "Hotel booking confirmation", "Train, bus or flight tickets", "Emergency cash", "Weather-ready clothes"],
    weatherTip: monthWeather[month] || "Check the forecast before departure and keep a flexible sightseeing plan.",
    bestTimeToVisit: input.tripType === "domestic" ? "October to March" : "Shoulder season when flights and hotels are cheaper",
  }
}

function normalizeInput(raw: any): PlannerRequest {
  const tripType = raw.tripType === "international" ? "international" : "domestic"
  return {
    origin: String(raw.origin || "").trim() || "Your city",
    destination: String(raw.destination || "").trim(),
    budget: clampNumber(raw.budget, 1, 100000000, 25000),
    currency: raw.currency || (tripType === "domestic" ? "INR" : "USD"),
    days: clampNumber(raw.days, 1, 30, 3),
    travelers: clampNumber(raw.travelers, 1, 20, 1),
    tripType,
    travelMonth: raw.travelMonth || "October",
  }
}

export async function POST(req: Request) {
  try {
    const input = normalizeInput(await req.json())

    if (!input.destination || !input.budget || !input.days) {
      return NextResponse.json({ error: "Destination, budget and days are required." }, { status: 400 })
    }

    const fallbackPlan = buildFallbackPlan(input)
    const prompt = `Return ONLY valid compact JSON for a realistic travel plan. No markdown.
Trip: from ${input.origin} to ${input.destination}; type: ${input.tripType}; month: ${input.travelMonth}; budget: ${input.currency} ${input.budget}; days: ${input.days}; travelers: ${input.travelers}.
Use this exact JSON shape and keep total <= budget:
${JSON.stringify(fallbackPlan)}
Improve names, costs, local food, weather, route and tips using real places. Include multiple flight/train/bus, hotel and local transport choices. Prices may be estimates, not live fares.`

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt,
          stream: false,
          format: "json",
          options: { temperature: 0.45, num_predict: 4096 },
        }),
        signal: AbortSignal.timeout(20000),
      })

      if (!response.ok) return NextResponse.json(fallbackPlan)

      const data = await response.json()
      const cleaned = String(data.response || "")
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()

      if (!cleaned) return NextResponse.json(fallbackPlan)

      try {
        const itinerary = JSON.parse(cleaned)
        return NextResponse.json({ ...fallbackPlan, ...itinerary })
      } catch {
        return NextResponse.json(fallbackPlan)
      }
    } catch {
      return NextResponse.json(fallbackPlan)
    }
  } catch {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}
