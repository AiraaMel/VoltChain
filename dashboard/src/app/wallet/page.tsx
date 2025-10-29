"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { WalletConnectionCard } from "@/components/wallet/wallet-connection-card"
import { ClaimCard } from "@/components/wallet/claim-card"
import { EarningsTabs } from "@/components/wallet/earnings-tabs"
import { TransactionList } from "@/components/wallet/transaction-list"

export default function WalletPage() {
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

            {/* Wallet Connection and Claim Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Wallet Connection */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <WalletConnectionCard />
              </div>
              
              {/* Claim Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <ClaimCard />
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <EarningsTabs />
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <TransactionList />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
