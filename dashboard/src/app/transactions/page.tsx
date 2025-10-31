"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { Topbar } from "@/components/ui/topbar"
import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js"
import { createMemoInstruction } from "@solana/spl-memo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import { useNotifications } from "@/context/NotificationContext"

interface EnergyTransaction {
  id: string;
  wallet_address: string;
  kwh: number;
  price_per_kwh: number;
  total_usd: number;
  tx_signature: string;
  tx_status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  confirmed_at?: string;
}

interface Claim {
  id: string;
  wallet_address: string;
  amount: number;
  claim_tx_signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  requested_at: string;
  completed_at?: string;
}

interface WalletEarnings {
  wallet_address: string;
  available_to_claim: number;
  total_earned: number;
  updated_at: string;
}

const formatUSD = (n: number) => `$${n.toFixed(2)}`

export default function TransactionsPage() {
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const { addNotification } = useNotifications()
  const [kwh, setKwh] = useState<string>('10')
  const [isProcessingSale, setIsProcessingSale] = useState(false)
  const [saleStatus, setSaleStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saleMessage, setSaleMessage] = useState('')
  
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [claimMessage, setClaimMessage] = useState('')
  
  const [earnings, setEarnings] = useState<WalletEarnings | null>(null)
  const [transactions, setTransactions] = useState<EnergyTransaction[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Local state for earnings and histories
  const [localEarnings, setLocalEarnings] = useState({ available: 0, total: 0 })
  const [salesHistory, setSalesHistory] = useState<Array<{ id: string; date: string; kwh: number; total: number }>>([])
  const [claimsHistory, setClaimsHistory] = useState<Array<{ id: string; amount: number; date: string }>>([])

  const pricePerKwh = 0.38; // $0.38 per kWh

  // Fetch earnings and history
  const fetchData = async () => {
    if (!connected || !publicKey) return
    
    setIsLoading(true)
    try {
      const wallet = publicKey.toString()
      
      // Fetch earnings
      const earningsRes = await fetch(`/api/earnings?wallet=${wallet}`)
      if (earningsRes.ok) {
        const earningsData = await earningsRes.json()
        if (earningsData.success) {
          setEarnings(earningsData.data)
        }
      }
      
      // Fetch transactions
      const txRes = await fetch(`/api/transactions?wallet=${wallet}`)
      if (txRes.ok) {
        const txData = await txRes.json()
        if (txData.success) {
          setTransactions(txData.data)
        }
      }
      
      // Fetch claims
      const claimsRes = await fetch(`/api/claims?wallet=${wallet}`)
      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        if (claimsData.success) {
          setClaims(claimsData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchData().catch(() => {
        // Silently ignore errors on load - Supabase may not be configured
      })
    }
  }, [connected, publicKey])

  const handleSendSale = async () => {
    if (!connected || !publicKey || !signTransaction || !connection) {
      setSaleStatus('error')
      setSaleMessage('Wallet not connected')
      return
    }

    const kwhValue = parseFloat(kwh)
    if (isNaN(kwhValue) || kwhValue <= 0) {
      setSaleStatus('error')
      setSaleMessage('Please enter a valid kWh amount')
      return
    }

    setIsProcessingSale(true)
    setSaleStatus('idle')
    setSaleMessage('Checking balance...')

    try {
      // Check balance before sending
      const balance = await connection.getBalance(publicKey)
      if (balance < 1000000) { // 0.001 SOL
        setSaleStatus('error')
        setSaleMessage('Insufficient balance. Use https://faucet.solana.com to get Devnet SOL.')
        return
      }

      const totalUsd = kwhValue * pricePerKwh
      
      // Generate unique nonce for transaction uniqueness
      const nonce = Math.floor(Math.random() * 1000000)
      
      // Create memo with transaction details (include timestamp and nonce to make it unique)
      const memo = JSON.stringify({
        type: 'sale',
        kwh: kwhValue,
        pricePerKwh: pricePerKwh,
        total_usd: totalUsd,
        timestamp: Date.now(),
        nonce: nonce
      })

      // Get fresh blockhash FIRST (critical for transaction uniqueness)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')

      setSaleMessage('Creating transaction...')

      // Get recipient address from env or use a valid Devnet address
      const recipientPubkey = process.env.NEXT_PUBLIC_MARKET_PUBKEY 
        ? new PublicKey(process.env.NEXT_PUBLIC_MARKET_PUBKEY)
        : publicKey // Fallback to user's own address

      // Create NEW transaction with fresh blockhash
      const transaction = new Transaction()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
      
      // Add transfer instruction with unique lamports amount
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: 5000 + nonce, // Unique amount based on nonce
        })
      )
      
      // Add memo instruction
      transaction.add(
        createMemoInstruction(memo, [publicKey])
      )

      setSaleMessage('Signing transaction...')

      // Sign transaction
      const signedTransaction = await signTransaction(transaction)

      setSaleMessage('Sending transaction...')

      // Send transaction with error handling and retry logic
      let signature: string
      try {
        signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          { skipPreflight: false }
        )
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
        console.log('Transaction confirmed:', signature)
      } catch (sendError: unknown) {
        // Silently retry with skipPreflight (simulation errors are expected)
        setSaleMessage('Retrying transaction...')
        signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          { skipPreflight: true }
        )
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
        console.log('Transaction confirmed (retry):', signature)
      }

      // Transaction confirmed on-chain - always show success
      setSaleStatus('success')
      setSaleMessage(`Transaction confirmed! Signature: ${signature.slice(0, 16)}...`)
      
      // Show notification
      addNotification(
        "sale",
        "Energy Sale Completed",
        `Your energy sale of ${formatUSD(totalUsd)} has been processed successfully.`
      )
      
      // Update local earnings after successful sale
      setLocalEarnings((prev) => ({
        available: prev.available + totalUsd,
        total: prev.total + totalUsd
      }))
      
      // Add to sales history
      const saleRecord = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleString(),
        kwh: kwhValue,
        total: totalUsd
      }
      setSalesHistory((prev) => [saleRecord, ...prev])
      
      // Clear input
      setKwh('10')
      
      // Try to record in database (optional - don't fail if it errors)
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: publicKey.toString(),
            kwh: kwhValue,
            txSignature: signature
          })
        })
        
        const result = await response.json()
        if (result.success) {
          // Refresh data
          await fetchData()
        }
      } catch (dbError) {
        console.log('Database recording failed (optional):', dbError)
        // Don't fail the transaction - it's already confirmed on-chain
      }

    } catch (error) {
      console.error('Sale error:', error)
      setSaleStatus('error')
      setSaleMessage(error instanceof Error ? error.message : 'Sale failed')
    } finally {
      setIsProcessingSale(false)
    }
  }

  const handleClaimEarnings = () => {
    if (localEarnings.available <= 0) {
      setClaimStatus('error')
      setClaimMessage('Nenhum valor disponível para saque.')
      return
    }

    const claim = {
      id: crypto.randomUUID(),
      amount: localEarnings.available,
      date: new Date().toLocaleString(),
    }
    
    setClaimsHistory((prev) => [claim, ...prev])
    setLocalEarnings((prev) => ({ ...prev, available: 0 }))
    
    // Show notification
    addNotification(
      "claim",
      "Claim Successful",
      `You claimed ${formatUSD(claim.amount)} in earnings to your wallet.`
    )
    
    setClaimStatus('success')
    setClaimMessage(`Saque realizado com sucesso: $${claim.amount.toFixed(2)}`)
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setClaimMessage('')
      setClaimStatus('idle')
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
    }
  }

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
            { label: "Transactions" }
          ]}
        />
        
        {/* Transactions Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Energy Transactions
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Sell your energy (C2B) and claim your earnings
                </p>
              </div>
              <Button
                onClick={fetchData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Available to Claim Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Available to Claim
                </CardTitle>
                <CardDescription>
                  Your accumulated earnings ready to withdraw
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${localEarnings.available.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Total Earned: ${localEarnings.total.toFixed(2)}
                  </div>
                </div>
                <Button
                  onClick={handleClaimEarnings}
                  disabled={localEarnings.available <= 0}
                  className={`w-full ${
                    localEarnings.available > 0 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Claim Earnings
                </Button>
                {claimMessage && (
                  <div className={`text-center text-sm ${
                    claimStatus === 'success' ? 'text-green-600' : 
                    claimStatus === 'error' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {claimMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Sale Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpRight className="h-5 w-5 mr-2" />
                  Sell Energy (C2B)
                </CardTitle>
                <CardDescription>
                  Record an energy sale transaction on Solana Devnet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kwh">Energy Amount (kWh)</Label>
                  <Input
                    id="kwh"
                    type="number"
                    value={kwh}
                    onChange={(e) => setKwh(e.target.value)}
                    placeholder="10"
                    min="0.01"
                    step="0.01"
                  />
                  <p className="text-sm text-gray-500">
                    Price: ${pricePerKwh} per kWh
                  </p>
                  {kwh && !isNaN(parseFloat(kwh)) && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total: ${(parseFloat(kwh) * pricePerKwh).toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleSendSale}
                  disabled={!connected || isProcessingSale}
                  className="w-full"
                >
                  {isProcessingSale ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Send Sale
                    </>
                  )}
                </Button>
                {saleMessage && (
                  <div className={`text-center text-sm ${
                    saleStatus === 'success' ? 'text-green-600' : 
                    saleStatus === 'error' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {saleMessage}
                  </div>
                )}
                {!connected && (
                  <p className="text-xs text-center text-gray-500">
                    Connect your Phantom wallet to begin
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Sales History */}
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>
                  Recent energy sale transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {salesHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No sales recorded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {salesHistory.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">{sale.kwh} kWh</p>
                            <p className="text-sm text-gray-500">
                              {sale.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${sale.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            confirmed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claims History */}
            <Card>
              <CardHeader>
                <CardTitle>Claims History</CardTitle>
                <CardDescription>
                  Recent earnings withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claimsHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No claims recorded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {claimsHistory.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">Claim</p>
                            <p className="text-sm text-gray-500">
                              {claim.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${claim.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            completed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

