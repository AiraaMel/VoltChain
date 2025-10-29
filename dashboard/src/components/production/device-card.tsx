"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Wind } from "lucide-react"

interface Device {
  id: string
  name: string
  location: string
  type: "solar" | "wind"
  status: "active" | "inactive" | "maintenance"
  production: number
  capacity: number
  efficiency: number
}

const mockDevices: Device[] = [
  {
    id: "1",
    name: "Solar Panel Array A",
    location: "Rooftop – North",
    type: "solar",
    status: "active",
    production: 1847,
    capacity: 2000,
    efficiency: 92.35
  },
  {
    id: "2",
    name: "Solar Panel Array B",
    location: "Rooftop – South",
    type: "solar",
    status: "active",
    production: 1923,
    capacity: 2000,
    efficiency: 96.15
  },
  {
    id: "3",
    name: "Wind Turbine Unit 1",
    location: "Ground Level",
    type: "wind",
    status: "active",
    production: 1464,
    capacity: 1800,
    efficiency: 81.33
  }
]

export function DeviceCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          Production by Device
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Individual device performance and output
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockDevices.map((device) => (
          <div key={device.id} className="space-y-3">
            {/* Device Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {device.type === "solar" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Wind className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {device.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {device.location}
                  </p>
                </div>
              </div>
              <Badge 
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
              >
                {device.status}
              </Badge>
            </div>

            {/* Production Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Production</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {device.production.toLocaleString()} of {device.capacity.toLocaleString()} kWh
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(device.production / device.capacity) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Efficiency</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {device.efficiency}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
