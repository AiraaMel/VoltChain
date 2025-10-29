"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', price: 0.35 },
  { month: 'Feb', price: 0.33 },
  { month: 'Mar', price: 0.36 },
  { month: 'Apr', price: 0.38 },
  { month: 'May', price: 0.37 },
  { month: 'Jun', price: 0.39 },
  { month: 'Jul', price: 0.41 },
  { month: 'Aug', price: 0.40 },
  { month: 'Sep', price: 0.42 },
  { month: 'Oct', price: 0.41 },
  { month: 'Nov', price: 0.39 },
  { month: 'Dec', price: 0.38 }
]

export function PriceTrendsChart() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Price Trends
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Average energy price per kWh over the past year
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              className="text-xs text-gray-500"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              className="text-xs text-gray-500"
              tick={{ fill: '#6B7280' }}
              domain={[0.3, 0.45]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`$${value}`, 'Price per kWh']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#0091FF" 
              strokeWidth={3}
              dot={{ fill: '#0091FF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0091FF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
