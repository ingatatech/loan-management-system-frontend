// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { 
  getDelayedDaysReport, 
  performDailyDelayedDaysUpdate,
  clearDelayedDaysReport,
  clearDailyUpdateResult
} from '@/lib/features/repayment/repaymentTransactionSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  FileText,
  Play,
  CheckCircle2,
  Loader2,
  Info,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const DelayedDaysReportPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    delayedDaysReport, 
    dailyUpdateResult, 
    isReportLoading, 
    isDailyUpdateLoading, 
    error 
  } = useAppSelector(state => state.repaymentTransaction);

  const [daysThreshold, setDaysThreshold] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'delayedDays' | 'borrowerName' | 'totalDelayed'>('delayedDays');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterRange, setFilterRange] = useState({ min: 0, max: 1000 });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    // Load initial report
    handleLoadReport();
    
    // Cleanup on unmount
    return () => {
      dispatch(clearDelayedDaysReport());
      dispatch(clearDailyUpdateResult());
    };
  }, []);

  const handleLoadReport = async () => {
    try {
      await dispatch(getDelayedDaysReport({ daysThreshold })).unwrap();
      toast.success('Delayed days report loaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load delayed days report');
    }
  };

  const handleDailyUpdate = async () => {
    try {
      const result = await dispatch(performDailyDelayedDaysUpdate()).unwrap();
      toast.success(`Daily update completed: ${result.data?.updatedSchedules || 0} schedules updated`);
      setShowUpdateModal(false);
      // Reload report after update
      handleLoadReport();
    } catch (error: any) {
      toast.error(error.message || 'Failed to perform daily update');
    }
  };

  const handleThresholdChange = (newThreshold: number) => {
    setDaysThreshold(newThreshold);
  };

  const handleApplyThreshold = () => {
    handleLoadReport();
  };

  // Filter and sort loan data
  const getFilteredAndSortedLoans = () => {
    if (!delayedDaysReport?.loanDetails) return [];

    let filtered = delayedDaysReport.loanDetails.filter(loan => {
      const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loan.loanId.toLowerCase().includes(searchTerm.toLowerCase());
      const withinRange = loan.maxDelayedDays >= filterRange.min && 
                         loan.maxDelayedDays <= filterRange.max;
      return matchesSearch && withinRange;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'borrowerName':
          aValue = a.borrowerName;
          bValue = b.borrowerName;
          break;
        case 'totalDelayed':
          aValue = a.totalDelayedDays;
          bValue = b.totalDelayedDays;
          break;
        case 'delayedDays':
        default:
          aValue = a.maxDelayedDays;
          bValue = b.maxDelayedDays;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getDaysColorClass = (days: number) => {
    if (days === 0) return 'text-green-600 bg-green-100';
    if (days <= 30) return 'text-yellow-600 bg-yellow-100';
    if (days <= 90) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (days: number) => {
    if (days === 0) return { label: 'On Time', class: 'bg-green-100 text-green-800' };
    if (days <= 30) return { label: 'Watch', class: 'bg-yellow-100 text-yellow-800' };
    if (days <= 90) return { label: 'Substandard', class: 'bg-orange-100 text-orange-800' };
    return { label: 'Critical', class: 'bg-red-100 text-red-800' };
  };

  const exportReport = () => {
    if (!delayedDaysReport) return;
    
    const csvData = [
      ['Loan ID', 'Borrower Name', 'Max Delayed Days', 'Total Delayed Days', 'Installments with Delays', 'Status'],
      ...getFilteredAndSortedLoans().map(loan => [
        loan.loanId,
        loan.borrowerName,
        loan.maxDelayedDays,
        loan.totalDelayedDays,
        loan.installmentsWithDelays,
        getStatusBadge(loan.maxDelayedDays).label
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delayed-days-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  const ReportSummaryCards = () => {
    if (!delayedDaysReport) return null;

    const { reportSummary } = delayedDaysReport;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Loans with Delays</p>
              <p className="text-3xl font-bold text-gray-900">{reportSummary.totalLoansWithDelays}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Delayed Days</p>
              <p className="text-3xl font-bold text-gray-900">{reportSummary.totalDelayedDays}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Delayed Days</p>
              <p className="text-3xl font-bold text-gray-900">{reportSummary.averageDelayedDaysPerLoan}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Report Date</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(reportSummary.reportDate).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const DailyUpdateModal = () => (
    <AnimatePresence>
      {showUpdateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowUpdateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Daily Delayed Days Update</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                This will update delayed days for all overdue installments based on current date. 
                This process typically runs automatically each day.
              </p>
              
              {dailyUpdateResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-green-800 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Last update: {dailyUpdateResult.updatedSchedules} schedules updated, 
                    {dailyUpdateResult.totalDelayedDaysAdded} delayed days added
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDailyUpdate}
                disabled={isDailyUpdateLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isDailyUpdateLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Update
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const LoanDetailModal = () => {
    const loan = delayedDaysReport?.loanDetails.find(l => l.loanId === expandedLoan);
    if (!loan) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setExpandedLoan(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{loan.borrowerName}</h3>
                <p className="text-blue-100">Loan ID: {loan.loanId}</p>
              </div>
              <button
                onClick={() => setExpandedLoan(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Max Delayed Days</p>
                  <p className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getDaysColorClass(loan.maxDelayedDays)}`}>
                    {loan.maxDelayedDays}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Delayed Days</p>
                  <p className="text-2xl font-bold text-gray-900">{loan.totalDelayedDays}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Affected Installments</p>
                  <p className="text-2xl font-bold text-gray-900">{loan.installmentsWithDelays}</p>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Installment Details</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loan.schedules.map(schedule => (
                  <div
                    key={schedule.installmentNumber}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getDaysColorClass(schedule.delayedDays)}`}>
                        {schedule.installmentNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Due: {new Date(schedule.dueDate).toLocaleDateString()}
                        </p>
                        {schedule.actualPaymentDate && (
                          <p className="text-sm text-gray-600">
                            Paid: {new Date(schedule.actualPaymentDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${getDaysColorClass(schedule.delayedDays)}`}>
                        {schedule.delayedDays} days
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(schedule.delayedDays).class}`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Clock className="w-8 h-8 mr-3 text-blue-600" />
                Delayed Days Report
              </h1>
              <p className="text-gray-600 mt-1">Monitor and track payment delays across your loan portfolio</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUpdateModal(true)}
                disabled={isDailyUpdateLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isDailyUpdateLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Daily Update
              </button>
              
              <button
                onClick={exportReport}
                disabled={!delayedDaysReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Threshold
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={daysThreshold}
                  onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                <button
                  onClick={handleApplyThreshold}
                  disabled={isReportLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search loans..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="delayedDays-desc">Max Delayed Days (High to Low)</option>
                <option value="delayedDays-asc">Max Delayed Days (Low to High)</option>
                <option value="totalDelayed-desc">Total Delayed Days (High to Low)</option>
                <option value="totalDelayed-asc">Total Delayed Days (Low to High)</option>
                <option value="borrowerName-asc">Borrower Name (A-Z)</option>
                <option value="borrowerName-desc">Borrower Name (Z-A)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'cards' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isReportLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading delayed days report...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Report Content */}
        {delayedDaysReport && !isReportLoading && (
          <>
            <ReportSummaryCards />
            
            {/* Loans List */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Loans with Delayed Days ({getFilteredAndSortedLoans().length})
                </h2>
              </div>
              
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Loan Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Max Delayed Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Delayed Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Installments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredAndSortedLoans().map((loan) => (
                        <motion.tr
                          key={loan.loanId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{loan.borrowerName}</p>
                              <p className="text-sm text-gray-600">{loan.loanId}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getDaysColorClass(loan.maxDelayedDays)}`}>
                              {loan.maxDelayedDays} days
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {loan.totalDelayedDays} days
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">
                              {loan.installmentsWithDelays} installments
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(loan.maxDelayedDays).class}`}>
                              {getStatusBadge(loan.maxDelayedDays).label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setExpandedLoan(loan.loanId)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredAndSortedLoans().map((loan) => (
                    <motion.div
                      key={loan.loanId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{loan.borrowerName}</h3>
                          <p className="text-sm text-gray-600">{loan.loanId}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(loan.maxDelayedDays).class}`}>
                          {getStatusBadge(loan.maxDelayedDays).label}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Max Delayed Days:</span>
                          <span className={`text-sm font-bold px-2 py-1 rounded ${getDaysColorClass(loan.maxDelayedDays)}`}>
                            {loan.maxDelayedDays}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Delayed Days:</span>
                          <span className="text-sm font-medium">{loan.totalDelayedDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Affected Installments:</span>
                          <span className="text-sm font-medium">{loan.installmentsWithDelays}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setExpandedLoan(loan.loanId)}
                        className="w-full text-center py-2 text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {getFilteredAndSortedLoans().length === 0 && (
                <div className="p-12 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No loans found with the current filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}
      <DailyUpdateModal />
      <LoanDetailModal />
    </div>
  );
};

export default DelayedDaysReportPage;