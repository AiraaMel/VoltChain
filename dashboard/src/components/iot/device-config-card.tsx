"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DeviceConfigCard() {
  const [autoSync, setAutoSync] = useState(true)
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)
  const [syncFrequency, setSyncFrequency] = useState("hour")
  const [dataRetention, setDataRetention] = useState("6months")
  const [apiEndpoint, setApiEndpoint] = useState("https://api.voltchain.io/v1")

  const handleSave = () => {
    // Here you would typically save the configuration to your API
    console.log("Saving configuration:", {
      autoSync,
      realTimeMonitoring,
      syncFrequency,
      dataRetention,
      apiEndpoint
    })
    // Show success message or handle error
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Device Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure global settings for all IoT devices
        </p>
      </div>

      {/* Configuration Options */}
      <div className="space-y-6">
        {/* Auto-sync Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-sync" className="text-sm font-medium">
              Auto-sync
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically sync device data every hour
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSync}
            onCheckedChange={setAutoSync}
          />
        </div>

        {/* Real-time monitoring Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="real-time" className="text-sm font-medium">
              Real-time monitoring
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enable real-time production monitoring
            </p>
          </div>
          <Switch
            id="real-time"
            checked={realTimeMonitoring}
            onCheckedChange={setRealTimeMonitoring}
          />
        </div>

        {/* Sync Frequency */}
        <div className="space-y-2">
          <Label htmlFor="sync-frequency" className="text-sm font-medium">
            Sync Frequency
          </Label>
          <Select value={syncFrequency} onValueChange={setSyncFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Every hour</SelectItem>
              <SelectItem value="6hours">Every 6 hours</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Retention Period */}
        <div className="space-y-2">
          <Label htmlFor="data-retention" className="text-sm font-medium">
            Data Retention Period
          </Label>
          <Select value={dataRetention} onValueChange={setDataRetention}>
            <SelectTrigger>
              <SelectValue placeholder="Select retention period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 month</SelectItem>
              <SelectItem value="6months">6 months</SelectItem>
              <SelectItem value="1year">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Endpoint */}
        <div className="space-y-2">
          <Label htmlFor="api-endpoint" className="text-sm font-medium">
            API Endpoint
          </Label>
          <Input
            id="api-endpoint"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.voltchain.io/v1"
          />
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full bg-green-800 hover:bg-green-700 text-white"
      >
        Save Configuration
      </Button>
    </div>
  )
}
