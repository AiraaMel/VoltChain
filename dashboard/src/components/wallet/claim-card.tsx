"use client"

import { Button } from "@/components/ui/button"
import { ArrowDownLeft } from "lucide-react"

export function ClaimCard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Available to Claim
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your accumulated earnings ready to withdraw
        </p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Amount */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            $1,247.85
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            USDC
          </div>
        </div>

        {/* Claim Button */}
        <Button 
          disabled 
          className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          <ArrowDownLeft className="mr-2 h-4 w-4" />
          Claim Earnings
        </Button>

        {/* Subtext */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Connect your wallet to claim earnings
        </p>
      </div>
    </div>
  )
}
