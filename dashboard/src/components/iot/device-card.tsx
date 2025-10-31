"use client"

import { Cpu, Sun, Wind, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeviceCardProps {
  name: string
  location: string
  type: "Solar" | "Wind" | "Hydro" | "Battery"
  deviceId: string
  status: "active" | "offline" | "maintenance"
  currentProduction: number
  maxCapacity: number
  efficiency: number
  lastSync: string
}

export function DeviceCard({
  name,
  location,
  type,
  deviceId,
  status,
  currentProduction,
  maxCapacity,
  efficiency,
  lastSync
}: DeviceCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case "Solar":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "Wind":
        return <Wind className="h-6 w-6 text-blue-500" />
      case "Hydro":
        return <Cpu className="h-6 w-6 text-cyan-500" />
      case "Battery":
        return <Cpu className="h-6 w-6 text-green-500" />
      default:
        return <Cpu className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      case "offline":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      case "maintenance":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const progressPercentage = (currentProduction / maxCapacity) * 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {location}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium",
            getStatusColor()
          )}>
            {status}
          </span>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Device Info */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Type:</span>
          <span className="text-gray-900 dark:text-white">{type}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Device ID:</span>
          <span className="text-gray-900 dark:text-white font-mono">{deviceId}</span>
        </div>

        {/* Production Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Current Production:</span>
            <span className="text-gray-900 dark:text-white">
              {currentProduction.toLocaleString()} / {maxCapacity.toLocaleString()} kWh
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Efficiency and Last Sync */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Efficiency:</span>
          <span className="text-gray-900 dark:text-white">{efficiency}%</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last Sync:</span>
          <span className="text-gray-900 dark:text-white">{lastSync}</span>
        </div>
      </div>
    </div>
  )
}
