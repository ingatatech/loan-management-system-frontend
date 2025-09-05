// @ts-nocheck

"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Shield,
    AlertTriangle,
    Calculator,
    FileText,
    Search,
    CheckCircle2,
    XCircle,
    DollarSign,
    User,
    TrendingDown,
    Eye,
    RefreshCw,
    Save,
    ArrowRight,
    Info,
    AlertCircle,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
    calculateProvisions,
    calculateDaysInArrears,
    createLoanClassification,
    clearError,
    clearCurrentClassification,
    LoanStatus,
    type CreateClassificationRequest,

} from "@/lib/features/repayment/loanClassificationSlice"
import { fetchLoanApplications, type LoanApplication } from "@/lib/features/auth/loanApplicationSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

const CreateClassificationPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const { currentClassification, isLoading, error } = useAppSelector((state) => state.loanClassification)
    const { applications: loanApplications, isLoading: loansLoading } = useAppSelector((state) => state.loanApplication)

    // UI state
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showLoanSelector, setShowLoanSelector] = useState(true)
    const [showCalculationPreview, setShowCalculationPreview] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [loadingLoanId, setLoadingLoanId] = useState<number | null>(null)

    // Form data state
    const [formData, setFormData] = useState<CreateClassificationRequest>({
        loanId: 0,
        classificationDate: new Date().toISOString().split("T")[0],
        daysInArrears: 0,
        currentStatus: LoanStatus.PERFORMING,
        previousStatus: LoanStatus.PERFORMING,
        outstandingPrincipal: 0,
        accruedInterest: 0,
        netExposure: 0,
        provisioningRate: 0.01,
        provisionRequired: 0,
        riskRating: "Normal/Standard",
        notes: "",
    })

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    // Get organization ID from localStorage
    const getOrganizationId = () => {
        if (typeof window !== "undefined") {
            const userString = localStorage.getItem("user")
            const user = userString ? JSON.parse(userString) : null
            return user?.organizationId
        }
        return null
    }

    const organizationId = getOrganizationId()

    // Load loan applications on component mount
    useEffect(() => {
        if (organizationId) {
            dispatch(fetchLoanApplications({ page: 1, limit: 50 }))
        }
    }, [dispatch, organizationId])

    // Add this useEffect to scroll to form when step changes to 3
    useEffect(() => {
        if (currentStep === 3) {
            // Scroll to the form section smoothly
            setTimeout(() => {
                const formElement = document.querySelector('form')
                if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }, 300)
        }
    }, [currentStep])

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError())
            dispatch(clearCurrentClassification())
        }
    }, [dispatch])

    // Filter loans based on search term
    const filteredLoans = useMemo(() => {
        if (!searchTerm) return loanApplications
        return loanApplications.filter(
            (loan) =>
                loan.borrower.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.borrower.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.borrower.nationalId.includes(searchTerm) ||
                loan.id.toString().includes(searchTerm),
        )
    }, [loanApplications, searchTerm])

    const handleLoanSelection = async (loan: LoanApplication) => {
        if (!organizationId) {
            toast.error("Organization ID not found")
            return
        }

        setLoadingLoanId(loan.id)

        try {
            setSelectedLoan(loan)
            setFormData((prev) => ({
                ...prev,
                loanId: loan.id,
                outstandingPrincipal: loan.outstandingPrincipal || 0,
            }))

            await dispatch(calculateDaysInArrears({ organizationId, loanId: loan.id })).unwrap()

            setShowLoanSelector(false)
            setCurrentStep(2)
        } catch (error: any) {
            toast.error(error || "Failed to calculate days in arrears")
        } finally {
            setLoadingLoanId(null)
        }
    }

    const handleCalculateProvisions = async () => {
        if (!organizationId || !selectedLoan) {
            toast.error("Missing required data for calculation")
            return
        }

        try {
            const result = await dispatch(calculateProvisions({ organizationId, loanId: selectedLoan.id })).unwrap()

            // Pre-fill form with calculated data - FIXED MAPPING
            if (result.data) {
                const calculationData = result.data;

                // Map API response fields to form fields correctly
                setFormData((prev) => ({
                    ...prev,
                    daysInArrears: calculationData.daysInArrears || prev.daysInArrears,
                    // Map outstandingBalance to outstandingPrincipal
                    outstandingPrincipal: calculationData.outstandingBalance || prev.outstandingPrincipal,
                    // Set accruedInterest to 0 if not provided, or use existing value
                    accruedInterest: prev.accruedInterest, // Keep existing or set to 0
                    // Calculate netExposure properly
                    netExposure: (calculationData.outstandingBalance || prev.outstandingPrincipal) + prev.accruedInterest,
                    provisioningRate: calculationData.provisioningRate || prev.provisioningRate,
                    provisionRequired: calculationData.provisionRequired || prev.provisionRequired,
                    // Map loanClass to riskRating with proper conversion
                    riskRating: mapLoanClassToRiskRating(calculationData.loanClass) || prev.riskRating,
                    // Map loanClass to currentStatus
                    currentStatus: mapLoanClassToStatus(calculationData.loanClass) || prev.currentStatus,
                    // Add the additional fields from API
                    loanClass: calculationData.loanClass,
                    collateralValue: calculationData.collateralValue,
                    previousProvisionsHeld: calculationData.previousProvisionsHeld,
                    additionalProvisionsThisPeriod: calculationData.additionalProvisionsThisPeriod,
                }))

                setShowCalculationPreview(true)
                toast.success("Risk assessment calculated successfully! Review the results below.")
            }
        } catch (error: any) {
            toast.error(error || "Failed to calculate provisions")
        }
    }

    const handleProceedToClassification = () => {
        setCurrentStep(3)
        setShowCalculationPreview(false)
    }

    const mapLoanClassToRiskRating = (loanClass: string): string => {
        const mapping: { [key: string]: string } = {
            'normal': 'Normal/Standard',
            'watch': 'Watch',
            'substandard': 'Substandard',
            'doubtful': 'Doubtful',
            'loss': 'Loss'
        }
        return mapping[loanClass] || 'Normal/Standard'
    }

    const mapLoanClassToStatus = (loanClass: string): LoanStatus => {
        const mapping: { [key: string]: LoanStatus } = {
            'normal': LoanStatus.PERFORMING,
            'watch': LoanStatus.WATCH,
            'substandard': LoanStatus.SUBSTANDARD,
            'doubtful': LoanStatus.DOUBTFUL,
            'loss': LoanStatus.LOSS
        }
        return mapping[loanClass] || LoanStatus.PERFORMING
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CreateClassificationRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setHasUnsavedChanges(true)

        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        // Auto-calculate derived values
        if (field === "daysInArrears") {
            const daysInArrears = Number(value)
            let newStatus = LoanStatus.PERFORMING
            let newRiskRating = "Normal/Standard"
            let newProvisioningRate = 0.01

            if (daysInArrears > 365) {
                newStatus = LoanStatus.LOSS
                newRiskRating = "Loss"
                newProvisioningRate = 1.0
            } else if (daysInArrears > 180) {
                newStatus = LoanStatus.DOUBTFUL
                newRiskRating = "Doubtful"
                newProvisioningRate = 0.5
            } else if (daysInArrears > 90) {
                newStatus = LoanStatus.SUBSTANDARD
                newRiskRating = "Substandard"
                newProvisioningRate = 0.25
            } else if (daysInArrears > 30) {
                newStatus = LoanStatus.WATCH
                newRiskRating = "Watch"
                newProvisioningRate = 0.05
            }

            setFormData((prev) => ({
                ...prev,
                currentStatus: newStatus,
                riskRating: newRiskRating,
                provisioningRate: newProvisioningRate,
                provisionRequired: prev.netExposure * newProvisioningRate,
            }))
        }

        if (field === "outstandingPrincipal" || field === "accruedInterest") {
            setFormData((prev) => {
                const newOutstanding = field === "outstandingPrincipal" ? Number(value) : prev.outstandingPrincipal
                const newAccrued = field === "accruedInterest" ? Number(value) : prev.accruedInterest
                const newNetExposure = newOutstanding + newAccrued
                return {
                    ...prev,
                    netExposure: newNetExposure,
                    provisionRequired: newNetExposure * prev.provisioningRate,
                }
            })
        }
    }

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.loanId) {
            errors.loanId = "Please select a loan"
        }

        if (!formData.classificationDate) {
            errors.classificationDate = "Classification date is required"
        }

        if (formData.daysInArrears < 0) {
            errors.daysInArrears = "Days in arrears cannot be negative"
        }

        if (formData.outstandingPrincipal <= 0) {
            errors.outstandingPrincipal = "Outstanding principal must be greater than 0"
        }

        if (formData.accruedInterest < 0) {
            errors.accruedInterest = "Accrued interest cannot be negative"
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm() || !organizationId) {
            toast.error("Please fix validation errors")
            return
        }

        try {
            await dispatch(
                createLoanClassification({
                    organizationId,
                    loanId: formData.loanId,
                    classificationData: formData, // Pass the entire formData object
                }),
            ).unwrap()

            toast.success("Loan classification created successfully!")
            setHasUnsavedChanges(false)

            // Reset form
            setCurrentStep(1)
            setSelectedLoan(null)
            setShowLoanSelector(true)
            setShowCalculationPreview(false)
            setFormData({
                loanId: 0,
                classificationDate: new Date().toISOString().split("T")[0],
                daysInArrears: 0,
                currentStatus: LoanStatus.PERFORMING,
                previousStatus: LoanStatus.PERFORMING,
                outstandingPrincipal: 0,
                accruedInterest: 0,
                netExposure: 0,
                provisioningRate: 0.01,
                provisionRequired: 0,
                riskRating: "Normal/Standard",
                notes: "",
                // Reset additional fields
                loanClass: "",
                collateralValue: 0,
                previousProvisionsHeld: 0,
                additionalProvisionsThisPeriod: 0,
            })
        } catch (error: any) {
            toast.error(error || "Failed to create loan classification")
        }
    }

    // Get status badge styling
    const getStatusBadge = (status: LoanStatus) => {
        const statusConfig = {
            [LoanStatus.PERFORMING]: {
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle2,
                label: "Performing",
            },
            [LoanStatus.WATCH]: {
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Eye,
                label: "Watch",
            },
            [LoanStatus.SUBSTANDARD]: {
                color: "bg-orange-100 text-orange-800 border-orange-200",
                icon: AlertTriangle,
                label: "Substandard",
            },
            [LoanStatus.DOUBTFUL]: {
                color: "bg-red-100 text-red-800 border-red-200",
                icon: TrendingDown,
                label: "Doubtful",
            },
            [LoanStatus.LOSS]: {
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: XCircle,
                label: "Loss",
            },
        }

        const config = statusConfig[status]
        const IconComponent = config.icon

        return (
            <Badge className={`${config.color} border flex items-center space-x-1`}>
                <IconComponent className="w-3 h-3" />
                <span>{config.label}</span>
            </Badge>
        )
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-RW", {
            style: "currency",
            currency: "RWF",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center">
                                    <Shield className="w-7 h-7 mr-3" />
                                    Create Loan Classification
                                </h1>
                                <p className="text-green-100 text-sm mt-1">Assess loan risk and calculate provisioning requirements</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-100 text-xs">Step</p>
                                <p className="text-white font-semibold text-lg">{currentStep} of 3</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-2 bg-gray-50">
                        <Progress value={(currentStep / 3) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span className={currentStep >= 1 ? "text-green-600 font-medium" : ""}>Select Loan</span>
                            <span className={currentStep >= 2 ? "text-green-600 font-medium" : ""}>Calculate Risk</span>
                            <span className={currentStep >= 3 ? "text-green-600 font-medium" : ""}>Create Classification</span>
                        </div>
                    </div>
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Step 1: Loan Selection */}
                <AnimatePresence>
                    {showLoanSelector && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center">
                                        <Search className="w-5 h-5 mr-2 text-green-600" />
                                        Select Loan for Classification
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Search by borrower name, national ID, or loan ID..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500"

                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => dispatch(fetchLoanApplications({ page: 1, limit: 50 }))}
                                                disabled={loansLoading}
                                                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"

                                            >
                                                <RefreshCw className={`w-4 h-4 ${loansLoading ? "animate-spin" : ""}`} />
                                            </Button>
                                        </div>

                                        {loansLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                    className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full"
                                                />
                                                <span className="ml-2 text-gray-600">Loading loans...</span>
                                            </div>
                                        ) : filteredLoans.length === 0 ? (
                                            <div className="text-center py-8">
                                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 font-medium">No loans found</p>
                                                <p className="text-sm text-gray-500">
                                                    {searchTerm ? "Try adjusting your search criteria" : "No loan applications available"}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gradient-to-r from-green-50 to-emerald-100">
                                                            <tr>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    #
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Borrower
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    National ID
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Disbursed Amount
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Term
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Interest Rate
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="bg-white divide-y divide-gray-100">
                                                            {filteredLoans.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                                                        No loans found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                filteredLoans.map((loan, index) => (
                                                                    <motion.tr
                                                                        key={loan.id}
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: index * 0.05 }}
                                                                        className="hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        {/* Index + 1 */}
                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                                                <span className="text-xs font-semibold text-green-600">
                                                                                    {index + 1}
                                                                                </span>
                                                                            </div>
                                                                        </td>

                                                                        {/* Borrower */}
                                                                        <td className="px-3 py-3">
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900">
                                                                                    {loan.borrower.firstName} {loan.borrower.lastName}
                                                                                </p>
                                                                            </div>
                                                                        </td>

                                                                        {/* National ID - CORRECTED: Access through loan.borrower */}
                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <div className="font-mono text-sm text-gray-700">
                                                                                {loan.borrower.nationalId}
                                                                            </div>
                                                                        </td>

                                                                        {/* Disbursed Amount */}
                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <p className="font-semibold text-gray-900">
                                                                                {formatCurrency(loan.disbursedAmount || 0)}
                                                                            </p>
                                                                        </td>

                                                                        {/* Term */}
                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <p className="text-sm text-gray-700">{loan.termInMonths} months</p>
                                                                        </td>

                                                                        {/* Interest Rate */}
                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <p className="text-sm text-gray-700">{loan.annualInterestRate}%</p>
                                                                        </td>

                                                                        {/* Status */}
                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <span
                                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${loan.status === 'Active'
                                                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                                                    }`}
                                                                            >
                                                                                {loan.status}
                                                                            </span>
                                                                        </td>

                                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleLoanSelection(loan)}
                                                                                disabled={loadingLoanId === loan.id}
                                                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-md px-3 py-1 text-xs font-medium shadow-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {loadingLoanId === loan.id ? (
                                                                                    <>
                                                                                        <motion.div
                                                                                            animate={{ rotate: 360 }}
                                                                                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                                                            className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full"
                                                                                        />
                                                                                        Calculating...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <ArrowRight className="w-4 h-4 mr-1" />
                                                                                        Select
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </td>
                                                                    </motion.tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step 2 & 3: Classification Form */}
                {selectedLoan && !showLoanSelector && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Selected Loan Summary */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <User className="w-5 h-5 mr-2 text-green-600" />
                                        Selected Loan Details
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowLoanSelector(true)
                                            setCurrentStep(1)
                                            setShowCalculationPreview(false)
                                        }}
                                        className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"

                                    >
                                        Change Loan
                                    </Button>
                                </CardTitle>
                            </CardHeader>

                        </Card>

                        {/* Auto-Calculation Section */}
                        {currentStep === 2 && !showCalculationPreview && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center">
                                        <Calculator className="w-5 h-5 mr-2 text-green-600" />
                                        Risk Assessment & Calculation
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <Info className="w-5 h-5 text-green-600 mr-2" />
                                                <h4 className="font-semibold text-green-800">Auto-Calculate Provisions</h4>
                                            </div>
                                            <p className="text-sm text-green-700 mb-4">
                                                Click the button below to automatically calculate days in arrears, risk rating, and provisioning
                                                requirements based on current loan data.
                                            </p>
                                            <Button
                                                onClick={handleCalculateProvisions}
                                                disabled={isLoading}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                            className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                                                        />
                                                        Calculating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Calculator className="w-4 h-4 mr-2" />
                                                        Calculate Provisions
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Calculation Preview Section */}
                        {currentStep === 2 && showCalculationPreview && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="flex items-center">
                                                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                                                Risk Assessment Results Preview
                                            </span>
                                            <Badge className="bg-green-100 text-green-800">Calculated Successfully</Badge>
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-6">
                                            {/* Summary Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-700">Risk Assessment</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Days in Arrears:</span>
                                                            <span className="font-medium text-gray-800">{formData.daysInArrears}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Loan Class:</span>
                                                            <span className="font-medium text-gray-800">{formData.loanClass || 'Normal'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Risk Rating:</span>
                                                            <span className="font-medium text-gray-800">{formData.riskRating}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Current Status:</span>
                                                            <div>{getStatusBadge(formData.currentStatus)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-700">Financial Summary</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Outstanding Principal:</span>
                                                            <span className="font-medium text-gray-800">{formatCurrency(formData.outstandingPrincipal)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Collateral Value:</span>
                                                            <span className="font-medium text-gray-800">{formatCurrency(formData.collateralValue || 0)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Provisioning Rate:</span>
                                                            <span className="font-medium text-gray-800">
                                                                {(formData.provisioningRate * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Provision Required:</span>
                                                            <span className="font-medium text-red-600">{formatCurrency(formData.provisionRequired)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-500">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowCalculationPreview(false)
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            daysInArrears: 0,
                                                            provisioningRate: 0.01,
                                                            provisionRequired: 0,
                                                            riskRating: "Normal/Standard",
                                                            currentStatus: LoanStatus.PERFORMING
                                                        }))
                                                    }}
                                                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"

                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Recalculate
                                                </Button>

                                                <Button
                                                    onClick={handleProceedToClassification}
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                                >
                                                    Proceed to Create Classification
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Info className="w-4 h-4 mr-1" />
                                                Review the calculated risk assessment above. Click "Proceed to Create Classification" to continue.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Classification Form */}
                        {currentStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Header Card */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-gray-700" />
                                        Classification Details
                                    </h3>

                                    <p className="text-sm text-gray-500 flex items-center">
                                        <Info className="w-4 h-4 mr-1" />
                                        Complete the classification form below. The risk assessment has been pre-filled based on calculations.
                                    </p>
                                </div>

                                {/* Form */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            {/* Classification Date */}
                                            <div>
                                                <Label htmlFor="classificationDate">Classification Date *</Label>
                                                <Input
                                                    id="classificationDate"
                                                    type="date"
                                                    value={formData.classificationDate}
                                                    onChange={(e) => handleInputChange("classificationDate", e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                                />
                                                {validationErrors.classificationDate && (
                                                    <p className="text-xs text-red-500 mt-1 flex items-center">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        {validationErrors.classificationDate}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Days in Arrears */}
                                            <div>
                                                <Label htmlFor="daysInArrears">Days in Arrears *</Label>
                                                <Input
                                                    id="daysInArrears"
                                                    type="number"
                                                    value={formData.daysInArrears}
                                                    onChange={(e) => handleInputChange("daysInArrears", Number.parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                                    min="0"
                                                />
                                                {validationErrors.daysInArrears && (
                                                    <p className="text-xs text-red-500 mt-1 flex items-center">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        {validationErrors.daysInArrears}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Current Status */}
                                            <div>
                                                <Label htmlFor="currentStatus">Current Status *</Label>
                                                <Select

                                                    value={formData.currentStatus}
                                                    onValueChange={(value: LoanStatus) => handleInputChange("currentStatus", value)}
                                                >
                                                    <SelectTrigger
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="w-full bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                                                    >
                                                        <SelectItem value={LoanStatus.PERFORMING}>Performing</SelectItem>
                                                        <SelectItem value={LoanStatus.WATCH}>Watch</SelectItem>
                                                        <SelectItem value={LoanStatus.SUBSTANDARD}>Substandard</SelectItem>
                                                        <SelectItem value={LoanStatus.DOUBTFUL}>Doubtful</SelectItem>
                                                        <SelectItem value={LoanStatus.LOSS}>Loss</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Previous Status */}
                                            <div>
                                                <Label htmlFor="previousStatus">Previous Status</Label>
                                                <Select
                                                    value={formData.previousStatus}
                                                    onValueChange={(value: LoanStatus) => handleInputChange("previousStatus", value)}
                                                >
                                                    <SelectTrigger
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="w-full bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"

                                                    >
                                                        <SelectItem value={LoanStatus.PERFORMING}>Performing</SelectItem>
                                                        <SelectItem value={LoanStatus.WATCH}>Watch</SelectItem>
                                                        <SelectItem value={LoanStatus.SUBSTANDARD}>Substandard</SelectItem>
                                                        <SelectItem value={LoanStatus.DOUBTFUL}>Doubtful</SelectItem>
                                                        <SelectItem value={LoanStatus.LOSS}>Loss</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Net Exposure (read-only) */}
                                            <div>
                                                <Label htmlFor="netExposure">Net Exposure (RWF)</Label>
                                                <Input
                                                    id="netExposure"
                                                    type="number"
                                                    value={formData.netExposure}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Calculated: Outstanding Principal + Accrued Interest</p>
                                            </div>

                                            {/* Provision Required */}
                                            <div>
                                                <Label htmlFor="provisionRequired">Provision Required (RWF)</Label>
                                                <Input
                                                    id="provisionRequired"
                                                    type="number"
                                                    value={formData.provisionRequired}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-red-50 text-red-600 font-semibold focus:ring-2 focus:ring-gray-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Calculated: Net Exposure × Provisioning Rate</p>
                                            </div>

                                            {/* Add remaining fields similarly with compact spacing and gray-standard colors */}
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <Label htmlFor="notes">Classification Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                                placeholder="Additional notes about the loan classification..."
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}
                                                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 hover:bg-gray-300 hover:text-black"

                                            >
                                                Back
                                            </Button>

                                            <Button type="submit" disabled={isLoading} className="bg-gray-800 text-white hover:bg-gray-900">
                                                {isLoading ? "Creating Classification..." : "Create Classification"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default CreateClassificationPage
