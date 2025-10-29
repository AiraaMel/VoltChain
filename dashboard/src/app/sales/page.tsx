"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { MetricCard } from "@/components/ui/metric-card"
import { MarketInsights } from "@/components/sales/market-insights"
import { PriceTrendsChart } from "@/components/sales/price-trends-chart"
import { RevenueBreakdownChart } from "@/components/sales/revenue-breakdown-chart"
import { SalesTable } from "@/components/sales/sales-table"
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Percent
} from "lucide-react"

export default function SalesPage() {
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
            { label: "Sales" }
          ]}
        />
        
        {/* Sales Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sales & Pricing
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your energy sales and market pricing trends
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value="$1,989.20"
                change={{ value: "This month", isPositive: true }}
                icon={<DollarSign className="h-5 w-5" />}
              />
              <MetricCard
                title="Average Price"
                value="$0.38 per kWh"
                change={{ value: "+3.2% from last month", isPositive: true }}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <MetricCard
                title="Total Sales"
                value="4,892 kWh"
                change={{ value: "Energy sold this month", isPositive: true }}
                icon={<ShoppingCart className="h-5 w-5" />}
              />
              <MetricCard
                title="Profit Margin"
                value="94.2%"
                change={{ value: "After platform fees", isPositive: true }}
                icon={<Percent className="h-5 w-5" />}
              />
            </div>

            {/* Market Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <MarketInsights />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Price Trends */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <PriceTrendsChart />
              </div>
              
              {/* Revenue Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <RevenueBreakdownChart />
              </div>
            </div>

            {/* Sales History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <SalesTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
