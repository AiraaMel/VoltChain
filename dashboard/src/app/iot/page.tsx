"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { MetricCard } from "@/components/ui/metric-card"
import { DeviceCard } from "@/components/iot/device-card"
import { AddDeviceDialog } from "@/components/iot/add-device-dialog"
import { DeviceConfigCard } from "@/components/iot/device-config-card"
import { 
  Cog, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiService } from '@/lib/api'

export default function IoTDevicesPage() {
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    setLoading(true)
    apiService.getDevices().then(resp => {
      if (resp.success) {
        setDevices(resp.data)
        setError(null)
      } else {
        setDevices([])
        setError(resp.error || 'Erro ao buscar devices')
      }
      setLoading(false)
    })
  }, [])

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
            { label: "Devices" }
          ]}
        />
        
        {/* IoT Devices Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  IoT Devices
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and monitor your energy production devices
                </p>
              </div>
              
              {/* Add Device Button */}
              <Button
                onClick={() => setIsAddDeviceOpen(true)}
                className="bg-green-800 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            </div>

            {/* Metrics Grid - simples, só mostra total real */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Devices"
                value={devices.length.toString()}
                change={{ value: "Connected devices", isPositive: true }}
                icon={<Cog className="h-5 w-5" />}
              />
              <MetricCard
                title="Active Devices"
                value={devices.filter(d => d.active).length.toString()}
                change={{ value: "Currently producing ⚡", isPositive: true }}
                icon={<Activity className="h-5 w-5" />}
              />
              <MetricCard
                title="Offline Devices"
                value={devices.filter(d => d.active===false).length.toString()}
                change={{ value: "Not responding", isPositive: true }}
                icon={<AlertCircle className="h-5 w-5" />}
              />
              <MetricCard
                title="System Health"
                value="100%"
                change={{ value: "All systems operational", isPositive: true }}
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </div>

            {/* Devices and Configuration */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Devices List */}
              <div className="lg:col-span-2 space-y-4">
                {loading && <div className="text-gray-600">Carregando dispositivos...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {!loading && !error && devices.length === 0 && (
                  <div className="text-gray-600">Nenhum dispositivo cadastrado ainda.</div>
                )}
                {devices.map(device => (
                  <DeviceCard
                    key={device.id}
                    name={device.name}
                    location={device.location?.place || device.location?.site || device.location || '-'}
                    type={device.type || 'Solar'}
                    deviceId={device.id}
                    status={device.active ? 'active' : 'offline'}
                    currentProduction={device.currentProduction || 0}
                    maxCapacity={device.maxCapacity || 2000}
                    efficiency={device.efficiency || 90}
                    lastSync={device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : '-'}
                  />
                ))}
              </div>
              
              {/* Device Configuration */}
              <div className="lg:col-span-1">
                <DeviceConfigCard />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Device Dialog */}
      <AddDeviceDialog 
        open={isAddDeviceOpen} 
        onOpenChange={setIsAddDeviceOpen} 
      />
    </div>
  )
}
