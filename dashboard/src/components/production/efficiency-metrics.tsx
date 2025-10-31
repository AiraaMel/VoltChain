"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock, BarChart3, Gauge, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EfficiencyMetricProps {
  title: string
  value: string
  subtitle: string
  change: {
    value: string
    isPositive: boolean
  }
  icon: React.ReactNode
}

function EfficiencyMetricCard({ title, value, subtitle, change, icon }: EfficiencyMetricProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
        <div className="flex items-center">
          <div className={cn(
            "flex items-center text-xs font-medium",
            change.isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
          )}>
            {change.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {change.value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EfficiencyMetrics() {
  const metrics = [
    {
      title: "Peak Production Hour",
      value: "12:00 PM",
      subtitle: "312 kWh",
      change: {
        value: "+8% vs last period",
        isPositive: true
      },
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "Average Daily Output",
      value: "523 kWh",
      subtitle: "Last 7 days",
      change: {
        value: "+12% vs last period",
        isPositive: true
      },
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "System Efficiency",
      value: "89.94%",
      subtitle: "Overall performance",
      change: {
        value: "-2% vs last period",
        isPositive: false
      },
      icon: <Gauge className="h-5 w-5" />
    },
    {
      title: "Uptime",
      value: "99.8%",
      subtitle: "Last 30 days",
      change: {
        value: "+0.2% vs last period",
        isPositive: true
      },
      icon: <CheckCircle className="h-5 w-5" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Efficiency Metrics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Key performance indicators for your energy system
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <EfficiencyMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>
    </div>
  )
}
