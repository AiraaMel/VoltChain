"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/ui/metric-card"
import { DollarSign, Zap, ShoppingCart } from "lucide-react"

// Mock data for different time periods
const earningsData = {
  today: {
    totalEarnings: 89.20,
    energySold: 234,
    transactions: 12
  },
  week: {
    totalEarnings: 456.80,
    energySold: 1202,
    transactions: 45
  },
  month: {
    totalEarnings: 1989.20,
    energySold: 5234,
    transactions: 87
  },
  year: {
    totalEarnings: 18945.60,
    energySold: 49856,
    transactions: 1024
  }
}

export function EarningsTabs() {
  const [activeTab, setActiveTab] = useState("month")

  const getCurrentData = () => {
    return earningsData[activeTab as keyof typeof earningsData] || earningsData.month
  }

  const currentData = getCurrentData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Earnings Summary
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your earnings across different time periods
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricCard
              title="Total Earnings"
              value={`$${currentData.totalEarnings.toLocaleString()}`}
              change={{ value: "USDC", isPositive: true }}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <MetricCard
              title="Energy Sold"
              value={`${currentData.energySold.toLocaleString()}`}
              change={{ value: "kWh", isPositive: true }}
              icon={<Zap className="h-5 w-5" />}
            />
            <MetricCard
              title="Transactions"
              value={`${currentData.transactions.toLocaleString()}`}
              change={{ value: "Sales", isPositive: true }}
              icon={<ShoppingCart className="h-5 w-5" />}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
