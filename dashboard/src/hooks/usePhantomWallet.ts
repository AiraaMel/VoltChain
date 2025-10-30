"use client"

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

/**
 * Hook para gerenciar conexão com Phantom Wallet
 */
export function usePhantomWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);

  // Detectar se Phantom está disponível
  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    const provider = window.solana;
    
    if (provider && provider.isPhantom) {
      setIsPhantomAvailable(true);
      console.log("✅ Phantom Wallet detectada");
      
      // Verificar se já está conectado
      provider.on("connect", () => {
        console.log("✅ Phantom conectada:", provider.publicKey?.toString());
        setPublicKey(provider.publicKey?.toString() || null);
      });

      provider.on("disconnect", () => {
        console.log("❌ Phantom desconectada");
        setPublicKey(null);
      });

      // Tentar recuperar conexão existente
      if (provider.publicKey) {
        setPublicKey(provider.publicKey.toString());
      }
    } else {
      setIsPhantomAvailable(false);
      console.log("⚠️ Phantom não está disponível");
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
   * Conectar à Phantom Wallet
   */
  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined") {
      alert("Apenas disponível no navegador");
      return;
    }

    // Verificar ambiente seguro
    const isSecureContext = window.location.protocol === "https:" || 
                           window.location.hostname === "localhost";

    if (!isSecureContext) {
      alert("Por favor, acesse via https ou http://localhost");
      return;
    }

    // @ts-ignore
    const provider = window.solana;

    if (!provider || !provider.isPhantom) {
      alert("Phantom Wallet não detectada. Instale em https://phantom.app/download");
      window.open("https://phantom.app/download", "_blank");
      return;
    }

    setIsConnecting(true);

    try {
      const resp = await provider.connect();
      const pubkey = resp.publicKey.toString();
      
      setPublicKey(pubkey);
      console.log("✅ Conectado à Phantom Wallet:", pubkey);
    } catch (err: any) {
      console.error("❌ Erro ao conectar Phantom:", err);
      
      if (err.code === 4001) {
        alert("Conexão recusada pelo usuário");
      } else {
        alert(`Erro ao conectar: ${err.message || "Erro desconhecido"}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Desconectar da Phantom Wallet
   */
  const disconnectWallet = useCallback(async () => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    const provider = window.solana;

    if (provider && provider.isPhantom) {
      try {
        await provider.disconnect();
        setPublicKey(null);
        console.log("✅ Desconectado da Phantom Wallet");
      } catch (err) {
        console.error("❌ Erro ao desconectar:", err);
      }
    }
  }, []);

  /**
   * Obter PublicKey do Solana Web3
   */
  const getPublicKey = useCallback((): PublicKey | null => {
    if (!publicKey) return null;
    
    try {
      return new PublicKey(publicKey);
    } catch (err) {
      console.error("❌ Erro ao converter PublicKey:", err);
      return null;
    }
  }, [publicKey]);

  /**
   * Formatar endereço para exibição (primeiros 4 e últimos 4 caracteres)
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

