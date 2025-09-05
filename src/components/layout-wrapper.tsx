"use client"

import type React from "react"
import Navigation from "@/components/navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Navigation />
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Loan Management System</div>
          </div>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default LayoutWrapper
