"use client"
import { useEffect } from 'react'
import { seedUserData } from '@/lib/supabaseSeedUser'

export function SeedDevData() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      seedUserData().then(() => {
        // eslint-disable-next-line no-console
        console.log("Seed for user@voltchain completed (dev only)")
      }).catch((err) => {
        console.log("Seed already exists or failed", err)
      })
    }
  }, [])
  return null
}


