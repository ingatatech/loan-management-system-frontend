"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calculator, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoanStatus } from "@/lib/features/repayment/loanClassificationSlice"

interface ProvisionCalculatorProps {
  onCalculate?: (result: ProvisionCalculationResult) => void
  className?: string
}

interface ProvisionCalculationResult {
  outstandingPrincipal: number
  accruedInterest: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  status: LoanStatus
}

const ProvisionCalculator: React.FC<ProvisionCalculatorProps> = ({ onCalculate, className = "" }) => {
  const [formData, setFormData] = useState({
    outstandingPrincipal: 0,
    accruedInterest: 0,
    daysInArrears: 0,
    collateralValue: 0,
    status: LoanStatus.PERFORMING,
  })

  const [calculationResult, setCalculationResult] = useState<ProvisionCalculationResult | null>(null)

  const provisioningRates = {
    [LoanStatus.PERFORMING]: 1, // 1%
    [LoanStatus.WATCH]: 3, // 3%
    [LoanStatus.SUBSTANDARD]: 20, // 20%
    [LoanStatus.DOUBTFUL]: 50, // 50%
    [LoanStatus.LOSS]: 100, // 100%
  }

  const calculateProvision = () => {
    const netExposure = Math.max(0, formData.outstandingPrincipal + formData.accruedInterest - formData.collateralValue)
    const provisioningRate = provisioningRates[formData.status]
    const provisionRequired = (netExposure * provisioningRate) / 100

    const result: ProvisionCalculationResult = {
      outstandingPrincipal: formData.outstandingPrincipal,
      accruedInterest: formData.accruedInterest,
      netExposure,
      provisioningRate,
      provisionRequired,
      status: formData.status,
    }

    setCalculationResult(result)
    onCalculate?.(result)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusFromDays = (days: number): LoanStatus => {
    if (days >= 180) return LoanStatus.LOSS
    if (days >= 90) return LoanStatus.DOUBTFUL
    if (days >= 30) return LoanStatus.SUBSTANDARD
    if (days >= 1) return LoanStatus.WATCH
    return LoanStatus.PERFORMING
  }

  // Auto-update status based on days in arrears
  useEffect(() => {
    const suggestedStatus = getStatusFromDays(formData.daysInArrears)
    if (suggestedStatus !== formData.status) {
      setFormData((prev) => ({ ...prev, status: suggestedStatus }))
    }
  }, [formData.daysInArrears])

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          Provision Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="outstandingPrincipal">Outstanding Principal (RWF)</Label>
            <Input
              id="outstandingPrincipal"
              type="number"
              value={formData.outstandingPrincipal || ""}
              onChange={(e) => handleInputChange("outstandingPrincipal", Number.parseFloat(e.target.value) || 0)}
              placeholder="Enter outstanding principal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accruedInterest">Accrued Interest (RWF)</Label>
            <Input
              id="accruedInterest"
              type="number"
              value={formData.accruedInterest || ""}
              onChange={(e) => handleInputChange("accruedInterest", Number.parseFloat(e.target.value) || 0)}
              placeholder="Enter accrued interest"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysInArrears">Days in Arrears</Label>
            <Input
              id="daysInArrears"
              type="number"
              value={formData.daysInArrears || ""}
              onChange={(e) => handleInputChange("daysInArrears", Number.parseInt(e.target.value) || 0)}
              placeholder="Enter days in arrears"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collateralValue">Collateral Value (RWF)</Label>
            <Input
              id="collateralValue"
              type="number"
              value={formData.collateralValue || ""}
              onChange={(e) => handleInputChange("collateralValue", Number.parseFloat(e.target.value) || 0)}
              placeholder="Enter collateral value"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Loan Classification Status</Label>
            <Select value={formData.status} onValueChange={(value: LoanStatus) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LoanStatus.PERFORMING}>Performing (1% provision)</SelectItem>
                <SelectItem value={LoanStatus.WATCH}>Watch (3% provision)</SelectItem>
                <SelectItem value={LoanStatus.SUBSTANDARD}>Substandard (20% provision)</SelectItem>
                <SelectItem value={LoanStatus.DOUBTFUL}>Doubtful (50% provision)</SelectItem>
                <SelectItem value={LoanStatus.LOSS}>Loss (100% provision)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculateProvision} className="w-full bg-blue-600 hover:bg-blue-700">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Provision
        </Button>

        {calculationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4"
          >
            <h4 className="font-semibold text-blue-800 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Calculation Results
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-600">Outstanding Principal:</span>
                  <span className="font-medium">{formatCurrency(calculationResult.outstandingPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Accrued Interest:</span>
                  <span className="font-medium">{formatCurrency(calculationResult.accruedInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Collateral Value:</span>
                  <span className="font-medium">{formatCurrency(formData.collateralValue)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-600">Net Exposure:</span>
                  <span className="font-semibold">{formatCurrency(calculationResult.netExposure)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Provisioning Rate:</span>
                  <span className="font-semibold">{calculationResult.provisioningRate}%</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-800 font-semibold">Provision Required:</span>
                  <span className="font-bold text-blue-900">{formatCurrency(calculationResult.provisionRequired)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-blue-700">
              <p>
                <strong>Formula:</strong> Provision Required = (Outstanding Principal + Accrued Interest - Collateral
                Value) × Provisioning Rate
              </p>
              <p className="mt-1">
                <strong>Net Exposure:</strong> {formatCurrency(calculationResult.netExposure)} ×{" "}
                {calculationResult.provisioningRate}% = {formatCurrency(calculationResult.provisionRequired)}
              </p>
            </div>
          </motion.div>
        )}

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Note:</strong> Provisioning rates are based on regulatory guidelines. Actual rates may vary based on
            specific loan terms and collateral arrangements.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default ProvisionCalculator
