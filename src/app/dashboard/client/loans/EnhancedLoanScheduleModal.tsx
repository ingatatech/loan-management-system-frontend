import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    CreditCard,
    Download,
    Search,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Loader2,
    RefreshCw
} from 'lucide-react';

interface LoanScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    loanId: number;
    loanData: {
        loanId: string;
        borrowerName: string;
        disbursedAmount: number;
        monthlyInstallment: number;
        totalInstallments: number;
        outstandingPrincipal: number;
    };
    onMakePayment: (installmentId: number, installmentData: any) => void;
    preloadedSchedules?: InstallmentSchedule[] | null;
    onRefresh?: () => Promise<void>; 
    isLoading?: boolean;
    refreshTrigger?: number;
}

interface InstallmentSchedule {
    id: number;
    installmentNumber: number;
    dueDate: string;
    duePrincipal: number;
    dueInterest: number;
    dueTotal: number;
    paidPrincipal: number;
    paidInterest: number;
    paidTotal: number;
    outstandingPrincipal: number;
    isPaid: boolean;
    paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue'
    delayedDays: number;
    actualPaymentDate?: string;
    paidTimestamp?: string;
    remainingAmount: number;
    lastPaymentAttempt?: string;
    paymentAttemptCount?: number;
}

export default function EnhancedLoanScheduleModal({
    isOpen,
    onClose,
    loanId,
    loanData,
    onMakePayment,
    preloadedSchedules = null,
    onRefresh,
    refreshTrigger = 0 // NEW: Refresh trigger
}: LoanScheduleModalProps) {
    const [schedules, setSchedules] = useState<InstallmentSchedule[]>([]);
    const [filteredSchedules, setFilteredSchedules] = useState<InstallmentSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // NEW: Effect to refresh when trigger changes
    useEffect(() => {
        if (isOpen && refreshTrigger > 0) {
            handleManualRefresh();
        }
    }, [refreshTrigger, isOpen]);

    useEffect(() => {
        if (isOpen && loanId) {
            if (preloadedSchedules) {
                setSchedules(preloadedSchedules);
                setError(null);
            } else {
                fetchSchedules();
            }
        }
    }, [isOpen, loanId, preloadedSchedules]);

    // NEW: Enhanced manual refresh with async support
    const handleManualRefresh = async () => {
        if (onRefresh) {
            try {
                setIsLoading(true);
                await onRefresh();
                // If onRefresh doesn't update schedules, fetch them
                if (!preloadedSchedules) {
                    await fetchSchedules();
                }
            } catch (error) {
                console.error('Failed to refresh schedules:', error);
                setError('Failed to refresh schedules');
            } finally {
                setIsLoading(false);
            }
        } else {
            fetchSchedules();
        }
    };

    useEffect(() => {
        applyFilters();
    }, [schedules, filterStatus, searchTerm]);

    const fetchSchedules = async () => {
        if (!preloadedSchedules) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const orgId = user?.organizationId;

            if (!orgId) {
                throw new Error('No organization ID found');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${orgId}/loans/${loanId}/schedule`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch repayment schedule');
            }

            const result = await response.json();
            setSchedules(result.data?.schedules || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const showLoading = isLoading || (isLoading && !preloadedSchedules);

    const applyFilters = () => {
        let filtered = [...schedules];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(schedule => {
                if (filterStatus === 'paid') return schedule.isPaid;
                if (filterStatus === 'unpaid') return !schedule.isPaid && schedule.paymentStatus !== 'overdue';
                if (filterStatus === 'overdue') return schedule.paymentStatus === 'overdue';
                return true;
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(schedule =>
                schedule.installmentNumber.toString().includes(searchTerm) ||
                schedule.dueDate.includes(searchTerm)
            );
        }

        setFilteredSchedules(filtered);
    };

    const toggleRowExpansion = (installmentNumber: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(installmentNumber)) {
            newExpanded.delete(installmentNumber);
        } else {
            newExpanded.add(installmentNumber);
        }
        setExpandedRows(newExpanded);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return <CheckCircle2 className="w-3 h-3 text-green-600" />;
            case 'overdue':
                return <AlertCircle className="w-3 h-3 text-red-600" />;
            case 'partial':
                return <Clock className="w-3 h-3 text-yellow-600" />;
            default:
                return <Calendar className="w-3 h-3 text-gray-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-RW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const canMakePayment = (schedule: InstallmentSchedule): boolean => {
        if (schedule.isPaid) return false;

        if (schedule.lastPaymentAttempt) {
            const lastAttempt = new Date(schedule.lastPaymentAttempt);
            const now = new Date();
            const diffMinutes = (now.getTime() - lastAttempt.getTime()) / (1000 * 60);
            if (diffMinutes < 1) return false;
        }

        return true;
    };

    const exportSchedule = () => {
        const csvContent = [
            ['#', 'Due Date', 'Principal', 'Interest', 'Total', 'Status', 'Paid', 'Balance', 'Delayed Days'],
            ...filteredSchedules.map(s => [
                s.installmentNumber,
                formatDate(s.dueDate),
                s.duePrincipal.toFixed(2),
                s.dueInterest.toFixed(2),
                s.dueTotal.toFixed(2),
                s.paymentStatus,
                s.paidTotal.toFixed(2),
                s.remainingAmount.toFixed(2),
                s.delayedDays
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan_schedule_${loanData.loanId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Calculate summary from actual schedule data
    const summary = {
        totalScheduled: schedules.reduce((sum, s) => sum + parseFloat(String(s.dueTotal || 0)), 0),
        totalPaid: schedules.reduce((sum, s) => sum + parseFloat(String(s.paidTotal || 0)), 0),
        totalRemaining: schedules.reduce((sum, s) => sum + parseFloat(String(s.remainingAmount || s.dueTotal - s.paidTotal || 0)), 0),
        paidCount: schedules.filter(s => s.isPaid).length,
        overdueCount: schedules.filter(s => s.paymentStatus === 'overdue').length,
        totalDelayedDays: schedules.reduce((sum, s) => sum + (s.delayedDays || 0), 0)
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[96vh] overflow-hidden flex flex-col"
                >
                    {/* Compact Header */}
                    <div className="bg-[#5B7FA2] px-4 py-2.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Repayment Scheduleg
                                </h2>
                                <p className="text-blue-100 text-xs mt-0.5">
                                    {loanData.borrowerName} - {loanData.loanId}
                                </p>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={showLoading}
                                    className="flex items-center px-2 py-1 text-xs bg-white/20 text-white rounded hover:bg-white/30 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 mr-1 ${showLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:bg-white/20 rounded p-1 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Compact Summary Cards */}
                        <div className="grid grid-cols-5 gap-2 mt-2">
                            <div className="bg-white/10 rounded px-2 py-1.5">
                                <p className="text-blue-100 text-[10px]">Scheduled</p>
                                <p className="text-white font-bold text-xs">{formatCurrency(summary.totalScheduled)}</p>
                            </div>
                            <div className="bg-white/10 rounded px-2 py-1.5">
                                <p className="text-blue-100 text-[10px]">Paid</p>
                                <p className="text-white font-bold text-xs">{formatCurrency(summary.totalPaid)}</p>
                            </div>
                            <div className="bg-white/10 rounded px-2 py-1.5">
                                <p className="text-blue-100 text-[10px]">Remaining</p>
                                <p className="text-white font-bold text-xs">{formatCurrency(summary.totalRemaining)}</p>
                            </div>
                            <div className="bg-white/10 rounded px-2 py-1.5">
                                <p className="text-blue-100 text-[10px]">Progress</p>
                                <p className="text-white font-bold text-xs">{summary.paidCount}/{schedules.length}</p>
                            </div>
                            <div className="bg-white/10 rounded px-2 py-1.5">
                                <p className="text-blue-100 text-[10px]">Delayed</p>
                                <p className="text-white font-bold text-xs">{summary.totalDelayedDays}d</p>
                            </div>
                        </div>
                    </div>

                    {/* Compact Filters */}
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                        <div className="flex gap-2 items-center justify-between">
                            <div className="flex gap-1.5">
                                {['all', 'paid', 'unpaid', 'overdue'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterStatus === status
                                            ? 'bg-[#5B7FA2] text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1.5">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-40 pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={exportSchedule}
                                    className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Compact Table */}
                    <div className="flex-1 overflow-auto p-3">
                        {showLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                <span className="ml-2 text-sm text-gray-600">Loading...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <div className="flex items-center">
                                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                                    <span className="text-sm text-red-800">{error}</span>
                                </div>
                            </div>
                        ) : filteredSchedules.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No installments found</p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {filteredSchedules.map((schedule) => (
                                    <div key={schedule.id} className="bg-white border border-gray-300 rounded overflow-hidden hover:shadow transition-shadow">
                                        <div className="p-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                                        <span className="text-blue-600 font-bold text-xs">#{schedule.installmentNumber}</span>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-4 gap-3 text-xs">
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Due Date</p>
                                                            <p className="font-medium text-gray-900">{formatDate(schedule.dueDate)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Amount</p>
                                                            <p className="font-medium text-gray-900">{formatCurrency(schedule.dueTotal)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Status</p>
                                                            <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(schedule.paymentStatus)}`}>
                                                                {getStatusIcon(schedule.paymentStatus)}
                                                                <span className="ml-0.5">{schedule.paymentStatus}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Delayed</p>
                                                            <p className={`font-medium ${schedule.delayedDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                {schedule.delayedDays}d {schedule.delayedDays === 0 && '✓'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-1.5 ml-3">
                                                    {!schedule.isPaid && canMakePayment(schedule) && (
                                                        <button
                                                            onClick={() => onMakePayment(schedule.id, schedule)}
                                                            className="flex items-center px-2.5 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                        >
                                                            <CreditCard className="w-3 h-3 mr-1" />
                                                            Pay
                                                        </button>
                                                    )}
                                                    {!schedule.isPaid && !canMakePayment(schedule) && (
                                                        <div className="flex items-center px-2.5 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Wait
                                                        </div>
                                                    )}
                                                    {schedule.isPaid && (
                                                        <div className="flex items-center px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Paid
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => toggleRowExpansion(schedule.installmentNumber)}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        {expandedRows.has(schedule.installmentNumber) ? (
                                                            <ChevronUp className="w-4 h-4 text-gray-600" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {expandedRows.has(schedule.installmentNumber) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="mt-2 pt-2 border-t border-gray-300"
                                                    >
                                                        <div className="grid grid-cols-4 gap-3 text-xs">
                                                            <div>
                                                                <p className="text-gray-500 text-[10px]">Principal</p>
                                                                <p className="font-medium">{formatCurrency(schedule.duePrincipal)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 text-[10px]">Interest</p>
                                                                <p className="font-medium">{formatCurrency(schedule.dueInterest)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 text-[10px]">Paid</p>
                                                                <p className="font-medium text-green-600">{formatCurrency(schedule.paidTotal)}</p>
                                                            </div>
                                                            <div>

                                                                <p className="text-gray-500 text-[10px]">Balance</p>

                                                                <p className="font-medium text-orange-600">
                                                                    {formatCurrency(
                                                                        schedule.remainingAmount ||
                                                                        (parseFloat(String(schedule.dueTotal)) - parseFloat(String(schedule.paidTotal)))
                                                                    )}
                                                                </p>

                                                            </div>
                                                        </div>

                                                        {schedule.delayedDays > 0 && (
                                                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                                                                <div className="flex items-start">
                                                                    <AlertTriangle className="w-3 h-3 text-orange-600 mr-1.5 flex-shrink-0 mt-0.5" />
                                                                    <div className="text-xs">
                                                                        <p className="font-medium text-orange-800">Overdue by {schedule.delayedDays} days</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Compact Footer */}
                    {summary.overdueCount > 0 && (
                        <div className="bg-red-50 border-t border-red-200 px-4 py-2">
                            <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                                <p className="text-xs text-red-800">
                                    <span className="font-medium">{summary.overdueCount} overdue</span> ({summary.totalDelayedDays} days total)
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}