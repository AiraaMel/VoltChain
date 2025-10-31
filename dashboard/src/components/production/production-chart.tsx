"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ProductionChartProps {
  period: "daily" | "weekly" | "monthly"
}

// Mock data for different periods
const dailyData = [
  { time: "00:00", production: 0 },
  { time: "04:00", production: 0 },
  { time: "08:00", production: 45 },
  { time: "12:00", production: 78 },
  { time: "16:00", production: 65 },
  { time: "20:00", production: 12 },
  { time: "24:00", production: 0 },
]

const weeklyData = [
  { day: "Mon", production: 420 },
  { day: "Tue", production: 380 },
  { day: "Wed", production: 450 },
  { day: "Thu", production: 520 },
  { day: "Fri", production: 480 },
  { day: "Sat", production: 350 },
  { day: "Sun", production: 290 },
]

const monthlyData = [
  { month: "Jan", production: 12000 },
  { month: "Feb", production: 13500 },
  { month: "Mar", production: 14800 },
  { month: "Apr", production: 16200 },
  { month: "May", production: 17500 },
  { month: "Jun", production: 18900 },
]

export function ProductionChart({ period }: ProductionChartProps) {
  const getData = () => {
    switch (period) {
      case "daily":
        return dailyData
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      default:
        return dailyData
    }
  }

  const getXAxisKey = () => {
    switch (period) {
      case "daily":
        return "time"
      case "weekly":
        return "day"
      case "monthly":
        return "month"
      default:
        return "time"
    }
  }

  const data = getData()
  const xAxisKey = getXAxisKey()

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey={xAxisKey} 
            className="text-sm text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            className="text-sm text-gray-600 dark:text-gray-400"
            tickFormatter={(value) => `${value} kWh`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} kWh`, 'Production']}
            labelStyle={{ color: '#374151' }}
          />
          <Area
            type="monotone"
            dataKey="production"
            stroke="#0091FF"
            fill="url(#colorProduction)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0091FF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0091FF" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
