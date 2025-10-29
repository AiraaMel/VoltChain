"use client"

import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: 1,
    type: "Claim",
    status: "completed",
    date: "2024-01-15 14:32",
    hash: "5KJp7n...8mQx",
    amount: 523.40
  },
  {
    id: 2,
    type: "Sale",
    status: "completed",
    date: "2024-01-15 12:15",
    hash: "7Lmq9p...3nRy",
    amount: 67.30
  },
  {
    id: 3,
    type: "Sale",
    status: "completed",
    date: "2024-01-15 10:48",
    hash: "9Npq2r...5pTz",
    amount: 45.50
  },
  {
    id: 4,
    type: "Claim",
    status: "completed",
    date: "2024-01-14 16:20",
    hash: "2Krs4t...7qUw",
    amount: 456.80
  },
  {
    id: 5,
    type: "Sale",
    status: "completed",
    date: "2024-01-14 14:05",
    hash: "4Mtu6v...9rVx",
    amount: 32.80
  }
]

export function TransactionList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Transaction History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Recent wallet transactions and claims
        </p>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {/* Left side - Icon and Type */}
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                {transaction.type === "Claim" ? (
                  <ArrowDownLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.type}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.date}
                </div>
              </div>
            </div>

            {/* Center - Status and Hash */}
            <div className="flex items-center space-x-3">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
              )}>
                {transaction.status}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {transaction.hash}
                </span>
                <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
              </div>
            </div>

            {/* Right side - Amount */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${transaction.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
