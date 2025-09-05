"use client"

import { Toaster } from "react-hot-toast"

export function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
        },
        success: {
          duration: 3000,
          iconTheme: { primary: '#10B981', secondary: '#fff' },
        },
        error: {
          duration: 4000,
          iconTheme: { primary: '#EF4444', secondary: '#fff' },
        },
      }}
    />
  )
}
