"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { WalletConnectionCard } from "@/components/wallet/wallet-connection-card"
import { EarningsTabs } from "@/components/wallet/earnings-tabs"
import { TransactionList } from "@/components/wallet/transaction-list"
import { useWallet } from "@solana/wallet-adapter-react"

export default function WalletPage() {
  const { connected } = useWallet();
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar 
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Wallet" }
          ]}
        />
        
        {/* Wallet Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Wallet & Earnings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your wallet and track your earnings
              </p>
            </div>


            {/* Earnings Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <EarningsTabs />
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <TransactionList />
            </div>

            {/* Wallet Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Wallet & Earnings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {connected 
                  ? "Connected to Phantom Wallet (Devnet). Your wallet and Anchor connection remain active."
                  : "Connect your Phantom Wallet to begin."
                }
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
