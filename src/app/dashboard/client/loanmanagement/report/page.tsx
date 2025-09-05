// @ts-nocheck

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Shield, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  DollarSign, Download, RefreshCw, Search, Filter, Eye,
  Users, Building2, Clock, FileText, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp,
  ExternalLink, Minus, AlertCircle, PieChart, TrendingDown,
  Calendar, Archive, Trash2, AlertOctagon, Calendar as CalendarIcon
} from 'lucide-react'

import { BarChart } from '@mui/x-charts/BarChart'

import { RootState, AppDispatch } from '@/lib/store'
import {
  fetchComprehensiveClassificationReport,
  fetchOtherInformation,
  fetchSupplementaryInformation,
  clearComprehensiveReport,
  clearOtherInformation,
  clearSupplementaryInformation,
  type ComprehensiveReport,
  type ClassificationReport,
  type LoanDetail,
  type OtherInformation,
  type SupplementaryInformation
} from '@/lib/features/repayment/loanClassificationSlice'
const getOrganizationId = () => {
  if (typeof window !== 'undefined') {
    const userString = localStorage.getItem('user')
    const user = userString ? JSON.parse(userString) : null
    return user?.organizationId
  }
  return null
}

const getOrganizationInfo = () => {
  if (typeof window !== 'undefined') {
    const userString = localStorage.getItem('user')
    const user = userString ? JSON.parse(userString) : null
    return {
      name: user?.organization?.name || 'N/A',
      tinNumber: user?.organization?.tinNumber || 'N/A'
    }
  }
  return { name: 'N/A', tinNumber: 'N/A' }
}

// Write-off report interface
interface WriteOffReportEntry {
  borrowerName: string;
  borrowerNationalId: string;
  telephoneNumber: string;
  accountNumber: string;
  gender: string;
  age: number;
  relationshipWithNDFSP: string;
  annualInterestRate: number;
  interestCalculationMethod: string;
  physicalGuarantee: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  disbursementDate: Date;
  disbursedAmount: number;
  maturityDate: Date;
  amountRepaid: number;
  loanBalanceOutstanding: number;
  securitySavings: number;
  amountWrittenOff: number;
  dateOfWriteOff: Date | null;
  recoveriesOnWrittenOff: number;
  remainingBalanceToRecover: number;
  daysInArrears: number;
  loanId: string;
  loanStatus: string;
}

interface WriteOffReport {
  title: string;
  description: string;
  criteria: string;
  reportDate: Date;
  totalLoans: number;
  totalAmountWrittenOff: number;
  totalRemainingBalance: number;
  loans: WriteOffReportEntry[];
  summary: {
    byGender: Record<string, number>;
    byDistrict: Record<string, number>;
    byRelationship: Record<string, number>;
    averageAge: number;
    averageDaysInArrears: number;
    recoveryRate: number;
  };
}

// Date filter interface
interface DateFilterState {
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const LoanClassificationDashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    comprehensiveReport,
    otherInformation,
    supplementaryInformation,
    isLoadingComprehensive,
    error
  } = useSelector((state: RootState) => state.loanClassification)

  const [activeView, setActiveView] = useState<'table' | 'analytics' | 'writeoff' | 'otherinfo' | 'supplementary'>('table')
  const [activeTab, setActiveTab] = useState<'normal' | 'watch' | 'substandard' | 'doubtful' | 'loss'>('normal')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [organizationInfo, setOrganizationInfo] = useState({ name: 'N/A', tinNumber: 'N/A' })

  // Smart Calendar Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    startDate: '',
    endDate: '',
    isActive: false
  })
  const [showDateFilter, setShowDateFilter] = useState(false)

  useEffect(() => {
    const orgInfo = getOrganizationInfo()
    setOrganizationInfo(orgInfo)
  }, [])

  useEffect(() => {
    const organizationId = getOrganizationId()
    if (organizationId) {
      dispatch(fetchComprehensiveClassificationReport({ organizationId }))
      dispatch(fetchOtherInformation({ organizationId }))
      dispatch(fetchSupplementaryInformation({ organizationId }))
    }
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(clearComprehensiveReport())
      dispatch(clearOtherInformation())
      dispatch(clearSupplementaryInformation())  // ADD THIS LINE
    }
  }, [dispatch])

  const activeClassData = useMemo(() => {
    if (!comprehensiveReport) return null
    return comprehensiveReport.classificationReports[activeTab]
  }, [comprehensiveReport, activeTab])

  // Get write-off report data
  const writeOffReport = useMemo((): WriteOffReport | null => {
    if (!comprehensiveReport?.writeOffLoansReport) return null
    return comprehensiveReport.writeOffLoansReport
  }, [comprehensiveReport])

  // Filter loans based on search and date range
  const filteredLoans = useMemo(() => {
    if (!activeClassData) return []

    let filtered = activeClassData.loanDetails.filter(loan =>
      loan.borrowerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply date filter if active
    if (dateFilter.isActive && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate)
      const endDate = new Date(dateFilter.endDate)

      filtered = filtered.filter(loan => {
        const disbursementDate = new Date(loan.disbursementDate)
        return disbursementDate >= startDate && disbursementDate <= endDate
      })
    }

    return filtered
  }, [activeClassData, searchTerm, dateFilter])

  // Filter write-off loans based on search and date range
  const filteredWriteOffLoans = useMemo(() => {
    if (!writeOffReport?.loans) return []

    let filtered = writeOffReport.loans.filter(loan =>
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerNationalId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply date filter if active
    if (dateFilter.isActive && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate)
      const endDate = new Date(dateFilter.endDate)

      filtered = filtered.filter(loan => {
        const disbursementDate = new Date(loan.disbursementDate)
        return disbursementDate >= startDate && disbursementDate <= endDate
      })
    }

    return filtered
  }, [writeOffReport, searchTerm, dateFilter])

  // Prepare data for horizontal bar chart
  const barChartData = useMemo(() => {
    if (!comprehensiveReport) return []

    const classifications = ['normal', 'watch', 'substandard', 'doubtful', 'loss'] as const

    return classifications.map(classKey => {
      const report = comprehensiveReport.classificationReports[classKey]
      return {
        classification: classKey.toUpperCase(),
        loanCount: report.summary.classCount,
        totalOutstanding: report.summary.totalOutstanding,
        provisionsRequired: report.summary.totalProvisionsRequired,
        // Normalize values for better visualization
        normalizedValue: Math.log10(report.summary.totalOutstanding > 0 ? report.summary.totalOutstanding : 1)
      }
    })
  }, [comprehensiveReport])

  // Refresh data
  const refreshData = () => {
    const organizationId = getOrganizationId()
    if (organizationId) {
      dispatch(fetchComprehensiveClassificationReport({ organizationId }))
    }
  }

  // Date filter handlers
  const handleDateFilterApply = () => {
    if (dateFilter.startDate && dateFilter.endDate) {
      setDateFilter(prev => ({ ...prev, isActive: true }))
      setShowDateFilter(false)
    }
  }

  const handleDateFilterClear = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      isActive: false
    })
    setShowDateFilter(false)
  }

  const handleDateFilterToggle = () => {
    setShowDateFilter(prev => !prev)
  }

  // Quick date range presets
  const applyQuickDateRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case 'today':
        startDate = new Date(today)
        endDate = new Date(today)
        break
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7))
        endDate = new Date()
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), quarter * 3, 1)
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0)
        break
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1)
        endDate = new Date(today.getFullYear(), 11, 31)
        break
    }

    setDateFilter({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isActive: true
    })
    setShowDateFilter(false)
  }

  const exportToExcel = () => {
    if (activeView === 'writeoff' && writeOffReport) {
      exportWriteOffToExcel()
    } else if (activeClassData) {
      exportClassificationToExcel()
    }
  }

  const exportClassificationToExcel = () => {
    if (!activeClassData) return

    // Helper function to escape CSV fields
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    // Get organization info
    const orgInfo = getOrganizationInfo()
    const currentDate = new Date().toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Prepare report header with date filter info
    const reportHeader = [
      ['LOAN CLASSIFICATION REPORT'],
      [],
      ['NDFSP Name:', orgInfo.name],
      ['Code of Institution (TIN):', orgInfo.tinNumber],
      ['Reporting Period:', currentDate],
      ['Report Name:', `${activeTab.toUpperCase()} Loans Classification Report`],
      ['Date Filter Applied:', dateFilter.isActive ? 'Yes' : 'No'],
      ...(dateFilter.isActive ? [
        ['Filter Start Date:', dateFilter.startDate],
        ['Filter End Date:', dateFilter.endDate]
      ] : []),
      [],
      ['Generated On:', new Date().toLocaleString('en-RW')],
      ['Total Loans in Report:', filteredLoans.length],
      ['Total Outstanding:', formatCurrency(activeClassData.summary.totalOutstanding)],
      ['Total Provisions Required:', formatCurrency(activeClassData.summary.totalProvisionsRequired)],
      [],
      [] // Empty row before data headers
    ]

    // Prepare headers in the specified order - COMPACT AND CORRECTLY MAPPED
    const dataHeaders = [
      // Basic Information
      'No',
      'Names of Borrowers',
      'Borrower ID',
      'Telephone number',
      'Gender',
      'Age',
      'Marital Status',
      'Relationship with the NDFSP',
      'Previous loans paid on time',

      // Loan Details
      'Purpose of the loan',
      'Branch name',
      'Loan Officer',
      'Disbursed amount',
      'Date of loan disbursement',
      'Agreed Maturity Date',
      'Annual Interest Rate',
      'Interest Method',
      'Loan Status',

      // Repayment Information
      'Total Installments',
      'Paid Installments',
      'Unpaid Installments',
      'Next Payment Due',
      'Last Payment Date',
      'Monthly Installment Amount',
      'Outstanding Principal',
      'Outstanding Balance',

      // Collateral Information
      'Collateral Type',
      'Total Collateral Value',
      'Effective Collateral Value',
      'Collateral Coverage Ratio',

      // Borrower Address
      'District',
      'Sector',
      'Cell',
      'Village',

      // Risk & Classification
      'Days Overdue',
      'Current Classification',
      'Risk Level',
      'Provisioning Rate',
      'Provision Required',

      // Enhanced Provision Details
      'Previous Provisions Held',
      'Current Provision Required',
      'Additional Provisions Needed',
      'Provision Change Status'
    ]

    // Prepare data rows with CORRECT FIELD MAPPINGS from your JSON structure
    const dataRows = filteredLoans.map((loan, index) => {
      const borrower = loan.borrowerInfo || {}
      const address = borrower.address || {}
      const financial = loan.financialMetrics || {}
      const risk = loan.riskAssessment || {}
      const collateral = loan.collateralSummary || {}
      const repayment = loan.repaymentScheduleSummary || {}
      const payment = loan.paymentHistory || {}
      const provision = loan.provisionDetails || {}

      return [
        // Basic Information
        escapeCSV(index + 1),
        escapeCSV(borrower.fullName),
        escapeCSV(borrower.borrowerId),
        escapeCSV(borrower.primaryPhone),
        escapeCSV(borrower.gender),
        escapeCSV(borrower.age),
        escapeCSV(borrower.maritalStatus),
        escapeCSV(borrower.relationshipWithNDFSP),
        escapeCSV(borrower.previousLoansPaidOnTime > 0 ? 'Yes' : 'No'),

        // Loan Details
        escapeCSV(loan.purposeOfLoan),
        escapeCSV(loan.branchName),
        escapeCSV(loan.loanOfficer),
        escapeCSV(loan.disbursedAmount),
        escapeCSV(loan.disbursementDate),
        escapeCSV(loan.agreedMaturityDate),
        escapeCSV(loan.annualInterestRate),
        escapeCSV(loan.interestMethod),
        escapeCSV(loan.status),

        // Repayment Information
        escapeCSV(loan.totalNumberOfInstallments),
        escapeCSV(repayment.paidInstallments),
        escapeCSV(repayment.unpaidInstallments),
        escapeCSV(repayment.nextPaymentDue || 'N/A'),
        escapeCSV(payment.lastPaymentDate || 'N/A'),
        escapeCSV(financial.monthlyInstallmentAmount),
        escapeCSV(financial.outstandingPrincipal),
        escapeCSV(financial.outstandingBalance),

        // Collateral Information
        escapeCSV(collateral.collateralTypes?.join(', ') || 'None'),
        escapeCSV(collateral.totalOriginalValue),
        escapeCSV(collateral.totalEffectiveValue),
        escapeCSV(risk.collateralCoverageRatio),

        // Borrower Address
        escapeCSV(address.district || 'N/A'),
        escapeCSV(address.sector || 'N/A'),
        escapeCSV(address.cell || 'N/A'),
        escapeCSV(address.village || 'N/A'),

        // Risk & Classification
        escapeCSV(risk.daysOverdue),
        escapeCSV(risk.currentClassification),
        escapeCSV(risk.riskLevel),
        escapeCSV(risk.provisioningRate),
        escapeCSV(risk.provisionRequired),

        // Enhanced Provision Details
        escapeCSV(provision.previousProvisionsHeld || 0),
        escapeCSV(provision.currentProvisionRequired || 0),
        escapeCSV(provision.additionalProvisionsNeeded || 0),
        escapeCSV(provision.provisionChangeStatus || 'NO_CHANGE')
      ]
    })

    // Create CSV content with report header and data
    const csvContent = [
      // Report header rows
      ...reportHeader.map(row => row.map(escapeCSV).join(',')),
      // Data headers
      dataHeaders.join(','),
      // Data rows
      ...dataRows.map(row => row.join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${activeTab}_classification_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const exportWriteOffToExcel = () => {
    if (!writeOffReport) return

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const orgInfo = getOrganizationInfo()
    const currentDate = new Date().toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const reportHeader = [
      ['WRITTEN OFF LOANS REPORT'],
      [],
      ['NDFSP Name:', orgInfo.name],
      ['Code of Institution (TIN):', orgInfo.tinNumber],
      ['Reporting Period:', currentDate],
      ['Report Name:', writeOffReport.title],
      ['Criteria:', writeOffReport.criteria],
      ['Date Filter Applied:', dateFilter.isActive ? 'Yes' : 'No'],
      ...(dateFilter.isActive ? [
        ['Filter Start Date:', dateFilter.startDate],
        ['Filter End Date:', dateFilter.endDate]
      ] : []),
      [],
      ['Generated On:', new Date().toLocaleString('en-RW')],
      ['Total Written Off Loans:', writeOffReport.totalLoans],
      ['Total Amount Written Off:', formatCurrency(writeOffReport.totalAmountWrittenOff)],
      ['Total Remaining Balance:', formatCurrency(writeOffReport.totalRemainingBalance)],
      ['Recovery Rate:', `${writeOffReport.summary.recoveryRate.toFixed(2)}%`],
      [],
      []
    ]

    const dataHeaders = [
      'No',
      'Borrower Name',
      'National ID',
      'Telephone',
      'Account Number',
      'Gender',
      'Age',
      'Relationship with NDFSP',
      'Annual Interest Rate',
      'Interest Method',
      'Physical Guarantee',
      'District',
      'Sector',
      'Cell',
      'Village',
      'Disbursement Date',
      'Disbursed Amount',
      'Maturity Date',
      'Amount Repaid',
      'Loan Balance Outstanding',
      'Security Savings',
      'Amount Written Off',
      'Date of Write Off',
      'Recoveries on Written Off',
      'Remaining Balance to Recover',
      'Days in Arrears',
      'Loan Status'
    ]

    const dataRows = filteredWriteOffLoans.map((loan, index) => [
      escapeCSV(index + 1),
      escapeCSV(loan.borrowerName),
      escapeCSV(loan.borrowerNationalId),
      escapeCSV(loan.telephoneNumber),
      escapeCSV(loan.accountNumber),
      escapeCSV(loan.gender),
      escapeCSV(loan.age),
      escapeCSV(loan.relationshipWithNDFSP),
      escapeCSV(loan.annualInterestRate),
      escapeCSV(loan.interestCalculationMethod),
      escapeCSV(loan.physicalGuarantee),
      escapeCSV(loan.district),
      escapeCSV(loan.sector),
      escapeCSV(loan.cell),
      escapeCSV(loan.village),
      escapeCSV(loan.disbursementDate),
      escapeCSV(loan.disbursedAmount),
      escapeCSV(loan.maturityDate),
      escapeCSV(loan.amountRepaid),
      escapeCSV(loan.loanBalanceOutstanding),
      escapeCSV(loan.securitySavings),
      escapeCSV(loan.amountWrittenOff),
      escapeCSV(loan.dateOfWriteOff || 'N/A'),
      escapeCSV(loan.recoveriesOnWrittenOff),
      escapeCSV(loan.remainingBalanceToRecover),
      escapeCSV(loan.daysInArrears),
      escapeCSV(loan.loanStatus)
    ])

    const csvContent = [
      ...reportHeader.map(row => row.map(escapeCSV).join(',')),
      dataHeaders.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `write_off_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Format compact number for chart labels
  const formatCompactNumber = (value: number) => {
    if (value >= 1000000) {
      return `RWF ${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `RWF ${(value / 1000).toFixed(1)}K`
    }
    return `RWF ${value}`
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      performing: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      watch: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Eye },
      substandard: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
      doubtful: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      loss: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      written_off: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Archive }
    }
    const config = configs[status] || configs.performing
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </span>
    )
  }

  // Get risk badge
  const getRiskBadge = (level: string) => {
    const configs: Record<string, any> = {
      LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      MODERATE: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    }
    const config = configs[level] || configs.LOW
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}>
        {level}
      </span>
    )
  }

  // Toggle row expansion
  const toggleRow = (loanId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(loanId)) {
      newExpanded.delete(loanId)
    } else {
      newExpanded.add(loanId)
    }
    setExpandedRows(newExpanded)
  }

  if (isLoadingComprehensive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Classification Intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Failed to load data: {error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!comprehensiveReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No classification data available</p>
        </div>
      </div>
    )
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
    <div className="max-w-[1800px] mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#5B7FA2] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Classification Intelligence Dashboard</h1>
                <p className="text-blue-100 text-sm">
                  {comprehensiveReport.overallSummary.totalPortfolio > 0
                    ? formatCurrency(comprehensiveReport.overallSummary.totalPortfolio)
                    : 'No data'} Portfolio • Health Score: {comprehensiveReport.overallSummary.portfolioHealthScore}%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshData}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveView('table')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeView === 'table'
              ? 'bg-[#5B7FA2] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Loan Classification Table</span>
            </div>
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeView === 'analytics'
              ? 'bg-[#5B7FA2] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Loan Analytics View</span>
            </div>
          </button>
          <button
            onClick={() => setActiveView('writeoff')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeView === 'writeoff'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Archive className="w-4 h-4" />
              <span>Write-Off Report</span>
              {writeOffReport && writeOffReport.totalLoans > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {writeOffReport.totalLoans}
                </span>
              )}
            </div>
          </button>
          {/* Find the View Toggle section and add this button after the writeoff button */}
          <button
            onClick={() => setActiveView('otherinfo')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeView === 'otherinfo'
              ? 'bg-[#5B7FA2] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Other Info</span>
            </div>
          </button>
          {/* Add this button after the "Other Info" button in the View Toggle section */}
          <button
            onClick={() => setActiveView('supplementary')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeView === 'supplementary'
              ? 'bg-[#5B7FA2] text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Supplementary Info</span>
            </div>
          </button>
        </div>
      </div>

      {/* Smart Calendar Filter - Shared across all views */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
            Smart Date Filter
          </h3>
          <div className="flex items-center space-x-2">
            {dateFilter.isActive && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Active Filter: {dateFilter.startDate} to {dateFilter.endDate}
              </span>
            )}
            <button
              onClick={handleDateFilterToggle}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${dateFilter.isActive
                ? 'bg-[#5B7FA2] text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {dateFilter.isActive ? 'Adjust Filter' : 'Add Date Filter'}
            </button>
            {dateFilter.isActive && (
              <button
                onClick={handleDateFilterClear}
                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Panel */}
        {showDateFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Date Range Presets */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Ranges:</p>
              <div className="flex flex-wrap gap-2">
                {(['today', 'week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => applyQuickDateRange(range)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDateFilterClear}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDateFilterApply}
                disabled={!dateFilter.startDate || !dateFilter.endDate}
                className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {dateFilter.isActive && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Date filter active: {dateFilter.startDate} to {dateFilter.endDate}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Showing {activeView === 'writeoff' ? filteredWriteOffLoans.length : filteredLoans.length} records
                  {activeView !== 'writeoff' && ` in ${activeTab} classification`}
                </p>
              </div>
              <button
                onClick={handleDateFilterClear}
                className="text-green-700 hover:text-green-800 text-sm font-medium"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}
      </div>

      {activeView !== 'writeoff' && activeView !== 'otherinfo' && activeView !== 'supplementary' ? (
        <>
          {/* Compact Classification Tabs */}
          <div className="bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
            <div className="flex space-x-0.5 overflow-x-auto">
              {(['normal', 'watch', 'substandard', 'doubtful', 'loss'] as const).map((tab) => {
                const report = comprehensiveReport.classificationReports[tab]
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[110px] px-2 py-1.5 rounded-md font-medium text-xs transition-all ${isActive
                      ? 'bg-[#5B7FA2] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="text-[10px] opacity-75 mb-0.5">{tab.toUpperCase()}</div>
                    <div className="text-sm font-semibold leading-tight">{report.summary.classCount}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{formatCurrency(report.summary.totalOutstanding)}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900">NDFSP Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={organizationInfo.name}>
                    {organizationInfo.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-900">Code of Institution</p>
                  <p className="text-sm font-semibold text-gray-900">{organizationInfo.tinNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-900">Reporting Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-RW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-900">Report Name</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {activeTab}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Export Bar */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by loan ID or borrower..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-[#5B7FA2] hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>

          {activeView === 'table' ? (
            /* Loans Table View */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  {activeTab.toUpperCase()} Loans ({filteredLoans.length})
                  {dateFilter.isActive && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Date Filtered
                    </span>
                  )}
                </h3>
                {activeClassData.movements.summary.netChange !== 0 && (
                  <div className={`flex items-center text-sm ${activeClassData.movements.summary.netChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {activeClassData.movements.summary.netChange > 0 ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(activeClassData.movements.summary.netChange)} net change
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Names of Borrowers</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID of Borrower</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Telephone</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Age</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Relationship with NDFSP</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Marital Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Previous Loans Paid</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Purpose of Loan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Branch Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Collateral Type</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Guarantee Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">District</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Sector</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Cell</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Village</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Annual Interest Rate</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Interest Method</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Loan Officer</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Disbursed Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Disbursement Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Maturity Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Grace Period (Days)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">First Payment Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Last Payment Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Arrears Start Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Cut Off Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Total Installments</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Paid Installments</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Outstanding Installments</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Principal Repaid</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Outstanding Principal</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Eligible Collateral</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Net Amount Due</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Days Overdue</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Provisioning Rate</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Previous Provisions</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Additional Provisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLoans.map((loan, index) => (
                      <React.Fragment key={loan.loanId}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-gray-900">{loan.borrowerInfo.fullName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.nationalId}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.primaryPhone}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 capitalize">{loan.borrowerInfo.gender}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.age}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 capitalize">
                            {loan.borrowerInfo.relationshipWithNDFSP.replace(/_/g, ' ')}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900 capitalize">{loan.borrowerInfo.maritalStatus}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {loan.borrowerInfo.previousLoansPaidOnTime}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.purposeOfLoan}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.branchName}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {loan.collateralSummary.collateralTypes?.join(', ') || 'None'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.collateralSummary.totalEffectiveValue)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.address?.district || 'N/A'}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.address?.sector || 'N/A'}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.address?.cell || 'N/A'}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerInfo.address?.village || 'N/A'}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.annualInterestRate}%</td>
                          <td className="px-3 py-2 text-xs text-gray-900 capitalize">
                            {loan.interestMethod?.replace(/_/g, ' ') || 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.loanOfficer}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.disbursedAmount)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {loan.agreedMaturityDate ? new Date(loan.agreedMaturityDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.gracePeriodMonths * 30}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {loan.repaymentScheduleSummary.nextPaymentDue ?
                              new Date(loan.repaymentScheduleSummary.nextPaymentDue).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {loan.paymentHistory.lastPaymentDate ?
                              new Date(loan.paymentHistory.lastPaymentDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">N/A</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.totalNumberOfInstallments}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.repaymentScheduleSummary.paidInstallments}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.repaymentScheduleSummary.unpaidInstallments}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.paymentHistory.totalPrincipalPaid || 0)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.financialMetrics.outstandingPrincipal)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.collateralSummary.totalEffectiveValue)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.financialMetrics.outstandingPrincipal)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.riskAssessment.daysOverdue}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 capitalize">
                            {loan.riskAssessment.currentClassification}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{loan.riskAssessment.provisioningRate}%</td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.provisionDetails?.previousProvisionsHeld || 0)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatCurrency(loan.provisionDetails?.additionalProvisionsNeeded || 0)}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>

                  {/* DYNAMIC SUMMARY ROW */}
                  {filteredLoans.length > 0 && (
                    <tfoot>
                      <tr className="bg-blue-50 border-t-2 border-blue-600 font-semibold">
                        {/* No */}
                        <td className="px-3 py-3 text-xs text-gray-900 font-bold" colSpan={1}>
                          TOTAL
                        </td>

                        {/* Names of Borrowers - span 10 columns */}
                        <td colSpan={10}></td>

                        {/* Collateral Type */}
                        <td className="px-3 py-2 text-xs text-gray-900"></td>

                        {/* Guarantee Amount (Effective Collateral Value) */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.collateralSummary?.totalEffectiveValue || 0), 0)
                          )}
                        </td>

                        {/* District, Sector, Cell, Village - span 4 columns */}
                        <td colSpan={4}></td>

                        {/* Annual Interest Rate */}
                        <td className="px-3 py-2 text-xs text-gray-900"></td>

                        {/* Interest Method */}
                        <td className="px-3 py-2 text-xs text-gray-900"></td>

                        {/* Loan Officer */}
                        <td className="px-3 py-2 text-xs text-gray-900"></td>

                        {/* Disbursed Amount */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0)
                          )}
                        </td>

                        {/* Disbursement Date, Maturity Date, Grace Period, First Payment Date, Last Payment Date, Arrears Start Date, Cut Off Date - span 7 columns */}
                        <td colSpan={7}></td>

                        {/* Total Installments - LEFT ALIGNED to match data cells */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-left">
                          {filteredLoans.reduce((sum, loan) => sum + (loan.totalNumberOfInstallments || 0), 0)}
                        </td>

                        {/* Paid Installments - LEFT ALIGNED to match data cells */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-left">
                          {filteredLoans.reduce((sum, loan) => sum + (loan.repaymentScheduleSummary?.paidInstallments || 0), 0)}
                        </td>

                        {/* Outstanding Installments - LEFT ALIGNED to match data cells */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-left">
                          {filteredLoans.reduce((sum, loan) => sum + (loan.repaymentScheduleSummary?.unpaidInstallments || 0), 0)}
                        </td>

                        {/* Principal Repaid */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.paymentHistory?.totalPrincipalPaid || 0), 0)
                          )}
                        </td>

                        {/* Outstanding Principal */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.financialMetrics?.outstandingPrincipal || 0), 0)
                          )}
                        </td>

                        {/* Eligible Collateral (Outstanding Balance) */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.financialMetrics?.outstandingBalance || 0), 0)
                          )}
                        </td>

                        {/* Net Amount Due (Outstanding Balance) */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.financialMetrics?.outstandingBalance || 0), 0)
                          )}
                        </td>

                        {/* Days Overdue - LEFT ALIGNED to match data cells */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-left">
                          {Math.round(
                            filteredLoans.reduce((sum, loan) => sum + (loan.riskAssessment?.daysOverdue || 0), 0) / filteredLoans.length
                          )}
                        </td>

                        {/* Class */}
                        <td className="px-3 py-2 text-xs text-gray-900"></td>

                        {/* Provisioning Rate */}
                        <td className="px-3 py-2 text-xs text-gray-900"></td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-left">

                          {/* Previous Provisions Held - RIGHT ALIGNED to match data cells */}
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.provisionDetails?.previousProvisionsHeld || 0), 0)
                          )}
                        </td>

                        {/* Additional Provisions Needed */}
                        <td className="px-3 py-2 text-xs text-gray-900 font-bold text-right">
                          {formatCurrency(
                            filteredLoans.reduce((sum, loan) => sum + (loan.provisionDetails?.additionalProvisionsNeeded || 0), 0)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          ) : (
            /* Loan Analytics View */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                  Loan Portfolio Analytics - {activeTab.toUpperCase()} Classification
                  {dateFilter.isActive && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Date Filtered
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Comparative analysis of loan distribution and dominance across classifications
                </p>
              </div>

              <div className="p-6">
                {/* Horizontal Bar Chart */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Outstanding Balance by Classification
                  </h4>
                  <div className="h-96">
                    <BarChart
                      dataset={barChartData}
                      xAxis={[{
                        label: 'Outstanding Balance (RWF)',
                        scaleType: 'linear',
                      }]}
                      yAxis={[{
                        scaleType: 'band',
                        dataKey: 'classification',
                      }]}
                      series={[{
                        dataKey: 'totalOutstanding',
                        label: 'Outstanding Balance',
                        valueFormatter: (value) => formatCompactNumber(value || 0),
                        color: '#3b82f6',
                      }]}
                      layout="horizontal"
                      grid={{ vertical: true }}
                      borderRadius={6}
                      margin={{ left: 0, right: 20, top: 20, bottom: 50 }}
                      slotProps={{
                        legend: {},
                      }}
                    />
                  </div>
                </div>

                {/* Additional Analytics Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Active Loans</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {activeClassData.summary.classCount}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Total Outstanding</p>
                        <p className="text-xl font-bold text-green-700 mt-1">
                          {formatCurrency(activeClassData.summary.totalOutstanding)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Collateral Coverage</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">
                          {activeClassData.summary.collateralCoverage}%
                        </p>
                      </div>
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Risk Distribution Visualization */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(comprehensiveReport.aggregatedInsights.riskDistribution).map(([riskLevel, percentage]) => (
                      <div key={riskLevel} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 w-24">{riskLevel.toUpperCase()}</span>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${riskLevel === 'normal' ? 'bg-green-500' :
                                riskLevel === 'watch' ? 'bg-yellow-500' :
                                  riskLevel === 'substandard' ? 'bg-orange-500' :
                                    riskLevel === 'doubtful' ? 'bg-red-500' :
                                      'bg-gray-500'
                                }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : activeView === 'writeoff' ? (
        <div>
          <div className="space-y-4">
            {/* Write-Off Report Header */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Archive className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-900">NDFSP Name</p>
                    <p className="text-sm font-semibold text-gray-900 truncate" title={organizationInfo.name}>
                      {organizationInfo.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-900">Code of Institution</p>
                    <p className="text-sm font-semibold text-gray-900">{organizationInfo.tinNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-900">Reporting Period</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-RW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Report Name</p>
                    <p className="text-sm font-semibold text-gray-900">Write-Off Loans</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Write-Off Summary Cards */}
            {writeOffReport && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                      <Archive className="w-5 h-5 text-red-600" />
                    </div>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-gray-600 text-xs font-medium">Total Written Off Loans</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {writeOffReport.totalLoans}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <TrendingDown className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-gray-600 text-xs font-medium">Total Amount Written Off</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(writeOffReport.totalAmountWrittenOff)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <Minus className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-gray-600 text-xs font-medium">Remaining Balance</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(writeOffReport.totalRemainingBalance)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-gray-600 text-xs font-medium">Recovery Rate</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {writeOffReport.summary.recoveryRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}

            {/* Write-Off Report Description */}
            {writeOffReport && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{writeOffReport.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{writeOffReport.description}</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Criteria:</strong> {writeOffReport.criteria}
                    </p>
                  </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600">Average Age</p>
                    <p className="text-lg font-semibold text-gray-900">{writeOffReport.summary.averageAge.toFixed(1)} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600">Average Days in Arrears</p>
                    <p className="text-lg font-semibold text-gray-900">{writeOffReport.summary.averageDaysInArrears} days</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600">Report Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(writeOffReport.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Export Bar for Write-Off */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by borrower name, account number, or national ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Write-Off Loans Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <Archive className="w-4 h-4 mr-2 text-red-600" />
                  Written Off Loans ({filteredWriteOffLoans.length})
                  {dateFilter.isActive && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Date Filtered
                    </span>
                  )}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Borrower Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">National ID</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Telephone</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Account Number</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Age</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Relationship</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">District</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Disbursed Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount Repaid</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Loan Balance</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Security Savings</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount Written Off</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Recoveries</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Remaining Balance</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Days in Arrears</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Write-Off Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWriteOffLoans.map((loan, index) => (
                      <tr key={loan.accountNumber} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-gray-900">{loan.borrowerName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">{loan.borrowerNationalId}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{loan.telephoneNumber}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-mono">{loan.accountNumber}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 capitalize">{loan.gender}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{loan.age}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 capitalize">
                          {loan.relationshipWithNDFSP.replace(/_/g, ' ')}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">{loan.district}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {formatCurrency(loan.disbursedAmount)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {formatCurrency(loan.amountRepaid)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {formatCurrency(loan.loanBalanceOutstanding)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {formatCurrency(loan.securitySavings)}
                        </td>
                        <td className="px-3 py-2 text-xs text-red-600 font-semibold">
                          {formatCurrency(loan.amountWrittenOff)}
                        </td>
                        <td className="px-3 py-2 text-xs text-green-600">
                          {formatCurrency(loan.recoveriesOnWrittenOff)}
                        </td>
                        <td className="px-3 py-2 text-xs text-orange-600 font-semibold">
                          {formatCurrency(loan.remainingBalanceToRecover)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900">{loan.daysInArrears}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">
                          {loan.dateOfWriteOff ? new Date(loan.dateOfWriteOff).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredWriteOffLoans.length === 0 && (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No written off loans found</p>
                    {writeOffReport && writeOffReport.totalLoans > 0 && searchTerm && (
                      <p className="text-gray-400 text-xs mt-2">Try adjusting your search terms</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Write-Off Summary Analytics */}
            {writeOffReport && writeOffReport.totalLoans > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Gender Distribution */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Gender Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(writeOffReport.summary.byGender).map(([gender, count]) => (
                      <div key={gender}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700 capitalize">{gender}</span>
                          <span className="font-semibold text-gray-900">{count} loans</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${(count / writeOffReport.totalLoans) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* District Distribution */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-green-600" />
                    District Distribution
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.entries(writeOffReport.summary.byDistrict)
                      .sort(([, a], [, b]) => b - a)
                      .map(([district, count]) => (
                        <div key={district} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-700 truncate">{district || 'Unknown'}</span>
                          <span className="font-semibold text-gray-900">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeView === 'otherinfo' ? (
        <div className="space-y-4">
          {/* Other Info Header */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900">NDFSP Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={organizationInfo.name}>
                    {organizationInfo.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-900">Code of Institution</p>
                  <p className="text-sm font-semibold text-gray-900">{organizationInfo.tinNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-900">Reporting Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-RW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-900">Report Name</p>
                  <p className="text-sm font-semibold text-gray-900">Other Information</p>
                </div>
              </div>
            </div>
          </div>

          {otherInformation ? (
            <>
              {/* Borrowings Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                    Borrowings
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Shareholders</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{otherInformation.borrowings.shareholders.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(otherInformation.borrowings.shareholders.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Related Parties</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{otherInformation.borrowings.relatedParties.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(otherInformation.borrowings.relatedParties.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Banks</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{otherInformation.borrowings.banks.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(otherInformation.borrowings.banks.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Other Sources</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{otherInformation.borrowings.otherSources.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(otherInformation.borrowings.otherSources.amount)}</td>
                      </tr>
                      <tr className="bg-blue-50 border-t-2 border-blue-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{otherInformation.borrowings.total.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-blue-900">{formatCurrency(otherInformation.borrowings.total.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Women Enterprises, SMEs, Youth Entities - Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Women Enterprises */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-pink-600" />
                      Women Enterprises
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-600">Disbursed Count</p>
                        <p className="text-lg font-bold text-gray-900">{otherInformation.womenEnterprises.disbursedCount.value}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Outstanding Count</p>
                        <p className="text-lg font-bold text-gray-900">{otherInformation.womenEnterprises.outstandingCount.value}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-600">Disbursed Value</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(otherInformation.womenEnterprises.disbursedValue.value)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">Outstanding Value</p>
                        <p className="text-sm font-semibold text-pink-600">{formatCurrency(otherInformation.womenEnterprises.outstandingValue.value)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMEs */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-green-600" />
                      SMEs
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-600">Disbursed Count</p>
                        <p className="text-lg font-bold text-gray-900">{otherInformation.smes.disbursedCount.value}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Outstanding Count</p>
                        <p className="text-lg font-bold text-gray-900">{otherInformation.smes.outstandingCount.value}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-600">Disbursed Value</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(otherInformation.smes.disbursedValue.value)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">Outstanding Value</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(otherInformation.smes.outstandingValue.value)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Youth Entities */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-600" />
                      Youth Entities
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-600">Disbursed Count</p>
                        <p className="text-lg font-bold text-gray-900">{otherInformation.youthEntities.disbursedCount.value}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Outstanding Count</p>
                        <p className="text-lg font-bold text-gray-900">{otherInformation.youthEntities.outstandingCount.value}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-600">Disbursed Value</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(otherInformation.youthEntities.disbursedValue.value)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">Outstanding Value</p>
                        <p className="text-sm font-semibold text-orange-600">{formatCurrency(otherInformation.youthEntities.outstandingValue.value)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Applications */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-purple-600" />
                    Loan Applications
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-1">Applied Count</p>
                    <p className="text-2xl font-bold text-blue-700">{otherInformation.loanApplications.appliedCount.value}</p>
                    <p className="text-xs text-blue-600 mt-2">{formatCurrency(otherInformation.loanApplications.appliedAmount.value)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-xs font-medium text-red-900 mb-1">Rejected Count</p>
                    <p className="text-2xl font-bold text-red-700">{otherInformation.loanApplications.rejectedCount.value}</p>
                    <p className="text-xs text-red-600 mt-2">{formatCurrency(otherInformation.loanApplications.rejectedAmount.value)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-xs font-medium text-green-900 mb-1">Approval Rate</p>
                    <p className="text-2xl font-bold text-green-700">
                      {((otherInformation.loanApplications.appliedCount.value - otherInformation.loanApplications.rejectedCount.value) / otherInformation.loanApplications.appliedCount.value * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 mt-2">Success Rate</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs font-medium text-purple-900 mb-1">Total Applied</p>
                    <p className="text-xl font-bold text-purple-700">{formatCurrency(otherInformation.loanApplications.appliedAmount.value)}</p>
                    <p className="text-xs text-purple-600 mt-2">Amount Requested</p>
                  </div>
                </div>
              </div>

              {/* Staff, Board Members, Shareholders - Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Staff Numbers */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-cyan-600" />
                      Staff Numbers
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Men</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.staffNumbers.men.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Women</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.staffNumbers.women.value}</span>
                      </div>
                      <div className="pt-3 border-t-2 border-cyan-600 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-cyan-700">{otherInformation.staffNumbers.total.value}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Board Members */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                      Board Members
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Men</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.boardMembers.men.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Women</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.boardMembers.women.value}</span>
                      </div>
                      <div className="pt-3 border-t-2 border-indigo-600 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-indigo-700">{otherInformation.boardMembers.total.value}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shareholders */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-green-50">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-teal-600" />
                      Shareholders
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Men</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.shareholders.men.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Women</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.shareholders.women.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Legal Entities</span>
                        <span className="text-lg font-bold text-gray-900">{otherInformation.shareholders.legalEntities.value}</span>
                      </div>
                      <div className="pt-3 border-t-2 border-teal-600 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-teal-700">{otherInformation.shareholders.total.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No other information available</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Supplementary Info Header */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900">NDFSP Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={organizationInfo.name}>
                    {organizationInfo.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-900">Code of Institution</p>
                  <p className="text-sm font-semibold text-gray-900">{organizationInfo.tinNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-900">Report Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {supplementaryInformation?.reportPeriod
                      ? `${supplementaryInformation.reportPeriod.quarter} ${supplementaryInformation.reportPeriod.year}`
                      : new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-900">Report Name</p>
                  <p className="text-sm font-semibold text-gray-900">Supplementary Info</p>
                </div>
              </div>
            </div>
          </div>

          {supplementaryInformation ? (
            <>
              {/* Outstanding Loans - Number by Category */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Outstanding Loans - Number by Category
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Men</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.numberByCategory.men.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.numberByCategory.men.count}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Women</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.numberByCategory.women.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.numberByCategory.women.count}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Groups & Entities</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.numberByCategory.groupsAndEntities.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.numberByCategory.groupsAndEntities.count}</td>
                      </tr>
                      <tr className="bg-blue-50 border-t-2 border-blue-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-blue-900">{supplementaryInformation.outstandingLoans.numberByCategory.total.count}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outstanding Loans - Value by Gender */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Outstanding Loans - Value by Gender
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Men</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueByGender.men.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Women</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueByGender.women.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Groups & Entities</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueByGender.groupsAndEntities.amount)}</td>
                      </tr>
                      <tr className="bg-green-50 border-t-2 border-green-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-green-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueByGender.total.amount)}</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs text-blue-800" colSpan={2}>
                          <span className={`inline-flex items-center ${supplementaryInformation.outstandingLoans.valueByGender.validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
                            {supplementaryInformation.outstandingLoans.valueByGender.validation.isValid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {supplementaryInformation.outstandingLoans.valueByGender.validation.message}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outstanding Loans - Value by Sector */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                    Outstanding Loans - Value by Sector
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sector</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Agriculture</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.valueBySector.agriculture.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueBySector.agriculture.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Public Works</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.valueBySector.publicWorks.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueBySector.publicWorks.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Commerce</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.valueBySector.commerce.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueBySector.commerce.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Transport</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.valueBySector.transport.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueBySector.transport.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Others</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.valueBySector.others.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueBySector.others.amount)}</td>
                      </tr>
                      <tr className="bg-purple-50 border-t-2 border-purple-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-purple-900">{formatCurrency(supplementaryInformation.outstandingLoans.valueBySector.total.amount)}</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs text-blue-800" colSpan={3}>
                          <span className={`inline-flex items-center ${supplementaryInformation.outstandingLoans.valueBySector.validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
                            {supplementaryInformation.outstandingLoans.valueBySector.validation.isValid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {supplementaryInformation.outstandingLoans.valueBySector.validation.message}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outstanding Loans - Classification */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                    Outstanding Loans - Classification
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Classification</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Count</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Current</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.classification.current.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.classification.current.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.current.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Watch</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.classification.watch.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.classification.watch.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.watch.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Substandard</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.classification.substandard.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.classification.substandard.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.substandard.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Doubtful</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.classification.doubtful.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.classification.doubtful.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.doubtful.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Loss</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.classification.loss.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.classification.loss.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.loss.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Restructured</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.outstandingLoans.classification.restructured.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.outstandingLoans.classification.restructured.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.restructured.amount)}</td>
                      </tr>
                      <tr className="bg-orange-50 border-t-2 border-orange-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-900">{supplementaryInformation.outstandingLoans.classification.total.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-900">{formatCurrency(supplementaryInformation.outstandingLoans.classification.total.amount)}</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs text-blue-800" colSpan={4}>
                          <span className={`inline-flex items-center ${supplementaryInformation.outstandingLoans.classification.validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
                            {supplementaryInformation.outstandingLoans.classification.validation.isValid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {supplementaryInformation.outstandingLoans.classification.validation.message}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* New Loans - Number by Category */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-cyan-600" />
                    New Loans - Number by Category
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Men</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.numberByCategory.men.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.newLoans.numberByCategory.men.count}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Women</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.numberByCategory.women.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.newLoans.numberByCategory.women.count}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Groups & Entities</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.numberByCategory.groupsAndEntities.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{supplementaryInformation.newLoans.numberByCategory.groupsAndEntities.count}</td>
                      </tr>
                      <tr className="bg-cyan-50 border-t-2 border-cyan-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-cyan-900">{supplementaryInformation.newLoans.numberByCategory.total.count}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* New Loans - Value by Gender */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-green-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-teal-600" />
                    New Loans - Value by Gender
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Men</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueByGender.men.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueByGender.men.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Women</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueByGender.women.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueByGender.women.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Groups & Entities</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueByGender.groupsAndEntities.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueByGender.groupsAndEntities.amount)}</td>
                      </tr>
                      <tr className="bg-teal-50 border-t-2 border-teal-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-teal-900">{formatCurrency(supplementaryInformation.newLoans.valueByGender.total.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* New Loans - Value by Sector */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <PieChart className="w-4 h-4 mr-2 text-indigo-600" />
                    New Loans - Value by Sector
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sector</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Agriculture</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueBySector.agriculture.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueBySector.agriculture.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Public Works</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueBySector.publicWorks.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueBySector.publicWorks.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Commerce</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueBySector.commerce.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueBySector.commerce.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Transport</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueBySector.transport.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueBySector.transport.amount)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Others</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{supplementaryInformation.newLoans.valueBySector.others.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(supplementaryInformation.newLoans.valueBySector.others.amount)}</td>
                      </tr>
                      <tr className="bg-indigo-50 border-t-2 border-indigo-600">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700"></td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-indigo-900">{formatCurrency(supplementaryInformation.newLoans.valueBySector.total.amount)}</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs text-blue-800" colSpan={3}>
                          <span className={`inline-flex items-center ${supplementaryInformation.newLoans.validation.genderEqualsSector ? 'text-green-700' : 'text-red-700'}`}>
                            {supplementaryInformation.newLoans.validation.genderEqualsSector ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {supplementaryInformation.newLoans.validation.message}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No supplementary information available</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)
}

export default LoanClassificationDashboard
