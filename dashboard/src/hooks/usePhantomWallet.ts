"use client"

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

/**
 * Hook to manage Phantom Wallet connection
 */
export function usePhantomWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);

  // Detect if Phantom is available
  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    const provider = window.solana;
    
    if (provider && provider.isPhantom) {
      setIsPhantomAvailable(true);
      console.log("Phantom Wallet detected");
      
      // Check if already connected
      provider.on("connect", () => {
        console.log("Phantom connected:", provider.publicKey?.toString());
        setPublicKey(provider.publicKey?.toString() || null);
      });

      provider.on("disconnect", () => {
        console.log("Phantom disconnected");
        setPublicKey(null);
      });

      // Try to recover existing connection
      if (provider.publicKey) {
        setPublicKey(provider.publicKey.toString());
      }
    } else {
      setIsPhantomAvailable(false);
      console.log("Phantom is not available");
    }

    return () => {
      // Cleanup listeners
      if (provider && provider.isPhantom) {
        provider.removeListener("connect");
        provider.removeListener("disconnect");
      }
    };
  }, []);

  /**
   * Connect to Phantom Wallet
   */
  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined") {
      alert("Only available in browser");
      return;
    }

    // Check secure context
    const isSecureContext = window.location.protocol === "https:" || 
                           window.location.hostname === "localhost";

    if (!isSecureContext) {
      alert("Please access via https or http://localhost");
      return;
    }

    // @ts-ignore
    const provider = window.solana;

    if (!provider || !provider.isPhantom) {
      alert("Phantom Wallet not detected. Install at https://phantom.app/download");
      window.open("https://phantom.app/download", "_blank");
      return;
    }

    setIsConnecting(true);

    try {
      const resp = await provider.connect();
      const pubkey = resp.publicKey.toString();
      
      setPublicKey(pubkey);
      console.log("Connected to Phantom Wallet:", pubkey);
    } catch (err: any) {
      console.error("Error connecting to Phantom:", err);
      
      if (err.code === 4001) {
        alert("Connection refused by user");
      } else {
        alert(`Error connecting: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect from Phantom Wallet
   */
  const disconnectWallet = useCallback(async () => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    const provider = window.solana;

    if (provider && provider.isPhantom) {
      try {
        await provider.disconnect();
        setPublicKey(null);
        console.log("Disconnected from Phantom Wallet");
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }
  }, []);

  /**
   * Get Solana Web3 PublicKey
   */
  const getPublicKey = useCallback((): PublicKey | null => {
    if (!publicKey) return null;
    
    try {
      return new PublicKey(publicKey);
    } catch (err) {
      console.error("Error converting PublicKey:", err);
      return null;
    }
  }, [publicKey]);

  /**
   * Format address for display (first 4 and last 4 characters)
   */
  const getShortAddress = useCallback((): string | null => {
    if (!publicKey) return null;
    
    return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
  }, [publicKey]);

  return {
    publicKey,
    isPhantomAvailable,
    isConnecting,
    isConnected: !!publicKey,
    connectWallet,
    disconnectWallet,
    getPublicKey,
    getShortAddress,
  };
}

