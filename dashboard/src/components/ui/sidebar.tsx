"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Zap, 
  TrendingUp, 
  Wallet, 
  Settings,
  Receipt
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Energy Production", href: "/production", icon: Zap },
  { name: "Sales & Pricing", href: "/sales", icon: TrendingUp },
  { name: "Wallet & Earnings", href: "/wallet", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "IoT Devices", href: "/iot", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-3">
          {/* VoltChain Logo - New Brand Identity (SVG preferred to match PNG appearance) */}
          <div className="flex h-8 w-8 items-center justify-center">
            <Image 
              src="/voltchain-logo.svg" 
              alt="VoltChain Logo" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
          </div>
          <span className="text-xl font-bold text-foreground">
            VoltChain
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
