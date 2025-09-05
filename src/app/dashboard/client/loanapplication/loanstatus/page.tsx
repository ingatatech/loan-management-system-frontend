// @ts-nocheck

"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Send
} from "lucide-react"

import { 
  fetchLoanApplications, 
  changeLoanStatus, 
  bulkChangeLoanStatus,
  clearError,
  LoanStatus,
  type LoanApplication,
  type LoanStatusChangeRequest,
  type BulkLoanStatusChangeRequest
} from "@/lib/features/auth/loanApplicationSlice"
import type { AppDispatch, RootState } from "@/lib/store"

const LoanManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    applications, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.loanApplication)

  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedLoans, setSelectedLoans] = useState<number[]>([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [currentLoan, setCurrentLoan] = useState<LoanApplication | null>(null)
  const [newStatus, setNewStatus] = useState<LoanStatus | "">("")
  const [statusNotes, setStatusNotes] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Load data on mount
  useEffect(() => {
    dispatch(fetchLoanApplications({ status: "pending" }))
    dispatch(clearError())
  }, [dispatch])

  // Filter pending loans only
  const pendingLoans = applications.filter(loan => loan.status === LoanStatus.PENDING)

  // Apply search and filter
  const filteredLoans = pendingLoans.filter((loan) => {
    const matchesSearch = 
      loan.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${loan.borrower.firstName} ${loan.borrower.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrower.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrower.primaryPhone.includes(searchTerm)

    const matchesStatus = !statusFilter || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Status color mapping
  const getStatusColor = (status: LoanStatus) => {
    const colors = {
      [LoanStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [LoanStatus.APPROVED]: "bg-blue-100 text-blue-800 border-blue-200", 
      [LoanStatus.DISBURSED]: "bg-green-100 text-green-800 border-green-200",
      [LoanStatus.PERFORMING]: "bg-green-100 text-green-800 border-green-200",
      [LoanStatus.WATCH]: "bg-orange-100 text-orange-800 border-orange-200",
      [LoanStatus.SUBSTANDARD]: "bg-red-100 text-red-800 border-red-200",
      [LoanStatus.DOUBTFUL]: "bg-red-200 text-red-900 border-red-300",
      [LoanStatus.LOSS]: "bg-red-300 text-red-900 border-red-400",
      [LoanStatus.WRITTEN_OFF]: "bg-gray-100 text-gray-800 border-gray-200",
      [LoanStatus.CLOSED]: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return <Clock className="w-3 h-3" />
      case LoanStatus.APPROVED:
        return <CheckCircle className="w-3 h-3" />
      case LoanStatus.DISBURSED:
      case LoanStatus.PERFORMING:
      case LoanStatus.CLOSED:
        return <CheckCircle className="w-3 h-3" />
      case LoanStatus.WATCH:
      case LoanStatus.SUBSTANDARD:
      case LoanStatus.DOUBTFUL:
      case LoanStatus.LOSS:
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }
  const getStatusIconsingle = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return <Clock className="w-3 h-3" />
      case LoanStatus.APPROVED:
        return <CheckCircle className="w-3 h-3" />
      case LoanStatus.DISBURSED:
      case LoanStatus.PERFORMING:
      case LoanStatus.CLOSED:
        return <CheckCircle className="w-3 h-3" />
      case LoanStatus.WATCH:
      case LoanStatus.SUBSTANDARD:
      case LoanStatus.DOUBTFUL:
      case LoanStatus.LOSS:
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  // Handle single loan status change - simplified without validation
  const handleStatusChange = async (loan: LoanApplication) => {
    setCurrentLoan(loan)
    setShowStatusModal(true)
  }

  // Submit status change
  const submitStatusChange = async () => {
    if (!currentLoan || !newStatus) return

    setActionLoading(true)
    try {
      const statusData: LoanStatusChangeRequest = {
        newStatus: newStatus as LoanStatus,
        notes: statusNotes,
        sendEmail,
        customMessage: customMessage || undefined
      }

      await dispatch(changeLoanStatus({ 
        loanId: currentLoan.id, 
        statusData 
      })).unwrap()

      toast.success(`Loan status changed to ${newStatus}`)
      setShowStatusModal(false)
      resetModalState()
      
      // Refresh the loans
      dispatch(fetchLoanApplications({ status: "pending" }))
    } catch (error: any) {
      toast.error(error || "Failed to change loan status")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle bulk status change
  const handleBulkStatusChange = () => {
    if (selectedLoans.length === 0) {
      toast.error("Please select loans to update")
      return
    }
    setShowBulkModal(true)
  }

  // Submit bulk status change
  const submitBulkStatusChange = async () => {
    if (!newStatus || selectedLoans.length === 0) return

    setActionLoading(true)
    try {
      const statusData: BulkLoanStatusChangeRequest = {
        loanIds: selectedLoans,
        newStatus: newStatus as LoanStatus,
        notes: statusNotes,
        sendEmail,
        customMessage: customMessage || undefined
      }

      await dispatch(bulkChangeLoanStatus(statusData)).unwrap()

      toast.success(`${selectedLoans.length} loans updated to ${newStatus}`)
      setShowBulkModal(false)
      setSelectedLoans([])
      resetModalState()
      
      // Refresh the loans
      dispatch(fetchLoanApplications({ status: "pending" }))
    } catch (error: any) {
      toast.error(error || "Failed to bulk change loan status")
    } finally {
      setActionLoading(false)
    }
  }

  // Reset modal state
  const resetModalState = () => {
    setNewStatus("")
    setStatusNotes("")
    setCustomMessage("")
    setSendEmail(true)
    setCurrentLoan(null)
  }

  // Toggle loan selection
  const toggleLoanSelection = (loanId: number) => {
    setSelectedLoans(prev => 
      prev.includes(loanId)
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    )
  }

  // Select all loans
  const selectAllLoans = () => {
    if (selectedLoans.length === filteredLoans.length) {
      setSelectedLoans([])
    } else {
      setSelectedLoans(filteredLoans.map(loan => loan.id))
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
                <p className="text-gray-600">Manage pending loan applications and change status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by loan ID, borrower name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {Object.values(LoanStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedLoans.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedLoans.length} selected
                </span>
                <button
                  onClick={handleBulkStatusChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Bulk Update Status
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Compact Loans Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLoans.length === filteredLoans.length && filteredLoans.length > 0}
                      onChange={selectAllLoans}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Loan Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Borrower Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Financial Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                        <span className="text-gray-600 text-sm">Loading loan applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        {searchTerm || statusFilter 
                          ? 'No loans match your search criteria' 
                          : 'No pending loan applications found'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan, index) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      {/* Numerical Numbering */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* Selection Checkbox */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLoans.includes(loan.id)}
                          onChange={() => toggleLoanSelection(loan.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Loan Details - Compact */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Purpose:</span> {loan.purposeOfLoan}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Officer:</span> {loan.loanOfficer}
                          </div>
                
                        </div>
                      </td>

                      {/* Borrower Info - Compact */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {loan.borrower.firstName} {loan.borrower.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">ID:</span> {loan.borrower.nationalId}
                          </div>
                     
                     
                        </div>
                      </td>

                      {/* Financial Details - Compact */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(loan.disbursedAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Term:</span> {loan.termInMonths} months
                          </div>
                     
                        
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          <span className="ml-1 capitalize">
                            {loan.status.replace('_', ' ')}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusChange(loan)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Change Status
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Change Modal */}
        <AnimatePresence>
          {showStatusModal && currentLoan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => !actionLoading && setShowStatusModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Edit className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white">
                          Change Loan Status
                        </h3>
                      
                      </div>
                    </div>
                    {!actionLoading && (
                      <button
                        onClick={() => setShowStatusModal(false)}
                        className="text-blue-100 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Current Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentLoan.status)}`}>
                      {getStatusIcon(currentLoan.status)}
                      <span className="ml-2 capitalize">
                        {currentLoan.status.replace('_', ' ')}
                      </span>
                    </span>
                  </div>

           <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    New Status *
  </label>
  <select
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value as LoanStatus)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    disabled={actionLoading}
  >
    <option value="">Select new status</option>
    <option value={LoanStatus.APPROVED}>
      Approved
    </option>
    <option value={LoanStatus.DISBURSED}>
      Disbursed
    </option>
  </select>
</div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about this status change..."
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Email Notification */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={actionLoading}
                    />
                    <div>
                      <label htmlFor="sendEmail" className="text-sm font-medium text-gray-700">
                        Send email notification to borrower
                      </label>
                      <p className="text-xs text-gray-500">
                        {currentLoan.borrower.email ? 
                          `Email will be sent to ${currentLoan.borrower.email}` :
                          'No email address available for this borrower'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Custom Message */}
                  {sendEmail && currentLoan.borrower.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Message (Optional)
                      </label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a custom message for the borrower..."
                        disabled={actionLoading}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => !actionLoading && setShowStatusModal(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitStatusChange}
                    disabled={actionLoading || !newStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Status Change Modal */}
        <AnimatePresence>
          {showBulkModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => !actionLoading && setShowBulkModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white">
                          Bulk Status Change
                        </h3>
                        <p className="text-green-100 text-sm">
                          {selectedLoans.length} loans selected
                        </p>
                      </div>
                    </div>
                    {!actionLoading && (
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="text-green-100 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* New Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as LoanStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={actionLoading}
                    >
                      <option value="">Select new status</option>
                      {Object.values(LoanStatus).map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Add notes about this bulk status change..."
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Email Notification */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="sendEmailBulk"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      disabled={actionLoading}
                    />
                    <div>
                      <label htmlFor="sendEmailBulk" className="text-sm font-medium text-gray-700">
                        Send email notifications to borrowers
                      </label>
                      <p className="text-xs text-gray-500">
                        Emails will be sent to borrowers who have email addresses
                      </p>
                    </div>
                  </div>

                  {/* Custom Message */}
                  {sendEmail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Message (Optional)
                      </label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Add a custom message for all borrowers..."
                        disabled={actionLoading}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => !actionLoading && setShowBulkModal(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitBulkStatusChange}
                    disabled={actionLoading || !newStatus}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating {selectedLoans.length} loans...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Update {selectedLoans.length} Loans
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LoanManagementPage