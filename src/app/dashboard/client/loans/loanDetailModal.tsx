// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from "@/lib/hooks";
import { fetchLoanPerformanceMetrics } from "@/lib/features/auth/loanApplicationSlice";
import { 
  X, 
  User, 
  FileText, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Eye, 
  Receipt,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface PerformanceMetrics {
  totalInstallments: number;
  installmentsPaid: number;
  installmentsOutstanding: number;
  principalRepaid: number;
  balanceOutstanding: number;
  paymentCompletionRate: number;
  principalRecoveryRate: number;
}

interface PaymentFrequencySummary {
  frequency: string;
  label: string;
  amount: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
}

interface FinancialSummary {
  disbursedAmount: number;
  totalInterestAmount: number;
  totalAmountToBeRepaid: number;
  outstandingPrincipal: number;
  accruedInterestToDate: number;
  totalPaid: number;
  remainingBalance: number;
}

interface ScheduleStatus {
  totalScheduled: number;
  paid: number;
  pending: number;
  overdue: number;
  daysInArrears: number;
}

interface LoanApplication {
  id: number;
  loanId: string;
  borrowerId: number;
  purposeOfLoan: string;
  branchName: string;
  loanOfficer: string;
  disbursedAmount: string;
  disbursementDate: string;
  annualInterestRate: string;
  interestMethod: string;
  termInMonths: number;
  agreedMaturityDate: string;
  repaymentFrequency: string;
  gracePeriodMonths: number;
  agreedFirstPaymentDate: string;
  totalNumberOfInstallments: number;
  totalInterestAmount: string;
  totalAmountToBeRepaid: string;
  monthlyInstallmentAmount: string;
  outstandingPrincipal: string;
  accruedInterestToDate: string;
  daysInArrears: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  
  // NEW: Enhanced fields from backend
  periodicInstallmentAmount?: number;
  periodicPaymentLabel?: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  paidInstallments?: number;
  remainingInstallments?: number;
  paymentCompletionRate?: number;
  principalRecoveryRate?: number;
  paymentFrequencySummary?: PaymentFrequencySummary;
  financialSummary?: FinancialSummary;
  scheduleStatus?: ScheduleStatus;
  
  performanceMetrics?: PerformanceMetrics;
  borrower: any;
  collaterals: any[];
  organization: any;
  repaymentSchedules?: any[];
  transactions?: any[];
}

interface LoanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanData: LoanApplication | null;
  onProcessPayment?: (loanId: number) => void;
  onEdit?: (loanId: number) => void;
}

// ============================================================================
// PERFORMANCE METRICS CARD
// ============================================================================

const PerformanceMetricsCard: React.FC<{ 
  metrics: PerformanceMetrics;
  loanId: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}> = ({ metrics, isLoading, onRefresh }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
          Performance Metrics
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center px-2 py-1 text-xs bg-[#5B7FA2] text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Loading metrics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Installments Paid</p>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-bold text-green-600">
                {metrics.installmentsPaid}
              </p>
              <p className="text-xs text-gray-500">
                / {metrics.totalInstallments}
              </p>
            </div>
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${metrics.paymentCompletionRate}%` 
                }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.paymentCompletionRate.toFixed(1)}% Complete
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-yellow-100">
            <p className="text-xs text-gray-600 mb-1">Outstanding</p>
            <p className="text-lg font-bold text-yellow-600">
              {metrics.installmentsOutstanding}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Installments Remaining
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Principal Repaid</p>
            <p className="text-lg font-bold text-blue-600">
              {new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0,
              }).format(metrics.principalRepaid)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.principalRecoveryRate.toFixed(1)}% Recovered
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <p className="text-xs text-gray-600 mb-1">Balance Outstanding</p>
            <p className="text-lg font-bold text-purple-600">
              {new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0,
              }).format(metrics.balanceOutstanding)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total Due
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NEW: PAYMENT FREQUENCY SUMMARY CARD
// ============================================================================

const PaymentFrequencySummaryCard: React.FC<{ summary: PaymentFrequencySummary }> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 p-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
        <Clock className="w-4 h-4 mr-2 text-purple-600" />
        Payment Schedule Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <p className="text-xs text-gray-600 mb-1">Payment Type</p>
          <p className="text-sm font-bold text-purple-600">{summary.label}</p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {summary.frequency} payments
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <p className="text-xs text-gray-600 mb-1">Payment Amount</p>
          <p className="text-sm font-bold text-purple-600">
            {new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
            }).format(summary.amount)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <p className="text-xs text-gray-600 mb-1">Progress</p>
          <p className="text-sm font-bold text-purple-600">
            {summary.paidInstallments} / {summary.totalInstallments}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.remainingInstallments} remaining
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NEW: FINANCIAL SUMMARY CARD
// ============================================================================

const FinancialSummaryCard: React.FC<{ summary: FinancialSummary }> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 p-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
        <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
        Financial Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <p className="text-xs text-gray-600 mb-1">Disbursed</p>
          <p className="text-sm font-bold text-green-600">
            {new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
            }).format(summary.disbursedAmount)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-100">
          <p className="text-xs text-gray-600 mb-1">Total Repayable</p>
          <p className="text-sm font-bold text-green-600">
            {new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
            }).format(summary.totalAmountToBeRepaid)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Total Paid</p>
          <p className="text-sm font-bold text-blue-600">
            {new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
            }).format(summary.totalPaid)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-orange-100">
          <p className="text-xs text-gray-600 mb-1">Remaining</p>
          <p className="text-sm font-bold text-orange-600">
            {new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
            }).format(summary.remainingBalance)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NEW: SCHEDULE STATUS CARD
// ============================================================================

const ScheduleStatusCard: React.FC<{ status: ScheduleStatus }> = ({ status }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 p-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center mb-3">
        <Activity className="w-4 h-4 mr-2 text-indigo-600" />
        Schedule Status
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Total
          </p>
          <p className="text-lg font-bold text-indigo-600">
            {status.totalScheduled}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-100">
          <p className="text-xs text-gray-600 mb-1 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </p>
          <p className="text-lg font-bold text-green-600">
            {status.paid}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-yellow-100">
          <p className="text-xs text-gray-600 mb-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </p>
          <p className="text-lg font-bold text-yellow-600">
            {status.pending}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-red-100">
          <p className="text-xs text-gray-600 mb-1 flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Overdue
          </p>
          <p className="text-lg font-bold text-red-600">
            {status.overdue}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-orange-100">
          <p className="text-xs text-gray-600 mb-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Arrears
          </p>
          <p className="text-lg font-bold text-orange-600">
            {status.daysInArrears}
          </p>
          <p className="text-xs text-gray-500 mt-1">days</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NEW: NEXT PAYMENT ALERT
// ============================================================================

const NextPaymentAlert: React.FC<{ 
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  periodicPaymentLabel?: string;
}> = ({ nextPaymentDate, nextPaymentAmount, periodicPaymentLabel }) => {
  if (!nextPaymentDate || !nextPaymentAmount) return null;

  const daysUntilPayment = Math.ceil((new Date(nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilPayment < 0;
  const isUpcoming = daysUntilPayment >= 0 && daysUntilPayment <= 7;

  return (
    <div className={`rounded-lg border p-4 mt-4 ${
      isOverdue ? 'bg-red-50 border-red-200' : 
      isUpcoming ? 'bg-yellow-50 border-yellow-200' : 
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`rounded-full p-2 mr-3 ${
            isOverdue ? 'bg-red-100' : 
            isUpcoming ? 'bg-yellow-100' : 
            'bg-blue-100'
          }`}>
            <Calendar className={`w-5 h-5 ${
              isOverdue ? 'text-red-600' : 
              isUpcoming ? 'text-yellow-600' : 
              'text-blue-600'
            }`} />
          </div>
          <div>
            <h4 className={`text-sm font-semibold mb-1 ${
              isOverdue ? 'text-red-800' : 
              isUpcoming ? 'text-yellow-800' : 
              'text-blue-800'
            }`}>
              {isOverdue ? 'Payment Overdue!' : isUpcoming ? 'Upcoming Payment' : 'Next Payment'}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {periodicPaymentLabel || 'Payment'} due on {new Date(nextPaymentDate).toLocaleDateString('en-RW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0,
              }).format(nextPaymentAmount)}
            </p>
          </div>
        </div>
        <div className={`text-right ${
          isOverdue ? 'text-red-600' : 
          isUpcoming ? 'text-yellow-600' : 
          'text-blue-600'
        }`}>
          <p className="text-2xl font-bold">
            {Math.abs(daysUntilPayment)}
          </p>
          <p className="text-xs">
            {isOverdue ? 'days overdue' : 'days remaining'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  isOpen,
  onClose,
  loanData,
  onProcessPayment,
  onEdit
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'details' | 'borrower' | 'collateral' | 'schedule'>('details');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [calculatedSchedule, setCalculatedSchedule] = useState<any[]>([]);

  // Fetch performance metrics when modal opens
  useEffect(() => {
    if (isOpen && loanData) {
      loadPerformanceMetrics();
    }
  }, [isOpen, loanData?.id]);

  const loadPerformanceMetrics = async () => {
    if (!loanData) return;

    setIsLoadingMetrics(true);
    setMetricsError(null);

    try {
      const result = await dispatch(fetchLoanPerformanceMetrics(loanData.id)).unwrap();
      setPerformanceMetrics(result.metrics);
    } catch (error: any) {
      console.error('Failed to load performance metrics:', error);
      setMetricsError(error.message || 'Failed to load performance metrics');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (loanData) {
      generateRepaymentSchedule();
    }
  }, [loanData]);

  const generateRepaymentSchedule = () => {
    if (!loanData) return;

    const principal = parseFloat(loanData.disbursedAmount);
    const monthlyRate = parseFloat(loanData.annualInterestRate) / 100 / 12;
    const termMonths = loanData.totalNumberOfInstallments;
    const monthlyInstallment = parseFloat(loanData.monthlyInstallmentAmount);
    const startDate = new Date(loanData.agreedFirstPaymentDate);

    const schedule = [];
    let remainingPrincipal = principal;

    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (i - 1));

      let duePrincipal: number;
      let dueInterest: number;

      if (loanData.interestMethod === 'flat') {
        duePrincipal = principal / termMonths;
        dueInterest = parseFloat(loanData.totalInterestAmount) / termMonths;
      } else {
        dueInterest = remainingPrincipal * monthlyRate;
        duePrincipal = monthlyInstallment - dueInterest;
        remainingPrincipal -= duePrincipal;
      }

      if (i === termMonths) {
        duePrincipal = remainingPrincipal + duePrincipal;
        remainingPrincipal = 0;
      }

      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toLocaleDateString('en-RW'),
        duePrincipal: Math.round(duePrincipal * 100) / 100,
        dueInterest: Math.round(dueInterest * 100) / 100,
        dueTotal: Math.round((duePrincipal + dueInterest) * 100) / 100,
        outstandingPrincipal: Math.round(remainingPrincipal * 100) / 100,
      });
    }

    setCalculatedSchedule(schedule);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
      case 'performing': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateLTVRatio = () => {
    if (!loanData || !loanData.collaterals.length) return 0;
    const loanAmount = parseFloat(loanData.disbursedAmount);
    const collateralValue = parseFloat(loanData.collaterals[0].collateralValue);
    return (loanAmount / collateralValue * 100).toFixed(1);
  };

  if (!isOpen || !loanData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[#5B7FA2]  px-5 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {loanData.purposeOfLoan}
                </h3>
                <p className="text-gray-300 text-xs">
                  {loanData.branchName} • {loanData.periodicPaymentLabel || 'Loan Payment'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loanData.status)}`}>
                {loanData.status.toUpperCase()}
              </span>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          {[
            { id: 'details', label: 'Loan Details', icon: FileText },
            { id: 'borrower', label: 'Borrower', icon: User },
            { id: 'collateral', label: 'Collateral', icon: Shield },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* NEW: Next Payment Alert */}
              <NextPaymentAlert 
                nextPaymentDate={loanData.nextPaymentDate}
                nextPaymentAmount={loanData.nextPaymentAmount}
                periodicPaymentLabel={loanData.periodicPaymentLabel}
              />

              {/* NEW: Payment Frequency Summary */}
              {loanData.paymentFrequencySummary && (
                <PaymentFrequencySummaryCard summary={loanData.paymentFrequencySummary} />
              )}

              {/* Main Loan Information Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Financial Information */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Financial Information
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Disbursed Amount</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.disbursedAmount)}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Total Repayable</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.totalAmountToBeRepaid)}</td>
                    </tr>
                                        <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Interest Amount</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.totalInterestAmount)}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Outstanding Principal</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.outstandingPrincipal)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Monthly Installment</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.monthlyInstallmentAmount)}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Accrued Interest</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.accruedInterestToDate)}</td>
                    </tr>

                    {/* NEW: Enhanced Payment Information */}
                    {loanData.periodicPaymentLabel && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                            Enhanced Payment Information
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-600">Payment Type</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">{loanData.periodicPaymentLabel}</td>
                          <td className="px-3 py-2 font-medium text-gray-600">Payment Amount</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">
                            {formatCurrency(loanData.periodicInstallmentAmount || loanData.monthlyInstallmentAmount)}
                          </td>
                        </tr>
                        {loanData.nextPaymentDate && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-600">Next Payment Date</td>
                            <td className="px-3 py-2 text-gray-900">{formatDate(loanData.nextPaymentDate)}</td>
                            <td className="px-3 py-2 font-medium text-gray-600">Next Payment Amount</td>
                            <td className="px-3 py-2 text-gray-900 font-semibold">
                              {formatCurrency(loanData.nextPaymentAmount || loanData.periodicInstallmentAmount || loanData.monthlyInstallmentAmount)}
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {/* Loan Terms */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Loan Terms
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Interest Rate</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.annualInterestRate}% {loanData.interestMethod}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Term</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.termInMonths} months</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Repayment Frequency</td>
                      <td className="px-3 py-2 text-gray-900 capitalize">{loanData.repaymentFrequency}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Total Installments</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.totalNumberOfInstallments}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Grace Period</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.gracePeriodMonths || 0} months</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Days in Arrears</td>
                      <td className={`px-3 py-2 font-semibold ${loanData.daysInArrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {loanData.daysInArrears} days
                      </td>
                    </tr>

                    {/* NEW: Payment Progress */}
                    {(loanData.paidInstallments !== undefined || loanData.paymentCompletionRate !== undefined) && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                            Payment Progress
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-600">Paid Installments</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">
                            {loanData.paidInstallments || 0} / {loanData.totalNumberOfInstallments}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-600">Remaining Installments</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">
                            {loanData.remainingInstallments || loanData.totalNumberOfInstallments}
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-600">Completion Rate</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">
                            {(loanData.paymentCompletionRate || 0).toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-600">Principal Recovery</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">
                            {(loanData.principalRecoveryRate || 0).toFixed(1)}%
                          </td>
                        </tr>
                      </>
                    )}

                    {/* Timeline */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Timeline
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Disbursement Date</td>
                      <td className="px-3 py-2 text-gray-900">{formatDate(loanData.disbursementDate)}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">First Payment</td>
                      <td className="px-3 py-2 text-gray-900">{formatDate(loanData.agreedFirstPaymentDate)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Maturity Date</td>
                      <td className="px-3 py-2 text-gray-900">{formatDate(loanData.agreedMaturityDate)}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Last Updated</td>
                      <td className="px-3 py-2 text-gray-900">{formatDate(loanData.updatedAt)}</td>
                    </tr>

                    {/* Management */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Management
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Branch</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.branchName}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Loan Officer</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.loanOfficer}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* NEW: Enhanced Summary Cards */}
              {loanData.financialSummary && (
                <FinancialSummaryCard summary={loanData.financialSummary} />
              )}

              {loanData.scheduleStatus && (
                <ScheduleStatusCard status={loanData.scheduleStatus} />
              )}

              {/* Notes */}
              {loanData.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-yellow-800 mb-1">Notes</h4>
                  <p className="text-xs text-yellow-700">{loanData.notes}</p>
                </div>
              )}

              {/* Performance Metrics Section */}
              {metricsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">{metricsError}</span>
                    </div>
                    <button
                      onClick={loadPerformanceMetrics}
                      className="flex items-center px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </button>
                  </div>
                </div>
              ) : performanceMetrics || isLoadingMetrics ? (
                <PerformanceMetricsCard 
                  metrics={performanceMetrics || {
                    totalInstallments: loanData.totalNumberOfInstallments,
                    installmentsPaid: loanData.paidInstallments || 0,
                    installmentsOutstanding: loanData.remainingInstallments || loanData.totalNumberOfInstallments,
                    principalRepaid: parseFloat(loanData.disbursedAmount) - parseFloat(loanData.outstandingPrincipal),
                    balanceOutstanding: parseFloat(loanData.outstandingPrincipal),
                    paymentCompletionRate: loanData.paymentCompletionRate || 0,
                    principalRecoveryRate: loanData.principalRecoveryRate || 0
                  }}
                  loanId={loanData.loanId}
                  isLoading={isLoadingMetrics}
                  onRefresh={loadPerformanceMetrics}
                />
              ) : null}
            </div>
          )}

          {activeTab === 'borrower' && (
            <div className="space-y-4">
              {/* Borrower Information Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Personal Information */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Personal Information
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">First Name</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.firstName}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Last Name</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.lastName}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Middle Name</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.middleName || 'N/A'}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">National ID</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.nationalId}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Gender</td>
                      <td className="px-3 py-2 text-gray-900 capitalize">{loanData.borrower.gender}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Date of Birth</td>
                      <td className="px-3 py-2 text-gray-900">{formatDate(loanData.borrower.dateOfBirth)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Marital Status</td>
                      <td className="px-3 py-2 text-gray-900 capitalize">{loanData.borrower.maritalStatus.replace('_', ' ')}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Relationship</td>
                      <td className="px-3 py-2 text-gray-900 capitalize">{loanData.borrower.relationshipWithNDFSP.replace('_', ' ')}</td>
                    </tr>

                    {/* Contact Information */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Contact Information
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Primary Phone</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.primaryPhone}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Alternative Phone</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.alternativePhone || 'N/A'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Email</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.email || 'N/A'}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Previous Loans Paid</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.previousLoansPaidOnTime}</td>
                    </tr>

                    {/* Address Information */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Address Information
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Country</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.address.country}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Province</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.address.province}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">District</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.address.district}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Sector</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.address.sector}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Cell</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.address.cell}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Village</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.address.village}</td>
                    </tr>

                    {/* Employment & Financial */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                        Employment & Financial
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Occupation</td>
                      <td className="px-3 py-2 text-gray-900">{loanData.borrower.occupation}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Monthly Income</td>
                      <td className="px-3 py-2 text-gray-900">{formatCurrency(loanData.borrower.monthlyIncome)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Income Source</td>
                      <td className="px-3 py-2 text-gray-900 capitalize">{loanData.borrower.incomeSource || 'Not specified'}</td>
                      <td className="px-3 py-2 font-medium text-gray-600"></td>
                      <td className="px-3 py-2 text-gray-900"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Borrower Notes */}
              {loanData.borrower.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-800 mb-1">Borrower Notes</h4>
                  <p className="text-xs text-blue-700">{loanData.borrower.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collateral' && (
            <div className="space-y-4">
              {loanData.collaterals.length > 0 ? (
                loanData.collaterals.map((collateral) => (
                  <div key={collateral.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                            Collateral Summary
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-600">Type</td>
                          <td className="px-3 py-2 text-gray-900 capitalize">{collateral.collateralType} Property</td>
                          <td className="px-3 py-2 font-medium text-gray-600">Value</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(collateral.collateralValue)}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-600">LTV Ratio</td>
                          <td className={`px-3 py-2 font-semibold ${parseFloat(calculateLTVRatio()) > 80 ? 'text-red-600' : 'text-green-600'}`}>
                            {calculateLTVRatio()}%
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-600">Valuation Date</td>
                          <td className="px-3 py-2 text-gray-900">{collateral.valuationDate ? formatDate(collateral.valuationDate) : 'N/A'}</td>
                        </tr>
                        {collateral.guarantorName && (
                          <tr className="bg-gray-50">
                            <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase bg-gray-100">
                              Guarantor Information
                            </td>
                          </tr>
                        )}
                        {collateral.guarantorName && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-600">Name</td>
                            <td className="px-3 py-2 text-gray-900">{collateral.guarantorName}</td>
                            <td className="px-3 py-2 font-medium text-gray-600">Contact</td>
                            <td className="px-3 py-2 text-gray-900">{collateral.guarantorPhone}</td>
                          </tr>
                        )}
                        {collateral.guarantorAddress && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-600">Address</td>
                            <td className="px-3 py-2 text-gray-900" colSpan={3}>{collateral.guarantorAddress}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No collateral registered for this loan</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {/* Current Balance Summary */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-1/4">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Outstanding Principal</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.outstandingPrincipal)}</td>
                      <td className="px-3 py-2 font-medium text-gray-600">Accrued Interest</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(loanData.accruedInterestToDate)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-600">Days in Arrears</td>
                      <td className={`px-3 py-2 font-semibold ${loanData.daysInArrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {loanData.daysInArrears} days
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-600">Next Payment</td>
                      <td className="px-3 py-2 text-gray-900">
                        {loanData.nextPaymentDate ? formatDate(loanData.nextPaymentDate) : formatDate(loanData.agreedFirstPaymentDate)}
                      </td>
                    </tr>
                    
                    {/* NEW: Enhanced Payment Progress */}
                    {(loanData.paidInstallments !== undefined || loanData.paymentCompletionRate !== undefined) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-600">Paid Installments</td>
                        <td className="px-3 py-2 text-gray-900 font-semibold">
                          {loanData.paidInstallments || 0} / {loanData.totalNumberOfInstallments}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-600">Completion Rate</td>
                        <td className="px-3 py-2 text-gray-900 font-semibold">
                          {(loanData.paymentCompletionRate || 0).toFixed(1)}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Repayment Schedule Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase">
                      Repayment Schedule ({loanData.totalNumberOfInstallments} installments)
                    </h3>
                    {loanData.periodicPaymentLabel && (
                      <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded">
                        {loanData.periodicPaymentLabel}: {formatCurrency(loanData.periodicInstallmentAmount || loanData.monthlyInstallmentAmount)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-medium text-gray-600">#</th>
                        <th className="px-2 py-1.5 text-left font-medium text-gray-600">Due Date</th>
                        <th className="px-2 py-1.5 text-right font-medium text-gray-600">Principal</th>
                        <th className="px-2 py-1.5 text-right font-medium text-gray-600">Interest</th>
                        <th className="px-2 py-1.5 text-right font-medium text-gray-600">Total</th>
                        <th className="px-2 py-1.5 text-right font-medium text-gray-600">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {calculatedSchedule.map((item, index) => (
                        <tr key={item.installmentNumber} className={`hover:bg-gray-50 ${index === 0 ? 'bg-blue-50' : ''}`}>
                          <td className="px-2 py-1.5 text-gray-900">{item.installmentNumber}</td>
                          <td className="px-2 py-1.5 text-gray-900">{item.dueDate}</td>
                          <td className="px-2 py-1.5 text-gray-900 text-right">{item.duePrincipal.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-gray-900 text-right">{item.dueInterest.toLocaleString()}</td>
                          <td className="px-2 py-1.5 font-medium text-gray-900 text-right">{item.dueTotal.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-gray-600 text-right">{item.outstandingPrincipal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetailModal;