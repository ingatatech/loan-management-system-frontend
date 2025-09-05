"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { processPayment } from "@/lib/features/repayment/repaymentTransactionSlice"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard,
  X,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  Calculator,
  Receipt,
  Shield,
  User,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
  Save,
  Banknote,
  Smartphone,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react"
import toast from "react-hot-toast"
import { fetchLoanApplications } from "@/lib/features/auth/loanApplicationSlice"

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: number;
  loanData?: {
    loanId: string;
    borrowerName: string;
    outstandingPrincipal: number;
    accruedInterest: number;
    monthlyInstallment: number;
    nextDueDate: string;
    daysInArrears: number;
    status: string;
  };
  selectedInstallment?: {
    id: number;
    installmentNumber: number;
    dueDate: string;
    duePrincipal: number;
    dueInterest: number;
    dueTotal: number;
    remainingAmount: number;
    isPaid: boolean;
    paymentStatus: string;
    delayedDays: number;
    canAcceptPayment?: boolean;
  };
  paymentMode?: 'general' | 'installment-specific';
  onPaymentSuccess?: () => void;
  onRefreshSchedules?: () => Promise<void>;
  // NEW: Prefetched frequency data
  prefetchedFrequencyData?: {
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
  };
}


interface DelayedDaysInfo {
  installmentNumber: number;
  scheduledDueDate: string;
  actualPaymentDate: string;
  delayedDays: number;
  wasEarlyPayment: boolean;
}

interface InstallmentPaymentPreview {
  installmentNumber: number;
  dueAmount: number;
  paymentAmount: number;
  willBePaid: boolean;
  remainingAfterPayment: number;
  delayedDays: number;
  paymentImpact: 'positive' | 'negative' | 'neutral';
}

interface PaymentAllocationPreview {
  totalAmount: number;
  interestPaid: number;
  principalPaid: number;
  excessAmount: number;
  newOutstandingPrincipal?: number;
  newAccruedInterest?: number;
  targetInstallment?: number;
  paymentType: 'general' | 'installment-specific';
}

interface ClassificationWarning {
  show: boolean;
  message: string;
  severity: 'info' | 'warning' | 'success';
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  loanId,
  loanData,
  selectedInstallment,
  paymentMode = 'general',
  onPaymentSuccess,
  onRefreshSchedules,
  prefetchedFrequencyData
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, lastClassificationUpdate } = useAppSelector(state => state.repaymentTransaction);
  const [formData, setFormData] = useState({
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    receivedBy: '',
    approvedBy: '',
    repaymentProof: '',
    notes: '',
    targetInstallmentId: selectedInstallment?.id || null,
    paymentType: paymentMode,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatedAllocation, setCalculatedAllocation] = useState<PaymentAllocationPreview | null>(null);
  const [showCalculationPreview, setShowCalculationPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [delayedDaysPreview, setDelayedDaysPreview] = useState<any>(null);
  const [installmentDelays, setInstallmentDelays] = useState<DelayedDaysInfo[]>([]);
  const [installmentPreview, setInstallmentPreview] = useState<InstallmentPaymentPreview | null>(null);
  const [duplicatePaymentWarning, setDuplicatePaymentWarning] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isRefreshingSchedules, setIsRefreshingSchedules] = useState(false);
  const [classificationWarning, setClassificationWarning] = useState<ClassificationWarning | null>(null);

  const [repaymentFrequency, setRepaymentFrequency] = useState<string>(prefetchedFrequencyData?.repaymentFrequency || '');
  const [frequencyLabel, setFrequencyLabel] = useState<string>(prefetchedFrequencyData?.frequencyLabel || 'Payment');
  const [nextInstallmentData, setNextInstallmentData] = useState<{
    installmentNumber: number;
    amount: number;
    dueDate: string;
    principal: number;
    interest: number;
    frequency: string;
  } | null>(prefetchedFrequencyData?.nextInstallmentData || null);
useEffect(() => {
    if (isOpen && loanId && !prefetchedFrequencyData) {
      fetchLoanFrequencyData();
    }
  }, [isOpen, loanId, prefetchedFrequencyData]);

  // NEW: Update state when prefetched data changes
  useEffect(() => {
    if (prefetchedFrequencyData) {
      setRepaymentFrequency(prefetchedFrequencyData.repaymentFrequency);
      setFrequencyLabel(prefetchedFrequencyData.frequencyLabel);
      setNextInstallmentData(prefetchedFrequencyData.nextInstallmentData);
    }
  }, [prefetchedFrequencyData]);

  const fetchLoanFrequencyData = async () => {
    try {
      const token = localStorage.getItem("token");
      const orgId = getOrganizationId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${orgId}/loan-applications/${loanId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const loan = result.data;

        setRepaymentFrequency(loan.repaymentFrequency);
        setFrequencyLabel(getFrequencyLabelFrontend(loan.repaymentFrequency));

        // Get next unpaid installment from schedules
        if (loan.repaymentSchedules) {
          const nextSchedule = loan.repaymentSchedules
            .filter((s: any) => !s.isPaid)
            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

          if (nextSchedule) {
            setNextInstallmentData({
              installmentNumber: nextSchedule.installmentNumber,
              amount: nextSchedule.dueTotal,
              dueDate: nextSchedule.dueDate,
              principal: nextSchedule.duePrincipal,
              interest: nextSchedule.dueInterest,
              frequency: loan.repaymentFrequency
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch frequency data:', error);
    }
  };
  const getOrganizationId = () => {
    if (typeof window !== "undefined") {
      const userString = localStorage.getItem("user")
      const user = userString ? JSON.parse(userString) : null
      return user?.organizationId
    }
    return null
  }

  useEffect(() => {
    if (isOpen && loanId) {
      fetchLoanFrequencyData();
    }
  }, [isOpen, loanId]);
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


  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      const initialAmount = selectedInstallment && paymentMode === 'installment-specific'
        ? selectedInstallment.remainingAmount.toString()
        : '';

      setFormData({
        amountPaid: initialAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        receivedBy: '',
        approvedBy: '',
        repaymentProof: '',
        notes: '',
        targetInstallmentId: selectedInstallment?.id || null,
        paymentType: paymentMode,
      });
      setValidationErrors({});
      setCalculatedAllocation(null);
      setShowCalculationPreview(false);
      setDelayedDaysPreview(null);
      setInstallmentDelays([]);
      setInstallmentPreview(null);
      setDuplicatePaymentWarning(null);
      setShowAdvancedOptions(false);
      setIsRefreshingSchedules(false);
      setClassificationWarning(null);
    }
  }, [isOpen, selectedInstallment, paymentMode]);

  // Enhanced payment allocation calculation with classification impact prediction
  useEffect(() => {
    if (formData.amountPaid && parseFloat(formData.amountPaid) > 0) {
      if (paymentMode === 'installment-specific' && selectedInstallment) {
        calculateInstallmentSpecificAllocation();
      } else {
        calculateGeneralPaymentAllocation();
      }
      predictClassificationImpact();
    } else {
      clearCalculations();
    }
  }, [formData.amountPaid, formData.paymentDate, loanData, selectedInstallment, paymentMode]);

  // NEW: Predict classification impact before payment
  const predictClassificationImpact = () => {
    if (!loanData) return;

    const paymentDate = new Date(formData.paymentDate);
    const nextDueDate = new Date(loanData.nextDueDate);
    const currentStatus = loanData.status;
    const currentDaysInArrears = loanData.daysInArrears || 0;

    // Calculate if payment is early or late
    const isEarlyPayment = paymentDate <= nextDueDate;

    // Predict new days in arrears after payment
    let projectedDaysInArrears = currentDaysInArrears;
    if (isEarlyPayment) {
      projectedDaysInArrears = 0; // Early payment clears arrears
    } else {
      // Late payment - days will increase
      const daysLate = Math.floor(
        (paymentDate.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      projectedDaysInArrears = Math.max(currentDaysInArrears, daysLate);
    }

    // Predict new classification
    let projectedStatus = 'PERFORMING';
    if (projectedDaysInArrears > 0 && projectedDaysInArrears <= 30) projectedStatus = 'WATCH';
    else if (projectedDaysInArrears > 30 && projectedDaysInArrears <= 90) projectedStatus = 'SUBSTANDARD';
    else if (projectedDaysInArrears > 90 && projectedDaysInArrears <= 180) projectedStatus = 'DOUBTFUL';
    else if (projectedDaysInArrears > 180) projectedStatus = 'LOSS';

    // Show warning if classification will change
    if (projectedStatus !== currentStatus) {
      const severity = projectedStatus === 'PERFORMING' ? 'success' :
        projectedStatus === 'WATCH' ? 'info' : 'warning';

      setClassificationWarning({
        show: true,
        message: `This payment will reclassify the loan from ${currentStatus} to ${projectedStatus} (${projectedDaysInArrears} days overdue)`,
        severity
      });
    } else {
      setClassificationWarning(null);
    }
  };

  // NEW: Function to silently refresh schedules after payment
  const silentlyRefreshSchedules = async () => {
    if (!onRefreshSchedules) return;

    try {
      setIsRefreshingSchedules(true);
      await onRefreshSchedules();
      console.log('Schedules refreshed silently after payment');
    } catch (error) {
      console.error('Failed to refresh schedules silently:', error);
    } finally {
      setIsRefreshingSchedules(false);
    }
  };

  const clearCalculations = () => {
    setCalculatedAllocation(null);
    setDelayedDaysPreview(null);
    setInstallmentDelays([]);
    setInstallmentPreview(null);
    setDuplicatePaymentWarning(null);
    setClassificationWarning(null);
  };

  const calculateInstallmentSpecificAllocation = () => {
    if (!selectedInstallment || !loanData) return;

    const amount = parseFloat(formData.amountPaid);
    const paymentDate = new Date(formData.paymentDate);
    const dueDate = new Date(selectedInstallment.dueDate);

    // Check if installment can accept payment
    if (selectedInstallment.isPaid) {
      setDuplicatePaymentWarning(
        `Installment #${selectedInstallment.installmentNumber} is already marked as paid. Payment may be blocked by duplicate prevention.`
      );
    } else if (selectedInstallment.canAcceptPayment === false) {
      setDuplicatePaymentWarning(
        `Recent payment attempt detected for installment #${selectedInstallment.installmentNumber}. Please wait before attempting another payment.`
      );
    } else {
      setDuplicatePaymentWarning(null);
    }

    // Calculate delayed days for this specific installment
    const delayedDays = paymentDate > dueDate ?
      Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const isEarlyPayment = paymentDate <= dueDate;

    // Calculate payment allocation for this installment
    let remainingAmount = amount;
    let interestPaid = 0;
    let principalPaid = 0;
    let excessAmount = 0;

    const dueInterest = selectedInstallment.dueInterest;
    const duePrincipal = selectedInstallment.duePrincipal;

    // Pay interest first, then principal
    if (dueInterest > 0 && remainingAmount > 0) {
      interestPaid = Math.min(dueInterest, remainingAmount);
      remainingAmount -= interestPaid;
    }

    if (duePrincipal > 0 && remainingAmount > 0) {
      principalPaid = Math.min(duePrincipal, remainingAmount);
      remainingAmount -= principalPaid;
    }

    excessAmount = remainingAmount;

    // Create installment-specific preview
    const paymentImpact = isEarlyPayment ? 'positive' :
      delayedDays > 0 ? 'negative' : 'neutral';

    setInstallmentPreview({
      installmentNumber: selectedInstallment.installmentNumber,
      dueAmount: selectedInstallment.dueTotal,
      paymentAmount: amount,
      willBePaid: (interestPaid + principalPaid) >= selectedInstallment.remainingAmount,
      remainingAfterPayment: Math.max(0, selectedInstallment.remainingAmount - (interestPaid + principalPaid)),
      delayedDays,
      paymentImpact
    });

    setCalculatedAllocation({
      totalAmount: amount,
      interestPaid,
      principalPaid,
      excessAmount,
      targetInstallment: selectedInstallment.installmentNumber,
      paymentType: 'installment-specific'
    });

    // Set delayed days info for this installment
    setInstallmentDelays([{
      installmentNumber: selectedInstallment.installmentNumber,
      scheduledDueDate: selectedInstallment.dueDate,
      actualPaymentDate: formData.paymentDate,
      delayedDays: delayedDays,
      wasEarlyPayment: isEarlyPayment
    }]);

    setDelayedDaysPreview({
      currentDelayedDays: selectedInstallment.delayedDays || 0,
      paymentDelayedDays: delayedDays,
      isEarlyPayment,
      willResetDelayedDays: isEarlyPayment && (selectedInstallment.delayedDays || 0) > 0,
      projectedDelayedDaysAfterPayment: isEarlyPayment ? 0 : delayedDays,
      paymentImpact,
      targetInstallment: selectedInstallment.installmentNumber
    });
  };

  const calculateGeneralPaymentAllocation = () => {
    if (!loanData) return;

    const amount = parseFloat(formData.amountPaid);
    const outstandingPrincipal = loanData.outstandingPrincipal || 0;
    const accruedInterest = loanData.accruedInterest || 0;
    const paymentDate = new Date(formData.paymentDate);
    const dueDate = new Date(loanData.nextDueDate);

    let remainingAmount = amount;
    let interestPaid = 0;
    let principalPaid = 0;
    let excessAmount = 0;

    // First, pay accrued interest
    if (accruedInterest > 0 && remainingAmount > 0) {
      interestPaid = Math.min(accruedInterest, remainingAmount);
      remainingAmount -= interestPaid;
    }

    // Then, pay principal
    if (outstandingPrincipal > 0 && remainingAmount > 0) {
      principalPaid = Math.min(outstandingPrincipal, remainingAmount);
      remainingAmount -= principalPaid;
    }

    excessAmount = remainingAmount;

    // Calculate delayed days impact
    const delayedDays = paymentDate > dueDate ?
      Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const isEarlyPayment = paymentDate <= dueDate;

    const delayedDaysInfo = {
      currentDelayedDays: loanData.daysInArrears || 0,
      paymentDelayedDays: delayedDays,
      isEarlyPayment,
      willResetDelayedDays: isEarlyPayment && (loanData.daysInArrears || 0) > 0,
      projectedDelayedDaysAfterPayment: isEarlyPayment ? 0 : Math.max(delayedDays, loanData.daysInArrears || 0),
      paymentImpact: isEarlyPayment ? 'positive' : delayedDays > 0 ? 'negative' : 'neutral'
    };

    setCalculatedAllocation({
      totalAmount: amount,
      interestPaid,
      principalPaid,
      excessAmount,
      newOutstandingPrincipal: outstandingPrincipal - principalPaid,
      newAccruedInterest: accruedInterest - interestPaid,
      paymentType: 'general'
    });

    setDelayedDaysPreview(delayedDaysInfo);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
        errors.amountPaid = 'Payment amount is required and must be greater than 0';
      }

      // Enhanced validation for installment-specific payments
      if (paymentMode === 'installment-specific' && selectedInstallment) {
        const amount = parseFloat(formData.amountPaid);
        if (amount > selectedInstallment.remainingAmount * 1.1) {
          errors.amountPaid = `Payment amount exceeds installment balance (${selectedInstallment.remainingAmount.toFixed(2)})`;
        }

        if (selectedInstallment.isPaid) {
          errors.amountPaid = 'This installment is already marked as paid';
        }
      }

      if (!formData.paymentDate) {
        errors.paymentDate = 'Payment date is required';
      }

      const paymentDate = new Date(formData.paymentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (formData.paymentDate > new Date().toISOString().split('T')[0]) {
        errors.paymentDate = 'Payment date cannot be in the future';
      }
      if (!formData.paymentMethod) {
        errors.paymentMethod = 'Payment method is required';
      }
    }

    if (step === 2) {
      if (!formData.receivedBy?.trim()) {
        errors.receivedBy = 'Received by field is required';
      }

      if (formData.receivedBy && formData.receivedBy.length < 2) {
        errors.receivedBy = 'Received by name must be at least 2 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

const handleSubmit = async () => {
  if (!validateStep(2)) return;

  setIsProcessing(true);

  try {
    const paymentData = {
      amountPaid: parseFloat(formData.amountPaid),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod as any,
      receivedBy: formData.receivedBy,
      approvedBy: formData.approvedBy || undefined,
      repaymentProof: formData.repaymentProof || undefined,
      notes: formData.notes || undefined,
      ...(paymentMode === 'installment-specific' && selectedInstallment && {
        targetInstallmentId: selectedInstallment.id,
        notes: `${formData.notes || ''} [Target: Installment #${selectedInstallment.installmentNumber}]`.trim()
      })
    };

    console.log('Submitting payment with auto-classification...');

    const result = await dispatch(processPayment({
      loanId,
      paymentData
    })).unwrap();

    console.log('Payment processed with classification:', result);

    // ✅ ENHANCED: Ensure loan data is refreshed
    await dispatch(fetchLoanApplications({
      page: 1,
      limit: 50
    })).unwrap();

    // ✅ NEW: Trigger preFetchAllSchedules after successful payment
    if (onPaymentSuccess) {
      onPaymentSuccess(); // This should now trigger preFetchAllSchedules in LoanManagementPage
    }

    // Show classification change notification
    if (result.data?.loanStatus?.classification?.wasReclassified) {
      const classif = result.data.loanStatus.classification;
      toast.success(
        `Payment successful! Loan reclassified: ${classif.previousStatus} → ${classif.newStatus}`,
        { duration: 5000 }
      );
    } else {
      toast.success('Payment processed successfully!');
    }

    setCurrentStep(3);

    // ✅ ENHANCED: Refresh schedules silently and ensure LoanManagementPage updates
    if (onRefreshSchedules) {
      await onRefreshSchedules();
    }

    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose();
    }, 3000);

  } catch (error: any) {
    console.error('Payment processing error:', error);
    toast.error(error.message || 'Failed to process payment');
  } finally {
    setIsProcessing(false);
  }
};

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
    { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
    { value: 'check', label: 'Check', icon: FileText },
    { value: 'card', label: 'Card', icon: CreditCard }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[
        { num: 1, label: paymentMode === 'installment-specific' ? 'Installment Payment' : 'Payment Details' },
        { num: 2, label: 'Verification' },
        { num: 3, label: 'Confirmation' }
      ].map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${step.num < currentStep ? 'bg-green-500 text-white' :
              step.num === currentStep ? 'bg-[#5B7FA2] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
              {step.num < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step.num}</span>
              )}
            </div>
            <span className={`mt-1 text-xs font-medium ${step.num <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}>
              {step.label}
            </span>
          </div>
          {index < 2 && (
            <div className={`w-16 h-0.5 mx-2 mt-[-12px] transition-all duration-200 ${step.num < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >


      {/* General Loan Summary for non-installment payments */}
      {paymentMode === 'general' && loanData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#5B7FA2] rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{loanData.borrowerName}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${loanData.status === 'performing' ? 'bg-green-100 text-green-800' :
                    loanData.status === 'watch' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {loanData.status}
                  </span>
                  {loanData.daysInArrears > 0 && (
                    <span className="text-xs text-red-600 font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {loanData.daysInArrears} days delayed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency((loanData.outstandingPrincipal || 0) + (loanData.accruedInterest || 0))}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* NEW: Repayment Frequency Information */}
      {repaymentFrequency && nextInstallmentData && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-indigo-800">
                {frequencyLabel} Schedule
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-indigo-600">Next Payment:</p>
                  <p className="font-medium text-indigo-900">
                    {formatCurrency(nextInstallmentData.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-indigo-600">Due Date:</p>
                  <p className="font-medium text-indigo-900">
                    {new Date(nextInstallmentData.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-indigo-600">Principal Component:</p>
                  <p className="font-medium text-indigo-900">
                    {formatCurrency(nextInstallmentData.principal)}
                  </p>
                </div>
                <div>
                  <p className="text-indigo-600">Interest Component:</p>
                  <p className="font-medium text-indigo-900">
                    {formatCurrency(nextInstallmentData.interest)}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-indigo-100 rounded text-xs text-indigo-800">
                <Info className="w-3 h-3 inline mr-1" />
                Payment amounts are calculated based on {frequencyLabel.toLowerCase()} frequency
              </div>
            </div>
          </div>
        </div>
      )}
      {/* NEW: Classification Impact Warning */}
      {classificationWarning?.show && (
        <div className={`rounded-lg p-4 border ${classificationWarning.severity === 'success' ? 'bg-green-50 border-green-200' :
            classificationWarning.severity === 'info' ? 'bg-blue-50 border-blue-200' :
              'bg-orange-50 border-orange-200'
          }`}>
          <div className="flex items-start">
            {classificationWarning.severity === 'success' ? (
              <TrendingUp className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${classificationWarning.severity === 'success' ? 'text-green-800' :
                  classificationWarning.severity === 'info' ? 'text-blue-800' :
                    'text-orange-800'
                }`}>
                Classification Impact
              </p>
              <p className={`text-sm mt-1 ${classificationWarning.severity === 'success' ? 'text-green-700' :
                  classificationWarning.severity === 'info' ? 'text-blue-700' :
                    'text-orange-700'
                }`}>
                {classificationWarning.message}
              </p>
              <p className="text-xs mt-2 text-gray-600">
                <Info className="w-3 h-3 inline mr-1" />
                Loan will be automatically reclassified after payment processing
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Payment Warning */}
      {duplicatePaymentWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">Duplicate Payment Warning</p>
              <p className="text-orange-700 text-sm mt-1">{duplicatePaymentWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Amount (RWF) *
          {nextInstallmentData && (
            <span className="text-xs text-gray-500 ml-2 font-normal">
              (Next {frequencyLabel}: {formatCurrency(nextInstallmentData.amount)})
            </span>
          )}
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amountPaid}
            onChange={(e) => handleInputChange('amountPaid', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.amountPaid ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter payment amount"
          />
        </div>
        {validationErrors.amountPaid && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.amountPaid}
          </p>
        )}

        {/* Enhanced Quick Amount Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {paymentMode === 'installment-specific' && selectedInstallment ? (
            <>
              <button
                type="button"
                onClick={() => handleInputChange('amountPaid', selectedInstallment.remainingAmount.toString())}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                Full Installment ({formatCurrency(selectedInstallment.remainingAmount)})
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('amountPaid', selectedInstallment.duePrincipal.toString())}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                Principal Only ({formatCurrency(selectedInstallment.duePrincipal)})
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('amountPaid', selectedInstallment.dueInterest.toString())}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
              >
                Interest Only ({formatCurrency(selectedInstallment.dueInterest)})
              </button>
            </>
          ) : loanData && (
            <>
      {/* Enhanced Quick Amount Buttons - Frequency Aware */}
      <div className="flex flex-wrap gap-2 mt-3">
        {paymentMode === 'installment-specific' && selectedInstallment ? (
          <>
            <button
              type="button"
              onClick={() => handleInputChange('amountPaid', selectedInstallment.remainingAmount.toString())}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              Full Installment ({formatCurrency(selectedInstallment.remainingAmount)})
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('amountPaid', selectedInstallment.duePrincipal.toString())}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Principal Only ({formatCurrency(selectedInstallment.duePrincipal)})
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('amountPaid', selectedInstallment.dueInterest.toString())}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Interest Only ({formatCurrency(selectedInstallment.dueInterest)})
            </button>
          </>
        ) : nextInstallmentData ? (
          <>
            {/* Dynamic Frequency Button */}
            <button
              type="button"
              onClick={() => handleInputChange('amountPaid', nextInstallmentData.amount.toString())}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {frequencyLabel} ({formatCurrency(nextInstallmentData.amount)})
            </button>

            {/* Principal Only - Frequency Aware */}
            {nextInstallmentData.principal > 0 && (
              <button
                type="button"
                onClick={() => handleInputChange('amountPaid', nextInstallmentData.principal.toString())}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                Principal Only ({formatCurrency(nextInstallmentData.principal)})
              </button>
            )}

            {/* Interest Only - Frequency Aware */}
            {nextInstallmentData.interest > 0 && (
              <button
                type="button"
                onClick={() => handleInputChange('amountPaid', nextInstallmentData.interest.toString())}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
              >
                Interest Only ({formatCurrency(nextInstallmentData.interest)})
              </button>
            )}

            {/* Full Balance - Generic */}
            {loanData && (
              <button
                type="button"
                onClick={() => handleInputChange('amountPaid', ((loanData.outstandingPrincipal || 0) + (loanData.accruedInterest || 0)).toString())}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              >
                Full Balance
              </button>
            )}
          </>
        ) : null}
      </div>
              {loanData.accruedInterest > 0 && (
                <button
                  type="button"
                  onClick={() => handleInputChange('amountPaid', loanData.accruedInterest.toString())}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  Interest Only ({formatCurrency(loanData.accruedInterest)})
                </button>
              )}

            </>
          )}
        </div>
      </div>

      {/* Enhanced Payment Date with Delayed Days Warning */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={formData.paymentDate}
            onChange={(e) => handleInputChange('paymentDate', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.paymentDate ? 'border-red-500' : 'border-gray-300'
              }`}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        {validationErrors.paymentDate && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.paymentDate}
          </p>
        )}

        {/* Enhanced Delayed Days Warning/Info */}
        {delayedDaysPreview && (
          <div className={`p-3 rounded-lg border ${delayedDaysPreview.paymentImpact === 'positive' ? 'bg-green-50 border-green-200' :
            delayedDaysPreview.paymentImpact === 'negative' ? 'bg-orange-50 border-orange-200' :
              'bg-blue-50 border-blue-200'
            }`}>
            <div className="flex items-start space-x-2">
              <Clock className={`w-4 h-4 mt-0.5 ${delayedDaysPreview.paymentImpact === 'positive' ? 'text-green-600' :
                delayedDaysPreview.paymentImpact === 'negative' ? 'text-orange-600' :
                  'text-blue-600'
                }`} />
              <div className="text-sm flex-1">
                {delayedDaysPreview.isEarlyPayment ? (
                  <div>
                    <p className="font-medium text-green-800">Early Payment</p>
                    <p className="text-green-700">
                      {delayedDaysPreview.willResetDelayedDays
                        ? `This will reset ${delayedDaysPreview.currentDelayedDays} delayed days to 0`
                        : 'Payment is on time'
                      }
                      {delayedDaysPreview.targetInstallment &&
                        ` for installment #${delayedDaysPreview.targetInstallment}`
                      }
                    </p>
                  </div>
                ) : delayedDaysPreview.paymentDelayedDays > 0 ? (
                  <div>
                    <p className="font-medium text-orange-800">Late Payment</p>
                    <p className="text-orange-700">
                      This payment is {delayedDaysPreview.paymentDelayedDays} days after due date
                      {delayedDaysPreview.targetInstallment &&
                        ` for installment #${delayedDaysPreview.targetInstallment}`
                      }
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-blue-800">On-Time Payment</p>
                    <p className="text-blue-700">
                      Payment is made on the due date
                      {delayedDaysPreview.targetInstallment &&
                        ` for installment #${delayedDaysPreview.targetInstallment}`
                      }
                    </p>
                  </div>
                )}

                {/* Additional warning for installment-specific payments */}
                {paymentMode === 'installment-specific' && selectedInstallment && selectedInstallment.delayedDays > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-xs">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      This installment already has {selectedInstallment.delayedDays} delayed days.
                      Early payment will reset this to 0.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Method *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => handleInputChange('paymentMethod', method.value)}
                className={`p-3 border rounded-lg flex items-center space-x-3 transition-all duration-200 hover:bg-gray-50 ${formData.paymentMethod === method.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700'
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>
        {validationErrors.paymentMethod && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.paymentMethod}
          </p>
        )}
      </div>

      {/* Advanced Options */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Advanced Options</span>
          {showAdvancedOptions ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Proof/Reference
                </label>
                <input
                  type="text"
                  value={formData.repaymentProof}
                  onChange={(e) => handleInputChange('repaymentProof', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Receipt number, transaction ID, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Payment Allocation Preview */}
      {calculatedAllocation && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-800 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Payment Allocation Preview
            </h3>
            <button
              type="button"
              onClick={() => setShowCalculationPreview(!showCalculationPreview)}
              className="text-xs text-green-600 hover:text-green-700"
            >
              {showCalculationPreview ? 'Hide' : 'Show'} Details
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-600 font-medium">Interest Payment</p>
              <p className="text-green-800 font-bold">
                {formatCurrency(calculatedAllocation.interestPaid)}
              </p>
            </div>
            <div>
              <p className="text-green-600 font-medium">Principal Payment</p>
              <p className="text-green-800 font-bold">
                {formatCurrency(calculatedAllocation.principalPaid)}
              </p>
            </div>
            <div>
              <p className="text-green-600 font-medium">Total Allocated</p>
              <p className="text-green-800 font-bold">
                {formatCurrency(calculatedAllocation.interestPaid + calculatedAllocation.principalPaid)}
              </p>
            </div>
            <div>
              <p className="text-green-600 font-medium">Excess Amount</p>
              <p className="text-green-800 font-bold">
                {formatCurrency(calculatedAllocation.excessAmount)}
              </p>
            </div>
          </div>

          {showCalculationPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-3"
            >
              {/* Installment-specific preview */}
              {installmentPreview && (
                <div className="p-3 bg-white border border-green-200 rounded">
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    Installment Impact
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-600">Installment Status:</p>
                      <p className={`font-medium ${installmentPreview.willBePaid ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                        {installmentPreview.willBePaid ? 'Will be fully paid' : 'Partial payment'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining After Payment:</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(installmentPreview.remainingAfterPayment)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delayed days impact */}
              {delayedDaysPreview && (
                <div className="p-3 bg-white border border-green-200 rounded">
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Delayed Days Impact
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-600">Current Delayed Days:</p>
                      <p className="font-medium text-gray-900">{delayedDaysPreview.currentDelayedDays}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">After Payment:</p>
                      <p className={`font-medium ${delayedDaysPreview.projectedDelayedDaysAfterPayment < delayedDaysPreview.currentDelayedDays ? 'text-green-600' :
                        delayedDaysPreview.projectedDelayedDaysAfterPayment > delayedDaysPreview.currentDelayedDays ? 'text-red-600' :
                          'text-gray-900'
                        }`}>
                        {delayedDaysPreview.projectedDelayedDaysAfterPayment}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* General payment impact */}
              {calculatedAllocation.paymentType === 'general' && calculatedAllocation.newOutstandingPrincipal !== undefined && (
                <div className="p-3 bg-white border border-green-200 rounded">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Balance After Payment</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-600">New Outstanding Principal:</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(calculatedAllocation.newOutstandingPrincipal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">New Accrued Interest:</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(calculatedAllocation.newAccruedInterest || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {calculatedAllocation.excessAmount > 0 && (
                <div className="p-2 bg-yellow-100 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    Excess amount will be applied to future payments or refunded
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Verification</h3>
        <p className="text-sm text-gray-600">Please verify payment details and provide authorization</p>
      </div>

      {/* Enhanced Payment Summary */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Payment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">
              {formatCurrency(parseFloat(formData.amountPaid || '0'))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{new Date(formData.paymentDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Method:</span>
            <span className="font-medium capitalize">{formData.paymentMethod.replace('_', ' ')}</span>
          </div>
          {paymentMode === 'installment-specific' && selectedInstallment && (
            <div className="flex justify-between">
              <span className="text-gray-600">Target Installment:</span>
              <span className="font-medium">#{selectedInstallment.installmentNumber}</span>
            </div>
          )}
          {delayedDaysPreview && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Delayed Days Impact:</span>
                <span className={`font-medium ${delayedDaysPreview.paymentImpact === 'positive' ? 'text-green-600' :
                  delayedDaysPreview.paymentImpact === 'negative' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                  {delayedDaysPreview.isEarlyPayment ? 'Early Payment' :
                    delayedDaysPreview.paymentDelayedDays > 0 ? `${delayedDaysPreview.paymentDelayedDays} days late` :
                      'On Time'}
                </span>
              </div>
              {installmentDelays.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Affected Installments:</span>
                  <span className="font-medium text-orange-600">
                    {installmentDelays.length} installment(s) with delays
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Received By */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Received By *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.receivedBy}
            onChange={(e) => handleInputChange('receivedBy', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.receivedBy ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Name of person receiving payment"
          />
        </div>
        {validationErrors.receivedBy && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.receivedBy}
          </p>
        )}
      </div>

      {/* Approved By */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Approved By
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.approvedBy}
            onChange={(e) => handleInputChange('approvedBy', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Name of approving officer (optional)"
          />
        </div>
      </div>

      {/* Additional Verification Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Payment Verification</p>
            <p className="text-blue-700 mt-1">
              This payment will be processed with enhanced delayed days tracking and
              {paymentMode === 'installment-specific' ? ' installment-specific allocation.' : ' automatic allocation across due installments.'}
              Duplicate payment prevention is active.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Processed Successfully!</h3>
        <p className="text-gray-600">
          Payment of {formatCurrency(parseFloat(formData.amountPaid || '0'))} has been processed.
          {paymentMode === 'installment-specific' && selectedInstallment && (
            <span className="block mt-1">
              Installment #{selectedInstallment.installmentNumber} has been updated.
            </span>
          )}
        </p>

        {/* NEW: Show classification change */}
        {lastClassificationUpdate?.wasReclassified && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="font-medium text-blue-900">Loan Classification Updated</p>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                Status: <span className="font-medium">{lastClassificationUpdate.previousStatus}</span>
                {' → '}
                <span className="font-medium">{lastClassificationUpdate.newStatus}</span>
              </p>
              <p>Days Overdue: <span className="font-medium">{lastClassificationUpdate.daysOverdue}</span></p>
            </div>
          </div>
        )}

        {delayedDaysPreview && (
          <div className={`mt-3 p-3 rounded-lg ${delayedDaysPreview.paymentImpact === 'positive' ? 'bg-green-50 border border-green-200' :
            delayedDaysPreview.paymentImpact === 'negative' ? 'bg-orange-50 border border-orange-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
            <p className={`text-sm font-medium ${delayedDaysPreview.paymentImpact === 'positive' ? 'text-green-800' :
              delayedDaysPreview.paymentImpact === 'negative' ? 'text-orange-800' :
                'text-blue-800'
              }`}>
              {delayedDaysPreview.isEarlyPayment
                ? '✓ Early payment recorded - delayed days reset to 0'
                : delayedDaysPreview.paymentDelayedDays > 0
                  ? `⚠ Payment recorded with ${delayedDaysPreview.paymentDelayedDays} delayed days`
                  : '✓ On-time payment recorded'
              }
            </p>
          </div>
        )}

        {/* Silent refresh indicator */}
        {isRefreshingSchedules && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Updating schedules...</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
        <p className="text-sm text-green-800">
          A payment receipt has been generated and the loan balance has been updated.
          {paymentMode === 'installment-specific'
            ? ' The specific installment has been marked accordingly.'
            : ' Payment has been allocated across due installments.'
          }
          Delayed days tracking has been applied.
          {lastClassificationUpdate?.wasReclassified && ' Loan has been automatically reclassified based on payment timing.'}
          {isRefreshingSchedules ? ' Updating schedules...' : ' Schedules updated successfully.'}
          This window will close automatically.
        </p>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && currentStep !== 3 && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#5B7FA2] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white-700 bg-opacity-20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {paymentMode === 'installment-specific' ? 'Installment Payment' : 'Payment Processing'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {loanData?.borrowerName}
                </p>
              </div>
            </div>
            {currentStep !== 3 && (
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <StepIndicator />

            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </AnimatePresence>

            {error && currentStep !== 3 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {currentStep !== 3 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    disabled={isLoading || isProcessing}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 transform rotate-180" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {currentStep < 2 ? (
                  <button
                    onClick={handleNext}
                    disabled={!formData.amountPaid || isLoading || isProcessing}
                    className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {isLoading || isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || isProcessing}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {isLoading || isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Process Payment
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentForm;