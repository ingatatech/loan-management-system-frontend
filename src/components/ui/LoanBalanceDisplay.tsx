//@ts-nocheck 
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Activity,
  RefreshCw
} from "lucide-react"
import { LoanApplication, LoanCalculationUpdate, getLoanCurrentBalances } from "@/lib/features/auth/loanApplicationSlice"
import { AppDispatch } from "@/lib/store"
import toast from "react-hot-toast"

interface LoanBalanceDisplayProps {
  loan: LoanApplication
  showRefreshButton?: boolean
}

const LoanBalanceDisplay: React.FC<LoanBalanceDisplayProps> = ({ 
  loan, 
  showRefreshButton = true 
}) => {
  const dispatch = useDispatch<AppDispatch>()

  // Auto-refresh current balances on component mount
  useEffect(() => {
    if (loan.id) {
      dispatch(getLoanCurrentBalances(loan.id))
    }
  }, [dispatch, loan.id])

  const handleRefreshBalances = async () => {
    try {
      await dispatch(getLoanCurrentBalances(loan.id)).unwrap()
      toast.success("Loan balances updated successfully!")
    } catch (error: any) {
      toast.error(error || "Failed to refresh balances")
    }
  }

  // Use currentBalances if available, otherwise fall back to static values
  const currentBalances = loan.currentBalances || {
    outstandingPrincipal: loan.outstandingPrincipal,
    accruedInterestToDate: loan.accruedInterestToDate,
    daysInArrears: loan.daysInArrears,
    status: loan.status
  }

  const totalOutstanding = currentBalances.outstandingPrincipal + currentBalances.accruedInterestToDate
  const originalAmount = loan.disbursedAmount
  const paidAmount = originalAmount - currentBalances.outstandingPrincipal
  const paymentProgress = originalAmount > 0 ? (paidAmount / originalAmount) * 100 : 0

  // Status color mapping
  const getStatusColor = (status: string, daysInArrears: number) => {
    if (daysInArrears === 0 && status === 'performing') return 'text-green-600 bg-green-50'
    if (daysInArrears <= 30) return 'text-yellow-600 bg-yellow-50'
    if (daysInArrears <= 90) return 'text-orange-600 bg-orange-50'
    if (daysInArrears <= 180) return 'text-red-600 bg-red-50'
    return 'text-red-800 bg-red-100'
  }

  const getStatusIcon = (status: string, daysInArrears: number) => {
    if (daysInArrears === 0 && status === 'performing') return CheckCircle
    if (daysInArrears > 0) return AlertTriangle
    return Clock
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const StatusIcon = getStatusIcon(currentBalances.status, currentBalances.daysInArrears)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Current Loan Balances</h3>
          {loan.currentBalances && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Real-time
            </span>
          )}
        </div>
        {showRefreshButton && (
          <button
            onClick={handleRefreshBalances}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh balances"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-lg border ${getStatusColor(currentBalances.status, currentBalances.daysInArrears)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className="w-5 h-5" />
            <div>
              <p className="font-medium">Status: {currentBalances.status.toUpperCase()}</p>
              <p className="text-sm opacity-80">
                {currentBalances.daysInArrears > 0 
                  ? `${currentBalances.daysInArrears} days in arrears`
                  : 'Current on payments'
                }
              </p>
            </div>
          </div>
          {currentBalances.daysInArrears > 0 && (
            <div className="text-right">
              <Calendar className="w-4 h-4 mx-auto" />
              <p className="text-xs font-medium mt-1">Overdue</p>
            </div>
          )}
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Principal */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <TrendingDown className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-sm font-medium text-blue-800 mb-1">Outstanding Principal</h4>
          <p className="text-xl font-bold text-blue-900">
            {formatCurrency(currentBalances.outstandingPrincipal)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {((currentBalances.outstandingPrincipal / originalAmount) * 100).toFixed(1)}% of original
          </p>
        </div>

        {/* Accrued Interest */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <h4 className="text-sm font-medium text-orange-800 mb-1">Accrued Interest</h4>
          <p className="text-xl font-bold text-orange-900">
            {formatCurrency(currentBalances.accruedInterestToDate)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Current period interest
          </p>
        </div>

        {/* Total Outstanding */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <h4 className="text-sm font-medium text-purple-800 mb-1">Total Outstanding</h4>
          <p className="text-xl font-bold text-purple-900">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Principal + Interest
          </p>
        </div>

        {/* Amount Paid */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <h4 className="text-sm font-medium text-green-800 mb-1">Amount Paid</h4>
          <p className="text-xl font-bold text-green-900">
            {formatCurrency(paidAmount)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {paymentProgress.toFixed(1)}% completed
          </p>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Repayment Progress</span>
          <span>{paymentProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(paymentProgress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full ${
              paymentProgress >= 100 
                ? 'bg-green-500' 
                : paymentProgress >= 75 
                ? 'bg-blue-500' 
                : paymentProgress >= 50 
                ? 'bg-yellow-500' 
                : 'bg-orange-500'
            }`}
          />
        </div>
      </div>

      {/* Original vs Current Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Original Loan Terms</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Disbursed Amount:</span>
              <span className="font-medium">{formatCurrency(loan.disbursedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Rate:</span>
              <span className="font-medium">{loan.annualInterestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Term:</span>
              <span className="font-medium">{loan.termInMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Payment:</span>
              <span className="font-medium">{formatCurrency(loan.monthlyInstallmentAmount)}</span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Current Position</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Days Since Disbursement:</span>
              <span className="font-medium">
                {Math.floor((new Date().getTime() - new Date(loan.disbursementDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            <div className="flex justify-between">
              <span>Next Payment Due:</span>
              <span className="font-medium">
                {new Date(loan.agreedFirstPaymentDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Classification:</span>
              <span className={`font-medium ${
                currentBalances.daysInArrears === 0 ? 'text-green-600' :
                currentBalances.daysInArrears <= 30 ? 'text-yellow-600' :
                currentBalances.daysInArrears <= 90 ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {currentBalances.daysInArrears === 0 ? 'Standard' :
                 currentBalances.daysInArrears <= 30 ? 'Standard' :
                 currentBalances.daysInArrears <= 90 ? 'Watch' :
                 currentBalances.daysInArrears <= 180 ? 'Substandard' :
                 currentBalances.daysInArrears <= 365 ? 'Doubtful' : 'Loss'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium text-blue-600">
                {loan.currentBalances ? 'Real-time' : 'Static'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {currentBalances.daysInArrears > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h6 className="font-medium text-red-800">Payment Overdue</h6>
              <p className="text-sm text-red-700 mt-1">
                This loan is {currentBalances.daysInArrears} days overdue. 
                {currentBalances.daysInArrears > 90 && " Immediate action required to avoid further classification deterioration."}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default LoanBalanceDisplay