"use client"
import { useEffect } from 'react'
import { seedUserData } from '@/lib/supabaseSeedUser'

export function SeedDevData() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      seedUserData().then(() => {
        // eslint-disable-next-line no-console
        console.log("Seed do user@voltchain rodou (dev only)")
      }).catch((err) => {
        console.log("Seed já existe ou falhou", err)
      })
    }
  }, [])
  return null
}


