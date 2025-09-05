// @ts-nocheck
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  RefreshCw,
  Download,
  Eye,
  Activity,
  PieChart,
  Target,
  Shield
} from "lucide-react"
import {
  getPortfolioSummary,
  getOverdueLoans,
  getLoanClassificationReport,
  performDailyInterestAccrual,
  updateOrganizationLoanBalances,
  clearClassificationReport,
  fetchLoanApplicationStats
} from "@/lib/features/auth/loanApplicationSlice"
import { AppDispatch, RootState } from "@/lib/store"
import toast from "react-hot-toast"

const PortfolioDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    portfolioSummary, 
    overdueLoans, 
    classificationReport, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.loanApplication)
  
  const [selectedOverdueDays, setSelectedOverdueDays] = useState(1)
  const [showClassificationReport, setShowClassificationReport] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(getPortfolioSummary()).unwrap(),
        dispatch(getOverdueLoans(selectedOverdueDays)).unwrap(),
        dispatch(fetchLoanApplicationStats()).unwrap()
      ])
      setLastRefresh(new Date())
    } catch (error: any) {
      toast.error("Failed to load dashboard data")
    }
  }

  const handleRefreshDashboard = async () => {
    await loadDashboardData()
    toast.success("Dashboard refreshed successfully!")
  }

  const handleDailyAccrual = async () => {
    try {
      const result = await dispatch(performDailyInterestAccrual()).unwrap()
      toast.success(`Daily accrual completed! Processed ${result.totalLoansProcessed} loans`)
      await loadDashboardData() // Refresh after accrual
    } catch (error: any) {
      toast.error(error || "Failed to perform daily accrual")
    }
  }

  const handleUpdateBalances = async () => {
    try {
      const result = await dispatch(updateOrganizationLoanBalances()).unwrap()
      toast.success(`Balances updated! Processed ${result.totalLoansProcessed} loans`)
      await loadDashboardData() // Refresh after update
    } catch (error: any) {
      toast.error(error || "Failed to update balances")
    }
  }

  const handleOverdueDaysChange = async (days: number) => {
    setSelectedOverdueDays(days)
    try {
      await dispatch(getOverdueLoans(days)).unwrap()
    } catch (error: any) {
      toast.error("Failed to fetch overdue loans")
    }
  }

  const handleShowClassificationReport = async () => {
    if (!showClassificationReport) {
      try {
        await dispatch(getLoanClassificationReport()).unwrap()
        setShowClassificationReport(true)
      } catch (error: any) {
        toast.error("Failed to generate classification report")
      }
    } else {
      setShowClassificationReport(false)
      dispatch(clearClassificationReport())
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Status breakdown calculation
  const getStatusBreakdown = () => {
    if (!portfolioSummary?.statusBreakdown) return []
    
    return Object.entries(portfolioSummary.statusBreakdown).map(([status, count]) => ({
      status,
      count,
      color: getStatusColor(status)
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'performing': return 'bg-green-500'
      case 'watch': return 'bg-yellow-500'
      case 'substandard': return 'bg-orange-500'
      case 'doubtful': return 'bg-red-500'
      case 'loss': return 'bg-red-700'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time loan portfolio analytics and management
            {lastRefresh && (
              <span className="ml-2 text-sm text-blue-600">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshDashboard}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleDailyAccrual}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Activity className="w-4 h-4 mr-2" />
            Run Daily Accrual
          </button>

          <button
            onClick={handleUpdateBalances}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Target className="w-4 h-4 mr-2" />
            Update Balances
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Portfolio Summary Cards */}
      {portfolioSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Portfolio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-900">
                  {formatCurrency(portfolioSummary.totalDisbursed)}
                </span>
                <p className="text-sm text-blue-700">Total Portfolio</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              {portfolioSummary.totalLoans} active loans
            </div>
          </div>

          {/* Outstanding Principal */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div className="text-right">
                <span className="text-2xl font-bold text-orange-900">
                  {formatCurrency(portfolioSummary.totalOutstandingPrincipal)}
                </span>
                <p className="text-sm text-orange-700">Outstanding Principal</p>
              </div>
            </div>
            <div className="text-sm text-orange-600">
              Accrued Interest: {formatCurrency(portfolioSummary.totalAccruedInterest)}
            </div>
          </div>

          {/* Portfolio at Risk */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="text-right">
                <span className="text-2xl font-bold text-red-900">
                  {formatPercentage(portfolioSummary.portfolioAtRisk)}
                </span>
                <p className="text-sm text-red-700">Portfolio at Risk</p>
              </div>
            </div>
            <div className="text-sm text-red-600">
              {formatCurrency(portfolioSummary.totalInArrears)} in arrears
            </div>
          </div>

          {/* Average Loan */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <div className="text-right">
                <span className="text-2xl font-bold text-green-900">
                  {formatCurrency(portfolioSummary.averageLoanAmount)}
                </span>
                <p className="text-sm text-green-700">Average Loan Size</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <PieChart className="w-4 h-4 mr-1" />
              {portfolioSummary.totalLoans} loans
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Breakdown */}
      {portfolioSummary?.statusBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Loan Status Breakdown
            </h3>
            <div className="space-y-3">
              {getStatusBreakdown().map((item, index) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatPercentage((item.count / portfolioSummary.totalLoans) * 100)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleShowClassificationReport}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Classification Report</span>
                </div>
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex space-x-2">
                <select
                  value={selectedOverdueDays}
                  onChange={(e) => handleOverdueDaysChange(Number(e.target.value))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={1}>1+ Days Overdue</option>
                  <option value={30}>30+ Days Overdue</option>
                  <option value={90}>90+ Days Overdue</option>
                  <option value={180}>180+ Days Overdue</option>
                </select>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
                  View
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overdue Loans Section */}
      {overdueLoans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Overdue Loans ({overdueLoans.length})
            </h3>
            <span className="text-sm text-red-600">
              Total Overdue: {formatCurrency(
                overdueLoans.reduce((sum, loan) => 
                  sum + (loan.currentBalances?.outstandingPrincipal || 0) + 
                  (loan.currentBalances?.accruedInterestToDate || 0), 0)
              )}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Loan ID</th>
                  <th className="text-left py-2 font-medium text-gray-700">Borrower</th>
                  <th className="text-left py-2 font-medium text-gray-700">Days Overdue</th>
                  <th className="text-left py-2 font-medium text-gray-700">Outstanding</th>
                  <th className="text-left py-2 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {overdueLoans.slice(0, 5).map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-blue-600 font-medium">{loan.loanId}</td>
                    <td className="py-3">{loan.borrower?.fullName || 'N/A'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        loan.currentBalances.daysInArrears <= 30 ? 'bg-yellow-100 text-yellow-800' :
                        loan.currentBalances.daysInArrears <= 90 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {loan.currentBalances.daysInArrears} days
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      {formatCurrency(
                        (loan.currentBalances?.outstandingPrincipal || 0) + 
                        (loan.currentBalances?.accruedInterestToDate || 0)
                      )}
                    </td>
                    <td className="py-3 capitalize">{loan.currentBalances.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Classification Report */}
      {showClassificationReport && classificationReport.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Loan Classification Report
            </h3>
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Loan ID</th>
                  <th className="text-left py-2 font-medium text-gray-700">Borrower</th>
                  <th className="text-left py-2 font-medium text-gray-700">Classification</th>
                  <th className="text-left py-2 font-medium text-gray-700">Provision Rate</th>
                  <th className="text-left py-2 font-medium text-gray-700">Provision Required</th>
                </tr>
              </thead>
              <tbody>
                {classificationReport.slice(0, 5).map((report, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-blue-600 font-medium">{report.loanId}</td>
                    <td className="py-3">{report.borrowerName}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.classificationCategory === 'Normal/Standard' ? 'bg-green-100 text-green-800' :
                        report.classificationCategory === 'Watch' ? 'bg-yellow-100 text-yellow-800' :
                        report.classificationCategory === 'Substandard' ? 'bg-orange-100 text-orange-800' :
                        report.classificationCategory === 'Doubtful' ? 'bg-red-100 text-red-800' :
                        'bg-red-200 text-red-900'
                      }`}>
                        {report.classificationCategory}
                      </span>
                    </td>
                    <td className="py-3">{formatPercentage(report.provisioningRate * 100)}</td>
                    <td className="py-3 font-medium">{formatCurrency(report.provisionRequired)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      )}
    </div>
  )
}

export default PortfolioDashboard