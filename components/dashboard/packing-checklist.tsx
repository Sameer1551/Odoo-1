"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Trash2, 
  Shirt, 
  Briefcase, 
  Laptop, 
  Pill, 
  Camera, 
  Plane,
  Sparkles,
  Check
} from "lucide-react"

interface PackingItem {
  id: string
  name: string
  packed: boolean
}

interface PackingCategory {
  id: string
  name: string
  icon: React.ElementType
  color: string
  items: PackingItem[]
}

const defaultCategories: PackingCategory[] = [
  {
    id: "clothes",
    name: "Clothing",
    icon: Shirt,
    color: "bg-chart-1",
    items: [
      { id: "1", name: "T-shirts (5)", packed: true },
      { id: "2", name: "Pants (3)", packed: true },
      { id: "3", name: "Underwear (7)", packed: false },
      { id: "4", name: "Socks (7 pairs)", packed: false },
      { id: "5", name: "Jacket", packed: true },
      { id: "6", name: "Sleepwear", packed: false },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: Laptop,
    color: "bg-chart-2",
    items: [
      { id: "7", name: "Laptop + charger", packed: true },
      { id: "8", name: "Phone charger", packed: true },
      { id: "9", name: "Power adapter (EU)", packed: false },
      { id: "10", name: "Camera + SD cards", packed: false },
      { id: "11", name: "Headphones", packed: true },
    ],
  },
  {
    id: "toiletries",
    name: "Toiletries",
    icon: Pill,
    color: "bg-chart-3",
    items: [
      { id: "12", name: "Toothbrush & paste", packed: true },
      { id: "13", name: "Deodorant", packed: false },
      { id: "14", name: "Shampoo (travel size)", packed: false },
      { id: "15", name: "Sunscreen", packed: false },
      { id: "16", name: "Medications", packed: true },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    icon: Briefcase,
    color: "bg-chart-4",
    items: [
      { id: "17", name: "Passport", packed: true },
      { id: "18", name: "Travel insurance", packed: true },
      { id: "19", name: "Hotel confirmations", packed: true },
      { id: "20", name: "Flight tickets", packed: true },
      { id: "21", name: "Credit cards", packed: false },
    ],
  },
]

export function PackingChecklist() {
  const [categories, setCategories] = useState<PackingCategory[]>(defaultCategories)
  const [newItems, setNewItems] = useState<Record<string, string>>({})

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, packed: !item.packed } : item
          ),
        }
      }
      return cat
    }))
  }

  const addItem = (categoryId: string) => {
    const itemName = newItems[categoryId]?.trim()
    if (!itemName) return

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...cat.items, { 
            id: `new-${Date.now()}`, 
            name: itemName, 
            packed: false 
          }],
        }
      }
      return cat
    }))
    setNewItems(prev => ({ ...prev, [categoryId]: "" }))
  }

  const removeItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId),
        }
      }
      return cat
    }))
  }

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0)
  const packedItems = categories.reduce((acc, cat) => acc + cat.items.filter(i => i.packed).length, 0)
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Packing Progress
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {packedItems} of {totalItems} items packed
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{progress.toFixed(0)}%</span>
              {progress === 100 && (
                <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">
                  <Check className="w-3 h-3 mr-1" />
                  Ready!
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* AI Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">AI Suggestion</p>
              <p className="text-xs text-muted-foreground">
                Based on your destination (Paris) and dates (June), consider packing light layers and a rain jacket!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((category, catIndex) => {
          const Icon = category.icon
          const categoryPacked = category.items.filter(i => i.packed).length
          const categoryTotal = category.items.length
          const categoryProgress = categoryTotal > 0 ? (categoryPacked / categoryTotal) * 100 : 0

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-card" />
                      </div>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-normal">
                      {categoryPacked}/{categoryTotal}
                    </span>
                  </CardTitle>
                  <Progress value={categoryProgress} className="h-1" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence>
                    {category.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 group"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.packed}
                          onCheckedChange={() => toggleItem(category.id, item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className={`flex-1 text-sm cursor-pointer transition-all ${
                            item.packed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {item.name}
                        </label>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(category.id, item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add new item */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add item..."
                      value={newItems[category.id] || ""}
                      onChange={(e) => setNewItems(prev => ({ ...prev, [category.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addItem(category.id)}
                      className="h-8 text-sm bg-input/50"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => addItem(category.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
