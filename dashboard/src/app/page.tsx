"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { MetricCard } from "@/components/ui/metric-card"
import { OverviewChart } from "@/components/ui/overview-chart"
import { useDashboardData } from "@/hooks/useDashboardData"
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Settings,
  Wifi,
  WifiOff
} from "lucide-react"

export default function Dashboard() {
  const { data, loading, error, backendConnected } = useDashboardData()
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your energy production and earnings
                </p>
              </div>
              
              {/* Backend Status */}
              <div className="flex items-center space-x-2">
                {backendConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-medium">Backend Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">Backend Offline</span>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error loading data: {error}</p>
              </div>
            ) : data ? (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Energy Produced"
                    value={`${(data.totalEnergy || 0).toLocaleString()} kWh`}
                    change={{ value: "+12.5%", isPositive: true }}
                    icon={<Zap className="h-5 w-5" />}
                  />
                  <MetricCard
                    title="Average Price"
                    value={`$${(data.averagePrice || 0).toFixed(2)} per kWh`}
                    change={{ value: "+3.2%", isPositive: true }}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <MetricCard
                    title="Total Earnings"
                    value={`$${(data.totalEarnings || 0).toLocaleString()}`}
                    change={{ value: "+8.7%", isPositive: true }}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <MetricCard
                    title="Active Devices"
                    value={`${data.activeDevices || 0} IoT devices connected`}
                    icon={<Settings className="h-5 w-5" />}
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Energy Production Overview */}
                  <div>
                    <OverviewChart data={data.monthlyData || []} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}