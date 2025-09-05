// @ts-nocheck

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard,
  DollarSign,
  Receipt,
  AlertCircle,
  Clock,
  TrendingUp,
  Calculator,
  FileText,
  User,
  Calendar,
  Download,
  RefreshCw,
  X,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  processPayment,
  fetchLoanTransactions,
  calculateAccruedInterest,
  calculatePenalties,
  fetchPaymentSummary,
  generatePaymentReceipt,
  reverseTransaction,
  setPaymentAllocation,
  type PaymentData,
} from "@/lib/features/repayment/repaymentTransactionSlice"
import { fetchRepaymentSchedule } from "@/lib/features/repayment/repaymentScheduleSlice"
import { calculateProvisions } from "@/lib/features/repayment/loanClassificationSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface PaymentProcessingDashboardProps {
  organizationId: number
  loanId: number
  loanData?: {
    borrowerName: string
    loanAmount: number
    outstandingBalance: number
    nextDueDate: string
    nextDueAmount: number
    interestRate: number
    termMonths: number
    disbursementDate: string
    status: string
    borrowerPhone?: string
    borrowerEmail?: string
    borrowerAddress?: string
  }
}

const PaymentProcessingDashboard: React.FC<PaymentProcessingDashboardProps> = ({
  organizationId,
  loanId,
  loanData,
}) => {
  const dispatch = useAppDispatch()
  const {
    transactions,
    paymentSummary,
    accruedInterest,
    penaltyCalculation,
    paymentAllocation,
    isLoading,
    error,
    currentPage,
    totalCount,
  } = useAppSelector((state) => state.repaymentTransaction)

  const { schedules } = useAppSelector((state) => state.repaymentSchedule)
  const { currentClassification } = useAppSelector((state) => state.loanClassification)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState<PaymentData>({
    amountPaid: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "CASH",
    repaymentProof: "",
    receivedBy: "",
    approvedBy: "",
    notes: "",
  })

  // UI state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showTransactionDetails, setShowTransactionDetails] = useState<number | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState<number | null>(null)
  const [showReverseModal, setShowReverseModal] = useState<number | null>(null)
  const [reverseReason, setReverseReason] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAllocationPreview, setShowAllocationPreview] = useState(false)

  // Load initial data
  useEffect(() => {
    if (organizationId && loanId) {
      dispatch(fetchLoanTransactions({ organizationId, loanId, page: 1, limit: 10 }))
      dispatch(fetchPaymentSummary({ organizationId, loanId }))
      dispatch(fetchRepaymentSchedule({ organizationId, loanId }))
      dispatch(calculateAccruedInterest({ organizationId, loanId }))
      dispatch(calculatePenalties({ organizationId, loanId }))
      dispatch(calculateProvisions({ organizationId, loanId }))
    }
  }, [dispatch, organizationId, loanId])

  // Calculate payment allocation preview
  useEffect(() => {
    if (paymentForm.amountPaid > 0 && penaltyCalculation && accruedInterest) {
      const amount = paymentForm.amountPaid
      let remainingAmount = amount

      // First pay penalties
      const penaltyAmount = Math.min(remainingAmount, penaltyCalculation.penaltyAmount)
      remainingAmount -= penaltyAmount

      // Then pay accrued interest
      const interestAmount = Math.min(remainingAmount, accruedInterest.accruedAmount)
      remainingAmount -= interestAmount

      // Finally pay principal
      const principalAmount = remainingAmount

      dispatch(
        setPaymentAllocation({
          principalAmount,
          interestAmount,
          penaltyAmount,
          totalAmount: amount,
        }),
      )
    }
  }, [paymentForm.amountPaid, penaltyCalculation, accruedInterest, dispatch])

  const handleInputChange = (field: keyof PaymentData, value: any) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validatePaymentForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!paymentForm.amountPaid || paymentForm.amountPaid <= 0) {
      errors.amountPaid = "Payment amount must be greater than 0"
    }

    if (!paymentForm.paymentDate) {
      errors.paymentDate = "Payment date is required"
    }

    if (!paymentForm.paymentMethod) {
      errors.paymentMethod = "Payment method is required"
    }

    if (!paymentForm.receivedBy?.trim()) {
      errors.receivedBy = "Received by is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProcessPayment = async () => {
    if (!validatePaymentForm()) return

    setIsSubmitting(true)
    try {
      await dispatch(processPayment({ organizationId, loanId, paymentData: paymentForm })).unwrap()
      toast.success("Payment processed successfully!")

      // Refresh all related data
      dispatch(fetchLoanTransactions({ organizationId, loanId, page: 1, limit: 10 }))
      dispatch(fetchPaymentSummary({ organizationId, loanId }))
      dispatch(fetchRepaymentSchedule({ organizationId, loanId }))
      dispatch(calculateAccruedInterest({ organizationId, loanId }))
      dispatch(calculatePenalties({ organizationId, loanId }))
      dispatch(calculateProvisions({ organizationId, loanId }))

      // Reset form
      setPaymentForm({
        amountPaid: 0,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "CASH",
        repaymentProof: "",
        receivedBy: "",
        approvedBy: "",
        notes: "",
      })
      setShowPaymentForm(false)
    } catch (error: any) {
      toast.error(error || "Failed to process payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReverseTransaction = async (transactionId: number) => {
    if (!reverseReason.trim()) {
      toast.error("Please provide a reason for reversal")
      return
    }

    try {
      await dispatch(reverseTransaction({ organizationId, transactionId, reason: reverseReason })).unwrap()
      toast.success("Transaction reversed successfully!")

      // Refresh data
      dispatch(fetchLoanTransactions({ organizationId, loanId, page: currentPage, limit: 10 }))
      dispatch(fetchPaymentSummary({ organizationId, loanId }))

      setShowReverseModal(null)
      setReverseReason("")
    } catch (error: any) {
      toast.error(error || "Failed to reverse transaction")
    }
  }

  const handleGenerateReceipt = async (transactionId: number) => {
    try {
      const result = await dispatch(generatePaymentReceipt({ organizationId, transactionId })).unwrap()
      // Handle receipt generation (could open in new window or download)
      toast.success("Receipt generated successfully!")
      setShowReceiptModal(transactionId)
    } catch (error: any) {
      toast.error(error || "Failed to generate receipt")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      FAILED: { color: "bg-red-100 text-red-800", label: "Failed" },
      REVERSED: { color: "bg-gray-100 text-gray-800", label: "Reversed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
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
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <CreditCard className="w-7 h-7 mr-3" />
                  Payment Processing Dashboard
                </h1>
                <p className="text-blue-100 text-sm mt-1">Manage loan payments and transactions</p>
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
                  <User className="w-5 h-5 text-blue-600" />
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
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Next Due Date</p>
                    <p className="font-semibold text-gray-900">{loanData.nextDueDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Next Due Amount</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(loanData.nextDueAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Paid</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {paymentSummary ? formatCurrency(paymentSummary.totalPaid) : "Loading..."}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Remaining Balance</p>
                    <p className="text-2xl font-bold text-green-900">
                      {paymentSummary ? formatCurrency(paymentSummary.remainingBalance) : "Loading..."}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Accrued Interest</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {accruedInterest ? formatCurrency(accruedInterest.accruedAmount) : "Loading..."}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Penalties</p>
                    <p className="text-2xl font-bold text-red-900">
                      {penaltyCalculation ? formatCurrency(penaltyCalculation.penaltyAmount) : "Loading..."}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Process Payment
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowPaymentForm(!showPaymentForm)}>
                    {showPaymentForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>

              <AnimatePresence>
                {showPaymentForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amountPaid">Payment Amount (RWF) *</Label>
                        <Input
                          id="amountPaid"
                          type="number"
                          value={paymentForm.amountPaid || ""}
                          onChange={(e) => handleInputChange("amountPaid", Number.parseFloat(e.target.value) || 0)}
                          placeholder="Enter payment amount"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                        {validationErrors.amountPaid && (
                          <p className="text-xs text-red-500">{validationErrors.amountPaid}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentDate">Payment Date *</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                        {validationErrors.paymentDate && (
                          <p className="text-xs text-red-500">{validationErrors.paymentDate}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select
                          value={paymentForm.paymentMethod}
                          onValueChange={(value) => handleInputChange("paymentMethod", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                            <SelectItem value="CHECK">Check</SelectItem>
                            <SelectItem value="CARD">Card Payment</SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.paymentMethod && (
                          <p className="text-xs text-red-500">{validationErrors.paymentMethod}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="receivedBy">Received By *</Label>
                        <Input
                          id="receivedBy"
                          value={paymentForm.receivedBy}
                          onChange={(e) => handleInputChange("receivedBy", e.target.value)}
                          placeholder="Name of person receiving payment"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                        {validationErrors.receivedBy && (
                          <p className="text-xs text-red-500">{validationErrors.receivedBy}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="approvedBy">Approved By</Label>
                        <Input
                          id="approvedBy"
                          value={paymentForm.approvedBy}
                          onChange={(e) => handleInputChange("approvedBy", e.target.value)}
                          placeholder="Name of approving officer (optional)"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="repaymentProof">Payment Reference</Label>
                        <Input
                          id="repaymentProof"
                          value={paymentForm.repaymentProof}
                          onChange={(e) => handleInputChange("repaymentProof", e.target.value)}
                          placeholder="Transaction reference or receipt number"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={paymentForm.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="Additional notes about the payment"
                          rows={3}
                          className="focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* Payment Allocation Preview */}
                      {paymentAllocation && paymentForm.amountPaid > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-blue-50 border border-blue-100 rounded-lg p-4"
                        >
                          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                            <Calculator className="w-4 h-4 mr-2" />
                            Payment Allocation Preview
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-600">Penalty Payment:</span>
                              <span className="font-medium text-blue-800">
                                {formatCurrency(paymentAllocation.penaltyAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-600">Interest Payment:</span>
                              <span className="font-medium text-blue-800">
                                {formatCurrency(paymentAllocation.interestAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-600">Principal Payment:</span>
                              <span className="font-medium text-blue-800">
                                {formatCurrency(paymentAllocation.principalAmount)}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span className="text-blue-800">Total Payment:</span>
                              <span className="text-blue-900">{formatCurrency(paymentAllocation.totalAmount)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <Button
                        onClick={handleProcessPayment}
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Process Payment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Transaction History
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(fetchLoanTransactions({ organizationId, loanId, page: 1, limit: 10 }))}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions found</p>
                    <p className="text-sm text-gray-500">Process your first payment to see transaction history</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{new Date(transaction.paymentDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(transaction.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{formatCurrency(transaction.amountPaid)}</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>Principal: {formatCurrency(transaction.principalPaid)}</div>
                                  <div>Interest: {formatCurrency(transaction.interestPaid)}</div>
                                  {transaction.penaltyPaid > 0 && (
                                    <div>Penalty: {formatCurrency(transaction.penaltyPaid)}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{transaction.paymentMethod}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {transaction.transactionReference}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGenerateReceipt(transaction.id)}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                {transaction.status === "COMPLETED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowReverseModal(transaction.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Reverse Transaction Modal */}
        <Dialog open={showReverseModal !== null} onOpenChange={() => setShowReverseModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reverse Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to reverse this transaction? This action cannot be undone.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reverseReason">Reason for Reversal *</Label>
                <Textarea
                  id="reverseReason"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="Please provide a detailed reason for reversing this transaction"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReverseModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => showReverseModal && handleReverseTransaction(showReverseModal)}
                  disabled={!reverseReason.trim()}
                >
                  Reverse Transaction
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default PaymentProcessingDashboard
