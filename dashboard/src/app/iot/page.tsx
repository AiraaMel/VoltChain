"use client"

import { useState } from "react"
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

export default function IoTDevicesPage() {
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)

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

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Devices"
                value="3"
                change={{ value: "Connected devices ⚙️", isPositive: true }}
                icon={<Cog className="h-5 w-5" />}
              />
              <MetricCard
                title="Active Devices"
                value="3"
                change={{ value: "Currently producing ⚡", isPositive: true }}
                icon={<Activity className="h-5 w-5" />}
              />
              <MetricCard
                title="Offline Devices"
                value="0"
                change={{ value: "Not responding ⚠️", isPositive: true }}
                icon={<AlertCircle className="h-5 w-5" />}
              />
              <MetricCard
                title="System Health"
                value="100%"
                change={{ value: "All systems operational ✅", isPositive: true }}
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </div>

            {/* Devices and Configuration */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Devices List */}
              <div className="lg:col-span-2 space-y-4">
                <DeviceCard
                  name="Solar Panel Array A"
                  location="Rooftop - North"
                  type="Solar"
                  deviceId="device-001"
                  status="active"
                  currentProduction={1847}
                  maxCapacity={2000}
                  efficiency={92.35}
                  lastSync="2 min ago"
                />
                <DeviceCard
                  name="Solar Panel Array B"
                  location="Rooftop - South"
                  type="Solar"
                  deviceId="device-002"
                  status="active"
                  currentProduction={1923}
                  maxCapacity={2000}
                  efficiency={96.15}
                  lastSync="5 min ago"
                />
                <DeviceCard
                  name="Wind Turbine Unit 1"
                  location="Ground Level"
                  type="Wind"
                  deviceId="device-003"
                  status="active"
                  currentProduction={1464}
                  maxCapacity={1800}
                  efficiency={81.33}
                  lastSync="1 min ago"
                />
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
