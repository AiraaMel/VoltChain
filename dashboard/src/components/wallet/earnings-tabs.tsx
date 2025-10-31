"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/ui/metric-card"
import { DollarSign, Zap, ShoppingCart } from "lucide-react"
import { apiService } from '@/lib/api';

export function EarningsTabs() {
  const [activeTab, setActiveTab] = useState("month")
  const [earnings, setEarnings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    setLoading(true)
    // No backend endpoint por periodo ainda — usar /v1/dashboard para MVP
    apiService.getDashboardData().then(resp => {
      if (resp.success) {
        setEarnings({
          totalEarnings: resp.data.totalEarnings ?? 0,
          energySold: resp.data.totalEnergy ?? 0,
          transactions: 0 // pode somar via outra chamada se desejar
        });
        setError(null)
      } else {
        setEarnings(null)
        setError(resp.error || 'Erro ao buscar dados')
      }
      setLoading(false)
    });
  }, [activeTab]);

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
            {loading && <span className="text-gray-500">Carregando...</span>}
            {error && <span className="text-red-500">{error}</span>}
            {(!loading && !error && !earnings) && <span className="text-gray-500">Sem earnings</span>}
            {(!loading && !error && earnings) && <>
              <MetricCard
                title="Total Earnings"
                value={`$${earnings.totalEarnings.toLocaleString()}`}
                change={{ value: "USDC", isPositive: true }}
                icon={<DollarSign className="h-5 w-5" />}
              />
              <MetricCard
                title="Energy Sold"
                value={`${earnings.energySold.toLocaleString()}`}
                change={{ value: "kWh", isPositive: true }}
                icon={<Zap className="h-5 w-5" />}
              />
              <MetricCard
                title="Transactions"
                value={`${earnings.transactions}`}
                change={{ value: "Sales", isPositive: true }}
                icon={<ShoppingCart className="h-5 w-5" />}
              />
            </>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
