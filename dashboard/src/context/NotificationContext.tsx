"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { ArrowUpRight, Wallet, AlertCircle, XCircle, X } from "lucide-react"

export interface Notification {
  id: string
  type: "sale" | "claim" | "alert" | "error"
  title: string
  message: string
  date: string
}

interface NotificationContextType {
  addNotification: (type: "sale" | "claim" | "alert" | "error", title: string, message: string) => void
  removeNotification: (id: string) => void
  notifications: Notification[]
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (
    type: "sale" | "claim" | "alert" | "error",
    title: string,
    message: string
  ) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`
    
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      date: formattedDate,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Remove automaticamente após 10 segundos
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 10000)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, notifications }}>
      {children}
      <NotificationPanel notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  )
}

interface NotificationPanelProps {
  notifications: Notification[]
  removeNotification: (id: string) => void
}

const NotificationPanel = ({ notifications, removeNotification }: NotificationPanelProps) => {

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-24 right-6 w-96 max-w-[calc(100vw-3rem)] space-y-3 z-50 pointer-events-none">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationCardProps {
  notification: Notification
  onClose: () => void
}

const NotificationCard = ({ notification, onClose }: NotificationCardProps) => {
  const getNotificationStyles = () => {
    switch (notification.type) {
      case "sale":
        return {
          borderColor: "border-blue-500",
          iconBg: "bg-blue-50 dark:bg-blue-950",
          iconColor: "text-blue-600 dark:text-blue-400",
          Icon: ArrowUpRight,
        }
      case "claim":
        return {
          borderColor: "border-green-500",
          iconBg: "bg-green-50 dark:bg-green-950",
          iconColor: "text-green-600 dark:text-green-400",
          Icon: Wallet,
        }
      case "alert":
        return {
          borderColor: "border-yellow-500",
          iconBg: "bg-yellow-50 dark:bg-yellow-950",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          Icon: AlertCircle,
        }
      case "error":
        return {
          borderColor: "border-red-500",
          iconBg: "bg-red-50 dark:bg-red-950",
          iconColor: "text-red-600 dark:text-red-400",
          Icon: XCircle,
        }
    }
  }

  const styles = getNotificationStyles()
  const IconComponent = styles.Icon

  return (
    <div
      className={`
        rounded-xl shadow-sm border-l-4 ${styles.borderColor}
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        p-4 pointer-events-auto
        transition-all duration-300 ease-in-out
        transform translate-x-0 opacity-100
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1.5">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {notification.title}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {notification.message}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5">
                {notification.date}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 -mt-1 -mr-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

