"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Zap, Target } from "lucide-react"

interface MarketMetricProps {
  title: string
  value: string
  icon: React.ReactNode
}

function MarketMetricCard({ title, value, icon }: MarketMetricProps) {
  return (
    <Card className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export function MarketInsights() {
  const metrics = [
    {
      title: "Current Market Price",
      value: "$0.38 per kWh",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: "Price Trend",
      value: "+3.2% (Last 30 days)",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "Energy Sold",
      value: "4,892 kWh (This month)",
      icon: <Zap className="h-5 w-5" />
    },
    {
      title: "Avg. Sale Price",
      value: "$0.38 (Your average)",
      icon: <Target className="h-5 w-5" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Market Insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Key metrics and market information
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MarketMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </div>
    </div>
  )
}
