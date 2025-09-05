import type { Metadata } from "next"
import CompactLoanApplicationForm from "@/components/compact-loan-application-form"

export const metadata: Metadata = {
  title: "Loan Applications - Loan Management System",
  description: "Create and manage loan applications",
}

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Loan Applications</h1>
          <p className="text-muted-foreground mt-2">Create new loan applications and manage existing ones</p>
        </div>

        <CompactLoanApplicationForm />
      </div>
    </div>
  )
}
