// @ts-nocheck

"use client"

import type React from "react"
import { motion } from "framer-motion";
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { fetchLoanApplications, fetchLoanPerformanceMetrics, LoanApplication } from "@/lib/features/auth/loanApplicationSlice"
import PaymentProcessingDashboard from "../paymentprocessingDashboard/paymentProcessingDashboard"
import LoanRepaymentSchedulePage from "../pages/LoanRepaymentSchedulePage"
import LoanClassificationDashboard from "../risk/LoanClassificationDashboard"
import { ErrorBoundary } from "@/app/dashboard/client/shared/ErrorBoundary"
import { LoadingSpinner } from "@/app/dashboard/client/shared/LoadingSpinner"
import {
    CreditCard,
    Calendar,
    TrendingUp,
    FileText,
    DollarSign,
    Clock,
    AlertTriangle,
    Users,
    Eye,
    ArrowRight,
    RefreshCw,
    X,
    TrendingDown
} from "lucide-react"
import LoanDetailModal from "../loans/loanDetailModal"
import PaymentForm from "../repayment/PaymentForm"
import EnhancedLoanScheduleModal from "../loans/EnhancedLoanScheduleModal"
import { clearClassificationUpdate } from "@/lib/features/repayment/repaymentTransactionSlice"
import toast from "react-hot-toast"
import { InstallmentSchedule } from "@/lib/features/repayment/scheduleSlice";

// Remove the interface since Next.js page components don't receive props this way
// interface LoanManagementPageProps {
//     loanId?: string
// }

interface PrefetchedFrequencyData {
    repaymentFrequency: string;
    frequencyLabel: string;
    nextInstallmentData: {
        installmentNumber: number;
        amount: number;
        dueDate: string;
        principal: number;
        interest: number;
        frequency: string;
    } | null;
}

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token")
    }
    return null
}

const getOrganizationId = () => {
    if (typeof window !== "undefined") {
        const userString = localStorage.getItem("user")
        const user = userString ? JSON.parse(userString) : null
        return user?.organizationId
    }
    return null
}

// Remove the props parameter since Next.js page components don't receive props
const LoanManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"overview" | "payments" | "schedule" | "classification">("overview")
    const [organizationId, setOrganizationId] = useState<number | null>(null)
    const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const dispatch = useAppDispatch()
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<LoanApplication | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<LoanApplication | null>(null);
    const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
    const [schedulesData, setSchedulesData] = useState<Map<number, InstallmentSchedule[]>>(new Map());
    const [loadingSchedules, setLoadingSchedules] = useState<Set<number>>(new Set())
    const { applications: loanApplications, isLoading, error } = useAppSelector(
        (state) => state.loanApplication
    )
    const { transactions, lastClassificationUpdate } = useAppSelector((state) => state.repaymentTransaction)
    const [loadingMetrics, setLoadingMetrics] = useState<Set<number>>(new Set());
    const [metricsCache, setMetricsCache] = useState<Map<number, any>>(new Map());
    const [frequencyDataCache, setFrequencyDataCache] = useState<Map<number, PrefetchedFrequencyData>>(new Map());

    const preFetchAllFrequencyData = async () => {
        const token = getAuthToken();
        if (!token || !organizationId) return;

        const fetchPromises = loanApplications.map(async (loan) => {
            if (frequencyDataCache.has(loan.id)) return;

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/loan-applications/${loan.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    const loanData = result.data;

                    const getFrequencyLabelFrontend = (frequency: string): string => {
                        const labels: Record<string, string> = {
                            'DAILY': 'Daily Payment',
                            'WEEKLY': 'Weekly Payment',
                            'BIWEEKLY': 'Bi-Weekly Payment',
                            'MONTHLY': 'Monthly Payment',
                            'QUARTERLY': 'Quarterly Payment',
                            'SEMI_ANNUALLY': 'Semi-Annual Payment',
                            'ANNUALLY': 'Annual Payment'
                        };
                        return labels[frequency] || 'Payment';
                    };

                    let nextInstallmentData = null;
                    if (loanData.repaymentSchedules) {
                        const nextSchedule = loanData.repaymentSchedules
                            .filter((s: any) => !s.isPaid)
                            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

                        if (nextSchedule) {
                            nextInstallmentData = {
                                installmentNumber: nextSchedule.installmentNumber,
                                amount: nextSchedule.dueTotal,
                                dueDate: nextSchedule.dueDate,
                                principal: nextSchedule.duePrincipal,
                                interest: nextSchedule.dueInterest,
                                frequency: loanData.repaymentFrequency
                            };
                        }
                    }
                    const frequencyData: PrefetchedFrequencyData = {
                        repaymentFrequency: loanData.repaymentFrequency,
                        frequencyLabel: getFrequencyLabelFrontend(loanData.repaymentFrequency),
                        nextInstallmentData
                    };

                    setFrequencyDataCache(prev => new Map(prev).set(loan.id, frequencyData));
                }
            } catch (error) {
                console.error(`Failed to pre-fetch frequency data for loan ${loan.id}:`, error);
            }
        });

        await Promise.allSettled(fetchPromises);
    };

    useEffect(() => {
        if (lastClassificationUpdate?.wasReclassified) {
            toast.success(
                `Loan reclassified: ${lastClassificationUpdate.previousStatus} → ${lastClassificationUpdate.newStatus}`,
                {
                    duration: 5000,
                    position: 'top-right'
                }
            );
        }
    }, [lastClassificationUpdate]);

    const fetchLoanMetrics = async (loanId: number) => {
        if (metricsCache.has(loanId)) return;

        setLoadingMetrics(prev => new Set(prev).add(loanId));

        try {
            const result = await dispatch(fetchLoanPerformanceMetrics(loanId)).unwrap();
            setMetricsCache(prev => new Map(prev).set(loanId, result.metrics));
        } catch (error) {
            console.error(`Failed to fetch metrics for loan ${loanId}:`, error);
        } finally {
            setLoadingMetrics(prev => {
                const newSet = new Set(prev);
                newSet.delete(loanId);
                return newSet;
            });
        }
    };

    const preFetchAllMetrics = async () => {
        const fetchPromises = loanApplications.map(loan => fetchLoanMetrics(loan.id));
        await Promise.allSettled(fetchPromises);
    };

    useEffect(() => {
        if (loanApplications.length > 0) {
            preFetchAllMetrics();
        }
    }, [loanApplications.length]);

    useEffect(() => {
        const token = getAuthToken();
        const orgId = getOrganizationId();

        if (!orgId || !token) {
            console.error("No organization ID or token found");
            return;
        }

        setOrganizationId(orgId);

        // Initial fetch
        dispatch(fetchLoanApplications({
            page: 1,
            limit: 50
        }));
    }, [dispatch]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && organizationId) {
                dispatch(fetchLoanApplications({
                    page: 1,
                    limit: 50
                }));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [dispatch, organizationId]);

    useEffect(() => {
        if (organizationId) {
            dispatch(fetchLoanApplications({
                page: 1,
                limit: 50
            }))
        }
    }, [dispatch, organizationId])

    useEffect(() => {
        if (organizationId && loanApplications.length > 0) {
            preFetchAllSchedules();
            preFetchAllFrequencyData();
        }
    }, [organizationId, loanApplications]);

    const preFetchAllSchedules = async () => {
        const token = getAuthToken();
        if (!token || !organizationId) return;

        const fetchPromises = loanApplications.map(async (loan) => {
            if (schedulesData.has(loan.id)) return;

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/loans/${loan.id}/schedule`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    setSchedulesData(prev => new Map(prev).set(loan.id, result.data?.schedules || []));
                }
            } catch (error) {
                console.error(`Failed to pre-fetch schedule for loan ${loan.id}:`, error);
            }
        });

        Promise.allSettled(fetchPromises);
    };

    const refreshSchedule = async (loanId: number) => {
        const token = getAuthToken();
        if (!token || !organizationId) return;

        setLoadingSchedules(prev => new Set(prev).add(loanId));

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/schedule`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                setSchedulesData(prev => new Map(prev).set(loanId, result.data?.schedules || []));
            }
        } catch (error) {
            console.error(`Failed to refresh schedule for loan ${loanId}:`, error);
        } finally {
            setLoadingSchedules(prev => {
                const newSet = new Set(prev);
                newSet.delete(loanId);
                return newSet;
            });
        }
    };

    const handleOpenSchedule = (loan: LoanApplication) => {
        setSelectedLoanForSchedule(loan);

        if (!schedulesData.has(loan.id)) {
            refreshSchedule(loan.id);
        }

        setIsScheduleModalOpen(true);
    };

    const tabs = [
        {
            id: "overview" as const,
            label: "Overview",
            icon: FileText,
            description: "All loans and payment overview",
        },
        {
            id: "classification" as const,
            label: "Risk Management",
            icon: TrendingUp,
            description: "Loan classification and provisioning",
        },
    ];

    const handleRefreshLoans = () => {
        if (organizationId) {
            dispatch(fetchLoanApplications({
                page: 1,
                limit: 50
            }))
        }
    }

    const handleSchedulePayment = (installmentId: number, installmentData: any) => {
        setSelectedInstallment(installmentData);
        setIsScheduleModalOpen(false);
        setIsPaymentModalOpen(true);
        setSelectedLoanForPayment(selectedLoanForSchedule);
    };

    const enhancedLoanScheduleModalProps = selectedLoanForSchedule ? {
        isOpen: isScheduleModalOpen,
        onClose: () => {
            setIsScheduleModalOpen(false);
            setSelectedLoanForSchedule(null);
        },
        loanId: selectedLoanForSchedule.id,
        loanData: {
            loanId: selectedLoanForSchedule.loanId,
            borrowerName: `${selectedLoanForSchedule.borrower.firstName} ${selectedLoanForSchedule.borrower.lastName}`,
            disbursedAmount: parseFloat(selectedLoanForSchedule.disbursedAmount.toString()),
            monthlyInstallment: selectedLoanForSchedule.monthlyInstallmentAmount || 0,
            totalInstallments: selectedLoanForSchedule.totalNumberOfInstallments || 0,
            outstandingPrincipal: parseFloat(selectedLoanForSchedule.outstandingPrincipal.toString())
        },
        onMakePayment: handleSchedulePayment,
        preloadedSchedules: schedulesData.get(selectedLoanForSchedule.id) || null,
        onRefresh: () => refreshSchedule(selectedLoanForSchedule.id),
        isLoading: loadingSchedules.has(selectedLoanForSchedule.id)
    } : null;

    const LoanStatCard = ({
        title,
        value,
        icon,
        bgGradient,
        accentColor,
        subtitle,
        isCurrency = false,
    }: {
        title: string;
        value: number;
        icon: React.ReactNode;
        bgGradient: string;
        accentColor: string;
        subtitle?: string;
        isCurrency?: boolean;
    }) => {
        const formattedValue = isCurrency
            ? new Intl.NumberFormat("en-RW", {
                style: "currency",
                currency: "RWF",
                minimumFractionDigits: 0,
            }).format(value)
            : value.toLocaleString();

        return (
            <motion.div
                whileHover={{
                    scale: 1.02,
                    boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
            >
                <div className="overflow-hidden shadow-sm bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 h-[90px] rounded-xl border border-gray-100">
                    <div className="flex items-center h-full relative">
                        <div
                            className={`${bgGradient} p-3 flex items-center justify-center relative overflow-hidden h-full`}
                        >
                            <div
                                className={`absolute inset-0 ${accentColor} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}
                            ></div>
                            <motion.div
                                className="text-white relative z-10"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                {icon}
                            </motion.div>
                        </div>

                        <div className="px-4 flex-1 bg-gradient-to-r from-transparent to-gray-50/30 min-w-0">
                            <p className="text-xs text-gray-600 font-medium mb-1 tracking-wide uppercase truncate">
                                {title}
                            </p>
                            <div className="overflow-x-auto scrollbar-hide">
                                <p className="text-lg font-bold text-gray-800 whitespace-nowrap truncate">
                                    {formattedValue}
                                </p>
                            </div>
                            {subtitle && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderOverviewTab = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3">Loading loan applications...</span>
                </div>
            )
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-800">Error loading loans: {error}</span>
                        <button
                            onClick={handleRefreshLoans}
                            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )
        }

        if (!organizationId) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-yellow-800">No organization ID found. Please ensure you are properly logged in.</span>
                    </div>
                </div>
            )
        }

        const totalLoans = loanApplications.length
        const activeLoans = loanApplications.filter(loan =>
            ['disbursed', 'performing'].includes(loan.status)
        ).length
        const totalDisbursed = loanApplications.reduce((sum, loan) =>
            sum + parseFloat(loan.disbursedAmount.toString()), 0
        )
        const totalOutstanding = loanApplications.reduce((sum, loan) =>
            sum + parseFloat(loan.outstandingPrincipal.toString()), 0
        )

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <LoanStatCard
                        title="Total Loans"
                        value={totalLoans}
                        icon={<Users className="w-5 h-5" />}
                        bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
                        accentColor="bg-blue-400"
                        subtitle="All issued loans"
                    />

                    <LoanStatCard
                        title="Active Loans"
                        value={activeLoans}
                        icon={<TrendingUp className="w-5 h-5" />}
                        bgGradient="bg-gradient-to-br from-green-400 to-green-600"
                        accentColor="bg-green-400"
                        subtitle="Currently performing"
                    />

                    <LoanStatCard
                        title="Total Disbursed"
                        value={totalDisbursed}
                        isCurrency
                        icon={<DollarSign className="w-5 h-5" />}
                        bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
                        accentColor="bg-purple-400"
                        subtitle="Cumulative disbursements"
                    />

                    <LoanStatCard
                        title="Outstanding Balance"
                        value={totalOutstanding}
                        isCurrency
                        icon={<AlertTriangle className="w-5 h-5" />}
                        bgGradient="bg-gradient-to-br from-orange-400 to-orange-600"
                        accentColor="bg-orange-400"
                        subtitle="Remaining repayments"
                    />
                </motion.div>

                {/* NEW: Classification Alert */}
                {lastClassificationUpdate?.wasReclassified && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                        <div className="flex items-start">
                            <TrendingUp className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-blue-900">Recent Classification Update</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Loan status changed from <span className="font-medium">{lastClassificationUpdate.previousStatus}</span>
                                    {' to '}
                                    <span className="font-medium">{lastClassificationUpdate.newStatus}</span>
                                    {' '}
                                    ({lastClassificationUpdate.daysOverdue} days overdue)
                                </p>
                            </div>
                            <button
                                onClick={() => dispatch(clearClassificationUpdate())}
                                className="text-blue-400 hover:text-blue-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Loans Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">All Borrowers in Organization</h3>
                        <button
                            onClick={handleRefreshLoans}
                            className="flex items-center px-3 py-2 text-sm bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Borrower</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Outstanding</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loanApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm">No loan applications found</p>
                                            <p className="text-xs text-gray-400">Loan applications will appear here once created</p>
                                        </td>
                                    </tr>
                                ) : (
                                    loanApplications.map((loan, index) => (
                                        <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-blue-600">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {loan.borrower.firstName} {loan.borrower.lastName}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 text-gray-900 whitespace-nowrap">
                                                {new Intl.NumberFormat('en-RW', {
                                                    style: 'currency',
                                                    currency: 'RWF',
                                                    minimumFractionDigits: 0,
                                                }).format(parseFloat(loan.disbursedAmount.toString()))}
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="text-gray-900 font-medium">
                                                    {new Intl.NumberFormat('en-RW', {
                                                        style: 'currency',
                                                        currency: 'RWF',
                                                        minimumFractionDigits: 0,
                                                    }).format(parseFloat(loan.outstandingPrincipal.toString()))}
                                                </div>
                                                {metricsCache.has(loan.id) && (
                                                    <div className="text-xs text-gray-500">
                                                        {metricsCache.get(loan.id)?.principalRecoveryRate.toFixed(1)}% recovered
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                                                         ${loan.status === 'performing'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : loan.status === 'pending'
                                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                : loan.status === 'disbursed'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                >
                                                    {loan.status}
                                                </span>
                                                {metricsCache.has(loan.id) && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {metricsCache.get(loan.id)?.installmentsPaid} / {metricsCache.get(loan.id)?.totalInstallments} paid
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLoan(loan);
                                                            setIsLoanModalOpen(true);
                                                        }}
                                                        className="flex items-center px-3 py-1 text-xs bg-[#5B7FA2] text-white rounded hover:bg-blue-700"
                                                    >
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenSchedule(loan)}
                                                        className="flex items-center px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                                        disabled={loadingSchedules.has(loan.id)}
                                                    >
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {loadingSchedules.has(loan.id) ? 'Loading...' : 'Schedule'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return renderOverviewTab()
            case "payments":
                // Remove loanId reference since it's no longer available
                return organizationId ? (
                    <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Select a loan from the overview to process payments</p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Organization ID required for payment processing</p>
                    </div>
                )
            case "schedule":
                // Remove loanId reference since it's no longer available
                return organizationId ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Select a loan from the overview to view schedule</p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Organization ID required for schedule viewing</p>
                    </div>
                )
            case "classification":
                return organizationId ? (
                    <LoanClassificationDashboard organizationId={organizationId} />
                ) : (
                    <div className="text-center py-12">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Organization ID required for risk management</p>
                    </div>
                )
            default:
                return renderOverviewTab()
        }
    }

    if (isLoading && loanApplications.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">Loading loan management dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Navigation Tabs */}
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeTab === tab.id
                                                ? "bg-[#5B7FA2] text-white shadow-md"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <div>
                                                <p className="font-medium">{tab.label}</p>
                                                <p className={`text-xs ${activeTab === tab.id ? "text-blue-100" : "text-gray-500"
                                                    }`}>
                                                    {tab.description}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">{renderTabContent()}</div>
                </div>
            </div>

            {isLoanModalOpen && selectedLoan && (
                <LoanDetailModal
                    isOpen={isLoanModalOpen}
                    onClose={() => {
                        setIsLoanModalOpen(false);
                        setSelectedLoan(null);
                    }}
                    loanData={selectedLoan}
                    onProcessPayment={(loanId) => {
                        setIsLoanModalOpen(false);
                        setSelectedLoanForPayment(loanId);
                    }}
                    onEdit={(loanId) => {
                        console.log('Edit loan:', loanId);
                    }}
                />
            )}

            {isPaymentModalOpen && selectedLoanForPayment && (
                <PaymentForm
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedLoanForPayment(null);
                    }}
                    loanId={selectedLoanForPayment.id}
                    loanData={{
                        loanId: selectedLoanForPayment.loanId,
                        borrowerName: `${selectedLoanForPayment.borrower.firstName} ${selectedLoanForPayment.borrower.lastName}`,
                        outstandingPrincipal: parseFloat(selectedLoanForPayment.outstandingPrincipal.toString()),
                        accruedInterest: selectedLoanForPayment.accruedInterestToDate || 0,
                        monthlyInstallment: selectedLoanForPayment.monthlyInstallmentAmount || 0,
                        nextDueDate: selectedLoanForPayment.agreedFirstPaymentDate || '',
                        daysInArrears: selectedLoanForPayment.daysInArrears || 0,
                        status: selectedLoanForPayment.status
                    }}
                    // NEW: Pass prefetched frequency data
                    prefetchedFrequencyData={frequencyDataCache.get(selectedLoanForPayment.id)}
                    onPaymentSuccess={() => {
                        dispatch(fetchLoanApplications({
                            page: 1,
                            limit: 50
                        }));
                        preFetchAllSchedules();
                        preFetchAllFrequencyData(); // Refresh frequency data cache
                    }}
                    onRefreshSchedules={async () => {
                        if (selectedLoanForPayment) {
                            await refreshSchedule(selectedLoanForPayment.id);
                        }
                        preFetchAllSchedules();
                        preFetchAllFrequencyData(); // Refresh frequency data cache
                    }}
                />
            )}
            {enhancedLoanScheduleModalProps && (
                <EnhancedLoanScheduleModal {...enhancedLoanScheduleModalProps} />
            )}
        </ErrorBoundary>
    )
}

export default LoanManagementPage