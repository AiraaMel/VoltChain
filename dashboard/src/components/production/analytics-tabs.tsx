"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductionChart } from "./production-chart"

export function AnalyticsTabs() {
  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>
      
      <TabsContent value="daily" className="mt-6">
        <ProductionChart period="daily" />
      </TabsContent>
      
      <TabsContent value="weekly" className="mt-6">
        <ProductionChart period="weekly" />
      </TabsContent>
      
      <TabsContent value="monthly" className="mt-6">
        <ProductionChart period="monthly" />
      </TabsContent>
    </Tabs>
  )
}
