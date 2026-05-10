"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Edit2, MapPin, Trash2, Users, Wallet } from "lucide-react"

export interface Trip {
  id: string
  destination: string
  country: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  status: "upcoming" | "ongoing" | "completed"
  image: string
  currency?: string
  duration?: number
  travelMonth?: string
  origin?: string
  tripType?: "domestic" | "international"
  itinerary?: any
}

interface TripCardProps {
  trip: Trip
  index: number
  onClick: () => void
  onEdit?: (trip: Trip) => void
  onDelete?: (trip: Trip) => void
  isSelected?: boolean
}

export function TripCard({ trip, index, onClick, onEdit, onDelete, isSelected }: TripCardProps) {
  const statusColors = {
    upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ongoing: "bg-primary/20 text-primary border-primary/30",
    completed: "bg-muted text-muted-foreground border-border",
  }
  const currency = trip.currency || "USD"
  const formattedBudget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(trip.budget) || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="cursor-pointer"
    >
      <Card className={`overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-colors group ${isSelected ? "ring-2 ring-primary/40 border-primary/50" : ""}`}>
        <div className="relative h-32 overflow-hidden" onClick={onClick}>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${trip.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <Badge className={`absolute top-3 right-3 ${statusColors[trip.status]}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </Badge>
        </div>
        <CardContent className="p-4" onClick={onClick}>
          <h3 className="font-semibold text-lg text-card-foreground mb-1">{trip.destination}</h3>
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {trip.origin ? `${trip.origin} to ` : ""}{trip.country}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{trip.startDate}{trip.duration ? ` · ${trip.duration}d` : ""}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              <span>{trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center text-primary font-medium col-span-2">
              <Wallet className="w-4 h-4 mr-1" />
              <span>{formattedBudget}</span>
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="mt-4 grid grid-cols-2 gap-2" onClick={(event) => event.stopPropagation()}>
              <Button variant="outline" size="sm" onClick={() => onEdit?.(trip)} className="h-9">
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete?.(trip)} className="h-9 text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
