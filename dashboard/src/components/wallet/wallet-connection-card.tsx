"use client"

import { Wallet, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useState } from "react"

export function WalletConnectionCard() {
  const { connected, shortAddress, walletName, balance, isLoadingBalance } = useWalletConnection()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (shortAddress) {
      await navigator.clipboard.writeText(shortAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
        {connected ? (
          <>
            {/* Wallet Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Wallet Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {walletName}
              </h3>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {shortAddress}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Balance */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isLoadingBalance ? (
                  "Loading balance..."
                ) : (
                  `${balance.toFixed(4)} SOL`
                )}
              </div>
            </div>

            {/* Disconnect Button */}
            <WalletMultiButton className="w-full" />
          </>
        ) : (
          <>
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
            <WalletMultiButton className="w-full" />
          </>
        )}
      </div>
    </div>
  )
}
