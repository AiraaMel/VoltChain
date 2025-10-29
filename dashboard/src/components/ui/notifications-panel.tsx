"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X, Info, AlertTriangle, CreditCard } from "lucide-react"

interface NotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const notifications = [
  {
    id: 1,
    title: "New Feature",
    message: "Check out our new budget tracking tool!",
    date: "2023-07-15",
    icon: Info,
    iconColor: "text-blue-500"
  },
  {
    id: 2,
    title: "Account Alert",
    message: "Unusual activity detected on your account.",
    date: "2023-07-14",
    icon: AlertTriangle,
    iconColor: "text-yellow-500"
  },
  {
    id: 3,
    title: "Payment Due",
    message: "Your credit card payment is due in 3 days.",
    date: "2023-07-13",
    icon: CreditCard,
    iconColor: "text-red-500"
  }
]

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 h-6 w-6 p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = notification.icon
              return (
                <div
                  key={notification.id}
                  className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 flex items-start gap-3"
                >
                  <div className={`flex-shrink-0 ${notification.iconColor}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.date}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
