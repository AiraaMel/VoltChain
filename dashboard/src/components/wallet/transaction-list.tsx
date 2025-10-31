"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: "sale" | "reward" | "claim"
  amount: number
  date: string
  status?: string
  hash?: string
}

const formatUSD = (n: number) => `$${n.toFixed(2)}`

export function TransactionList() {
  // Estado inicial com dados mockados
  const [txs, setTxs] = useState<Transaction[]>([
    { 
      id: crypto.randomUUID(), 
      type: "sale", 
      amount: 24.5, 
      date: new Date(Date.now() - 3600000).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: "confirmed"
    },
    { 
      id: crypto.randomUUID(), 
      type: "reward", 
      amount: 5.0, 
      date: new Date(Date.now() - 7200000).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: "confirmed"
    },
    { 
      id: crypto.randomUUID(), 
      type: "sale", 
      amount: 18.75, 
      date: new Date(Date.now() - 86400000).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: "confirmed"
    },
    { 
      id: crypto.randomUUID(), 
      type: "claim", 
      amount: 12.30, 
      date: new Date(Date.now() - 172800000).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: "completed"
    },
    { 
      id: crypto.randomUUID(), 
      type: "sale", 
      amount: 31.20, 
      date: new Date(Date.now() - 259200000).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: "confirmed"
    }
  ])
  
  const updateCountRef = useRef(0)
  const [loading, setLoading] = useState(false)

  // Atualização automática (5 vezes, depois para)
  useEffect(() => {
    const interval = setInterval(() => {
      if (updateCountRef.current >= 5) {
        clearInterval(interval)
        return
      }

      const types: ("sale" | "reward" | "claim")[] = ["sale", "reward", "claim"]
      const randomType = types[Math.floor(Math.random() * types.length)]
      
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        type: randomType,
        amount: parseFloat((Math.random() * 25 + 5).toFixed(2)),
        date: new Date().toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        status: randomType === "claim" ? "completed" : "confirmed"
      }
      
      setTxs((prev) => [newTx, ...prev.slice(0, 9)]) // mantém últimas 10 transações
      updateCountRef.current += 1
    }, 20000) // a cada 20 segundos

    return () => clearInterval(interval)
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
        {txs.length === 0 ? (
          <span className="text-gray-600">Nenhuma transação encontrada.</span>
        ) : (
          txs.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {/* Left side - Icon and Type */}
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                  {transaction.type === "claim" ? (
                    <ArrowDownLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
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
                  {transaction.status || 'confirmed'}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {transaction.hash || '-'}
                  </span>
                  {transaction.hash && (
                    <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                  )}
                </div>
              </div>
              {/* Right side - Amount */}
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatUSD(transaction.amount)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
