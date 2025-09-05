import type { Metadata } from "next"
import PortfolioDashboard from "@/components/portfolio-dashboard"

export const metadata: Metadata = {
  title: "Dashboard - Loan Management System",
  description: "Portfolio overview and analytics dashboard",
}

export default function ClientDahboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <PortfolioDashboard />
      </div>
    </div>
  )
}