"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { 
  simulateWithPhantom, 
  sendWithPhantom, 
  getPoolAddress, 
  getUserPositionAddress 
} from "@/utils/anchorClient";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle, Loader2, AlertCircle, Wallet } from "lucide-react";
import { PublicKey } from "@solana/web3.js";

export function AnchorTestPanelEnhanced() {
  const { publicKey, connected, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleTest = async (fn: () => Promise<any>) => {
    if (!publicKey || !connected) {
      setResult({ type: "error", message: "Conecte sua Phantom Wallet primeiro!" });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      await fn();
      setResult({ type: "success", message: "Operação bem-sucedida! Veja o console para detalhes." });
    } catch (error: any) {
      console.error("Erro:", error);
      setResult({ 
        type: "error", 
        message: error?.message || "Erro desconhecido. Veja o console para detalhes." 
      });
    } finally {
      setLoading(false);
    }
  };

  const getShortAddress = () => {
    if (!publicKey) return null;
    return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
  };

  const testRegisterUser = async () => {
    if (!publicKey) throw new Error("Phantom não conectada");
    
    await simulateWithPhantom(
      "register_user",
      [],
      {
        userPosition: await getUserPositionAddress(publicKey),
        owner: publicKey,
        systemProgram: new PublicKey("11111111111111111111111111111111"),
      }
    );
  };

  const testRegisterUserSend = async () => {
    if (!publicKey) throw new Error("Phantom não conectada");
    
    await sendWithPhantom(
      "register_user",
      [],
      {
        userPosition: await getUserPositionAddress(publicKey),
        owner: publicKey,
        systemProgram: new PublicKey("11111111111111111111111111111111"),
      }
    );
  };

  const testEnergyReport = async () => {
    if (!publicKey) throw new Error("Phantom não conectada");
    
    // 1 kWh = 1_000_000 micro kWh
    await simulateWithPhantom(
      "energy_report",
      [1000000],
      {
        pool: await getPoolAddress(),
        userPosition: await getUserPositionAddress(publicKey),
        owner: publicKey,
      }
    );
  };

  const testEnergyReportSend = async () => {
    if (!publicKey) throw new Error("Phantom não conectada");
    
    // 1 kWh = 1_000_000 micro kWh
    await sendWithPhantom(
      "energy_report",
      [1000000],
      {
        pool: await getPoolAddress(),
        userPosition: await getUserPositionAddress(publicKey),
        owner: publicKey,
      }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🧪 Anchor Integration Test
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Teste a integração com Phantom Wallet e programa Anchor
          </p>
        </div>

        {/* Wallet Connection Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Wallet Connection
          </h3>
          
          {!connected ? (
            <div className="space-y-3">
              <WalletMultiButton className="!w-full !justify-center !bg-green-600 hover:!bg-green-700 !text-white" />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Clique acima para conectar sua Phantom Wallet
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Conectado à Phantom Wallet
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                    {getShortAddress()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => disconnect()}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Desconectar
              </Button>
            </div>
          )}
        </div>

        {/* Result Alert */}
        {result && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            result.type === "success" 
              ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800" 
              : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}>
            {result.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm ${
              result.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
            }`}>
              {result.message}
            </span>
          </div>
        )}

        {/* Test Buttons - Only show when connected */}
        {connected && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Register User
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTest(testRegisterUser)}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Simulate
                </Button>
                <Button
                  onClick={() => handleTest(testRegisterUserSend)}
                  disabled={loading}
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Energy Report (1 kWh)
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTest(testEnergyReport)}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Simulate
                </Button>
                <Button
                  onClick={() => handleTest(testEnergyReportSend)}
                  disabled={loading}
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>ℹ️ Importante:</strong> Certifique-se de ter a Phantom Wallet instalada e configurada com uma conta em Devnet.
            Os resultados detalhados aparecerão no console do navegador (F12 → Console).
          </p>
        </div>
      </div>
    </div>
  );
}

