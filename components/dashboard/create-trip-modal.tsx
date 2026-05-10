"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPin, Calendar, Users, DollarSign, Sparkles, X } from "lucide-react"

interface CreateTripModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTrip: (trip: TripFormData) => void
}

export interface TripFormData {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
}

export function CreateTripModal({ open, onOpenChange, onCreateTrip }: CreateTripModalProps) {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<TripFormData>({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budget: 2000,
  })

  const handleSubmit = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    onCreateTrip(formData)
    onOpenChange(false)
    setStep(1)
    setFormData({
      destination: "",
      startDate: "",
      endDate: "",
      travelers: 1,
      budget: 2000,
    })
  }

  const totalSteps = 3

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Trip
          </DialogTitle>
          <DialogDescription>
            Tell us about your trip and let AI plan the perfect itinerary.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Where do you want to go?
                </Label>
                <Input
                  id="destination"
                  placeholder="Paris, France"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="bg-input/50"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.destination}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-input/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-input/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Number of Travelers: {formData.travelers}
                </Label>
                <Slider
                  value={[formData.travelers]}
                  onValueChange={([value]) => setFormData({ ...formData, travelers: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.startDate || !formData.endDate}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Budget: ${formData.budget.toLocaleString()}
                </Label>
                <Slider
                  value={[formData.budget]}
                  onValueChange={([value]) => setFormData({ ...formData, budget: value })}
                  min={500}
                  max={20000}
                  step={100}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$500</span>
                  <span>$20,000</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Trip Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Destination: <span className="text-foreground">{formData.destination}</span></p>
                  <p>Dates: <span className="text-foreground">{formData.startDate} to {formData.endDate}</span></p>
                  <p>Travelers: <span className="text-foreground">{formData.travelers}</span></p>
                  <p>Budget: <span className="text-primary font-medium">${formData.budget.toLocaleString()}</span></p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isGenerating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <motion.div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      Generating...
                    </motion.div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
