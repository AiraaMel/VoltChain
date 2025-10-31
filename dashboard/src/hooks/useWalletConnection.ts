"use client"

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMemo, useState, useEffect } from 'react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function useWalletConnection() {
  const { connection } = useConnection()
  const { wallet, publicKey, connected, connecting, disconnecting } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Get short address for display
  const shortAddress = useMemo(() => {
    if (!publicKey) return ''
    const address = publicKey.toString()
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [publicKey])

  // Get wallet name
  const walletName = useMemo(() => {
    return wallet?.adapter.name || 'Unknown Wallet'
  }, [wallet])

  // Fetch balance
  const fetchBalance = async () => {
    if (!publicKey || !connection) return
    
    setIsLoadingBalance(true)
    try {
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  // Update balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
    } else {
      setBalance(0)
    }
  }, [connected, publicKey, connection])

  return {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    shortAddress,
    walletName,
    balance,
    isLoadingBalance,
    fetchBalance,
  }
}
