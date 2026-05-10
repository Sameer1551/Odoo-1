"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TripCard, Trip } from "@/components/dashboard/trip-card"
import { BudgetCard } from "@/components/dashboard/budget-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CreateTripModal, TripFormData } from "@/components/dashboard/create-trip-modal"
import { AiPlanner } from "@/components/dashboard/ai-planner"
import { ItineraryTimeline } from "@/components/dashboard/itinerary-timeline"
import { PackingChecklist } from "@/components/dashboard/packing-checklist"
import { UserSettings } from "@/components/dashboard/user-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Calendar, Map, Wallet, Luggage, Trash2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [editForm, setEditForm] = useState({
    destination: "",
    origin: "",
    travelMonth: "",
    duration: 1,
    travelers: 1,
    budget: 0,
    status: "upcoming" as Trip["status"],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [userInitials, setUserInitials] = useState("U")
  const totalBudget = trips.reduce((acc, trip: any) => acc + (Number(trip.budget) || 0), 0)
  const totalEstimatedSpend = trips.reduce((acc, trip: any) => acc + (Number(trip.itinerary?.budgetBreakdown?.total || trip.budget) || 0), 0)
  const dashboardCurrency = trips.some((trip: any) => trip.currency === "INR") ? "INR" : "USD"

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) {
      window.location.href = "/login"
      return
    }
    
    setUserInitials(userEmail.substring(0, 2).toUpperCase())

    fetch(`/api/trips?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTrips(data)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleCreateTrip = async (formData: TripFormData) => {
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) return

    const newTrip = {
      id: `trip-${Date.now()}`,
      userEmail,
      destination: formData.destination.split(",")[0] || formData.destination,
      country: formData.destination.split(",")[1]?.trim() || "Unknown",
      startDate: new Date(formData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      endDate: new Date(formData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      budget: formData.budget,
      travelers: formData.travelers,
      status: "upcoming",
      currency: "USD",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80",
    }

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrip)
      })
      const data = await res.json()
      if (data.success) {
        setTrips([data.trip, ...trips])
        setActiveTab("trips")
      }
    } catch (e) {
      console.error("Failed to create trip", e)
    }
  }

  const openEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setEditForm({
      destination: trip.destination || "",
      origin: trip.origin || "",
      travelMonth: trip.travelMonth || trip.startDate || "",
      duration: Number(trip.duration) || 1,
      travelers: Number(trip.travelers) || 1,
      budget: Number(trip.budget) || 0,
      status: trip.status || "upcoming",
    })
  }

  const handleUpdateTrip = async () => {
    if (!editingTrip) return
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) return

    const nextTrip = {
      ...editingTrip,
      userEmail,
      destination: editForm.destination.trim(),
      origin: editForm.origin.trim(),
      startDate: editForm.travelMonth || editingTrip.startDate,
      endDate: `${editForm.duration} days`,
      travelMonth: editForm.travelMonth,
      duration: Number(editForm.duration),
      travelers: Number(editForm.travelers),
      budget: Number(editForm.budget),
      status: editForm.status,
      itinerary: {
        ...(editingTrip as any).itinerary,
        destination: editForm.destination.trim(),
        travelMonth: editForm.travelMonth,
        duration: Number(editForm.duration),
        travelers: Number(editForm.travelers),
        totalBudget: Number(editForm.budget),
      },
    }

    const response = await fetch("/api/trips", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextTrip),
    })
    const data = await response.json()
    if (!response.ok || data.error) return

    setTrips((currentTrips) => currentTrips.map((trip) => (trip.id === data.trip.id ? data.trip : trip)))
    setSelectedTrip((currentTrip) => (currentTrip?.id === data.trip.id ? data.trip : currentTrip))
    setEditingTrip(null)
  }

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) return

    const response = await fetch(`/api/trips?id=${encodeURIComponent(tripToDelete.id)}&email=${encodeURIComponent(userEmail)}`, {
      method: "DELETE",
    })
    const data = await response.json()
    if (!response.ok || data.error) return

    setTrips((currentTrips) => currentTrips.filter((trip) => trip.id !== tripToDelete.id))
    setSelectedTrip((currentTrip) => (currentTrip?.id === tripToDelete.id ? null : currentTrip))
    setTripToDelete(null)
  }

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center p-12">Loading...</div>

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <StatsCards trips={trips} />
            
            {/* Recent trips */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Trips</h2>
                {trips.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("trips")}>
                    View All
                  </Button>
                )}
              </div>
              
              {trips.length === 0 ? (
                <div className="text-center p-12 bg-card rounded-lg border border-border/50">
                  <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                  <p className="text-muted-foreground mb-4">You haven't created any trips yet.</p>
                  <Button onClick={() => setActiveTab("planner")}>Create your first trip</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trips.slice(0, 4).map((trip, index) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      index={index}
                      onClick={() => {
                        setSelectedTrip(trip)
                        setActiveTab("trips")
                      }}
                      onEdit={openEditTrip}
                      onDelete={setTripToDelete}
                      isSelected={selectedTrip?.id === trip.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Budget Overview */}
            {trips.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                <BudgetCard totalBudget={totalBudget} totalSpent={totalEstimatedSpend} currency={dashboardCurrency} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Plus, label: "New Trip", action: () => setActiveTab("planner"), primary: true },
                      { icon: Calendar, label: "Calendar", action: () => setActiveTab("calendar") },
                      { icon: Map, label: "My Trips", action: () => setActiveTab("trips") },
                      { icon: Luggage, label: "Packing", action: () => setActiveTab("packing") },
                    ].map((action) => (
                      <Button
                        key={action.label}
                        variant={action.primary ? "default" : "outline"}
                        className={`h-auto py-4 flex flex-col gap-2 ${action.primary ? "bg-primary hover:bg-primary/90" : ""}`}
                        onClick={action.action}
                      >
                        <action.icon className="w-5 h-5" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case "planner":
        return (
          <AiPlanner
            onTripSaved={(trip) => {
              setTrips((currentTrips) => [trip, ...currentTrips.filter((item) => item.id !== trip.id)])
              setSelectedTrip(trip)
            }}
            onViewTrips={() => setActiveTab("trips")}
          />
        )

      case "trips":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">My Trips</h2>
              <Button onClick={() => setActiveTab("planner")} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </div>
            
            {trips.length === 0 ? (
              <div className="text-center p-12 bg-card rounded-lg border border-border/50">
                <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                <p className="text-muted-foreground mb-4">Start planning your next adventure!</p>
                <Button onClick={() => setActiveTab("planner")}>Create Trip</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,420px)_1fr] gap-6 items-start">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                  {trips.map((trip, index) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      index={index}
                      onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                      onEdit={openEditTrip}
                      onDelete={setTripToDelete}
                      isSelected={selectedTrip?.id === trip.id}
                    />
                  ))}
                </div>
                <div className="min-w-0">
                  {selectedTrip ? (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <ItineraryTimeline trip={selectedTrip} />
                    </motion.div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
                      Select a trip to view its itinerary, choices and budget.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case "calendar":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Travel Calendar</h2>
            <ItineraryTimeline />
          </div>
        )

      case "budget":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Budget Overview</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <BudgetCard totalBudget={totalBudget} totalSpent={totalEstimatedSpend} currency={dashboardCurrency} />
            </div>
          </div>
        )

      case "packing":
        return <PackingChecklist />

      case "settings":
        return <UserSettings />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content */}
      <div className="lg:pl-64 pl-20 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search trips, destinations..." 
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                onClick={() => setActiveTab("planner")}
                className="bg-primary hover:bg-primary/90 hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
              <Avatar className="h-9 w-9 border-2 border-primary/30 cursor-pointer" onClick={() => setActiveTab("settings")}>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CreateTripModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateTrip={handleCreateTrip}
      />

      <Dialog open={!!editingTrip} onOpenChange={(open) => !open && setEditingTrip(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>Update the details shown across your dashboard.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Destination</Label>
              <Input value={editForm.destination} onChange={(event) => setEditForm({ ...editForm, destination: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input value={editForm.origin} onChange={(event) => setEditForm({ ...editForm, origin: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Input value={editForm.travelMonth} onChange={(event) => setEditForm({ ...editForm, travelMonth: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Days</Label>
              <Input type="number" min={1} value={editForm.duration} onChange={(event) => setEditForm({ ...editForm, duration: Number(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Travelers</Label>
              <Input type="number" min={1} value={editForm.travelers} onChange={(event) => setEditForm({ ...editForm, travelers: Number(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input type="number" min={1} value={editForm.budget} onChange={(event) => setEditForm({ ...editForm, budget: Number(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={editForm.status}
                onChange={(event) => setEditForm({ ...editForm, status: event.target.value as Trip["status"] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingTrip(null)}>Cancel</Button>
            <Button onClick={handleUpdateTrip}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>This will permanently remove the selected trip and its saved itinerary.</DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            {tripToDelete?.destination}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTripToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTrip}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
