"use client"

import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const salesData = [
  {
    id: 1,
    date: "2024-01-15 14:32",
    buyer: "Grid Operator A",
    energy: 125,
    price: 0.38,
    total: 47.50,
    status: "completed",
    transaction: "5KJp7n...8mQx"
  },
  {
    id: 2,
    date: "2024-01-15 10:15",
    buyer: "Grid Operator B",
    energy: 89,
    price: 0.37,
    total: 32.93,
    status: "completed",
    transaction: "7Lmq9p...3nRy"
  },
  {
    id: 3,
    date: "2024-01-14 16:48",
    buyer: "Grid Operator C",
    energy: 156,
    price: 0.38,
    total: 59.28,
    status: "completed",
    transaction: "9Npq2r...5pTz"
  },
  {
    id: 4,
    date: "2024-01-14 09:22",
    buyer: "Grid Operator A",
    energy: 78,
    price: 0.39,
    total: 30.42,
    status: "completed",
    transaction: "2Mnp4s...7kLx"
  },
  {
    id: 5,
    date: "2024-01-13 15:30",
    buyer: "Grid Operator D",
    energy: 203,
    price: 0.38,
    total: 77.14,
    status: "completed",
    transaction: "8Qrt5m...9nPz"
  }
]

export function SalesTable() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Sales History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete transaction history of your energy sales
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Date & Time
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Buyer
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Energy (kWh)
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Price
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Total (USDC)
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Transaction
              </th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr 
                key={sale.id} 
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                  {sale.date}
                </td>
                <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                  {sale.buyer}
                </td>
                <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                  {sale.energy}
                </td>
                <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                  ${sale.price}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                  ${sale.total}
                </td>
                <td className="py-4 px-4">
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                    "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                  )}>
                    {sale.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {sale.transaction}
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
