"use client"

import type React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Calendar, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { OverdueInstallment } from "@/lib/features/repayment/repaymentScheduleSlice"

interface OverdueAlertsProps {
  overdueInstallments: OverdueInstallment[]
  onPayInstallment?: (installmentNumber: number) => void
  className?: string
}

const OverdueAlerts: React.FC<OverdueAlertsProps> = ({ overdueInstallments, onPayInstallment, className = "" }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSeverityLevel = (daysOverdue: number) => {
    if (daysOverdue >= 90) return { level: "critical", color: "bg-red-600", textColor: "text-red-600" }
    if (daysOverdue >= 30) return { level: "high", color: "bg-orange-500", textColor: "text-orange-600" }
    if (daysOverdue >= 7) return { level: "medium", color: "bg-yellow-500", textColor: "text-yellow-600" }
    return { level: "low", color: "bg-blue-500", textColor: "text-blue-600" }
  }

  const totalOverdueAmount = overdueInstallments.reduce((sum, installment) => sum + installment.outstandingAmount, 0)
  const totalPenalties = overdueInstallments.reduce((sum, installment) => sum + installment.penaltyAmount, 0)

  if (overdueInstallments.length === 0) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800 mb-2">All Payments Up to Date</h3>
          <p className="text-sm text-green-600">No overdue installments found. Great job!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-red-800">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Overdue Installments ({overdueInstallments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Overdue Amount</p>
                <p className="text-xl font-bold text-red-800">{formatCurrency(totalOverdueAmount)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Penalties</p>
                <p className="text-xl font-bold text-red-800">{formatCurrency(totalPenalties)}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Overdue installments list */}
        <div className="space-y-3">
          {overdueInstallments.map((installment, index) => {
            const severity = getSeverityLevel(installment.daysOverdue)

            return (
              <motion.div
                key={installment.installmentNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 border border-red-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${severity.color}`}></div>
                    <div>
                      <p className="font-semibold text-gray-900">Installment #{installment.installmentNumber}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {new Date(installment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {installment.daysOverdue} days overdue
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-red-800">{formatCurrency(installment.outstandingAmount)}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Due: {formatCurrency(installment.dueAmount)}</div>
                      <div>Paid: {formatCurrency(installment.paidAmount)}</div>
                      {installment.penaltyAmount > 0 && (
                        <div className="text-red-600">Penalty: {formatCurrency(installment.penaltyAmount)}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Badge className={`${severity.textColor} bg-transparent border-current`}>
                    {severity.level.toUpperCase()} PRIORITY
                  </Badge>
                  {onPayInstallment && (
                    <Button
                      size="sm"
                      onClick={() => onPayInstallment(installment.installmentNumber)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Action alert */}
        <Alert className="border-red-300 bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> Contact the borrower immediately to arrange payment for overdue
            installments. Consider implementing collection procedures for severely overdue accounts.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default OverdueAlerts
