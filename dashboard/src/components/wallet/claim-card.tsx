"use client"

import { Button } from "@/components/ui/button"
import { ArrowDownLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

export function ClaimCard() {
  const { connected, fetchBalance } = useWalletConnection()
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [claimMessage, setClaimMessage] = useState('')

  const handleClaim = async () => {
    if (!connected || !publicKey || !signTransaction || !connection) {
      setClaimStatus('error')
      setClaimMessage('Wallet not connected')
      return
    }

    setIsClaiming(true)
    setClaimStatus('idle')
    setClaimMessage('')

    try {
      console.log('Starting claim process...')
      console.log('Wallet address:', publicKey.toString())

      // Create a simple transaction that sends 0.0001 SOL to the user's own address
      // This simulates a claim transaction without requiring a real backend
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0.0001 * LAMPORTS_PER_SOL, // 0.0001 SOL
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      console.log('Transaction created, requesting signature...')

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction)
      console.log('Transaction signed')

      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      console.log('Transaction sent, signature:', signature)

      // Wait for confirmation
      await connection.confirmTransaction(signature)
      console.log('Transaction confirmed')

      setClaimStatus('success')
      setClaimMessage('Claimed successfully!')
      
      // Refresh balance
      await fetchBalance()

    } catch (error) {
      console.error('Claim failed:', error)
      setClaimStatus('error')
      setClaimMessage(error instanceof Error ? error.message : 'Claim failed')
    } finally {
      setIsClaiming(false)
    }
  }

  const getStatusIcon = () => {
    switch (claimStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <ArrowDownLeft className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (claimStatus) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return connected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
  }

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
          onClick={handleClaim}
          disabled={!connected || isClaiming}
          className={`w-full ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span className="ml-2">
            {isClaiming ? 'Claiming...' : 'Claim Earnings'}
          </span>
        </Button>

        {/* Status Message */}
        {claimMessage && (
          <div className={`text-center text-sm ${
            claimStatus === 'success' ? 'text-green-600' : 
            claimStatus === 'error' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {claimMessage}
          </div>
        )}

        {/* Subtext */}
        {!connected && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Connect your wallet to claim earnings
          </p>
        )}
      </div>
    </div>
  )
}
