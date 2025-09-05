// @ts-nocheck

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  DollarSign,
  Percent,
  Users,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchLoanClassifications,
  generateProvisioningReport,
  updateLoanStatus,
  bulkUpdateClassifications,
  LoanStatus,
  type BulkClassificationUpdate,
} from "@/lib/features/repayment/loanClassificationSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface LoanClassificationDashboardProps {
  organizationId: number
}

const LoanClassificationDashboard: React.FC<LoanClassificationDashboardProps> = ({ organizationId }) => {
  const dispatch = useAppDispatch()
  const { classifications, provisioningReport, isLoading, error, currentPage, totalCount } = useAppSelector(
    (state) => state.loanClassification,
  )

  // UI state
  const [showProvisioningReport, setShowProvisioningReport] = useState(false)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState<number | null>(null)
  const [selectedClassifications, setSelectedClassifications] = useState<Set<number>>(new Set())
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkClassificationUpdate>({
    loanIds: [],
    newStatus: LoanStatus.PERFORMING,
    reason: "",
  })
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: LoanStatus.PERFORMING,
    reason: "",
  })
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Load initial data
  useEffect(() => {
    if (organizationId) {
      dispatch(fetchLoanClassifications({ organizationId, page: 1, limit: 20 }))
      dispatch(generateProvisioningReport({ organizationId }))
    }
  }, [dispatch, organizationId])

  const handleStatusUpdate = async (loanId: number) => {
    if (!statusUpdateData.reason.trim()) {
      toast.error("Please provide a reason for status update")
      return
    }

    try {
      await dispatch(
        updateLoanStatus({
          organizationId,
          loanId,
          status: statusUpdateData.status,
          reason: statusUpdateData.reason,
        }),
      ).unwrap()
      toast.success("Loan status updated successfully!")
      setShowStatusUpdateModal(null)
      setStatusUpdateData({ status: LoanStatus.PERFORMING, reason: "" })
    } catch (error: any) {
      toast.error(error || "Failed to update loan status")
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedClassifications.size === 0) {
      toast.error("Please select loans to update")
      return
    }

    if (!bulkUpdateData.reason.trim()) {
      toast.error("Please provide a reason for bulk update")
      return
    }

    const updateData = {
      ...bulkUpdateData,
      loanIds: Array.from(selectedClassifications),
    }

    try {
      await dispatch(bulkUpdateClassifications({ organizationId, updateData })).unwrap()
      toast.success(`${selectedClassifications.size} loans updated successfully!`)
      setShowBulkUpdateModal(false)
      setSelectedClassifications(new Set())
      setBulkUpdateData({ loanIds: [], newStatus: LoanStatus.PERFORMING, reason: "" })
    } catch (error: any) {
      toast.error(error || "Failed to update loan classifications")
    }
  }

  const handleSelectClassification = (loanId: number, checked: boolean) => {
    const newSelected = new Set(selectedClassifications)
    if (checked) {
      newSelected.add(loanId)
    } else {
      newSelected.delete(loanId)
    }
    setSelectedClassifications(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredClassifications.map((c) => c.loanId))
      setSelectedClassifications(allIds)
    } else {
      setSelectedClassifications(new Set())
    }
  }

  // Safe number formatting utility
const safeFormatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'RF 0'
  }
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(numAmount)
}

const safeFormatPercentage = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0%'
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return `${numValue.toFixed(1)}%`
}

const safeFormatNumber = (value: number | string | undefined | null): number => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return 0
  }
  return typeof value === 'string' ? parseFloat(value) : value
}
const exportProvisioningReport = () => {
  if (!provisioningReport) return

  const csvContent = [
    ["Status", "Count", "Outstanding Amount", "Provision Required", "Percentage"],
    ...Object.entries(provisioningReport.byStatus || {}).map(([status, data]) => [
      status,
      safeFormatNumber(data.count),
      safeFormatNumber(data.outstanding).toFixed(2),
      safeFormatNumber(data.provisionRequired).toFixed(2),
      safeFormatNumber(data.percentage).toFixed(2) + "%",
    ]),
    [],
    ["Summary Metrics", "Value"],
    ["Total Loans", safeFormatNumber(provisioningReport.totalLoans)],
    ["Total Outstanding", safeFormatCurrency(provisioningReport.totalOutstanding)],
    ["Total Provision Required", safeFormatCurrency(provisioningReport.totalProvisionRequired)],
    ["Portfolio at Risk", safeFormatPercentage(provisioningReport.portfolioAtRisk)],
    ["Average Loan Amount", safeFormatCurrency(provisioningReport.averageLoanAmount)],
  ]
    .map((row) => row.join(","))
    .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `provisioning_report_${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

  const getStatusBadge = (status: LoanStatus) => {
    const statusConfig = {
      [LoanStatus.PERFORMING]: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
        label: "Performing",
      },
      [LoanStatus.WATCH]: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Eye,
        label: "Watch",
      },
      [LoanStatus.SUBSTANDARD]: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertTriangle,
        label: "Substandard",
      },
      [LoanStatus.DOUBTFUL]: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: TrendingDown,
        label: "Doubtful",
      },
      [LoanStatus.LOSS]: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
        label: "Loss",
      },
    }

    const config = statusConfig[status]
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} border flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getRiskLevel = (daysInArrears: number) => {
    if (daysInArrears >= 180) return { level: "Loss", color: "text-gray-600", bgColor: "bg-gray-100" }
    if (daysInArrears >= 90) return { level: "Doubtful", color: "text-red-600", bgColor: "bg-red-100" }
    if (daysInArrears >= 30) return { level: "Substandard", color: "text-orange-600", bgColor: "bg-orange-100" }
    if (daysInArrears >= 1) return { level: "Watch", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { level: "Performing", color: "text-green-600", bgColor: "bg-green-100" }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredClassifications = classifications.filter((classification) => {
    if (filterStatus === "all") return true
    return classification.currentStatus === filterStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Shield className="w-7 h-7 mr-3" />
                  Loan Classification & Risk Management
                </h1>
                <p className="text-red-100 text-sm mt-1">
                  Monitor loan performance and manage provisioning requirements
                </p>
              </div>
    
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

{/* Fixed Provisioning Report Summary */}
{provisioningReport && (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
            Provisioning Overview
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportProvisioningReport}
            className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"
            
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
            className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"

              variant="outline"
              size="sm"
              onClick={() => setShowProvisioningReport(!showProvisioningReport)}
            >
              {showProvisioningReport ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Loans</p>
                <p className="text-2xl font-bold text-blue-900">
                  {safeFormatNumber(provisioningReport.totalLoans)}
                </p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-green-900">
                  {safeFormatCurrency(provisioningReport.totalOutstanding)}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Provision Required</p>
                <p className="text-2xl font-bold text-red-900">
                  {safeFormatCurrency(provisioningReport.totalProvisionRequired)}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Provision Ratio</p>
                <p className="text-2xl font-bold text-purple-900">
                  {provisioningReport.totalOutstanding && provisioningReport.totalOutstanding > 0 
                    ? safeFormatPercentage(
                        (safeFormatNumber(provisioningReport.totalProvisionRequired) / 
                         safeFormatNumber(provisioningReport.totalOutstanding)) * 100
                      )
                    : '0%'
                  }
                </p>
              </div>
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showProvisioningReport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Separator />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status breakdown */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Classification Breakdown</h3>
                  {Object.entries(provisioningReport.byStatus || {}).map(([status, data]) => (
                    <div key={status} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(status as LoanStatus)}
                          <span className="font-medium">{safeFormatNumber(data.count)} loans</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {safeFormatPercentage(data.percentage)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Outstanding:</span>
                          <span className="font-medium">{safeFormatCurrency(data.outstanding)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Provision Required:</span>
                          <span className="font-medium text-red-600">
                            {safeFormatCurrency(data.provisionRequired)}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={provisioningReport.totalOutstanding && provisioningReport.totalOutstanding > 0
                          ? (safeFormatNumber(data.outstanding) / safeFormatNumber(provisioningReport.totalOutstanding)) * 100
                          : 0
                        }
                        className="mt-2 h-2"
                      />
                    </div>
                  ))}
                </div>

                {/* Additional metrics */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Portfolio Health</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-orange-600">Portfolio at Risk</p>
                      <p className="text-xl font-bold text-orange-900">
                        {safeFormatPercentage(provisioningReport.portfolioAtRisk)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-teal-600">Avg Loan Amount</p>
                      <p className="text-xl font-bold text-teal-900">
                        {safeFormatCurrency(provisioningReport.averageLoanAmount)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-indigo-600">Performing Ratio</p>
                      <p className="text-xl font-bold text-indigo-900">
                        {safeFormatPercentage(provisioningReport.performingLoansRatio)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-rose-600">Loans in Arrears</p>
                      <p className="text-xl font-bold text-rose-900">
                        {safeFormatNumber(provisioningReport.totalInArrears)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Risk distribution chart placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center mt-4">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Risk Distribution Chart</p>
                      <p className="text-sm text-gray-500">Visual representation of loan classifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  </motion.div>
)}

{/* Loan Classification Table – Compact Rich Style */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <h2 className="flex items-center text-sm font-semibold text-gray-800">
        <FileText className="w-5 h-5 mr-2 text-gray-600" />
        Loan Classifications
      </h2>
      <div className="flex items-center space-x-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger 
            className="border w-36 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"
          
          >
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"
          
          >
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={LoanStatus.PERFORMING}>Performing</SelectItem>
            <SelectItem value={LoanStatus.WATCH}>Watch</SelectItem>
            <SelectItem value={LoanStatus.SUBSTANDARD}>Substandard</SelectItem>
            <SelectItem value={LoanStatus.DOUBTFUL}>Doubtful</SelectItem>
            <SelectItem value={LoanStatus.LOSS}>Loss</SelectItem>
          </SelectContent>
        </Select>
        {selectedClassifications.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkUpdateModal(true)}
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"

          >
            <Settings className="w-4 h-4 mr-1" />
            Bulk Update ({selectedClassifications.size})
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(fetchLoanClassifications({ organizationId, page: 1, limit: 20 }))}
          disabled={isLoading}
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"
          
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
              <Checkbox
                checked={
                  filteredClassifications.length > 0 &&
                  filteredClassifications.every((c) => selectedClassifications.has(c.loanId))
                }
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Loan ID</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Classification Date</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Days in Arrears</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Current Status</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Outstanding Principal</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Net Exposure</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Provision Required</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Risk Rating</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mb-2"
                  />
                  <span className="text-gray-500 text-sm">Loading classifications...</span>
                </div>
              </td>
            </tr>
          ) : filteredClassifications.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center text-gray-500 text-sm">
                {filterStatus !== "all"
                  ? `No ${filterStatus} loans`
                  : "No loan classifications available"}
              </td>
            </tr>
          ) : (
            filteredClassifications.map((classification, index) => {
              const riskLevel = getRiskLevel(classification.daysInArrears)
              return (
                <motion.tr
                  key={classification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selectedClassifications.has(classification.loanId)}
                      onCheckedChange={(checked) =>
                        handleSelectClassification(classification.loanId, checked as boolean)
                      }
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-800">
                    #{classification.loanId}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {new Date(classification.classificationDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${riskLevel.bgColor}`}></div>
                      <span className={`font-medium ${riskLevel.color}`}>
                        {classification.daysInArrears}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">{getStatusBadge(classification.currentStatus)}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {formatCurrency(classification.outstandingPrincipal)}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {formatCurrency(classification.netExposure)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(classification.provisionRequired)}
                    </span>
                    <p className="text-[11px] text-gray-500">{classification.provisioningRate}%</p>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-xs ${riskLevel.color}`}>
                      {classification.riskRating}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStatusUpdateModal(classification.loanId)}
                      className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                    >
                      Update
                    </Button>
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
</motion.div>

        {/* Status Update Modal */}
        <Dialog open={showStatusUpdateModal !== null} onOpenChange={() => setShowStatusUpdateModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-orange-600" />
                Update Loan Status
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Updating loan status will affect provisioning calculations and regulatory
                  reporting.
                </p>
              </div>
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select
                  value={statusUpdateData.status}
                  onValueChange={(value: LoanStatus) => setStatusUpdateData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger 
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"
                  
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                  
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <SelectItem value={LoanStatus.PERFORMING}>Performing</SelectItem>
                    <SelectItem value={LoanStatus.WATCH}>Watch</SelectItem>
                    <SelectItem value={LoanStatus.SUBSTANDARD}>Substandard</SelectItem>
                    <SelectItem value={LoanStatus.DOUBTFUL}>Doubtful</SelectItem>
                    <SelectItem value={LoanStatus.LOSS}>Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusReason">Reason for Status Change *</Label>
                <Textarea
                  id="statusReason"
                  value={statusUpdateData.reason}
                  onChange={(e) => setStatusUpdateData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a detailed reason for the status change"
                  rows={3}
            className="border  border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 "

                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowStatusUpdateModal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => showStatusUpdateModal && handleStatusUpdate(showStatusUpdateModal)}
                  disabled={!statusUpdateData.reason.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Update Modal */}
        <Dialog open={showBulkUpdateModal} onOpenChange={setShowBulkUpdateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-red-600" />
                Bulk Update Classifications ({selectedClassifications.size} loans)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will update the classification status for{" "}
                  {selectedClassifications.size} selected loans. This action affects provisioning calculations.
                </p>
              </div>
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select
                  value={bulkUpdateData.newStatus}
                  onValueChange={(value: LoanStatus) => setBulkUpdateData((prev) => ({ ...prev, newStatus: value }))}
                >
                  <SelectTrigger
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  
                  >
                    <SelectItem value={LoanStatus.PERFORMING}>Performing</SelectItem>
                    <SelectItem value={LoanStatus.WATCH}>Watch</SelectItem>
                    <SelectItem value={LoanStatus.SUBSTANDARD}>Substandard</SelectItem>
                    <SelectItem value={LoanStatus.DOUBTFUL}>Doubtful</SelectItem>
                    <SelectItem value={LoanStatus.LOSS}>Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulkReason">Reason for Bulk Update *</Label>
                <Textarea
                  id="bulkReason"
                  value={bulkUpdateData.reason}
                  onChange={(e) => setBulkUpdateData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a detailed reason for the bulk status update"
                  rows={3}
                  className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
            className="border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                
                variant="outline" onClick={() => setShowBulkUpdateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpdate}
                  disabled={!bulkUpdateData.reason.trim()}
                 className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Update {selectedClassifications.size} Loans
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default LoanClassificationDashboard