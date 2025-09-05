
"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Eye,
    Calendar,
    DollarSign,
    User,
    Building2,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    X,
    Clock,
    FileText,
    Phone,
    Shield,
    MapPin,
    BadgeCheck,
    FileCheck,
    GitBranch,
    Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    fetchPendingLoanApplications,
    fetchRejectedLoanApplications,
    approveLoanApplication,
    rejectLoanApplication,
    clearPendingLoans,
    clearRejectedLoans
} from '@/lib/features/auth/loanApplicationSlice';
import { ApproveLoanModal, RejectLoanModal } from './ApproveLoanModal';
import type { AppDispatch, RootState } from '@/lib/store';
import { MessageSquare, MessageCircle } from 'lucide-react';
import { LoanReviewModal } from './LoanReviewModal';
import { fetchLoanReviews } from '@/lib/features/auth/loanApplicationSlice';
import { WorkflowHistoryModal } from '@/components/workflow/WorkflowHistoryModal';
import { SelectReviewerModal, ForwardLoanModal } from '@/components/workflow/ForwardLoanModal';
import { addReviewWithWorkflow, clearForwardSuccess, getWorkflowHistory, startLoanReview } from '@/lib/features/workflow/workflowSlice';


const PendingLoansManagementPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { pendingLoans, rejectedLoans, isLoading, error, pagination } = useSelector(
        (state: RootState) => state.loanApplication
    );

    const [activeTab, setActiveTab] = useState<'pending' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [reviewCounts, setReviewCounts] = useState<Record<number, number>>({});
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isWorkflowHistoryModalOpen, setIsWorkflowHistoryModalOpen] = useState(false);
    const [isSelectReviewerModalOpen, setIsSelectReviewerModalOpen] = useState(false);
    const { forwardSuccess } = useSelector((state: RootState) => state.workflow);
    const { user } = useSelector((state: RootState) => state.auth);
    const [workflowHistories, setWorkflowHistories] = useState<Record<number, any>>({});
    const [loadingWorkflowHistory, setLoadingWorkflowHistory] = useState<Record<number, boolean>>({});

    const loadWorkflowHistory = async (loanId: number) => {
        // If already loaded or loading, return
        if (workflowHistories[loanId] || loadingWorkflowHistory[loanId]) {
            return;
        }

        // If not in cache, load it
        if (user?.organizationId) {
            setLoadingWorkflowHistory(prev => ({ ...prev, [loanId]: true }));
            try {
                const result = await dispatch(
                    getWorkflowHistory({ organizationId: user.organizationId, loanId })
                ).unwrap();

                if (result.data) {
                    setWorkflowHistories(prev => ({
                        ...prev,
                        [loanId]: result.data
                    }));
                }
            } catch (error) {
                console.error('Error loading workflow history:', error);
            } finally {
                setLoadingWorkflowHistory(prev => ({ ...prev, [loanId]: false }));
            }
        }
    };


    // ✅ FIXED: Use correct role values
    const isLoanOfficer = user?.role === 'loan_officer';
    const isBoardDirector = user?.role === 'board_director';
    const isSeniorManager = user?.role === 'senior_manager';
    const isManagingDirector = user?.role === 'managing_director';
    const isClient = user?.role === 'client';

    // Group management roles for convenience
    const isManager = isBoardDirector || isSeniorManager || isManagingDirector;

    // Get workflow status display
    const getWorkflowStatus = (loan: any) => {
        if (!loan.workflowStatus) return 'Unassigned';
        if (loan.currentStep) {
            return `With ${loan.assignedTo?.name || 'Reviewer'}`;
        }
        return loan.workflowStatus;
    };

    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    const loadReviewCounts = async (loans: any[]) => {
        const counts: Record<number, number> = {};
        for (const loan of loans) {
            try {
                const result = await dispatch(fetchLoanReviews(loan.id)).unwrap();
                counts[loan.id] = result.data?.totalReviews || 0;
            } catch (error) {
                counts[loan.id] = 0;
            }
        }
        setReviewCounts(counts);
    };

    const openReviewModal = (loan: any) => {
        setSelectedLoan(loan);
        setIsReviewModalOpen(true);
    };

    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        loanOfficer: '',
        branch: '',
        sortBy: 'createdAt_desc'
    });

    useEffect(() => {
        loadLoans();
    }, []);

    useEffect(() => {
        if (forwardSuccess) {
            toast.success('Loan forwarded successfully!');
            loadLoans();
            dispatch(clearForwardSuccess());
        }
    }, [forwardSuccess]);

    // Fetch both pending and rejected loans on component mount (only once)
    useEffect(() => {
        // Initial fetch for both tabs
        dispatch(
            fetchPendingLoanApplications({
                page: 1,
                limit: 100, // Fetch more items initially
                search: '',
                statusFilter: 'pending'
            })
        );

        dispatch(
            fetchRejectedLoanApplications({
                page: 1,
                limit: 100, // Fetch more items initially
                search: ''
            })
        );

        // Cleanup on unmount
        return () => {
            dispatch(clearPendingLoans());
            dispatch(clearRejectedLoans());
        };
    }, [dispatch]); // Only run once on mount

    // Manual refresh function
    const loadLoans = () => {
        if (activeTab === 'pending') {
            dispatch(
                fetchPendingLoanApplications({
                    page: 1,
                    limit: 100,
                    search: '',
                    statusFilter: 'pending'
                })
            );
        } else {
            dispatch(
                fetchRejectedLoanApplications({
                    page: 1,
                    limit: 100,
                    search: ''
                })
            );
        }
        // Reset to first page after refresh
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleApprove = async (approvalData: any) => {
        try {
            await dispatch(
                approveLoanApplication({
                    loanId: selectedLoan.id,
                    approvalData,
                })
            ).unwrap();

            toast.success('Loan approved successfully!');
            setIsApproveModalOpen(false);
            setSelectedLoan(null);
            loadLoans();
        } catch (error: any) {
            toast.error(error || 'Failed to approve loan');
        }
    };

    const handleReject = async (rejectionData: any) => {
        try {
            await dispatch(
                rejectLoanApplication({
                    loanId: selectedLoan.id,
                    rejectionData
                })
            ).unwrap();

            toast.success('Loan rejected successfully');
            setIsRejectModalOpen(false);
            setSelectedLoan(null);
            loadLoans();
        } catch (error: any) {
            toast.error(error || 'Failed to reject loan');
        }
    };


    const handleForward = async (forwardData: any) => {
        try {
            console.log('Forward data received:', forwardData);  // ✅ Debug log

            // ✅ FIXED: Pass correct field names to Redux action
            await dispatch(
                addReviewWithWorkflow({
                    organizationId: user.organizationId,
                    loanId: forwardData.loanId,
                    reviewMessage: forwardData.reviewMessage,
                    decision: forwardData.decision,
                    forwardTo: forwardData.forwardTo,          // ✅ Changed from nextReviewerId
                    forwardToRole: forwardData.forwardToRole,  // ✅ Added forwardToRole
                })
            ).unwrap();

            toast.success('Loan forwarded successfully!');
            setIsForwardModalOpen(false);
            setSelectedLoan(null);
            loadLoans();
        } catch (error: any) {
            console.error('Forward error:', error);  // ✅ Debug log
            toast.error(error || 'Failed to forward loan');
        }
    };

    const handleStartReview = async (reviewData: any) => {
        try {
            await dispatch(
                startLoanReview({
                    organizationId: user.organizationId,
                    loanId: reviewData.loanId,
                    reviewMessage: reviewData.reviewMessage,
                    forwardTo: reviewData.forwardTo,
                    forwardToRole: reviewData.forwardToRole,
                })
            ).unwrap();

            toast.success('Review process started successfully!');
            loadLoans();
        } catch (error: any) {
            toast.error(error || 'Failed to start review');
        }
    };

    const openApproveModal = (loan: any) => {
        setSelectedLoan(loan);
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (loan: any) => {
        setSelectedLoan(loan);
        setIsRejectModalOpen(true);
    };

    const openViewDetails = (loan: any) => {
        setSelectedLoan(loan);
        setIsViewDetailsOpen(true);
    };

    // Filter and paginate loans client-side
    const getFilteredLoans = () => {
        const loans = activeTab === 'pending' ? pendingLoans : rejectedLoans;

        // Apply search filter
        let filtered = loans;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = loans.filter((loan) => {
                const borrowerName = `${loan.borrower?.firstName} ${loan.borrower?.lastName}`.toLowerCase();
                const loanId = loan.loanId?.toLowerCase() || '';
                const purpose = loan.purposeOfLoan?.toLowerCase() || '';
                const nationalId = loan.borrower?.nationalId?.toLowerCase() || '';
                const phone = loan.borrower?.primaryPhone?.toLowerCase() || '';

                return (
                    borrowerName.includes(query) ||
                    loanId.includes(query) ||
                    purpose.includes(query) ||
                    nationalId.includes(query) ||
                    phone.includes(query)
                );
            });
        }

        // Apply date filters
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter((loan) => new Date(loan.createdAt) >= fromDate);
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            filtered = filtered.filter((loan) => new Date(loan.createdAt) <= toDate);
        }

        // Apply officer filter
        if (filters.loanOfficer) {
            filtered = filtered.filter((loan) =>
                loan.loanOfficer?.toLowerCase().includes(filters.loanOfficer.toLowerCase())
            );
        }

        // Apply branch filter
        if (filters.branch) {
            filtered = filtered.filter((loan) =>
                loan.branchName?.toLowerCase().includes(filters.branch.toLowerCase())
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (filters.sortBy) {
                case 'createdAt_desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'createdAt_asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'amount_desc':
                    return b.disbursedAmount - a.disbursedAmount;
                case 'amount_asc':
                    return a.disbursedAmount - b.disbursedAmount;
                default:
                    return 0;
            }
        });

        return sorted;
    };

    // Get current page loans
    const filteredLoans = getFilteredLoans();
    const totalItems = filteredLoans.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageLoans = filteredLoans.slice(startIndex, endIndex);

    const currentLoanIds = React.useMemo(
        () => currentPageLoans.map(loan => loan.id).join(','),
        [currentPageLoans.map(loan => loan.id).join(',')]
    );
    useEffect(() => {
        if (currentPageLoans.length > 0 && user?.organizationId) {
            // Load workflow history for all loans on current page
            currentPageLoans.forEach(loan => {
                if (!workflowHistories[loan.id] && !loadingWorkflowHistory[loan.id]) {
                    loadWorkflowHistory(loan.id);
                }
            });
        }
    }, [currentLoanIds, user?.organizationId]);

    useEffect(() => {
        if (currentPageLoans.length > 0) {
            loadReviewCounts(currentPageLoans);
        }
    }, [currentLoanIds]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, activeTab]);

    const isRejected = (loan: any) => loan.status === 'rejected';

    // Helper function to get collateral type display name
    const getCollateralTypeDisplay = (type: string) => {
        const typeMap: { [key: string]: string } = {
            'movable': 'Movable Property',
            'immovable': 'Immovable Property',
            'financial': 'Financial Asset',
            'guarantee': 'Personal Guarantee'
        };
        return typeMap[type] || type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#5B7FA2]0 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                {/* ✅ FIXED: Updated header text based on roles */}
                                <h1 className="text-xl font-bold text-gray-900">
                                    {isLoanOfficer && 'Unassigned Loan Applications'}
                                    {isManager && 'My Assigned Loans'}
                                    {isClient && 'Loans for Final Approval'}
                                    {!isLoanOfficer && !isManager && !isClient && 'Loan Applications'}
                                </h1>
                                <p className="text-xs text-gray-500">{totalItems} total</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                    
                            <button
                                onClick={loadLoans}
                                disabled={isLoading}
                                className="flex items-center px-3 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 mb-3">
                        <button
                            onClick={() => {
                                setActiveTab('pending');
                            }}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'pending'
                                ? 'bg-[#5B7FA2] text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Pending ({pendingLoans.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('rejected');
                            }}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'rejected'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejected ({rejectedLoans.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                            placeholder="Search by borrower name, loan ID..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center"
                    >
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-800">{error}</span>
                    </motion.div>
                )}

                {/* Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : currentPageLoans.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
                    >
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No {activeTab} Loans {searchQuery || filters.dateFrom || filters.dateTo || filters.loanOfficer || filters.branch ? 'Found' : ''}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery || filters.dateFrom || filters.dateTo || filters.loanOfficer || filters.branch
                                ? 'Try adjusting your search or filters'
                                : activeTab === 'pending'
                                    ? 'All loan applications have been processed'
                                    : 'No rejected loan applications'
                            }
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`${activeTab === 'pending' ? 'bg-[#5B7FA2]' : 'bg-[#5B7FA2]'} text-white`}>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">#</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Borrower</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Contact</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Amount</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Purpose</th>
                                        {(isManager || isClient) && (
                                            <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Status</th>
                                        )}
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Officer</th>
                                        {activeTab === 'rejected' && (
                                            <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Reason</th>
                                        )}
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Date</th>
                                        <th className="px-3 py-3 text-center text-xs font-bold uppercase whitespace-nowrap min-w-[280px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentPageLoans.map((loan, index) => (
                                        <motion.tr
                                            key={loan.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-blue-50 transition-colors group"
                                        >
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className={`w-7 h-7 ${activeTab === 'pending' ? 'bg-[#5B7FA2]' : 'bg-[#5B7FA2]'} rounded-lg flex items-center justify-center shadow-sm`}>
                                                    <span className="text-xs font-bold text-white">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">
                                                            {loan.borrower?.firstName} {loan.borrower?.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center text-xs text-gray-600">
                                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                    {loan.borrower?.primaryPhone}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                                                    <span className="font-bold text-green-600 text-sm">
                                                        {loan.disbursedAmount?.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-1">RWF</span>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3">
                                                <div className="max-w-[150px]">
                                                    <p className="text-xs text-gray-700 truncate" title={loan.purposeOfLoan}>
                                                        {loan.purposeOfLoan}
                                                    </p>
                                                </div>
                                            </td>

                                            {(isManager || isClient) && (
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                        {getWorkflowStatus(loan)}
                                                    </span>
                                                </td>
                                            )}

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <p className="text-xs font-medium text-gray-700">{loan.loanOfficer}</p>
                                            </td>

                                            {activeTab === 'rejected' && (
                                                <td className="px-3 py-3">
                                                    <div className="max-w-[200px]">
                                                        <p className="text-xs text-red-600 truncate" title={loan.rejectionReason}>
                                                            {loan.rejectionReason || 'No reason provided'}
                                                        </p>
                                                    </div>
                                                </td>
                                            )}

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center text-xs text-gray-600">
                                                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                                    {new Date(activeTab === 'rejected' ? loan.rejectedAt : loan.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center justify-center space-x-1">
                                                    {/* Always visible buttons */}
                                                    <button
                                                        onClick={() => openViewDetails(loan)}
                                                        className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => openReviewModal(loan)}
                                                        className="relative p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                                        title="Review Application"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        {reviewCounts[loan.id] > 0 && (
                                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                                {reviewCounts[loan.id]}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {(isManager || isClient) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setIsWorkflowHistoryModalOpen(true);
                                                            }}
                                                            className="p-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                                            title="Workflow History"
                                                        >
                                                            <GitBranch className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {isLoanOfficer && activeTab === 'pending' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setIsSelectReviewerModalOpen(true);
                                                            }}
                                                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                            title="Start Review"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {(isBoardDirector || isSeniorManager) && activeTab === 'pending' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setIsForwardModalOpen(true);
                                                            }}
                                                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                            title="Forward"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {isClient && activeTab === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLoan(loan);
                                                                    setIsApproveModalOpen(true);
                                                                }}
                                                                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLoan(loan);
                                                                    setIsRejectModalOpen(true);
                                                                }}
                                                                className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* ✅ FIXED: Board Director & Senior Manager - Reject button */}
                                                    {(isBoardDirector || isSeniorManager) && activeTab === 'pending' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setIsRejectModalOpen(true);
                                                            }}
                                                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {/* ✅ FIXED: Loan Officer - Reject button */}
                                                    {isLoanOfficer && activeTab === 'pending' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setIsRejectModalOpen(true);
                                                            }}
                                                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {isManagingDirector && activeTab === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLoan(loan);
                                                                    setIsApproveModalOpen(true);
                                                                }}
                                                                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLoan(loan);
                                                                    setIsRejectModalOpen(true);
                                                                }}
                                                                className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}

                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                                        <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{' '}
                                        <span className="font-semibold">{totalItems}</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
                                                            ? 'bg-[#5B7FA2] text-white shadow-sm'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Modals - Only show approve/reject for pending loans */}
            {activeTab === 'pending' && (
                <>
                    <ApproveLoanModal
                        isOpen={isApproveModalOpen}
                        onClose={() => {
                            setIsApproveModalOpen(false);
                            setSelectedLoan(null);
                        }}
                        loan={selectedLoan}
                        onApprove={handleApprove}
                    />

                    <RejectLoanModal
                        isOpen={isRejectModalOpen}
                        onClose={() => {
                            setIsRejectModalOpen(false);
                            setSelectedLoan(null);
                        }}
                        loan={selectedLoan}
                        onReject={handleReject}
                    />
                </>
            )}

            {/* View Details Modal - Available for both tabs */}
            {isViewDetailsOpen && selectedLoan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className={`${isRejected(selectedLoan) ? 'bg-[#5B7FA2]' : 'bg-[#5B7FA2]'} px-5 py-3 border-b border-gray-700`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-white" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            Loan Application Details
                                        </h3>
                                        <p className="text-gray-300 text-xs">
                                            {selectedLoan.loanId} • {selectedLoan.branchName} • {selectedLoan.status.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedLoan.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedLoan.status.toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setIsViewDetailsOpen(false);
                                            setSelectedLoan(null);
                                        }}
                                        className="text-gray-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-4">
                                {/* Borrower Information */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="px-3 py-2 border-b border-blue-100">
                                        <h3 className="text-xs font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                                            <User className="w-4 h-4 mr-2 text-blue-600" />
                                            Borrower Information
                                        </h3>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Full Name</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {selectedLoan.borrower?.firstName} {selectedLoan.borrower?.middleName} {selectedLoan.borrower?.lastName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">National ID</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedLoan.borrower?.nationalId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Phone</p>
                                            <p className="text-sm text-gray-900">{selectedLoan.borrower?.primaryPhone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Email</p>
                                            <p className="text-sm text-gray-900">{selectedLoan.borrower?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Details */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-green-100">
                                        <h3 className="text-xs font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                                            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                                            Loan Details
                                        </h3>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Loan ID</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedLoan.loanId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Requested Amount</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {selectedLoan.disbursedAmount?.toLocaleString()} RWF
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Purpose</p>
                                            <p className="text-sm text-gray-900">{selectedLoan.purposeOfLoan}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Loan Officer</p>
                                            <p className="text-sm text-gray-900">{selectedLoan.loanOfficer}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Term</p>
                                            <p className="text-sm text-gray-900">{selectedLoan.termInMonths} months</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
                                            <p className="text-sm text-gray-900">{selectedLoan.annualInterestRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Collaterals Information */}
                                {selectedLoan.collaterals && selectedLoan.collaterals.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 border-b border-amber-100">
                                            <h3 className="text-xs font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                                                <Shield className="w-4 h-4 mr-2 text-amber-600" />
                                                Collaterals ({selectedLoan.collaterals.length})
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {selectedLoan.collaterals.map((collateral: any, index: number) => (
                                                <div key={collateral.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                                                            <BadgeCheck className="w-4 h-4 mr-2 text-amber-600" />
                                                            Collateral #{index + 1} - {getCollateralTypeDisplay(collateral.collateralType)}
                                                        </h4>
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                                            {collateral.collateralId}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Description</p>
                                                            <p className="text-sm text-gray-900">{collateral.description}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Collateral Value</p>
                                                            <p className="text-lg font-bold text-amber-600">
                                                                {parseFloat(collateral.collateralValue).toLocaleString()} RWF
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {collateral.guarantorName && (
                                                        <div className="border-t border-gray-200 pt-3 mt-3">
                                                            <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                                                <User className="w-3 h-3 mr-1" />
                                                                Guarantor Information
                                                            </h5>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">Name</p>
                                                                    <p className="text-sm text-gray-900">{collateral.guarantorName}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                                                                    <p className="text-sm text-gray-900">{collateral.guarantorPhone}</p>
                                                                </div>
                                                                {collateral.guarantorAddress && (
                                                                    <div className="col-span-2">
                                                                        <p className="text-xs text-gray-600 mb-1">Address</p>
                                                                        <p className="text-sm text-gray-900 flex items-center">
                                                                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                                            {collateral.guarantorAddress}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(collateral.valuationDate || collateral.valuedBy) && (
                                                        <div className="border-t border-gray-200 pt-3 mt-3">
                                                            <h5 className="text-xs font-semibold text-gray-700 mb-2">Valuation Details</h5>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {collateral.valuationDate && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 mb-1">Valuation Date</p>
                                                                        <p className="text-sm text-gray-900">
                                                                            {new Date(collateral.valuationDate).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {collateral.valuedBy && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-600 mb-1">Valued By</p>
                                                                        <p className="text-sm text-gray-900">{collateral.valuedBy}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {collateral.notes && (
                                                        <div className="border-t border-gray-200 pt-3 mt-3">
                                                            <p className="text-xs text-gray-600 mb-1">Additional Notes</p>
                                                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                                                                {collateral.notes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Document URLs */}
                                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                                        <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                                            <FileCheck className="w-3 h-3 mr-1" />
                                                            Supporting Documents
                                                        </h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {collateral.proofOfOwnershipUrl && (
                                                                <a
                                                                    href={collateral.proofOfOwnershipUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Proof of Ownership
                                                                </a>
                                                            )}
                                                            {collateral.ownerIdentificationUrl && (
                                                                <a
                                                                    href={collateral.ownerIdentificationUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Owner Identification
                                                                </a>
                                                            )}
                                                            {collateral.legalDocumentUrl && (
                                                                <a
                                                                    href={collateral.legalDocumentUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Legal Document
                                                                </a>
                                                            )}
                                                            {collateral.physicalEvidenceUrl && (
                                                                <a
                                                                    href={collateral.physicalEvidenceUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Physical Evidence
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rejection Details (only for rejected loans) */}
                                {isRejected(selectedLoan) && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-gradient-to-r from-red-100 to-rose-100 px-3 py-2 border-b border-red-200">
                                            <h3 className="text-xs font-semibold text-red-800 flex items-center uppercase tracking-wide">
                                                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                                                Rejection Details
                                            </h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-600 mb-1">Rejected By</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    User ID: {selectedLoan.rejectedBy}
                                                </p>
                                            </div>
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-600 mb-1">Rejection Date</p>
                                                <p className="text-sm text-gray-900">
                                                    {new Date(selectedLoan.rejectedAt).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Rejection Reason</p>
                                                <p className="text-sm text-red-800 bg-red-100 p-3 rounded border border-red-200">
                                                    {selectedLoan.rejectionReason || 'No reason provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>Created {new Date(selectedLoan.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setIsViewDetailsOpen(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Close
                                </button>
                                {/* ✅ FIXED: Only show approve/reject for clients on pending loans */}
                                {activeTab === 'pending' && isClient && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsViewDetailsOpen(false);
                                                openApproveModal(selectedLoan);
                                            }}
                                            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve Loan
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsViewDetailsOpen(false);
                                                openRejectModal(selectedLoan);
                                            }}
                                            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject Loan
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Review Modal */}
            <LoanReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false);
                    setSelectedLoan(null);
                    loadReviewCounts(currentPageLoans); // Refresh counts after closing
                }}
                loan={selectedLoan}
            />

            {/* Select Reviewer Modal - For Loan Officers */}
            <SelectReviewerModal
                isOpen={isSelectReviewerModalOpen}
                onClose={() => {
                    setIsSelectReviewerModalOpen(false);
                    setSelectedLoan(null);
                }}
                loan={selectedLoan}
                onSubmit={handleStartReview}
            />

            {/* Forward Modal - For Managers */}
            <ForwardLoanModal
                isOpen={isForwardModalOpen}
                onClose={() => {
                    setIsForwardModalOpen(false);
                    setSelectedLoan(null);
                }}
                loan={selectedLoan}
                onSubmit={handleForward}
            />

            <WorkflowHistoryModal
                isOpen={isWorkflowHistoryModalOpen}
                onClose={() => {
                    setIsWorkflowHistoryModalOpen(false);
                    setSelectedLoan(null);
                }}
                loanId={selectedLoan?.id}
                workflowHistory={selectedLoan ? workflowHistories[selectedLoan.id] : null}
                isLoading={selectedLoan ? loadingWorkflowHistory[selectedLoan.id] : false}
                onRetry={selectedLoan ? () => loadWorkflowHistory(selectedLoan.id) : undefined}
            />
        </div>
    );
};

export default PendingLoansManagementPage;