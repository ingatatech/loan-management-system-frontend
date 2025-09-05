import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Calculator, Calendar, DollarSign, TrendingUp, Loader2, XCircle, FileText, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================================
// APPROVE LOAN MODAL COMPONENT
// ============================================================================
interface ApproveLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: any;
    onApprove: (approvalData: any) => Promise<void>;
}

// Enhanced ApproveLoanModal
export const ApproveLoanModal: React.FC<ApproveLoanModalProps> = ({
    isOpen,
    onClose,
    loan,
    onApprove
}) => {
    const [formData, setFormData] = useState({
        annualInterestRate: 12.5,
        disbursementDate: new Date().toISOString().split('T')[0],
        agreedMaturityDate: '',
        repaymentFrequency: 'monthly',
        interestMethod: 'reducing_balance',
        gracePeriodMonths: 0,
        notes: ''
    });

    const [calculatedPreview, setCalculatedPreview] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Available organization funds check
    const availableFunds = 50000000;

    // Auto-calculate loan terms when form data changes
    useEffect(() => {
        if (formData.disbursementDate && formData.agreedMaturityDate && loan?.disbursedAmount) {
            calculateLoanPreview();
        }
    }, [
        formData.disbursementDate,
        formData.agreedMaturityDate,
        formData.repaymentFrequency,
        formData.interestMethod,
        formData.annualInterestRate,
        formData.gracePeriodMonths
    ]);

    const calculateAutoTerms = (
        disbursementDate: string,
        maturityDate: string,
        frequency: string
    ): number => {
        const start = new Date(disbursementDate);
        const end = new Date(maturityDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        switch (frequency) {
            case 'daily': return Math.ceil(diffDays);
            case 'weekly': return Math.ceil(diffDays / 7);
            case 'biweekly': return Math.ceil(diffDays / 14);
            case 'monthly': return Math.ceil(diffMonths);
            case 'quarterly': return Math.ceil(diffMonths / 3);
            case 'semi_annually': return Math.ceil(diffMonths / 6);
            case 'annually': return Math.ceil(diffMonths / 12);
            default: return 0;
        }
    };

    const calculateLoanPreview = () => {
        setIsCalculating(true);

        try {
            // Convert to number and clean any non-numeric characters
            const principal = parseFloat(loan.disbursedAmount.toString().replace(/[^0-9.-]+/g, ""));

            // Validate principal is a positive number
            if (isNaN(principal) || principal <= 0) {
                console.error('Invalid principal amount:', loan.disbursedAmount, 'Converted:', principal);
                setCalculatedPreview(null);
                return;
            }

            const annualRate = formData.annualInterestRate / 100;
            const autoTerms = calculateAutoTerms(
                formData.disbursementDate,
                formData.agreedMaturityDate,
                formData.repaymentFrequency
            );

            if (autoTerms <= 0 || autoTerms > 480) {
                console.log('Invalid auto terms:', autoTerms);
                setCalculatedPreview(null);
                return;
            }

            const periodsPerYear: Record<string, number> = {
                daily: 365, weekly: 52, biweekly: 26, monthly: 12,
                quarterly: 4, semi_annually: 2, annually: 1
            };

            let totalInterest: number;
            let periodicInstallment: number;

            if (formData.interestMethod === 'flat') {
                const termYears = autoTerms / periodsPerYear[formData.repaymentFrequency];
                totalInterest = principal * annualRate * termYears;
                periodicInstallment = (principal + totalInterest) / autoTerms;
            } else {
                const periodicRate = annualRate / periodsPerYear[formData.repaymentFrequency];
                if (periodicRate === 0) {
                    periodicInstallment = principal / autoTerms;
                    totalInterest = 0;
                } else {
                    const powerFactor = Math.pow(1 + periodicRate, autoTerms);
                    periodicInstallment = (principal * (periodicRate * powerFactor)) / (powerFactor - 1);
                    totalInterest = (periodicInstallment * autoTerms) - principal;
                }
            }

            // Round and validate all calculations
            const calculatedPeriodicPayment = Math.round(periodicInstallment * 100) / 100;
            const calculatedTotalInterest = Math.round(totalInterest * 100) / 100;
            const calculatedTotalAmount = Math.round((principal + totalInterest) * 100) / 100;

            // Final validation
            if (isNaN(calculatedPeriodicPayment) || isNaN(calculatedTotalInterest) || isNaN(calculatedTotalAmount)) {
                console.error('Final calculation resulted in NaN');
                setCalculatedPreview(null);
                return;
            }

            const firstPaymentDate = new Date(formData.disbursementDate);
            const gracePeriod = formData.gracePeriodMonths || 0;

            switch (formData.repaymentFrequency) {
                case 'monthly':
                    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + gracePeriod + 1);
                    break;
                case 'weekly':
                    firstPaymentDate.setDate(firstPaymentDate.getDate() + (gracePeriod * 7) + 7);
                    break;
                case 'daily':
                    firstPaymentDate.setDate(firstPaymentDate.getDate() + gracePeriod + 1);
                    break;
                default:
                    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + gracePeriod + 1);
            }

            setCalculatedPreview({
                numberOfInstallments: autoTerms,
                periodicPayment: calculatedPeriodicPayment,
                totalInterest: calculatedTotalInterest,
                totalAmount: calculatedTotalAmount,
                firstPaymentDate: firstPaymentDate.toLocaleDateString()
            });
        } catch (error) {
            console.error('Calculation error:', error);
            setCalculatedPreview(null);
        } finally {
            setIsCalculating(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (formData.annualInterestRate < 0.1 || formData.annualInterestRate > 50) {
            errors.annualInterestRate = 'Interest rate must be between 0.1% and 50%';
        }

        if (!formData.disbursementDate) {
            errors.disbursementDate = 'Disbursement date is required';
        } else {
            // FIXED: Compare dates without time component to avoid timezone issues
            const disbursementDate = new Date(formData.disbursementDate);
            const today = new Date();
            
            // Set both dates to start of day (00:00:00) for accurate comparison
            const disbursementDateStart = new Date(disbursementDate.getFullYear(), disbursementDate.getMonth(), disbursementDate.getDate());
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            if (disbursementDateStart < todayStart) {
                errors.disbursementDate = 'Disbursement date cannot be in the past';
            }
        }

        if (!formData.agreedMaturityDate) {
            errors.agreedMaturityDate = 'Maturity date is required';
        } else if (new Date(formData.agreedMaturityDate) <= new Date(formData.disbursementDate)) {
            errors.agreedMaturityDate = 'Maturity date must be after disbursement date';
        }

        if (calculatedPreview) {
            if (calculatedPreview.numberOfInstallments > 480) {
                errors.agreedMaturityDate = 'Loan term exceeds maximum 480 installments';
            }
            if (calculatedPreview.totalAmount > 9999999999999.99) {
                errors.general = 'Calculated loan amount exceeds database limits';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setShowConfirmation(true);
    };

    const getTodayDateString = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const confirmApproval = async () => {
        setIsSubmitting(true);
        try {
            await onApprove(formData);
            onClose();
        } catch (error) {
            console.error('Approval error:', error);
        } finally {
            setIsSubmitting(false);
            setShowConfirmation(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Enhanced Header */}
                <div className="bg-[#5B7FA2] px-5 py-3 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Approve Loan Application
                                </h3>
                                <p className="text-white text-xs">
                                    {loan?.loanId} • {loan?.borrower?.firstName} {loan?.borrower?.lastName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                        {/* Loan Summary */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-xs font-semibold text-blue-900 mb-3 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Loan Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-blue-600 text-xs">Borrower</p>
                                    <p className="font-medium text-gray-900">{loan?.borrower?.firstName} {loan?.borrower?.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 text-xs">Requested Amount</p>
                                    <p className="font-medium text-gray-900">{loan?.disbursedAmount?.toLocaleString()} RWF</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 text-xs">Available Funds</p>
                                    <p className="font-medium text-gray-900">{availableFunds.toLocaleString()} RWF</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 text-xs">Purpose</p>
                                    <p className="font-medium text-gray-900">{loan?.purposeOfLoan}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Annual Interest Rate */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                                    Annual Interest Rate (%) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    max="50"
                                    value={formData.annualInterestRate}
                                    onChange={(e) => setFormData({ ...formData, annualInterestRate: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                {validationErrors.annualInterestRate && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.annualInterestRate}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Standard rate is 12.5%</p>
                            </div>

                            {/* Interest Method */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <Calculator className="w-3 h-3 mr-1 text-green-600" />
                                    Interest Method *
                                </label>
                                <select
                                    value={formData.interestMethod}
                                    onChange={(e) => setFormData({ ...formData, interestMethod: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="reducing_balance">Reducing Balance</option>
                                    <option value="flat">Flat Rate</option>
                                </select>
                            </div>

                            {/* Disbursement Date */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1 text-green-600" />
                                    Disbursement Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.disbursementDate}
                                    onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                                    min={getTodayDateString()}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                {validationErrors.disbursementDate && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.disbursementDate}</p>
                                )}
                            </div>

                            {/* Maturity Date */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1 text-green-600" />
                                    Maturity Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.agreedMaturityDate}
                                    onChange={(e) => setFormData({ ...formData, agreedMaturityDate: e.target.value })}
                                    min={formData.disbursementDate}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                {validationErrors.agreedMaturityDate && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.agreedMaturityDate}</p>
                                )}
                            </div>

                            {/* Repayment Frequency */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <Clock className="w-3 h-3 mr-1 text-green-600" />
                                    Repayment Frequency *
                                </label>
                                <select
                                    value={formData.repaymentFrequency}
                                    onChange={(e) => setFormData({ ...formData, repaymentFrequency: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="semi_annually">Semi-annually</option>
                                    <option value="annually">Annually</option>
                                </select>
                            </div>

                            {/* Grace Period */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <Clock className="w-3 h-3 mr-1 text-green-600" />
                                    Grace Period (Months)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="12"
                                    value={formData.gracePeriodMonths}
                                    onChange={(e) => setFormData({ ...formData, gracePeriodMonths: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Months before first payment</p>
                            </div>
                        </div>

                        {/* Live Calculation Preview */}
                        {calculatedPreview && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                <h3 className="text-xs font-semibold text-green-900 mb-3 flex items-center">
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Live Calculation Preview
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <div className="bg-white rounded-lg p-3 border border-green-100">
                                        <p className="text-xs text-gray-600">Installments</p>
                                        <p className="text-lg font-bold text-green-700">{calculatedPreview.numberOfInstallments}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-green-100">
                                        <p className="text-xs text-gray-600">Periodic Payment</p>
                                        <p className="text-lg font-bold text-green-700">{calculatedPreview.periodicPayment.toLocaleString()} RWF</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-green-100">
                                        <p className="text-xs text-gray-600">Total Interest</p>
                                        <p className="text-lg font-bold text-green-700">{calculatedPreview.totalInterest.toLocaleString()} RWF</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-green-100">
                                        <p className="text-xs text-gray-600">Total Repayment</p>
                                        <p className="text-lg font-bold text-green-700">
                                            {calculatedPreview && !isNaN(calculatedPreview.totalAmount)
                                                ? calculatedPreview.totalAmount.toLocaleString()
                                                : 'Calculation Error'} RWF
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-green-100">
                                        <p className="text-xs text-gray-600">First Payment</p>
                                        <p className="text-lg font-bold text-green-700">{calculatedPreview.firstPaymentDate}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Notes */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                <FileText className="w-3 h-3 mr-1 text-green-600" />
                                Approval Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Add any special terms or conditions..."
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500 characters</p>
                        </div>

                        {validationErrors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                                <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{validationErrors.general}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!calculatedPreview || isSubmitting}
                        className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Generate Schedule
                            </>
                        )}
                    </button>
                </div>

                {/* Confirmation Dialog */}
                {showConfirmation && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-[#5B7FA2] rounded-full flex items-center justify-center mr-3">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Confirm Loan Approval</h3>
                                    <p className="text-xs text-gray-600">Please review the terms before approval</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold">{loan?.disbursedAmount?.toLocaleString()} RWF</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Interest:</span>
                                    <span className="font-semibold">{formData.annualInterestRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Installments:</span>
                                    <span className="font-semibold">{calculatedPreview?.numberOfInstallments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Periodic Payment:</span>
                                    <span className="font-semibold">{calculatedPreview?.periodicPayment.toLocaleString()} RWF</span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApproval}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-sm bg-[#5B7FA2] text-white rounded-lg hover:bg-[#5B7FA2] disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Confirm Approval'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};
// ============================================================================
// REJECT LOAN MODAL COMPONENT
// ============================================================================
interface RejectLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: any;
    onReject: (rejectionData: any) => Promise<void>;
}

// Enhanced RejectLoanModal
export const RejectLoanModal: React.FC<RejectLoanModalProps> = ({
    isOpen,
    onClose,
    loan,
    onReject
}) => {
    const [formData, setFormData] = useState({
        rejectionReason: '',
        additionalDetails: '',
        internalNotes: ''
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const predefinedReasons = [
        'Insufficient collateral value',
        'Unstable income source',
        'Poor credit history',
        'Incomplete documentation',
        'Failed verification',
        'High debt-to-income ratio',
        'Other (specify below)'
    ];

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.rejectionReason) {
            errors.rejectionReason = 'Please select a rejection reason';
        }

        if (formData.rejectionReason === 'Other (specify below)' &&
            (!formData.additionalDetails || formData.additionalDetails.trim().length < 10)) {
            errors.additionalDetails = 'Please provide detailed reason (minimum 10 characters)';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setShowConfirmation(true);
    };

    const confirmRejection = async () => {
        setIsSubmitting(true);
        try {
            const rejectionData = {
                rejectionReason: formData.rejectionReason === 'Other (specify below)'
                    ? formData.additionalDetails
                    : formData.rejectionReason,
                notes: formData.internalNotes
            };
            await onReject(rejectionData);
            onClose();
        } catch (error) {
            console.error('Rejection error:', error);
        } finally {
            setIsSubmitting(false);
            setShowConfirmation(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <XCircle className="w-5 h-5 text-white" />
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Reject Loan Application
                                </h3>
                                <p className="text-red-100 text-xs">
                                    {loan?.loanId} • {loan?.borrower?.firstName} {loan?.borrower?.lastName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                        {/* Loan Summary */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-xs font-semibold text-gray-800 mb-3 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Loan Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 text-xs">Borrower</p>
                                    <p className="font-medium text-gray-900">{loan?.borrower?.firstName} {loan?.borrower?.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs">Requested Amount</p>
                                    <p className="font-medium text-gray-900">{loan?.disbursedAmount?.toLocaleString()} RWF</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs">Purpose</p>
                                    <p className="font-medium text-gray-900">{loan?.purposeOfLoan}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs">Loan Officer</p>
                                    <p className="font-medium text-gray-900">{loan?.loanOfficer}</p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-900">Warning: This action cannot be undone</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    The borrower will be notified of the rejection via email/SMS
                                </p>
                            </div>
                        </div>

                        {/* Rejection Reason */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1 text-red-600" />
                                Rejection Reason *
                            </label>
                            <select
                                value={formData.rejectionReason}
                                onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Select a reason</option>
                                {predefinedReasons.map((reason) => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                            {validationErrors.rejectionReason && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.rejectionReason}</p>
                            )}
                        </div>

                        {/* Additional Details (shown when "Other" is selected) */}
                        {formData.rejectionReason === 'Other (specify below)' && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                    <FileText className="w-3 h-3 mr-1 text-red-600" />
                                    Additional Details *
                                </label>
                                <textarea
                                    value={formData.additionalDetails}
                                    onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Please provide a detailed reason for rejection (minimum 10 characters)..."
                                />
                                {validationErrors.additionalDetails && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.additionalDetails}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">{formData.additionalDetails.length}/500 characters</p>
                            </div>
                        )}

                        {/* Internal Notes */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                <FileText className="w-3 h-3 mr-1 text-gray-600" />
                                Internal Notes (Optional)
                            </label>
                            <textarea
                                value={formData.internalNotes}
                                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                placeholder="Add internal notes (not shared with borrower)..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                These notes are for internal record keeping only
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Confirm Rejection
                            </>
                        )}
                    </button>
                </div>

                {/* Confirmation Dialog */}
                {showConfirmation && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Confirm Rejection</h3>
                                    <p className="text-xs text-gray-600">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-red-900 mb-2">The borrower will be notified:</p>
                                <p className="text-xs text-red-800">
                                    Reason: {formData.rejectionReason === 'Other (specify below)'
                                        ? formData.additionalDetails
                                        : formData.rejectionReason}
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRejection}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Confirm Rejection'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};