"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Map, Calendar, Wallet, Plane } from "lucide-react"

interface Stat {
  label: string
  value: string
  change?: string
  icon: React.ElementType
  color: string
}

const stats: Stat[] = [
  { 
    label: "Total Trips", 
    value: "12", 
    change: "+3 this year",
    icon: Map, 
    color: "bg-chart-1" 
  },
  { 
    label: "Countries Visited", 
    value: "8", 
    change: "+2 this year",
    icon: Plane, 
    color: "bg-chart-2" 
  },
  { 
    label: "Days Traveled", 
    value: "87", 
    change: "in 2026",
    icon: Calendar, 
    color: "bg-chart-3" 
  },
  { 
    label: "Total Budget", 
    value: "$12,450", 
    change: "across all trips",
    icon: Wallet, 
    color: "bg-chart-4" 
  },
]

export function StatsCards({ trips = [] }: { trips?: any[] }) {
  const totalTrips = trips.length
  const totalBudget = trips.reduce((acc, trip) => acc + (Number(trip.budget) || 0), 0)
  const countries = new Set(trips.map((trip) => trip.country).filter(Boolean)).size
  const days = trips.reduce((acc, trip) => acc + (Number(trip.duration) || 0), 0)
  const hasInr = trips.some((trip) => trip.currency === "INR")
  const currency = hasInr ? "INR" : "USD"
  const formattedBudget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(totalBudget)

  const dynamicStats = [
    { ...stats[0], value: totalTrips.toString(), change: undefined },
    { ...stats[1], value: countries.toString(), change: undefined },
    { ...stats[2], value: days.toString(), change: undefined },
    { ...stats[3], value: formattedBudget, change: undefined }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dynamicStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-primary mt-1">{stat.change}</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-card" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
