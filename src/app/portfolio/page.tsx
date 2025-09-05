import type { Metadata } from "next"
import PortfolioDashboard from "@/components/portfolio-dashboard"

export const metadata: Metadata = {
  title: "Portfolio Dashboard - Loan Management System",
  description: "Comprehensive portfolio analytics and management",
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <PortfolioDashboard />
      </div>
    </div>
  )
}
