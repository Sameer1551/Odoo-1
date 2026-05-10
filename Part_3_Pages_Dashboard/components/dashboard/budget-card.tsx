"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plane, Hotel, Utensils, Camera, Car } from "lucide-react"

interface BudgetItem {
  category: string
  icon: React.ElementType
  allocated: number
  spent: number
  color: string
}

interface BudgetCardProps {
  totalBudget: number
  totalSpent: number
  items?: BudgetItem[]
  currency?: string
}

const defaultBudgetItems: BudgetItem[] = [
  { category: "Flights", icon: Plane, allocated: 1200, spent: 1150, color: "bg-chart-1" },
  { category: "Accommodation", icon: Hotel, allocated: 800, spent: 600, color: "bg-chart-2" },
  { category: "Food & Dining", icon: Utensils, allocated: 400, spent: 280, color: "bg-chart-3" },
  { category: "Activities", icon: Camera, allocated: 300, spent: 150, color: "bg-chart-4" },
  { category: "Transport", icon: Car, allocated: 200, spent: 120, color: "bg-chart-5" },
]

export function BudgetCard({ totalBudget = 2900, totalSpent = 2300, items = defaultBudgetItems, currency = "USD" }: BudgetCardProps) {
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0)

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Budget Breakdown</span>
          <span className="text-primary font-bold">{formatMoney(totalSpent)}</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          of {formatMoney(totalBudget)} total budget
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Total Spent</span>
            <span className="font-medium">{percentSpent.toFixed(0)}%</span>
          </div>
          <Progress value={percentSpent} className="h-2" />
        </div>

        <div className="space-y-3 pt-2">
          {items.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                <item.icon className="w-4 h-4 text-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium truncate">{item.category}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(item.spent)} / {formatMoney(item.allocated)}
                  </span>
                </div>
                <Progress 
                  value={(item.spent / item.allocated) * 100} 
                  className="h-1.5" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
