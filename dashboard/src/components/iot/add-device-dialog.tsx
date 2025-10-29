"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDeviceDialog({ open, onOpenChange }: AddDeviceDialogProps) {
  const [formData, setFormData] = useState({
    deviceName: "",
    deviceType: "",
    deviceId: "",
    apiKey: "",
    location: "",
    capacity: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log("Adding device:", formData)
    // Reset form
    setFormData({
      deviceName: "",
      deviceType: "",
      deviceId: "",
      apiKey: "",
      location: "",
      capacity: ""
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      deviceName: "",
      deviceType: "",
      deviceId: "",
      apiKey: "",
      location: "",
      capacity: ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New IoT Device</DialogTitle>
          <DialogDescription>
            Connect a new energy production device to your account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input
              id="deviceName"
              placeholder="e.g., Solar Panel Array A"
              value={formData.deviceName}
              onChange={(e) => handleInputChange("deviceName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) => handleInputChange("deviceType", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solar">Solar</SelectItem>
                <SelectItem value="Wind">Wind</SelectItem>
                <SelectItem value="Hydro">Hydro</SelectItem>
                <SelectItem value="Battery">Battery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              placeholder="Enter unique device identifier"
              value={formData.deviceId}
              onChange={(e) => handleInputChange("deviceId", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              placeholder="Enter device API key"
              value={formData.apiKey}
              onChange={(e) => handleInputChange("apiKey", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Rooftop - North"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <div className="relative">
              <Input
                id="capacity"
                type="number"
                placeholder="2000"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                kWh
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-800 hover:bg-green-700 text-white"
            >
              Add Device
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
