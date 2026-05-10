"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plane } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const userEmail = localStorage.getItem("userEmail")
      router.replace(userEmail ? "/dashboard" : "/login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mx-auto mb-6"
        >
          <img src="/icon.svg" alt="Traveloop Icon" className="w-20 h-20" />
        </motion.div>
        <img src="/logo.svg" alt="Traveloop Logo" className="h-12 mx-auto mb-2" />
        <p className="text-muted-foreground">AI-Powered Travel Planning</p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="h-1 bg-primary rounded-full mt-6 max-w-[200px] mx-auto"
        />
      </motion.div>
    </div>
  )
}
