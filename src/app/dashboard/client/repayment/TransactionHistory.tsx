"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  X,
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { RepaymentTransaction } from "@/lib/features/repayment/repaymentTransactionSlice"

interface TransactionHistoryProps {
  transactions: RepaymentTransaction[]
  isLoading?: boolean
  onRefresh?: () => void
  onGenerateReceipt?: (transactionId: number) => void
  onReverseTransaction?: (transactionId: number, reason: string) => void
  className?: string
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading = false,
  onRefresh,
  onGenerateReceipt,
  onReverseTransaction,
  className = "",
}) => {
  const [showTransactionDetails, setShowTransactionDetails] = useState<number | null>(null)
  const [showReverseModal, setShowReverseModal] = useState<number | null>(null)
  const [reverseReason, setReverseReason] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
        label: "Completed",
      },
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      FAILED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        label: "Failed",
      },
      REVERSED: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Ban,
        label: "Reversed",
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

  const handleReverseTransaction = () => {
    if (showReverseModal && reverseReason.trim() && onReverseTransaction) {
      onReverseTransaction(showReverseModal, reverseReason)
      setShowReverseModal(null)
      setReverseReason("")
    }
  }

  const selectedTransaction = transactions.find((t) => t.id === showTransactionDetails)

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Transaction History
          </span>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
            />
            <span className="ml-2 text-gray-600">Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No transactions found</p>
            <p className="text-sm text-gray-500">Process your first payment to see transaction history</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount Breakdown</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="font-medium text-sm">
                            {new Date(transaction.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="font-semibold text-green-800">{formatCurrency(transaction.amountPaid)}</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div>Principal: {formatCurrency(transaction.principalPaid)}</div>
                          <div>Interest: {formatCurrency(transaction.interestPaid)}</div>
                          {transaction.penaltyPaid > 0 && (
                            <div className="text-red-600">Penalty: {formatCurrency(transaction.penaltyPaid)}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-3 h-3 text-blue-600" />
                        <Badge variant="outline" className="text-xs">
                          {transaction.paymentMethod.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {transaction.transactionReference}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTransactionDetails(transaction.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {onGenerateReceipt && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateReceipt(transaction.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                        {transaction.status === "COMPLETED" && onReverseTransaction && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReverseModal(transaction.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionDetails !== null} onOpenChange={() => setShowTransactionDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reference</Label>
                  <p className="font-mono text-sm">{selectedTransaction.transactionReference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Date</Label>
                  <p>{new Date(selectedTransaction.paymentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                  <p>{selectedTransaction.paymentMethod.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                  <p className="font-semibold text-lg">{formatCurrency(selectedTransaction.amountPaid)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Payment Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Principal</Label>
                    <p className="font-semibold">{formatCurrency(selectedTransaction.principalPaid)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Interest</Label>
                    <p className="font-semibold">{formatCurrency(selectedTransaction.interestPaid)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Penalty</Label>
                    <p className="font-semibold">{formatCurrency(selectedTransaction.penaltyPaid)}</p>
                  </div>
                </div>
              </div>

              {selectedTransaction.receivedBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Received By</Label>
                  <p>{selectedTransaction.receivedBy}</p>
                </div>
              )}

              {selectedTransaction.approvedBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Approved By</Label>
                  <p>{selectedTransaction.approvedBy}</p>
                </div>
              )}

              {selectedTransaction.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedTransaction.notes}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Created: {new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedTransaction.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reverse Transaction Modal */}
      <Dialog open={showReverseModal !== null} onOpenChange={() => setShowReverseModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Reverse Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action will reverse the transaction and cannot be undone. The loan
                balance will be adjusted accordingly.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reverseReason">Reason for Reversal *</Label>
              <Textarea
                id="reverseReason"
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder="Please provide a detailed reason for reversing this transaction"
                rows={3}
                className="focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReverseModal(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReverseTransaction} disabled={!reverseReason.trim()}>
                <X className="w-4 h-4 mr-2" />
                Reverse Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default TransactionHistory
