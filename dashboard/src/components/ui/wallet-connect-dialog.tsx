"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WalletConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletConnectDialog({ open, onOpenChange }: WalletConnectDialogProps) {
  const handleWalletSelect = (wallet: string) => {
    console.log(`Selected wallet: ${wallet}`)
    // Future integration with onchain wallet connection
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0F172A] text-white border-gray-700">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-semibold text-center">
            Connect a wallet on Solana to continue
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {/* Phantom Wallet */}
          <Button
            onClick={() => handleWalletSelect("Phantom")}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl w-full h-auto"
          >
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-medium">Phantom</span>
          </Button>

          {/* Solflare Wallet */}
          <Button
            onClick={() => handleWalletSelect("Solflare")}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl w-full h-auto"
          >
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-medium">Solflare</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
