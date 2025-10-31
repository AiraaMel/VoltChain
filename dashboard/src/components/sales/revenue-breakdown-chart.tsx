"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 980 },
  { month: 'Mar', revenue: 1450 },
  { month: 'Apr', revenue: 1320 },
  { month: 'May', revenue: 1680 },
  { month: 'Jun', revenue: 1520 },
  { month: 'Jul', revenue: 1890 },
  { month: 'Aug', revenue: 1750 },
  { month: 'Sep', revenue: 2100 },
  { month: 'Oct', revenue: 1980 },
  { month: 'Nov', revenue: 2250 },
  { month: 'Dec', revenue: 1989 }
]

export function RevenueBreakdownChart() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Revenue Breakdown
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monthly revenue from energy sales in USDC
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              className="text-xs text-gray-500"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              className="text-xs text-gray-500"
              tick={{ fill: '#6B7280' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`$${value}`, 'Revenue']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar 
              dataKey="revenue" 
              fill="#4CAF50"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
