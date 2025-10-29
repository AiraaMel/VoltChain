"use client"

import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WalletConnectionCard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Wallet Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to view balance and earnings
        </p>
      </div>

      {/* Content */}
      <div className="text-center space-y-4">
        {/* Wallet Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No wallet connected
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connect your Solana wallet to get started
          </p>
        </div>

        {/* Connect Button */}
        <Button 
          disabled 
          className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  )
}
