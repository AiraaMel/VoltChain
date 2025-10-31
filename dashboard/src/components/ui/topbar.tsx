"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsPanel } from "@/components/ui/notifications-panel"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Bell, Moon, Sun, User, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

interface TopbarProps {
  title?: string
  breadcrumb?: Array<{ label: string; href?: string }>
}

export function Topbar({ title = "Home", breadcrumb }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const [notifications] = useState(3) // Mock notification count
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left side */}
      <div className="flex items-center">
        {breadcrumb ? (
          <div className="flex items-center space-x-2">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {item.href ? (
                  <a 
                    href={item.href}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Wallet Connection Button */}
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !border-none !rounded-md !h-9 !px-4 !text-sm !font-medium !min-w-fit" />

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => setIsNotificationsOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@user" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@voltchain.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel 
        open={isNotificationsOpen} 
        onOpenChange={setIsNotificationsOpen} 
      />
    </div>
  )
}
