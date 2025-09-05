"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle2, Clock, AlertTriangle, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { RepaymentSchedule } from "@/lib/features/repayment/repaymentScheduleSlice"

interface ScheduleTimelineProps {
  schedules: RepaymentSchedule[]
  className?: string
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ schedules, className = "" }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "OVERDUE":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "PARTIALLY_PAID":
        return <Minus className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 border-green-300"
      case "OVERDUE":
        return "bg-red-100 border-red-300"
      case "PARTIALLY_PAID":
        return "bg-yellow-100 border-yellow-300"
      default:
        return "bg-blue-100 border-blue-300"
    }
  }

  const totalPaid = schedules.filter((s) => s.status === "PAID").length
  const totalSchedules = schedules.length
  const progressPercentage = totalSchedules > 0 ? (totalPaid / totalSchedules) * 100 : 0

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Payment Timeline
          </span>
          <Badge variant="outline" className="text-indigo-600">
            {totalPaid}/{totalSchedules} Completed
          </Badge>
        </CardTitle>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {schedules.slice(0, 10).map((schedule, index) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center space-x-4 p-4 rounded-lg border-2 ${getStatusColor(
                schedule.status,
              )}`}
            >
              {/* Timeline connector */}
              {index < schedules.length - 1 && <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300"></div>}

              {/* Status icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full border-2 border-current flex items-center justify-center">
                {getStatusIcon(schedule.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Installment #{schedule.installmentNumber}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(schedule.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(schedule.dueTotal)}</p>
                    {schedule.paidTotal > 0 && (
                      <p className="text-sm text-green-600">Paid: {formatCurrency(schedule.paidTotal)}</p>
                    )}
                  </div>
                </div>

                {/* Payment breakdown */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>Principal: {formatCurrency(schedule.duePrincipal)}</div>
                  <div>Interest: {formatCurrency(schedule.dueInterest)}</div>
                </div>

                {/* Days in arrears */}
                {schedule.daysInArrears > 0 && (
                  <div className="mt-2">
                    <Badge variant="destructive" className="text-xs">
                      {schedule.daysInArrears} days overdue
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {schedules.length > 10 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Showing first 10 installments. Total: {schedules.length} installments
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ScheduleTimeline
