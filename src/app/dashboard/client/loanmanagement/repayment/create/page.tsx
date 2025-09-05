"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Calculator, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import type { PaymentData, PaymentAllocation } from "@/lib/features/repayment/repaymentTransactionSlice"

// Remove the props interface since Next.js page components don't receive props
// interface PaymentFormProps {
//   onSubmit: (paymentData: PaymentData) => void
//   paymentAllocation?: PaymentAllocation | null
//   isLoading?: boolean
//   className?: string
// }

// Remove props parameter and add useRouter for navigation
const PaymentForm: React.FC = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentAllocation, setPaymentAllocation] = useState<PaymentAllocation | null>(null)

  const [formData, setFormData] = useState<PaymentData>({
    amountPaid: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "CASH",
    repaymentProof: "",
    receivedBy: "",
    approvedBy: "",
    notes: "",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Handle form submission locally instead of through props
  const handleSubmit = async (paymentData: PaymentData) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log("Submitting payment:", paymentData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message or redirect
      alert("Payment processed successfully!")
      router.push("/dashboard/client/loanmanagement")
    } catch (error) {
      console.error("Payment submission failed:", error)
      alert("Payment submission failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof PaymentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Simulate payment allocation calculation when amount changes
    if (field === 'amountPaid' && value > 0) {
      setPaymentAllocation({
        penaltyAmount: value * 0.1, // 10% penalty
        interestAmount: value * 0.3, // 30% interest
        principalAmount: value * 0.6, // 60% principal
        totalAmount: value
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.amountPaid || formData.amountPaid <= 0) {
      errors.amountPaid = "Payment amount must be greater than 0"
    }

    if (!formData.paymentDate) {
      errors.paymentDate = "Payment date is required"
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = "Payment method is required"
    }

    if (!formData.receivedBy?.trim()) {
      errors.receivedBy = "Received by is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      handleSubmit(formData)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Payment</h1>
        <p className="text-gray-600">Process a new loan repayment</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Payment Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amountPaid">Payment Amount (RWF) *</Label>
              <Input
                id="amountPaid"
                type="number"
                value={formData.amountPaid || ""}
                onChange={(e) => handleInputChange("amountPaid", Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter payment amount"
                className="focus:ring-2 focus:ring-green-500"
              />
              {validationErrors.amountPaid && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationErrors.amountPaid}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                className="focus:ring-2 focus:ring-green-500"
              />
              {validationErrors.paymentDate && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationErrors.paymentDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
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
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationErrors.paymentMethod}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedBy">Received By *</Label>
              <Input
                id="receivedBy"
                value={formData.receivedBy}
                onChange={(e) => handleInputChange("receivedBy", e.target.value)}
                placeholder="Name of person receiving payment"
                className="focus:ring-2 focus:ring-green-500"
              />
              {validationErrors.receivedBy && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationErrors.receivedBy}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input
                id="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => handleInputChange("approvedBy", e.target.value)}
                placeholder="Name of approving officer (optional)"
                className="focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repaymentProof">Payment Reference</Label>
              <Input
                id="repaymentProof"
                value={formData.repaymentProof}
                onChange={(e) => handleInputChange("repaymentProof", e.target.value)}
                placeholder="Transaction reference or receipt number"
                className="focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about the payment"
                rows={3}
                className="focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Payment Allocation Preview */}
            {paymentAllocation && formData.amountPaid > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-100 rounded-lg p-4"
              >
                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Payment Allocation Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Penalty Payment:</span>
                    <span className="font-medium text-green-800">{formatCurrency(paymentAllocation.penaltyAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Interest Payment:</span>
                    <span className="font-medium text-green-800">{formatCurrency(paymentAllocation.interestAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Principal Payment:</span>
                    <span className="font-medium text-green-800">
                      {formatCurrency(paymentAllocation.principalAmount)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span className="text-green-800">Total Payment:</span>
                    <span className="text-green-900">{formatCurrency(paymentAllocation.totalAmount)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentForm