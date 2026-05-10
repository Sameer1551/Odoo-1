"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Bus,
  Car,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  CloudRain,
  Copy,
  Download,
  Flag,
  Globe,
  Hotel,
  Landmark,
  Leaf,
  Lightbulb,
  Map,
  MapPin,
  MessageSquare,
  Plane,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Train,
  Trash2,
  Utensils,
  Users,
  Wallet,
  Wand2,
} from "lucide-react"
import type { Trip } from "@/components/dashboard/trip-card"

interface Meal {
  id: string
  mealType: string
  restaurantName: string
  dish: string
  costPerPerson: number
  totalCost: number
  occurrences: number
  location: string
  tip: string
}

interface Transport {
  id: string
  mode: string
  costPerTrip: number
  estimatedTrips: number
  totalCost: number
  avgTime: string
  tip: string
  recommended: boolean
}

interface Attraction {
  id: string
  name: string
  type: string
  entryFee: number
  duration: string
  bestTime: string
  location: string
  tip: string
  mustVisit: boolean
}

interface Itinerary {
  origin?: string
  destination: string
  destinations?: string[]
  country: string
  duration: number
  travelers?: number
  tripType?: "domestic" | "international"
  travelMonth?: string
  totalBudget: number
  currency: string
  selectedTravelOptionId?: string
  selectedAccommodationId?: string
  selectedLocalTransportId?: string
  travelOptions?: {
    id: string
    type: "flight" | "train" | "bus"
    provider: string
    route: string
    pricePerPerson: number
    totalCost: number
    duration: string
    baggage: string
    refundable: string
    recommended: boolean
    note: string
  }[]
  localTransportOptions?: {
    id: string
    mode: string
    totalCost: number
    costPerDay: number
    comfort: string
    flexibility: string
    recommended: boolean
    note: string
  }[]
  livePriceStatus?: { source: string; lastChecked: string; confidence: string }
  comparisonPlans?: {
    id: string
    name: string
    totalCost: number
    travelOptionId?: string
    hotelLevel: string
    travelTime: string
    comfortScore: number
    weatherRisk: number
    summary: string
  }[]
  optimizerSuggestions?: string[]
  weatherAwarePlan?: { risk: number; summary: string; indoorAlternatives: string[] }
  safety?: {
    score: number
    weatherRisk: number
    crowdLevel: string
    lateNightRisk: string
    emergency: string
    nearbyHelp: string[]
  }
  mapPoints?: { id: string; type: string; label: string; area: string; x: number; y: number }[]
  groupVoting?: { shareCode: string; options: { id: string; label: string; votes: number }[] }
  carbon?: { flightKg: number; trainKg: number; busKg: number; recommendation: string }
  exportText?: string
  accommodations: {
    id?: string
    name: string
    area: string
    costPerNight: number
    totalCost: number
    rating: string
    amenities: string[]
    bookingTip: string
    distanceFromCenter: string
    recommended?: boolean
  }[]
  meals: Meal[]
  transport: Transport[]
  attractions: Attraction[]
  budgetBreakdown: {
    accommodation: number
    food: number
    transport: number
    attractions: number
    miscellaneous: number
    total: number
    remaining: number
  }
  suggestions: string[]
  checklist: string[]
  weatherTip: string
  bestTimeToVisit: string
}

type PlannerFormData = {
  origin: string
  destination: string
  budget: number
  days: number
  travelers: number
  tripType: "domestic" | "international"
  travelMonth: string
  currency: string
}

type SavedTrip = Trip & {
  userEmail: string
  currency: string
  duration: number
  travelMonth: string
  origin: string
  tripType: "domestic" | "international"
  itinerary: Itinerary
  createdAt: string
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const destinationImages = [
  "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
]

function money(currency: string, amount: number) {
  const code = currency === "$" ? "USD" : currency === "₹" ? "INR" : currency

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

function Section({ title, icon: Icon, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card className="bg-card border-border/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-t-lg"
      >
        <h3 className="font-semibold flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </h3>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

function BudgetBar({ label, amount, total, color, currency }: { label: string; amount: number; total: number; color: string; currency: string }) {
  const pct = total > 0 ? Math.min((amount / total) * 100, 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{money(currency, amount)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function PlannerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-lg bg-muted/70" />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-lg border border-border bg-muted/60" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/60" />
    </div>
  )
}

function PlannerForm({ onSubmit, isLoading }: { onSubmit: (data: PlannerFormData) => void; isLoading: boolean }) {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    budget: "",
    days: "3",
    travelers: "1",
    tripType: "domestic" as "domestic" | "international",
    travelMonth: months[new Date().getMonth()],
  })
  const currency = form.tripType === "domestic" ? "INR" : "USD"

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.origin.trim() || !form.destination.trim() || !form.budget) return

    onSubmit({
      ...form,
      currency,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      budget: Number(form.budget),
      days: Number(form.days),
      travelers: Number(form.travelers),
    })
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-5 h-5 text-primary" />
          Plan My Trip
        </CardTitle>
        <p className="text-sm text-muted-foreground">Create and save a complete travel plan with stay, food, transport, budget and weather notes.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.tripType === "domestic" ? "default" : "outline"}
              onClick={() => setForm({ ...form, tripType: "domestic" })}
              className="h-11"
            >
              <Flag className="w-4 h-4 mr-2" />
              Domestic
            </Button>
            <Button
              type="button"
              variant={form.tripType === "international" ? "default" : "outline"}
              onClick={() => setForm({ ...form, tripType: "international" })}
              className="h-11"
            >
              <Globe className="w-4 h-4 mr-2" />
              International
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Starting from</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={form.tripType === "domestic" ? "e.g. Pune, Mumbai, Delhi" : "e.g. Mumbai, London"}
                  value={form.origin}
                  onChange={(event) => setForm({ ...form, origin: event.target.value })}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Destination or route</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={form.tripType === "domestic" ? "Mumbai, Delhi or Mumbai + Goa" : "Paris, Dubai or Bangkok + Phuket"}
                  value={form.destination}
                  onChange={(event) => setForm({ ...form, destination: event.target.value })}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Travel month</Label>
              <select
                value={form.travelMonth}
                onChange={(event) => setForm({ ...form, travelMonth: event.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {months.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Total budget ({currency})</Label>
              <Input
                type="number"
                placeholder={form.tripType === "domestic" ? "25000" : "1200"}
                value={form.budget}
                onChange={(event) => setForm({ ...form, budget: event.target.value })}
                required
                min={1}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Days</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={form.days}
                onChange={(event) => setForm({ ...form, days: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Travelers</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.travelers}
                onChange={(event) => setForm({ ...form, travelers: event.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Building your options...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Plan My Trip
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function AiPlanner({ onTripSaved, onViewTrips }: { onTripSaved?: (trip: SavedTrip) => void; onViewTrips?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [plan, setPlan] = useState<Itinerary | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [transport, setTransport] = useState<Transport[]>([])
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [checklist, setChecklist] = useState<{ text: string; checked: boolean }[]>([])
  const [selectedTravelOptionId, setSelectedTravelOptionId] = useState("")
  const [selectedAccommodationId, setSelectedAccommodationId] = useState("")
  const [selectedLocalTransportId, setSelectedLocalTransportId] = useState("")
  const [pendingFormData, setPendingFormData] = useState<PlannerFormData | null>(null)
  const [hasSavedCurrentPlan, setHasSavedCurrentPlan] = useState(false)
  const [assistantInput, setAssistantInput] = useState("")
  const [assistantMessages, setAssistantMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([])
  const [groupVotes, setGroupVotes] = useState<Record<string, number>>({})
  const [exportMessage, setExportMessage] = useState("")

  const getSelectedAccommodation = (itinerary: Itinerary) =>
    itinerary.accommodations?.find((acc, index) => (acc.id || `${acc.name}-${index}`) === selectedAccommodationId) ||
    itinerary.accommodations?.find((acc) => acc.recommended) ||
    itinerary.accommodations?.[0]

  const getSelectedTravelOption = (itinerary: Itinerary) =>
    itinerary.travelOptions?.find((option) => option.id === selectedTravelOptionId) ||
    itinerary.travelOptions?.find((option) => option.recommended) ||
    itinerary.travelOptions?.[0]

  const getSelectedLocalTransport = (itinerary: Itinerary) =>
    itinerary.localTransportOptions?.find((option) => option.id === selectedLocalTransportId) ||
    itinerary.localTransportOptions?.find((option) => option.recommended) ||
    itinerary.localTransportOptions?.[0]

  const getCurrentBudget = (itinerary: Itinerary) => {
    const accommodation = getSelectedAccommodation(itinerary)?.totalCost ?? itinerary.budgetBreakdown.accommodation
    const food = meals.reduce((total, meal) => total + (Number(meal.totalCost) || 0), 0)
    const selectedTravelCost = getSelectedTravelOption(itinerary)?.totalCost || 0
    const localTransportCost = getSelectedLocalTransport(itinerary)?.totalCost || 0
    const extraTransportCost = transport.reduce((total, item) => total + (Number(item.totalCost) || 0), 0)
    const transportTotal = selectedTravelCost + localTransportCost + extraTransportCost
    const attractionTotal = attractions.reduce((total, attraction) => total + (Number(attraction.entryFee) || 0) * (itinerary.travelers || 1), 0)
    const miscellaneous = Number(itinerary.budgetBreakdown.miscellaneous) || 0
    const total = accommodation + food + transportTotal + attractionTotal + miscellaneous

    return {
      accommodation,
      food,
      transport: transportTotal,
      attractions: attractionTotal,
      miscellaneous,
      total,
      remaining: (Number(itinerary.totalBudget) || 0) - total,
    }
  }

  const markUnsaved = () => {
    setHasSavedCurrentPlan(false)
    if (plan) setSaveMessage("Plan updated. Save again to keep these choices.")
  }

  const applyCheapestChoices = (itinerary: Itinerary) => {
    const cheapestTravel = itinerary.travelOptions?.reduce((best, option) => (option.totalCost < best.totalCost ? option : best), itinerary.travelOptions[0])
    const cheapestHotel = itinerary.accommodations?.reduce((best, option) => (option.totalCost < best.totalCost ? option : best), itinerary.accommodations[0])
    const cheapestLocal = itinerary.localTransportOptions?.reduce((best, option) => (option.totalCost < best.totalCost ? option : best), itinerary.localTransportOptions[0])

    if (cheapestTravel) setSelectedTravelOptionId(cheapestTravel.id)
    if (cheapestHotel) setSelectedAccommodationId(cheapestHotel.id || cheapestHotel.name)
    if (cheapestLocal) setSelectedLocalTransportId(cheapestLocal.id)
    setAttractions((current) => current.map((attraction, index) => (index > 1 ? { ...attraction, entryFee: 0, tip: "Free/low-cost swap selected by optimizer." } : attraction)))
    markUnsaved()
  }

  const applyComparisonPlan = (comparison: NonNullable<Itinerary["comparisonPlans"]>[number]) => {
    if (comparison.travelOptionId) setSelectedTravelOptionId(comparison.travelOptionId)
    if (comparison.id === "cheap" && plan) applyCheapestChoices(plan)
    if (comparison.id === "comfort" && plan?.accommodations?.length) {
      const comfortHotel = plan.accommodations[plan.accommodations.length - 1]
      setSelectedAccommodationId(comfortHotel.id || comfortHotel.name)
      const taxi = plan.localTransportOptions?.find((option) => option.mode.toLowerCase().includes("taxi"))
      if (taxi) setSelectedLocalTransportId(taxi.id)
      markUnsaved()
    }
    if (comparison.id === "fast" && plan) {
      const flight = plan.travelOptions?.find((option) => option.type === "flight")
      if (flight) setSelectedTravelOptionId(flight.id)
      markUnsaved()
    }
  }

  const handleAssistantAsk = () => {
    if (!plan || !assistantInput.trim()) return
    const prompt = assistantInput.trim()
    const lower = prompt.toLowerCase()
    let reply = "I updated the recommendation notes. Save the trip after you like the final version."

    if (lower.includes("cheap") || lower.includes("budget") || lower.includes("₹") || lower.includes("rs")) {
      applyCheapestChoices(plan)
      reply = "I switched toward cheaper travel, hotel and low-cost attractions. The budget should drop immediately."
    } else if (lower.includes("flight")) {
      const flight = plan.travelOptions?.find((option) => option.type === "flight")
      if (flight) setSelectedTravelOptionId(flight.id)
      reply = flight ? "I selected the flight option for faster travel." : "I could not find a flight option in this plan."
      markUnsaved()
    } else if (lower.includes("kid") || lower.includes("family")) {
      setAttractions((current) => [
        ...current,
        { id: `kid-${Date.now()}`, name: "Family-friendly indoor activity", type: "Family", entryFee: 0, duration: "1-2 hours", bestTime: "Afternoon", location: plan.destination, tip: "Good fallback for kids and weather changes.", mustVisit: false },
      ])
      reply = "I added a family-friendly indoor activity as a flexible backup."
      markUnsaved()
    } else if (lower.includes("romantic")) {
      setAttractions((current) => [
        ...current,
        { id: `romantic-${Date.now()}`, name: "Sunset viewpoint and dinner walk", type: "Romantic", entryFee: 0, duration: "2 hours", bestTime: "Evening", location: plan.destination, tip: "Best after the heat or rain settles.", mustVisit: false },
      ])
      reply = "I added a romantic sunset/evening plan."
      markUnsaved()
    } else if (lower.includes("rain") || lower.includes("weather")) {
      setAttractions((current) => current.map((item) => ({ ...item, bestTime: item.mustVisit ? "Morning" : "Afternoon indoor backup" })))
      reply = "I adjusted activity timing to be more weather-aware, with indoor backups later in the day."
      markUnsaved()
    }

    setAssistantMessages((messages) => [...messages, { role: "user", text: prompt }, { role: "assistant", text: reply }])
    setAssistantInput("")
  }

  const handleExport = () => {
    if (!plan || !currentBudget) return
    const text = `${plan.exportText || `Traveloop plan for ${plan.destination}`}\nEstimated total: ${money(currency, currentBudget.total)}\nRemaining: ${money(currency, currentBudget.remaining)}\nWeather: ${plan.weatherTip}`
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `traveloop-${plan.destination.toLowerCase().replace(/\s+/g, "-")}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setExportMessage("Itinerary export downloaded.")
  }

  const handleCopyShare = async () => {
    if (!plan || !currentBudget) return
    const text = `${plan.exportText || `Traveloop plan for ${plan.destination}`} Estimated total ${money(currency, currentBudget.total)}. Share code: ${plan.groupVoting?.shareCode || "TRV-DEMO"}`
    await navigator.clipboard?.writeText(text)
    setExportMessage("Share summary copied.")
  }

  const updatePlan = (updater: (itinerary: Itinerary) => Itinerary) => {
    setPlan((currentPlan) => {
      if (!currentPlan) return currentPlan
      return updater(currentPlan)
    })
    markUnsaved()
  }

  const addHotelOptions = (kind: "budget" | "better" | "more") => {
    if (!plan) return
    const nights = Math.max((plan.duration || 1) - 1, 1)
    const base = Math.max(Math.round((plan.totalBudget || 10000) / Math.max(nights * 5, 1)), 900)
    const existingCount = plan.accommodations?.length || 0
    const areas = ["Dadar", "Andheri", "BKC", "Powai", "Fort", "Kurla", "Vile Parle", "Lower Parel"]
    const templates =
      kind === "budget"
        ? [
            { name: "Smart Budget Stay", factor: 0.45, rating: "4.0/5", amenities: ["Wi-Fi", "Breakfast"], tip: "Lowest-cost option; check commute and recent reviews." },
            { name: "Comfort Hostel Plus", factor: 0.32, rating: "3.9/5", amenities: ["Wi-Fi", "Locker"], tip: "Best for saving money and staying central." },
            { name: "Business Budget Inn", factor: 0.55, rating: "4.1/5", amenities: ["Wi-Fi", "Air conditioning"], tip: "Good balance of price and basic comfort." },
          ]
        : kind === "better"
          ? [
              { name: "Premium Central Hotel", factor: 1.15, rating: "4.6/5", amenities: ["Wi-Fi", "Breakfast", "Pool"], tip: "Better comfort and central access." },
              { name: "Boutique Comfort Stay", factor: 0.95, rating: "4.5/5", amenities: ["Wi-Fi", "Breakfast", "Airport pickup"], tip: "Higher quality without jumping to luxury pricing." },
              { name: "Family Suite Hotel", factor: 1.05, rating: "4.4/5", amenities: ["Wi-Fi", "Breakfast", "Large room"], tip: "Best for family or group travel." },
            ]
          : [
              { name: "Transit Friendly Hotel", factor: 0.7, rating: "4.2/5", amenities: ["Wi-Fi", "Breakfast"], tip: "Easy access to station or airport." },
              { name: "Central Value Hotel", factor: 0.8, rating: "4.3/5", amenities: ["Wi-Fi", "Breakfast", "Air conditioning"], tip: "Balanced value and convenience." },
              { name: "Quiet Neighbourhood Stay", factor: 0.65, rating: "4.1/5", amenities: ["Wi-Fi", "Air conditioning"], tip: "Lower price away from heavy tourist zones." },
            ]

    const additions = templates.map((template, index) => {
      const costPerNight = Math.max(Math.round(base * template.factor), 500)
      const area = areas[(existingCount + index) % areas.length]
      return {
        id: `hotel-extra-${kind}-${Date.now()}-${index}`,
        name: `${plan.destination} ${template.name}`,
        area,
        costPerNight,
        totalCost: costPerNight * nights,
        rating: template.rating,
        amenities: template.amenities,
        bookingTip: template.tip,
        distanceFromCenter: kind === "budget" ? "20-40 minutes from main sights" : "Central or well connected",
        recommended: false,
      }
    })

    updatePlan((itinerary) => ({ ...itinerary, accommodations: [...(itinerary.accommodations || []), ...additions] }))
  }

  const addTravelOptions = () => {
    if (!plan) return
    const current = plan.travelOptions || []
    const cheapest = current.reduce((best, option) => (option.totalCost < best.totalCost ? option : best), current[0])
    const additions = [
      {
        id: `travel-extra-saver-${Date.now()}`,
        type: "train" as const,
        provider: "Saver train / alternate date",
        route: `${plan.origin || "Origin"} to ${plan.destination}`,
        pricePerPerson: Math.max(Math.round((cheapest?.pricePerPerson || 1000) * 0.75), 300),
        totalCost: Math.max(Math.round((cheapest?.totalCost || 1000) * 0.75), 300),
        duration: "Flexible timing",
        baggage: "Flexible baggage",
        refundable: "Cancellation rules vary",
        recommended: false,
        note: "Cheaper if user can shift timing or class.",
      },
      {
        id: `travel-extra-comfort-${Date.now()}`,
        type: "flight" as const,
        provider: "Comfort flight with better timing",
        route: `${plan.origin || "Origin"} to ${plan.destination}`,
        pricePerPerson: Math.max(Math.round((cheapest?.pricePerPerson || 2000) * 1.8), 1200),
        totalCost: Math.max(Math.round((cheapest?.totalCost || 2000) * 1.8), 1200),
        duration: "Best timing",
        baggage: "Check baggage included",
        refundable: "Partly refundable",
        recommended: false,
        note: "Better comfort and less fatigue.",
      },
    ]
    updatePlan((itinerary) => ({ ...itinerary, travelOptions: [...(itinerary.travelOptions || []), ...additions] }))
  }

  const addFoodOptions = (kind: "budget" | "local" | "premium") => {
    if (!plan) return
    const travelers = plan.travelers || 1
    const days = plan.duration || 1
    const price = kind === "budget" ? 180 : kind === "premium" ? 900 : 350
    const label = kind === "budget" ? "Budget thali / street food" : kind === "premium" ? "Premium local restaurant" : "Local favourite meal"
    setMeals((current) => [
      ...current,
      {
        id: `meal-${kind}-${Date.now()}`,
        mealType: kind === "premium" ? "Dinner" : "Lunch",
        restaurantName: label,
        dish: kind === "budget" ? "Thali, snacks and tea" : kind === "premium" ? "Signature regional dinner" : "Popular local dish",
        costPerPerson: price,
        totalCost: price * travelers * days,
        occurrences: days,
        location: plan.destination,
        tip: kind === "budget" ? "Good for saving budget without skipping meals." : "User-added option.",
      },
    ])
    markUnsaved()
  }

  const addAttractionOptions = (kind: "free" | "premium") => {
    if (!plan) return
    setAttractions((current) => [
      ...current,
      {
        id: `place-${kind}-${Date.now()}`,
        name: kind === "free" ? "Free walking route and market" : "Premium guided experience",
        type: kind === "free" ? "Free" : "Experience",
        entryFee: kind === "free" ? 0 : Math.max(Math.round((plan.totalBudget || 10000) * 0.04), 800),
        duration: kind === "free" ? "1-2 hours" : "3 hours",
        bestTime: kind === "free" ? "Evening" : "Morning",
        location: plan.destination,
        tip: kind === "free" ? "Use this to reduce budget pressure." : "Better comfort and guided context.",
        mustVisit: false,
      },
    ])
    markUnsaved()
  }

  const saveTrip = async (itinerary: Itinerary, formData: PlannerFormData) => {
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) throw new Error("Please log in again before saving a trip.")

    const selectedItinerary = {
      ...itinerary,
      meals: meals.length ? meals : itinerary.meals,
      transport: transport.length ? transport : itinerary.transport,
      attractions: attractions.length ? attractions : itinerary.attractions,
      origin: formData.origin,
      selectedTravelOptionId: selectedTravelOptionId || itinerary.selectedTravelOptionId,
      selectedAccommodationId: selectedAccommodationId || itinerary.selectedAccommodationId,
      selectedLocalTransportId: selectedLocalTransportId || itinerary.selectedLocalTransportId,
      budgetBreakdown: getCurrentBudget(itinerary),
      groupVoting: itinerary.groupVoting
        ? {
            ...itinerary.groupVoting,
            options: itinerary.groupVoting.options.map((option) => ({ ...option, votes: groupVotes[option.id] ?? option.votes })),
          }
        : itinerary.groupVoting,
    }

    const savedTrip: SavedTrip = {
      id: `trip-${Date.now()}`,
      userEmail,
      destination: selectedItinerary.destination,
      country: selectedItinerary.country || (formData.tripType === "domestic" ? "India" : "International"),
      startDate: formData.travelMonth,
      endDate: `${selectedItinerary.duration || formData.days} days`,
      budget: selectedItinerary.totalBudget || formData.budget,
      travelers: selectedItinerary.travelers || formData.travelers,
      status: "upcoming",
      image: destinationImages[Math.floor(Math.random() * destinationImages.length)],
      currency: selectedItinerary.currency || formData.currency,
      duration: selectedItinerary.duration || formData.days,
      travelMonth: formData.travelMonth,
      origin: formData.origin,
      tripType: formData.tripType,
      itinerary: selectedItinerary,
      createdAt: new Date().toISOString(),
    }

    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savedTrip),
    })
    const data = await response.json()
    if (!response.ok || data.error) throw new Error(data.error || "Could not save the trip.")

    onTripSaved?.(data.trip)
    return data.trip as SavedTrip
  }

  const handleSubmit = async (formData: PlannerFormData) => {
    setIsLoading(true)
    setIsSaving(false)
    setError("")
    setSaveMessage("")
      setPlan(null)
      setPendingFormData(null)
      setHasSavedCurrentPlan(false)
      setAssistantMessages([])
      setGroupVotes({})
      setExportMessage("")

    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok || data.error) throw new Error(data.error || "Failed to generate plan.")

      const itinerary = {
        ...data,
        currency: data.currency || formData.currency,
        totalBudget: data.totalBudget || formData.budget,
        duration: data.duration || formData.days,
        travelers: data.travelers || formData.travelers,
        travelMonth: data.travelMonth || formData.travelMonth,
        tripType: data.tripType || formData.tripType,
      } as Itinerary

      setPlan(itinerary)
      setMeals(itinerary.meals || [])
      setTransport(itinerary.transport || [])
      setAttractions(itinerary.attractions || [])
      setChecklist((itinerary.checklist || []).map((text) => ({ text, checked: false })))
      setGroupVotes(
        Object.fromEntries((itinerary.groupVoting?.options || []).map((option) => [option.id, option.votes]))
      )
      setSelectedTravelOptionId(itinerary.selectedTravelOptionId || itinerary.travelOptions?.find((option) => option.recommended)?.id || itinerary.travelOptions?.[0]?.id || "")
      setSelectedAccommodationId(itinerary.selectedAccommodationId || itinerary.accommodations?.find((option) => option.recommended)?.id || itinerary.accommodations?.[0]?.id || "")
      setSelectedLocalTransportId(itinerary.selectedLocalTransportId || itinerary.localTransportOptions?.find((option) => option.recommended)?.id || itinerary.localTransportOptions?.[0]?.id || "")
      setPendingFormData(formData)
      setSaveMessage("Plan ready. Choose your preferred options, then save it to My Trips.")
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
      setIsSaving(false)
    }
  }

  const currency = plan?.currency || "INR"
  const currentBudget = plan ? getCurrentBudget(plan) : null
  const selectedAccommodation = plan ? getSelectedAccommodation(plan) : undefined
  const selectedTravelOption = plan ? getSelectedTravelOption(plan) : undefined
  const selectedLocalTransport = plan ? getSelectedLocalTransport(plan) : undefined

  const handleSaveCurrentPlan = async () => {
    if (!plan || !pendingFormData) return
    setIsSaving(true)
    setError("")
    try {
      await saveTrip(plan, pendingFormData)
      setHasSavedCurrentPlan(true)
      setSaveMessage("Saved to My Trips with your selected choices.")
    } catch (err: any) {
      setError(err.message || "Could not save this trip.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PlannerForm onSubmit={handleSubmit} isLoading={isLoading || isSaving} />

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">{error}</div>}

      {saveMessage && (
        <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border text-sm ${currentBudget && currentBudget.remaining < 0 ? "bg-destructive/10 text-destructive border-destructive/25" : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"}`}>
          <span>{currentBudget && currentBudget.remaining < 0 ? `Over budget by ${money(currency, Math.abs(currentBudget.remaining))}. Choose cheaper options or fit to budget.` : saveMessage}</span>
          {currentBudget && currentBudget.remaining < 0 && (
            <Button size="sm" variant="outline" onClick={() => plan && applyCheapestChoices(plan)}>
              Fit To Budget
            </Button>
          )}
          {plan && pendingFormData && !hasSavedCurrentPlan && (
            <Button size="sm" onClick={handleSaveCurrentPlan} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Trip"}
            </Button>
          )}
          {hasSavedCurrentPlan && onViewTrips && (
            <Button variant="outline" size="sm" onClick={onViewTrips}>
              View My Trips
            </Button>
          )}
        </div>
      )}

      {isLoading && <PlannerSkeleton />}

      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-border">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">AI Travel Decision System</Badge>
                <Badge variant="outline">Budget</Badge>
                <Badge variant="outline">Weather</Badge>
                <Badge variant="outline">Safety</Badge>
                <Badge variant="outline">Carbon</Badge>
                <Badge variant="outline">Group Voting</Badge>
              </div>
              <h2 className="text-2xl font-bold">{plan.destination}</h2>
              <p className="text-muted-foreground text-sm">
                {plan.origin ? `${plan.origin} to ` : ""}{plan.country} · {plan.duration} day{plan.duration > 1 ? "s" : ""} · {money(currency, plan.totalBudget)} budget
              </p>
            </div>
            <div className="flex gap-2 ml-auto flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {plan.travelMonth || "Travel month"}
              </Badge>
              {plan.weatherTip && (
                <Badge variant="outline" className="text-xs">
                  Weather: {plan.weatherTip}
                </Badge>
              )}
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-3">
                <div className="rounded-lg bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="font-semibold">{plan.origin || "Origin"} → {plan.destination}</p>
                </div>
                <div className="rounded-lg bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Travel</p>
                  <p className="font-semibold truncate">{selectedTravelOption?.provider || "Choose option"}</p>
                </div>
                <div className="rounded-lg bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Hotel</p>
                  <p className="font-semibold truncate">{selectedAccommodation?.name || "Choose hotel"}</p>
                </div>
                <div className="rounded-lg bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Local</p>
                  <p className="font-semibold truncate">{selectedLocalTransport?.mode || "Choose local"}</p>
                </div>
                <div className="rounded-lg bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Estimated Total</p>
                  <p className="font-bold">{money(currency, currentBudget?.total || 0)}</p>
                </div>
                <div className="rounded-lg bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className={`font-bold ${(currentBudget?.remaining || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>{money(currency, currentBudget?.remaining || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Section title="AI Trip Comparison" icon={Route}>
            <div className="grid md:grid-cols-3 gap-3">
              {(plan.comparisonPlans || []).map((comparison) => (
                <button
                  key={comparison.id}
                  type="button"
                  onClick={() => applyComparisonPlan(comparison)}
                  className="rounded-lg border border-border bg-muted/20 p-4 text-left hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{comparison.name}</p>
                    <Badge variant="outline">{money(currency, comparison.totalCost)}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Comfort</p>
                      <p className="font-semibold">{comparison.comfortScore}/100</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weather</p>
                      <p className="font-semibold">{comparison.weatherRisk}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-semibold">{comparison.travelTime}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{comparison.summary}</p>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Smart Budget Optimizer" icon={Wand2}>
            <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="space-y-2">
                {(plan.optimizerSuggestions || []).map((suggestion, index) => (
                  <div key={`${suggestion}-${index}`} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => plan && applyCheapestChoices(plan)}>
                <Wand2 className="w-4 h-4 mr-2" />
                Make It Cheaper
              </Button>
            </div>
          </Section>

          <Section title="Choose Travel Options" icon={Plane}>
            <div className="space-y-5">
              {plan.livePriceStatus && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <p className="font-medium">Live price integration status</p>
                  <p className="text-muted-foreground">{plan.livePriceStatus.source}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Confidence: {plan.livePriceStatus.confidence}</p>
                </div>
              )}
              {plan.travelOptions?.length ? (
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">Flight, train or bus</div>
                    <Button variant="outline" size="sm" onClick={addTravelOptions}>
                      <Plus className="w-4 h-4 mr-1" />
                      More Travel Options
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {plan.travelOptions.map((option) => {
                      const Icon = option.type === "flight" ? Plane : option.type === "train" ? Train : Bus
                      const selected = selectedTravelOptionId === option.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedTravelOptionId(option.id)
                            markUnsaved()
                          }}
                          className={`rounded-lg border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/40"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 font-semibold">
                              <Icon className="w-4 h-4 text-primary" />
                              {option.provider}
                            </div>
                            {selected && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{option.route}</p>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div>
                              <p className="font-bold">{money(currency, option.totalCost)}</p>
                              <p className="text-xs text-muted-foreground">{money(currency, option.pricePerPerson)} per person</p>
                            </div>
                            <Badge variant={option.recommended ? "default" : "outline"} className="text-xs">
                              {option.duration}
                            </Badge>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">{option.note}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {plan.localTransportOptions?.length ? (
                <div>
                  <div className="mb-2 text-sm font-medium">Local transport</div>
                  <div className="mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updatePlan((itinerary) => ({
                          ...itinerary,
                          localTransportOptions: [
                            ...(itinerary.localTransportOptions || []),
                            {
                              id: `local-extra-walk-${Date.now()}`,
                              mode: "Walk + public transport saver",
                              totalCost: Math.max(Math.round((itinerary.duration || 1) * 80), 80),
                              costPerDay: 80,
                              comfort: "Low",
                              flexibility: "Medium",
                              recommended: false,
                              note: "Cheapest local movement plan for strict budgets.",
                            },
                            {
                              id: `local-extra-daycab-${Date.now()}`,
                              mode: "One-day cab + public transport mix",
                              totalCost: Math.max(Math.round((itinerary.duration || 1) * 650), 650),
                              costPerDay: 650,
                              comfort: "Medium",
                              flexibility: "High",
                              recommended: false,
                              note: "Good balance when only one day needs a cab.",
                            },
                          ],
                        }))
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      More Local Options
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {plan.localTransportOptions.map((option) => {
                      const selected = selectedLocalTransportId === option.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocalTransportId(option.id)
                            markUnsaved()
                          }}
                          className={`rounded-lg border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/40"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 font-semibold">
                              <Car className="w-4 h-4 text-primary" />
                              {option.mode}
                            </div>
                            {selected && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                          </div>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div>
                              <p className="font-bold">{money(currency, option.totalCost)}</p>
                              <p className="text-xs text-muted-foreground">{money(currency, option.costPerDay)} per day</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {option.comfort}
                            </Badge>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">{option.note}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>

          <div className="grid xl:grid-cols-2 gap-4">
            <Section title="Map View" icon={Map}>
              <div className="relative h-72 overflow-hidden rounded-lg border border-border bg-[linear-gradient(135deg,hsl(var(--muted))_0%,hsl(var(--background))_55%,hsl(var(--muted))_100%)]">
                <div className="absolute left-[12%] right-[18%] top-[32%] h-1 rotate-[-24deg] rounded-full bg-primary/30" />
                {(plan.mapPoints || []).map((point) => (
                  <div
                    key={point.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">{point.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Safety Score" icon={ShieldCheck}>
              {plan.safety && (
                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-4xl font-bold text-primary">{plan.safety.score}</p>
                      <p className="text-sm text-muted-foreground">Trip safety score</p>
                    </div>
                    <Badge variant="outline">Crowd: {plan.safety.crowdLevel}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-muted-foreground">Weather risk</p>
                      <p className="font-semibold">{plan.safety.weatherRisk}%</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-muted-foreground">Late night risk</p>
                      <p className="font-semibold">{plan.safety.lateNightRisk}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{plan.safety.emergency}</p>
                  <div className="space-y-1">
                    {plan.safety.nearbyHelp.map((item) => (
                      <p key={item} className="text-xs text-muted-foreground">{item}</p>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </div>

          <div className="grid xl:grid-cols-2 gap-4">
            <Section title="Weather-Aware Itinerary" icon={CloudRain}>
              {plan.weatherAwarePlan && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Weather risk</p>
                    <Badge variant="outline">{plan.weatherAwarePlan.risk}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.weatherAwarePlan.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.weatherAwarePlan.indoorAlternatives.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAttractions((current) => current.map((item) => ({ ...item, bestTime: item.mustVisit ? "Morning" : "Afternoon indoor backup" })))
                      markUnsaved()
                    }}
                  >
                    Apply Weather Timing
                  </Button>
                </div>
              )}
            </Section>

            <Section title="Carbon Footprint" icon={Leaf}>
              {plan.carbon && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Flight</p>
                      <p className="font-bold">{plan.carbon.flightKg} kg</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Train</p>
                      <p className="font-bold">{plan.carbon.trainKg} kg</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Bus</p>
                      <p className="font-bold">{plan.carbon.busKg} kg</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.carbon.recommendation}</p>
                </div>
              )}
            </Section>
          </div>

          <Section title="Budget Breakdown" icon={Wallet}>
            {currentBudget && currentBudget.remaining < 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <span className="text-destructive">
                  This plan is over budget by {money(currency, Math.abs(currentBudget.remaining))}. Add cheaper choices or run the optimizer.
                </span>
                <Button size="sm" variant="outline" onClick={() => plan && applyCheapestChoices(plan)}>
                  Fit To Budget
                </Button>
              </div>
            )}
            <div className="space-y-3 mb-4">
              <BudgetBar label="Accommodation" amount={currentBudget?.accommodation || 0} total={plan.totalBudget} color="bg-blue-500" currency={currency} />
              <BudgetBar label="Food" amount={currentBudget?.food || 0} total={plan.totalBudget} color="bg-orange-500" currency={currency} />
              <BudgetBar label="Transport" amount={currentBudget?.transport || 0} total={plan.totalBudget} color="bg-green-500" currency={currency} />
              <BudgetBar label="Attractions" amount={currentBudget?.attractions || 0} total={plan.totalBudget} color="bg-purple-500" currency={currency} />
              <BudgetBar label="Miscellaneous" amount={currentBudget?.miscellaneous || 0} total={plan.totalBudget} color="bg-yellow-500" currency={currency} />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold">Estimated total</span>
              <span className="font-bold text-lg">{money(currency, currentBudget?.total || 0)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-muted-foreground text-sm">Remaining</span>
              <span className={`font-semibold ${(currentBudget?.remaining || 0) >= 0 ? "text-green-500" : "text-destructive"}`}>
                {money(currency, currentBudget?.remaining || 0)}
              </span>
            </div>
          </Section>

          <Section title="Where to Stay" icon={Hotel}>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => addHotelOptions("budget")}>
                <Plus className="w-4 h-4 mr-1" />
                Cheaper Hotels
              </Button>
              <Button variant="outline" size="sm" onClick={() => addHotelOptions("better")}>
                <Plus className="w-4 h-4 mr-1" />
                Better Hotels
              </Button>
              <Button variant="outline" size="sm" onClick={() => addHotelOptions("more")}>
                <Plus className="w-4 h-4 mr-1" />
                More Choices
              </Button>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {(plan.accommodations || []).map((acc, index) => (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAccommodationId(acc.id || `${acc.name}-${index}`)
                    markUnsaved()
                  }}
                  key={`${acc.name}-${index}`}
                  className={`rounded-lg p-4 space-y-2 border text-left transition-colors ${selectedAccommodationId === (acc.id || `${acc.name}-${index}`) ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-base flex items-center gap-2">
                        {acc.name}
                        {selectedAccommodationId === (acc.id || `${acc.name}-${index}`) && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {acc.area}
                        {acc.distanceFromCenter && <span> · {acc.distanceFromCenter}</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {money(currency, acc.costPerNight)}
                        <span className="text-sm font-normal text-muted-foreground">/night</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Total: {money(currency, acc.totalCost)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{acc.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {acc.amenities?.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  {acc.bookingTip && <p className="text-xs text-muted-foreground bg-primary/5 rounded px-3 py-2 border-l-2 border-primary">{acc.bookingTip}</p>}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Food Plan" icon={Utensils}>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => addFoodOptions("budget")}>
                <Plus className="w-4 h-4 mr-1" />
                Budget Food
              </Button>
              <Button variant="outline" size="sm" onClick={() => addFoodOptions("local")}>
                <Plus className="w-4 h-4 mr-1" />
                Local Food
              </Button>
              <Button variant="outline" size="sm" onClick={() => addFoodOptions("premium")}>
                <Plus className="w-4 h-4 mr-1" />
                Better Dining
              </Button>
            </div>
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg group">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {meal.mealType}
                      </Badge>
                      <span className="font-medium text-sm">{meal.restaurantName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{meal.dish}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {meal.location}
                    </p>
                    {meal.tip && <p className="text-xs text-primary/80 mt-1">{meal.tip}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{money(currency, meal.totalCost)}</p>
                    <p className="text-xs text-muted-foreground">
                      {money(currency, meal.costPerPerson)} per person · {meal.occurrences} day(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMeals(meals.filter((item) => item.id !== meal.id))
                      markUnsaved()
                    }}
                    className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all"
                    aria-label={`Remove ${meal.mealType}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  {
                    setMeals([
                    ...meals,
                    {
                      id: `m-${Date.now()}`,
                      mealType: "Snack",
                      restaurantName: "Local eatery",
                      dish: "Street food",
                      costPerPerson: 100,
                      totalCost: 100 * plan.duration,
                      occurrences: plan.duration,
                      location: "Near hotel",
                      tip: "",
                    },
                    ])
                    markUnsaved()
                  }
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Meal
              </Button>
            </div>
          </Section>

          <Section title="Getting Around" icon={Bus}>
            <div className="space-y-3">
              {transport.map((item) => (
                <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border group ${item.recommended ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"}`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{item.mode}</span>
                      {item.recommended && <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Recommended</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.avgTime}
                      </span>
                      <span>{item.estimatedTrips} trips</span>
                    </div>
                    {item.tip && <p className="text-xs text-primary/80 mt-1">{item.tip}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{money(currency, item.totalCost)}</p>
                    <p className="text-xs text-muted-foreground">{money(currency, item.costPerTrip)} per trip</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTransport(transport.filter((transportItem) => transportItem.id !== item.id))
                      markUnsaved()
                    }}
                    className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all"
                    aria-label={`Remove ${item.mode}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Places to Visit" icon={Landmark}>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => addAttractionOptions("free")}>
                <Plus className="w-4 h-4 mr-1" />
                Free Places
              </Button>
              <Button variant="outline" size="sm" onClick={() => addAttractionOptions("premium")}>
                <Plus className="w-4 h-4 mr-1" />
                Premium Experiences
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {attractions.map((attraction) => (
                <div key={attraction.id} className={`p-3 rounded-lg border group ${attraction.mustVisit ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {attraction.mustVisit && <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Must Visit</Badge>}
                        <p className="font-medium text-sm">{attraction.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {attraction.type}
                      </Badge>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{attraction.duration}</span>
                        <span>{attraction.bestTime}</span>
                        <span>{attraction.location}</span>
                      </div>
                      {attraction.tip && <p className="text-xs text-primary/80 mt-1.5">{attraction.tip}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">{attraction.entryFee === 0 ? <span className="text-green-500">Free</span> : money(currency, attraction.entryFee)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAttractions(attractions.filter((item) => item.id !== attraction.id))
                          markUnsaved()
                        }}
                        className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all mt-1 block"
                        aria-label={`Remove ${attraction.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                {
                  setAttractions([
                  ...attractions,
                  {
                    id: `a-${Date.now()}`,
                    name: "New Place",
                    type: "Activity",
                    entryFee: 0,
                    duration: "1-2 hours",
                    bestTime: "Morning",
                    location: plan.destination,
                    tip: "",
                    mustVisit: false,
                  },
                  ])
                  markUnsaved()
                }
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Place
            </Button>
          </Section>

          {plan.suggestions?.length > 0 && (
            <Section title="Travel Tips" icon={Lightbulb}>
              <div className="space-y-2">
                {plan.suggestions.map((suggestion, index) => (
                  <div key={`${suggestion}-${index}`} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div className="grid xl:grid-cols-2 gap-4">
            <Section title="Group Trip Voting" icon={Users}>
              {plan.groupVoting && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Share code</p>
                      <p className="font-bold">{plan.groupVoting.shareCode}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyShare}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Invite
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {plan.groupVoting.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setGroupVotes((votes) => ({ ...votes, [option.id]: (votes[option.id] || option.votes || 0) + 1 }))}
                        className="w-full rounded-lg border border-border bg-muted/20 p-3 text-left hover:border-primary/40"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{option.label}</span>
                          <Badge>{groupVotes[option.id] ?? option.votes} votes</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="AI Travel Assistant" icon={MessageSquare}>
              <div className="space-y-3">
                <div className="max-h-56 space-y-2 overflow-auto rounded-lg bg-muted/20 p-3">
                  {assistantMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Try: make it cheaper, replace train with flight, add kid friendly places, make it romantic.</p>
                  ) : (
                    assistantMessages.map((message, index) => (
                      <div key={`${message.text}-${index}`} className={`rounded-lg p-2 text-sm ${message.role === "assistant" ? "bg-primary/10" : "bg-background"}`}>
                        <span className="font-medium">{message.role === "assistant" ? "AI" : "You"}: </span>
                        {message.text}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={assistantInput}
                    onChange={(event) => setAssistantInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleAssistantAsk()
                    }}
                    placeholder="Ask AI to modify this trip..."
                  />
                  <Button onClick={handleAssistantAsk}>Ask</Button>
                </div>
              </div>
            </Section>
          </div>

          <Section title="Export & Share" icon={Download}>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Itinerary
              </Button>
              <Button variant="outline" onClick={handleCopyShare}>
                <Copy className="w-4 h-4 mr-2" />
                Copy WhatsApp Text
              </Button>
              {plan && currentBudget && (
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  href={`https://wa.me/?text=${encodeURIComponent(`${plan.exportText || `Traveloop plan for ${plan.destination}`} Estimated total: ${money(currency, currentBudget.total)}. Weather: ${plan.weatherTip}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open WhatsApp Share
                </a>
              )}
              {exportMessage && <span className="text-sm text-primary">{exportMessage}</span>}
            </div>
          </Section>

          <Section title="Pre-Trip Checklist" icon={CheckSquare}>
            <div className="space-y-2">
              {checklist.map((item, index) => (
                <button
                  key={`${item.text}-${index}`}
                  type="button"
                  onClick={() => setChecklist(checklist.map((entry, entryIndex) => (entryIndex === index ? { ...entry, checked: !entry.checked } : entry)))}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm text-left transition-colors ${item.checked ? "bg-green-500/10 text-green-600" : "hover:bg-muted/50"}`}
                >
                  {item.checked ? <CheckSquare className="w-4 h-4 text-green-500 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className={item.checked ? "line-through" : ""}>{item.text}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {checklist.filter((item) => item.checked).length}/{checklist.length} completed
            </div>
          </Section>

          {pendingFormData && (
            <div className="sticky bottom-4 z-30 rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total </span>
                    <span className="font-bold">{money(currency, currentBudget?.total || 0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining </span>
                    <span className={`font-bold ${(currentBudget?.remaining || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {money(currency, currentBudget?.remaining || 0)}
                    </span>
                  </div>
                  {currentBudget && currentBudget.remaining < 0 && (
                    <span className="text-destructive">Over budget by {money(currency, Math.abs(currentBudget.remaining))}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentBudget && currentBudget.remaining < 0 && (
                    <Button variant="outline" size="sm" onClick={() => plan && applyCheapestChoices(plan)}>
                      Fit To Budget
                    </Button>
                  )}
                  {!hasSavedCurrentPlan ? (
                    <Button size="sm" onClick={handleSaveCurrentPlan} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Trip"}
                    </Button>
                  ) : onViewTrips ? (
                    <Button size="sm" variant="outline" onClick={onViewTrips}>
                      View My Trips
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
