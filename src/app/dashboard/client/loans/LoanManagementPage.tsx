// @ts-nocheck
"use client"

import type React from "react"
import { useState } from "react"
import { useAppSelector,useAppDispatch } from "@/lib/hooks"
import  PaymentProcessingDashboard  from "@/app/dashboard/client/paymentprocessingDashboard/paymentProcessingDashboard"
import  LoanRepaymentSchedulePage  from "./LoanRepaymentSchedulePage"
import  LoanClassificationDashboard  from "../risk/LoanClassificationDashboard"
import { ErrorBoundary } from "@/app/dashboard/client/shared/ErrorBoundary"
import { LoadingSpinner } from "@/app/dashboard/client/shared/LoadingSpinner"
import { CreditCard, Calendar, TrendingUp, FileText, DollarSign, Clock, AlertTriangle } from "lucide-react"

interface LoanManagementPageProps {
  organizationId: string
  loanId: string
}

export const LoanManagementPage: React.FC<LoanManagementPageProps> = ({ organizationId, loanId }) => {
  const [activeTab, setActiveTab] = useState<"payments" | "schedule" | "classification" | "overview">("overview")
  const dispatch = useAppDispatch()

  // Get loan data from store
  const { currentLoan, loading } = useAppSelector((state) => state.loanApplication)
  const { transactions } = useAppSelector((state) => state.repaymentTransaction)
  const { schedule } = useAppSelector((state) => state.repaymentSchedule)
  const { classification } = useAppSelector((state) => state.loanClassification)

  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: FileText,
      description: "Loan summary and key metrics",
    },
    {
      id: "payments" as const,
      label: "Payments",
      icon: CreditCard,
      description: "Process payments and view transaction history",
    },
    {
      id: "schedule" as const,
      label: "Schedule",
      icon: Calendar,
      description: "Manage repayment schedule and installments",
    },
    {
      id: "classification" as const,
      label: "Risk Management",
      icon: TrendingUp,
      description: "Loan classification and provisioning",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading loan details...</p>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Loan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ${currentLoan?.outstandingBalance?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
              <p className="text-2xl font-bold text-gray-900">
                ${schedule?.nextInstallment?.totalAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{schedule?.nextInstallment?.dueDate || "N/A"}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">${schedule?.overdueAmount?.toLocaleString() || "0"}</p>
              <p className="text-xs text-gray-500 mt-1">{schedule?.overdueInstallments || 0} installments</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loan Status</p>
              <p className="text-lg font-semibold text-gray-900">{classification?.classification || "STANDARD"}</p>
              <p className="text-xs text-gray-500 mt-1">
                {classification?.provisionRate
                  ? `${(classification.provisionRate * 100).toFixed(1)}% provision`
                  : "No provision"}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {transactions?.slice(0, 5).map((transaction, index) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between py-3 ${index !== 4 ? "border-b border-gray-100" : ""}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Received</p>
                  <p className="text-xs text-gray-500">{new Date(transaction.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">${transaction.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
              </div>
            </div>
          )) || <p className="text-gray-500 text-center py-8">No recent transactions</p>}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "payments":
        return <PaymentProcessingDashboard organizationId={organizationId} loanId={loanId} />
      case "schedule":
        return <LoanRepaymentSchedulePage organizationId={organizationId} loanId={loanId} />
      case "classification":
        return <LoanClassificationDashboard organizationId={organizationId} loanId={loanId} />
      default:
        return renderOverview()
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>

                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{tab.label}</p>
                        <p className={`text-xs ${activeTab === tab.id ? "text-blue-100" : "text-gray-500"}`}>
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">{renderTabContent()}</div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default LoanManagementPage
