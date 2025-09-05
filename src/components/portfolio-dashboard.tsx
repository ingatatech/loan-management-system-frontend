// @ts-nocheck

"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  RefreshCw,
  Activity,
  Target,
  Shield,
  PieChart,
} from "lucide-react"
import {
  getPortfolioSummary,
  getOverdueLoans,
  getLoanClassificationReport,
  performDailyInterestAccrual,
  updateOrganizationLoanBalances,
  clearClassificationReport,
  fetchLoanApplicationStats,
} from "@/lib/features/auth/loanApplicationSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Tooltip,
} from "recharts"

const PortfolioDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { portfolioSummary, overdueLoans, classificationReport, dailyCalculationResult, stats, isLoading, error } =
    useSelector((state: RootState) => state.loanApplication)

  const [selectedOverdueDays, setSelectedOverdueDays] = useState(1)
  const [showClassificationReport, setShowClassificationReport] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(getPortfolioSummary()).unwrap(),
        dispatch(getOverdueLoans(selectedOverdueDays)).unwrap(),
        dispatch(fetchLoanApplicationStats()).unwrap(),
      ])
      setLastRefresh(new Date())
    } catch (error: any) {
      toast.error("Failed to load dashboard data")
    }
  }

  const handleRefreshDashboard = async () => {
    await loadDashboardData()
    toast.success("Dashboard refreshed!")
  }

  const handleDailyAccrual = async () => {
    try {
      const result = await dispatch(performDailyInterestAccrual()).unwrap()
      toast.success(`Processed ${result.totalLoansProcessed} loans`)
      await loadDashboardData()
    } catch (error: any) {
      toast.error(error || "Failed to perform daily accrual")
    }
  }

  const handleUpdateBalances = async () => {
    try {
      const result = await dispatch(updateOrganizationLoanBalances()).unwrap()
      toast.success(`Updated ${result.totalLoansProcessed} loans`)
      await loadDashboardData()
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
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`

const classificationChartData = classificationReport
  ? [
    { name: "Current", value: classificationReport.current?.amount || 0, count: classificationReport.current?.count || 0 },
    { name: "1-30 Days", value: classificationReport.pastDue1to30?.amount || 0, count: classificationReport.pastDue1to30?.count || 0 },
    { name: "31-60 Days", value: classificationReport.pastDue31to60?.amount || 0, count: classificationReport.pastDue31to60?.count || 0 },
    { name: "61-90 Days", value: classificationReport.pastDue61to90?.amount || 0, count: classificationReport.pastDue61to90?.count || 0 },
    { name: "90+ Days", value: classificationReport.pastDue90Plus?.amount || 0, count: classificationReport.pastDue90Plus?.count || 0 },
  ]
  : []

  const COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444", "#7c2d12"]

  const CompactStatCard = ({
    title,
    value,
    icon,
    bgGradient,
    subtitle,
  }: {
    title: string
    value: string | number
    icon: React.ReactNode
    bgGradient: string
    subtitle?: string
  }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group cursor-pointer">
      <div className="overflow-hidden shadow-sm bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 h-[90px] rounded-xl border border-gray-100">
        <div className="flex items-center h-full">
          <div className={`${bgGradient} p-3 flex items-center justify-center relative overflow-hidden h-full`}>
            <motion.div className="text-white relative z-10" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              {icon}
            </motion.div>
          </div>
          <div className="px-4 flex-1 min-w-0">
            <p className="text-xs text-gray-600 font-medium mb-1 uppercase truncate">{title}</p>
            <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
                {lastRefresh && (
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefreshDashboard} disabled={isLoading} variant="outline" size="sm" className="border border-gray-200">
                  <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button onClick={handleDailyAccrual} disabled={isLoading} size="sm">
                  <Activity className="w-4 h-4 mr-1" />
                  Accrual
                </Button>
                <Button onClick={handleUpdateBalances} disabled={isLoading} variant="secondary" size="sm">
                  <Target className="w-4 h-4 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Compact Summary Cards */}
        {portfolioSummary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CompactStatCard
              title="Total Loans"
              value={portfolioSummary.totalLoans || 0}
              icon={<Users className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
            />
            <CompactStatCard
              title="Total Disbursed"
              value={formatCurrency(portfolioSummary.totalDisbursed || 0)}
              icon={<DollarSign className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
            />
            <CompactStatCard
              title="Outstanding"
              value={formatCurrency(portfolioSummary.totalOutstandingPrincipal || 0)}
              icon={<BarChart3 className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-green-400 to-green-600"
            />
            <CompactStatCard
              title="Portfolio at Risk"
              value={formatPercentage(portfolioSummary.portfolioAtRisk || 0)}
              icon={<AlertTriangle className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-orange-400 to-orange-600"
            />
          </motion.div>
        )}

        {/* Performance Metrics - Compact */}
        {portfolioSummary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <CompactStatCard
              title="Performing"
              value={portfolioSummary.performingLoans || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-green-500 to-green-700"
              subtitle={portfolioSummary.totalLoans ? formatPercentage(((portfolioSummary.performingLoans || 0) / portfolioSummary.totalLoans) * 100) : "0%"}
            />
            <CompactStatCard
              title="Non-Performing"
              value={portfolioSummary.nonPerformingLoans || 0}
              icon={<TrendingDown className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-red-500 to-red-700"
              subtitle={portfolioSummary.totalLoans ? formatPercentage(((portfolioSummary.nonPerformingLoans || 0) / portfolioSummary.totalLoans) * 100) : "0%"}
            />
            <CompactStatCard
              title="Avg Interest Rate"
              value={formatPercentage(portfolioSummary.averageInterestRate || 0)}
              icon={<Shield className="w-5 h-5" />}
              bgGradient="bg-gradient-to-br from-blue-500 to-blue-700"
            />
          </motion.div>
        )}

        {/* Compact Tabs */}
        <Tabs defaultValue="overdue" className="space-y-4">
          <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-lg">
            <TabsTrigger
              value="overdue"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 rounded-md px-3 py-1"
            >
              Overdue
            </TabsTrigger>
            <TabsTrigger
              value="classification"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 rounded-md px-3 py-1"
            >
              Classification
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 rounded-md px-3 py-1"
            >
              Stats
            </TabsTrigger>
          </TabsList>


          <TabsContent value="overdue">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Overdue Loans</h3>
                <div className="flex gap-2">
                  {[1, 7, 30, 90].map((days) => (
                    <Button
                      key={days}
                      variant={selectedOverdueDays === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleOverdueDaysChange(days)}
                      className="border border-gray-200"
                    >
                      {days}+
                    </Button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Borrower</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Loan Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Balance</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Next Payment</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                   {overdueLoans && overdueLoans.length > 0 ? (
  overdueLoans.map((loan, index) => (
    <tr key={loan.id} className="hover:bg-gray-50">
      <td className="px-3 py-2">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="text-sm font-medium text-gray-900">
          {loan.borrowerName || `${loan.borrower?.firstName} ${loan.borrower?.lastName}` || "Unknown"}
        </div>
        <div className="text-xs text-gray-500">
          {loan.borrowerPhone || loan.borrower?.primaryPhone || "N/A"}
        </div>
      </td>
      <td className="px-3 py-2 text-gray-900">
        {formatCurrency(loan.loanAmount || loan.disbursedAmount || 0)}
      </td>
      <td className="px-3 py-2 text-gray-900">
        {formatCurrency(loan.currentBalance || loan.currentBalances?.outstandingPrincipal || 0)}
      </td>
      <td className="px-3 py-2 text-gray-900">
        {formatCurrency(loan.nextPaymentAmount || loan.monthlyInstallmentAmount || 0)}
      </td>
      <td className="px-3 py-2">
        <Badge variant="destructive">
          {loan.daysPastDue || loan.currentBalances?.daysInArrears || 0} days
        </Badge>
      </td>
    </tr>
  ))
) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <Shield className="w-10 h-10 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-green-600">No Overdue Loans</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classification">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Classification Report</h3>
                <Button onClick={handleShowClassificationReport} variant={showClassificationReport ? "secondary" : "default"} size="sm">
                  <PieChart className="w-4 h-4 mr-1" />
                  {showClassificationReport ? "Hide" : "Generate"}
                </Button>
              </div>
              {showClassificationReport && classificationReport ? (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {classificationChartData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatCurrency(item.value)}</div>
                          <div className="text-xs text-gray-500">{item.count} loans</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={classificationChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {classificationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click Generate to view report</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Application Statistics</h3>
              </div>
              {stats ? (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: stats.totalApplications || 0, color: "blue" },
                    { label: "Pending", value: stats.pendingApplications || 0, color: "yellow" },
                    { label: "Approved", value: stats.approvedApplications || 0, color: "green" },
                    { label: "Rejected", value: stats.rejectedApplications || 0, color: "red" },
                    { label: "Disbursed", value: stats.disbursedApplications || 0, color: "purple" },
                    { label: "Total Amount", value: formatCurrency(stats.totalDisbursedAmount || 0), color: "indigo" },
                    { label: "Avg Loan", value: formatCurrency(stats.averageLoanAmount || 0), color: "pink" },
                    { label: "Avg Process", value: `${(stats.averageProcessingTime || 0).toFixed(1)}d`, color: "teal" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-3 border rounded-lg border border-gray-300">
                      <div className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Compact Daily Results */}
        {dailyCalculationResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Latest Calculation
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{dailyCalculationResult.totalLoansProcessed}</div>
                  <div className="text-xs text-green-700">Processed</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(dailyCalculationResult.totalInterestAccrued || 0)}</div>
                  <div className="text-xs text-blue-700">Accrued</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{dailyCalculationResult.loansUpdated}</div>
                  <div className="text-xs text-purple-700">Updated</div>
                </div>
              </div>
              {dailyCalculationResult.errors && dailyCalculationResult.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-red-800 mb-1">Errors:</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    {dailyCalculationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PortfolioDashboard