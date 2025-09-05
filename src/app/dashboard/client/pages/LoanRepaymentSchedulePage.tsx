// @ts-nocheck

"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  TrendingUp,
  CheckCircle2,
  Minus,
  Calculator,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchRepaymentSchedule,
  recalculateSchedule,
  fetchOverdueInstallments,
  type ScheduleRecalculationOptions,
} from "@/lib/features/repayment/repaymentScheduleSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface LoanRepaymentSchedulePageProps {
  organizationId: number
  loanId: number
  loanData?: {
    borrowerName: string
    loanAmount: number
    outstandingBalance: number
    termMonths: number
    interestRate: number
    disbursementDate: string
    maturityDate: string
    status: string
  }
}

const LoanRepaymentSchedulePage: React.FC<LoanRepaymentSchedulePageProps> = ({ organizationId, loanId, loanData }) => {
  const dispatch = useAppDispatch()
  const { schedules, overdueInstallments, isLoading, error } = useAppSelector((state) => state.repaymentSchedule)

  // UI state
  const [showRecalculationModal, setShowRecalculationModal] = useState(false)
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState<number | null>(null)
  const [showOverdueDetails, setShowOverdueDetails] = useState(false)
  const [selectedView, setSelectedView] = useState<"all" | "pending" | "overdue" | "paid">("all")
  const [recalculationOptions, setRecalculationOptions] = useState<ScheduleRecalculationOptions>({
    type: "REDUCE_INSTALLMENT",
    effectiveDate: new Date().toISOString().split("T")[0],
  })
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<number>(0)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // Load initial data
  useEffect(() => {
    if (organizationId && loanId) {
      dispatch(fetchRepaymentSchedule({ organizationId, loanId }))
      dispatch(fetchOverdueInstallments({ organizationId, loanId }))
    }
  }, [dispatch, organizationId, loanId])

  const handleRecalculateSchedule = async () => {
    try {
      await dispatch(recalculateSchedule({ organizationId, loanId, options: recalculationOptions })).unwrap()
      toast.success("Schedule recalculated successfully!")
      setShowRecalculationModal(false)
    } catch (error: any) {
      toast.error(error || "Failed to recalculate schedule")
    }
  }

  const handlePartialPayment = async (installmentId: number) => {
    if (partialPaymentAmount <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    try {
      await dispatch(
        handlePartialPayment({
          organizationId,
          loanId,
          installmentId,
          amount: partialPaymentAmount,
        }),
      ).unwrap()
      toast.success("Partial payment processed successfully!")
      setShowPartialPaymentModal(null)
      setPartialPaymentAmount(0)
    } catch (error: any) {
      toast.error(error || "Failed to process partial payment")
    }
  }

  const exportSchedule = () => {
    const csvContent = [
      ["Installment", "Due Date", "Principal", "Interest", "Total", "Paid", "Outstanding", "Status"],
      ...schedules.map((schedule) => [
        schedule.installmentNumber,
        new Date(schedule.dueDate).toLocaleDateString(),
        schedule.duePrincipal.toFixed(2),
        schedule.dueInterest.toFixed(2),
        schedule.dueTotal.toFixed(2),
        schedule.paidTotal.toFixed(2),
        schedule.outstandingPrincipal.toFixed(2),
        schedule.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `loan_${loanId}_repayment_schedule.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, label: "Paid" },
      PENDING: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock, label: "Pending" },
      OVERDUE: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle, label: "Overdue" },
      PARTIALLY_PAID: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Minus,
        label: "Partial",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} border flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredSchedules = schedules.filter((schedule) => {
    switch (selectedView) {
      case "pending":
        return schedule.status === "PENDING"
      case "overdue":
        return schedule.status === "OVERDUE"
      case "paid":
        return schedule.status === "PAID"
      default:
        return true
    }
  })

  const scheduleStats = {
    total: schedules.length,
    paid: schedules.filter((s) => s.status === "PAID").length,
    pending: schedules.filter((s) => s.status === "PENDING").length,
    overdue: schedules.filter((s) => s.status === "OVERDUE").length,
    partiallyPaid: schedules.filter((s) => s.status === "PARTIALLY_PAID").length,
  }

  const paymentProgress = scheduleStats.total > 0 ? (scheduleStats.paid / scheduleStats.total) * 100 : 0

  const toggleRowExpansion = (installmentId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(installmentId)) {
      newExpanded.delete(installmentId)
    } else {
      newExpanded.add(installmentId)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-[#5B7FA2] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Calendar className="w-7 h-7 mr-3" />
                  Loan Repayment Schedule
                </h1>
                <p className="text-blue-100 text-sm mt-1">Manage and track loan repayment installments</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-xs">Loan ID</p>
                <p className="text-white font-semibold text-lg">#{loanId}</p>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          {loanData && (
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">Borrower</p>
                    <p className="font-semibold text-gray-900">{loanData.borrowerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Outstanding Balance</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(loanData.outstandingBalance)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Term</p>
                    <p className="font-semibold text-gray-900">{loanData.termMonths} months</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Interest Rate</p>
                    <p className="font-semibold text-gray-900">{loanData.interestRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Schedule Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Installments</p>
                    <p className="text-2xl font-bold text-blue-900">{scheduleStats.total}</p>
                  </div>
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Paid</p>
                    <p className="text-2xl font-bold text-green-900">{scheduleStats.paid}</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{scheduleStats.pending}</p>
                  </div>
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{scheduleStats.overdue}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Progress</p>
                    <p className="text-2xl font-bold text-purple-900">{Math.round(paymentProgress)}%</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <Progress value={paymentProgress} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Overdue Installments Alert */}
        {overdueInstallments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-red-800">
                  <span className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Overdue Installments ({overdueInstallments.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOverdueDetails(!showOverdueDetails)}
                    className="text-red-600 border-red-200 hover:bg-red-100"
                  >
                    {showOverdueDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <AnimatePresence>
                {showOverdueDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {overdueInstallments.map((installment) => (
                          <div
                            key={installment.installmentNumber}
                            className="bg-white rounded-lg p-4 border border-red-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-red-800">
                                  Installment #{installment.installmentNumber}
                                </p>
                                <p className="text-sm text-red-600">
                                  Due: {new Date(installment.dueDate).toLocaleDateString()} ({installment.daysOverdue}{" "}
                                  days overdue)
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-red-800">
                                  {formatCurrency(installment.outstandingAmount)}
                                </p>
                                <p className="text-sm text-red-600">
                                  Penalty: {formatCurrency(installment.penaltyAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* Schedule Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Repayment Schedule
                </span>
                <div className="flex items-center space-x-2">
                  <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={exportSchedule}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowRecalculationModal(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Recalculate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(fetchRepaymentSchedule({ organizationId, loanId }))}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"
                  />
                  <span className="ml-2 text-gray-600">Loading schedule...</span>
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No installments found</p>
                  <p className="text-sm text-gray-500">
                    {selectedView !== "all" ? `No ${selectedView} installments` : "Schedule not available"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Installment</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount Due</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Days in Arrears</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.map((schedule, index) => (
                        <React.Fragment key={schedule.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRowExpansion(schedule.id)}
                                className="h-6 w-6 p-0"
                              >
                                {expandedRows.has(schedule.id) ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-indigo-800">
                                    {schedule.installmentNumber}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{new Date(schedule.dueDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(schedule.dueDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{formatCurrency(schedule.dueTotal)}</p>
                                <div className="text-xs text-gray-500 space-y-0.5">
                                  <div>P: {formatCurrency(schedule.duePrincipal)}</div>
                                  <div>I: {formatCurrency(schedule.dueInterest)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-green-800">{formatCurrency(schedule.paidTotal)}</p>
                                <div className="text-xs text-gray-500 space-y-0.5">
                                  <div>P: {formatCurrency(schedule.paidPrincipal)}</div>
                                  <div>I: {formatCurrency(schedule.paidInterest)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{formatCurrency(schedule.outstandingPrincipal)}</p>
                            </TableCell>
                            <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                            <TableCell>
                              {schedule.daysInArrears > 0 ? (
                                <Badge variant="destructive">{schedule.daysInArrears} days</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {schedule.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPartialPaymentModal(schedule.id)}
                                    className="h-8 px-2 text-xs"
                                  >
                                    Partial Pay
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                          <AnimatePresence>
                            {expandedRows.has(schedule.id) && (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-gray-50"
                              >
                                <TableCell colSpan={9}>
                                  <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <Label className="text-gray-500">Principal Due</Label>
                                        <p className="font-semibold">{formatCurrency(schedule.duePrincipal)}</p>
                                      </div>
                                      <div>
                                        <Label className="text-gray-500">Interest Due</Label>
                                        <p className="font-semibold">{formatCurrency(schedule.dueInterest)}</p>
                                      </div>
                                      <div>
                                        <Label className="text-gray-500">Penalty Amount</Label>
                                        <p className="font-semibold text-red-600">
                                          {formatCurrency(schedule.penaltyAmount)}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-gray-500">Outstanding Principal</Label>
                                        <p className="font-semibold">{formatCurrency(schedule.outstandingPrincipal)}</p>
                                      </div>
                                    </div>
                                    <Separator />
                                    <div className="text-xs text-gray-500">
                                      <p>Created: {new Date(schedule.createdAt).toLocaleString()}</p>
                                      <p>Updated: {new Date(schedule.updatedAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Recalculation Modal */}
        <Dialog open={showRecalculationModal} onOpenChange={setShowRecalculationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-indigo-600" />
                Recalculate Schedule
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Recalculating the schedule will adjust future installments based on current
                  payments and outstanding balance.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Recalculation Type</Label>
                <Select
                  value={recalculationOptions.type}
                  onValueChange={(value: any) => setRecalculationOptions((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REDUCE_INSTALLMENT">Reduce Installment Amount</SelectItem>
                    <SelectItem value="REDUCE_TERM">Reduce Loan Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={recalculationOptions.effectiveDate}
                  onChange={(e) => setRecalculationOptions((prev) => ({ ...prev, effectiveDate: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRecalculationModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecalculateSchedule} className="bg-indigo-600 hover:bg-indigo-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Recalculate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Partial Payment Modal */}
        <Dialog open={showPartialPaymentModal !== null} onOpenChange={() => setShowPartialPaymentModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Process Partial Payment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Enter the partial payment amount for this installment. The remaining balance will be carried forward.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partialAmount">Payment Amount (RWF)</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  value={partialPaymentAmount || ""}
                  onChange={(e) => setPartialPaymentAmount(Number.parseFloat(e.target.value) || 0)}
                  placeholder="Enter partial payment amount"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPartialPaymentModal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => showPartialPaymentModal && handlePartialPayment(showPartialPaymentModal)}
                  disabled={partialPaymentAmount <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default LoanRepaymentSchedulePage
