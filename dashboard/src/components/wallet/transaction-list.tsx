"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from '@/lib/api';

export function TransactionList() {
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    setLoading(true)
    // Se existir endpoint /v1/transactions, usar. Senão usar earnings/overview para MVP:
    // apiService.getTransactions().then...
    apiService.getDashboardData().then(resp => {
      // Fake: pegar transactions de resp.data.transactions se existir, senão []
      if (resp.success && Array.isArray(resp.data.transactions)) {
        setTxs(resp.data.transactions)
        setError(null)
      } else {
        setTxs([])
        setError(null)
      }
      setLoading(false)
    })
  }, [])

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
        {loading && <span className="text-gray-500">Carregando...</span>}
        {error && <span className="text-red-500">{error}</span>}
        {(!loading && txs.length === 0) && (
          <span className="text-gray-600">Nenhuma transação encontrada.</span>
        )}
        {txs.map((transaction: any) => (
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
                  {transaction.date || '-'}
                </div>
              </div>
            </div>
            {/* Center - Status and Hash */}
            <div className="flex items-center space-x-3">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
              )}>
                {transaction.status || '-'}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {transaction.hash || '-'}
                </span>
                <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
              </div>
            </div>
            {/* Right side - Amount */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${transaction.amount || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
