"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { MetricCard } from "@/components/ui/metric-card"
import { ProductionChart } from "@/components/production/production-chart"
import { DeviceCard } from "@/components/production/device-card"
import { AnalyticsTabs } from "@/components/production/analytics-tabs"
import { EfficiencyMetrics } from "@/components/production/efficiency-metrics"
import { 
  Zap, 
  Sun, 
  Wind, 
  Activity
} from "lucide-react"

export default function ProductionPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar 
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Production" }
          ]}
        />
        
        {/* Production Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Energy Production
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed view of your energy generation and performance
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Today's Production"
                value="523 kWh"
                change={{ value: "Current day output", isPositive: true }}
                icon={<Zap className="h-5 w-5" />}
              />
              <MetricCard
                title="Solar Output"
                value="3,770 kWh"
                change={{ value: "This month ☀️", isPositive: true }}
                icon={<Sun className="h-5 w-5" />}
              />
              <MetricCard
                title="Wind Output"
                value="1,464 kWh"
                change={{ value: "This month 🌬️", isPositive: true }}
                icon={<Wind className="h-5 w-5" />}
              />
              <MetricCard
                title="System Health"
                value="Excellent"
                change={{ value: "All systems operational ✅", isPositive: true }}
                icon={<Activity className="h-5 w-5" />}
              />
            </div>

            {/* Efficiency Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <EfficiencyMetrics />
            </div>

            {/* Charts and Device Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Production Analytics */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Production Analytics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Detailed energy production trends over time
                    </p>
                  </div>
                  
                  <AnalyticsTabs />
                </div>
              </div>
              
              {/* Production by Device */}
              <div className="lg:col-span-1">
                <DeviceCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
