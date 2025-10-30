"use client"

import { useEffect, useState } from "react"
import { apiService } from '@/lib/api'
import { useDashboardData } from '@/hooks/useDashboardData';
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
  const { data: dash, loading: dashLoading, error: dashError } = useDashboardData();
  const [devices, setDevices] = useState<any[]>([]);
  const [devLoading, setDevLoading] = useState(true);
  const [devError, setDevError] = useState<string|null>(null);

  useEffect(() => {
    setDevLoading(true);
    apiService.getDevices().then(resp => {
      if (resp.success) {
        setDevices(resp.data);
        setDevError(null);
      } else {
        setDevices([]);
        setDevError(resp.error || 'Erro ao buscar devices');
      }
      setDevLoading(false);
    });
  }, []);

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
                title="Total Production"
                value={dashLoading ? '...' : dash?.totalEnergy ? `${dash.totalEnergy} kWh` : '0 kWh'}
                change={{ value: "Total gerado", isPositive: true }}
                icon={<Zap className="h-5 w-5" />}
              />
              <MetricCard
                title="Solar Output"
                value={dashLoading ? '...' : `${Math.round((dash?.totalEnergy || 0) * 0.7)} kWh`}
                change={{ value: "Estimated solar", isPositive: true }}
                icon={<Sun className="h-5 w-5" />}
              />
              <MetricCard
                title="Wind Output"
                value={dashLoading ? '...' : `${Math.round((dash?.totalEnergy || 0) * 0.3)} kWh`}
                change={{ value: "Estimated wind", isPositive: true }}
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
                  {/* TODO: Chart deve ser alimentado pelos dados reais do dashboard/produced */}
                  <AnalyticsTabs />
                </div>
              </div>
              
              {/* Production by Device */}
              <div className="lg:col-span-1 space-y-4">
                {devLoading && <div className="text-gray-600">Carregando dispositivos...</div>}
                {devError && <div className="text-red-500">{devError}</div>}
                {!devLoading && !devError && devices.length === 0 && (
                  <div className="text-gray-600">Nenhum dispositivo cadastrado ainda.</div>
                )}
                {devices.map(device => (
                  <div className="mb-2" key={device.id}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
                      <strong>{device.name}</strong><br/>
                      <span>Local: {device.location?.place || device.location?.site || device.location || '-'}</span><br/>
                      <span>Status: {device.active ? 'Ativo' : 'Desligado'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
