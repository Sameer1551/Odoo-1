"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  Coffee,
  Car,
  Sun,
  Moon,
  Sunset,
  Edit2,
  Trash2,
  Plus
} from "lucide-react"

export interface ItineraryItem {
  id: string
  time: string
  title: string
  location: string
  type: "flight" | "hotel" | "restaurant" | "activity" | "transport" | "coffee"
  duration: string
  notes?: string
}

export interface DayItinerary {
  day: number
  date: string
  items: ItineraryItem[]
}

const typeIcons = {
  flight: Plane,
  hotel: Hotel,
  restaurant: Utensils,
  activity: Camera,
  transport: Car,
  coffee: Coffee,
}

const typeColors = {
  flight: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  hotel: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  restaurant: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  activity: "bg-primary/20 text-primary border-primary/30",
  transport: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  coffee: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const mockItinerary: DayItinerary[] = [
  {
    day: 1,
    date: "June 15, 2026",
    items: [
      { id: "1", time: "08:00", title: "Departure from JFK", location: "JFK Airport, New York", type: "flight", duration: "7h 30m" },
      { id: "2", time: "21:30", title: "Check-in at Hotel Le Marais", location: "Le Marais District", type: "hotel", duration: "30m", notes: "Early check-in confirmed" },
      { id: "3", time: "22:30", title: "Dinner at Breizh Cafe", location: "Le Marais", type: "restaurant", duration: "1h 30m" },
    ],
  },
  {
    day: 2,
    date: "June 16, 2026",
    items: [
      { id: "4", time: "08:00", title: "Breakfast at Cafe de Flore", location: "Saint-Germain", type: "coffee", duration: "1h" },
      { id: "5", time: "10:00", title: "Louvre Museum Tour", location: "1st Arrondissement", type: "activity", duration: "4h", notes: "Skip-the-line tickets booked" },
      { id: "6", time: "14:30", title: "Lunch at Angelina", location: "Rue de Rivoli", type: "restaurant", duration: "1h 30m" },
      { id: "7", time: "16:30", title: "Tuileries Garden Walk", location: "1st Arrondissement", type: "activity", duration: "1h" },
      { id: "8", time: "18:00", title: "Seine River Cruise", location: "Pont Neuf", type: "activity", duration: "1h 30m" },
      { id: "9", time: "20:00", title: "Dinner at Le Jules Verne", location: "Eiffel Tower", type: "restaurant", duration: "2h", notes: "Reservation confirmed" },
    ],
  },
  {
    day: 3,
    date: "June 17, 2026",
    items: [
      { id: "10", time: "09:00", title: "Montmartre Walking Tour", location: "18th Arrondissement", type: "activity", duration: "3h" },
      { id: "11", time: "12:30", title: "Lunch at Pink Mamma", location: "10th Arrondissement", type: "restaurant", duration: "1h 30m" },
      { id: "12", time: "15:00", title: "Sacré-Cœur Visit", location: "Montmartre", type: "activity", duration: "1h 30m" },
      { id: "13", time: "17:00", title: "Transfer to Airport", location: "CDG Airport", type: "transport", duration: "1h" },
      { id: "14", time: "20:00", title: "Return Flight to JFK", location: "CDG Airport", type: "flight", duration: "8h" },
    ],
  },
]

interface ItineraryTimelineProps {
  itinerary?: DayItinerary[]
  trip?: any
}

function getTimeOfDay(time: string): "morning" | "afternoon" | "evening" {
  const hour = parseInt(time.split(":")[0])
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}

const timeOfDayIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
}

function buildTripItinerary(trip: any): DayItinerary[] {
  const plan = trip?.itinerary
  if (!plan) return mockItinerary

  const days = Math.max(Number(plan.duration || trip.duration) || 1, 1)
  const attractions = Array.isArray(plan.attractions) ? plan.attractions : []
  const meals = Array.isArray(plan.meals) ? plan.meals : []
  const accommodation =
    plan.accommodations?.find((item: any, index: number) => (item.id || `${item.name}-${index}`) === plan.selectedAccommodationId) ||
    plan.accommodations?.[0]
  const transport = plan.transport?.[0]

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const dayAttractions = attractions.filter((_: any, attractionIndex: number) => attractionIndex % days === index)
    const fallbackAttraction = attractions[index % Math.max(attractions.length, 1)]

    const items: ItineraryItem[] = [
      {
        id: `${trip.id}-d${day}-breakfast`,
        time: "08:30",
        title: meals[0]?.dish || "Breakfast near stay",
        location: meals[0]?.location || accommodation?.area || trip.destination,
        type: "restaurant",
        duration: "45m",
        notes: meals[0]?.restaurantName,
      },
      {
        id: `${trip.id}-d${day}-morning`,
        time: "10:00",
        title: dayAttractions[0]?.name || fallbackAttraction?.name || `Explore ${trip.destination}`,
        location: dayAttractions[0]?.location || fallbackAttraction?.location || trip.destination,
        type: "activity",
        duration: dayAttractions[0]?.duration || fallbackAttraction?.duration || "2h",
        notes: dayAttractions[0]?.tip || fallbackAttraction?.tip,
      },
      {
        id: `${trip.id}-d${day}-lunch`,
        time: "13:00",
        title: meals[1]?.dish || "Local lunch",
        location: meals[1]?.location || trip.destination,
        type: "restaurant",
        duration: "1h",
        notes: meals[1]?.restaurantName,
      },
      {
        id: `${trip.id}-d${day}-transport`,
        time: "15:00",
        title: transport?.mode || "Local transfer",
        location: trip.destination,
        type: "transport",
        duration: transport?.avgTime || "30m",
        notes: transport?.tip,
      },
      {
        id: `${trip.id}-d${day}-evening`,
        time: "17:00",
        title: dayAttractions[1]?.name || "Evening walk and market",
        location: dayAttractions[1]?.location || trip.destination,
        type: "activity",
        duration: dayAttractions[1]?.duration || "1h 30m",
        notes: dayAttractions[1]?.tip || plan.weatherTip,
      },
      {
        id: `${trip.id}-d${day}-dinner`,
        time: "20:00",
        title: meals[2]?.dish || "Dinner",
        location: meals[2]?.location || trip.destination,
        type: "restaurant",
        duration: "1h",
        notes: meals[2]?.restaurantName,
      },
    ]

    if (day === 1 && accommodation) {
      items.splice(1, 0, {
        id: `${trip.id}-d${day}-hotel`,
        time: "09:30",
        title: `Check in at ${accommodation.name}`,
        location: accommodation.area,
        type: "hotel",
        duration: "30m",
        notes: accommodation.bookingTip,
      })
    }

    return {
      day,
      date: `${trip.travelMonth || trip.startDate || "Trip"} - Day ${day}`,
      items,
    }
  })
}

export function ItineraryTimeline({ itinerary, trip }: ItineraryTimelineProps) {
  const [timeline, setTimeline] = useState<DayItinerary[]>([])

  useEffect(() => {
    setTimeline(itinerary || (trip ? buildTripItinerary(trip) : mockItinerary))
  }, [itinerary, trip])

  const handleDeleteItem = (dayNumber: number, itemId: string) => {
    setTimeline((currentTimeline) =>
      currentTimeline.map((day) =>
        day.day === dayNumber ? { ...day, items: day.items.filter((item) => item.id !== itemId) } : day
      )
    )
  }

  const handleEditItem = (dayNumber: number, item: ItineraryItem) => {
    const nextTitle = window.prompt("Edit activity title", item.title)
    if (!nextTitle?.trim()) return

    setTimeline((currentTimeline) =>
      currentTimeline.map((day) =>
        day.day === dayNumber
          ? {
              ...day,
              items: day.items.map((entry) => (entry.id === item.id ? { ...entry, title: nextTitle.trim() } : entry)),
            }
          : day
      )
    )
  }

  const handleAddActivity = () => {
    setTimeline((currentTimeline) => {
      const [firstDay, ...rest] = currentTimeline.length ? currentTimeline : buildTripItinerary(trip)
      const newItem: ItineraryItem = {
        id: `custom-${Date.now()}`,
        time: "16:00",
        title: "New Activity",
        location: trip?.destination || "Trip destination",
        type: "activity",
        duration: "1h",
      }

      return [{ ...firstDay, items: [...firstDay.items, newItem] }, ...rest]
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Itinerary</h2>
        <Button size="sm" variant="outline" onClick={handleAddActivity}>
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {timeline.map((day, dayIndex) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.15 }}
        >
          <Card className="bg-card border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {day.day}
                  </div>
                  <div>
                    <span className="text-lg font-semibold">Day {day.day}</span>
                    <p className="text-sm text-muted-foreground font-normal">{day.date}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  {day.items.length} activities
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
                
                {day.items.map((item, itemIndex) => {
                  const Icon = typeIcons[item.type]
                  const timeOfDay = getTimeOfDay(item.time)
                  const TimeIcon = timeOfDayIcons[timeOfDay]
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dayIndex * 0.15 + itemIndex * 0.05 }}
                      className="relative flex gap-4 p-4 hover:bg-muted/20 transition-colors group"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${typeColors[item.type].split(" ")[0]} border-2 ${typeColors[item.type].split(" ")[2]}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.time}
                              </span>
                              <Badge className={`text-xs ${typeColors[item.type]}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                {item.type}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-foreground">{item.title}</h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {item.location}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.duration}
                              </span>
                              {item.notes && (
                                <span className="text-primary">Note: {item.notes}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditItem(day.day, item)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(day.day, item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
