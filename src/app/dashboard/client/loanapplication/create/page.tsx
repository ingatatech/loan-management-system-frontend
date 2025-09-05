// @ts-nocheck
"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Building2,
  DollarSign,
  FileText,
  Upload,
  X,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react"
import { getFundingStructure } from "@/lib/features/auth/funding-Slice";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import {
  createLoanApplication,
  clearError,
  type LoanApplicationRequest,
  Gender,
  MaritalStatus,
  RelationshipType,
  CollateralType,
  BusinessType,
  EconomicSector,
} from "@/lib/features/auth/loanApplicationSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import toast from "react-hot-toast"
import { RwandaLocationService } from "@/lib/rwandaLocations"

interface FileUpload {
  file: File | null
  preview: string | null
  error: string | null
}

const CompactLoanApplicationForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.loanApplication)
  const [fundingStructure, setFundingStructure] = useState<any>(null);
  const { user } = useSelector((state: RootState) => state.auth)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Location state
  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  const [formData, setFormData] = useState<LoanApplicationRequest>({
    firstName: "",
    lastName: "",
    middleName: "",
    nationalId: "",
    gender: Gender.MALE,
    dateOfBirth: "",
    maritalStatus: MaritalStatus.SINGLE,
    primaryPhone: "",
    alternativePhone: "",
    email: "",
    address: {
      country: "Rwanda",
      village: "",
      cell: "",
      sector: "",
      district: "",
      province: "",
    },
    occupation: "",
    monthlyIncome: undefined,
    incomeSource: "",
    relationshipWithNDFSP: RelationshipType.NEW_BORROWER,
    previousLoansPaidOnTime: undefined,
    borrowerNotes: "",

    // ✅ REMOVED 6 FIELDS - These will be set during approval
    purposeOfLoan: "",
    branchName: "",
    loanOfficer: "",
    disbursedAmount: undefined,
    businessType: null,
    economicSector: null,
    loanNotes: "",

    collateralType: CollateralType.IMMOVABLE,
    collateralDescription: "",
    collateralValue: undefined,
    guarantorName: "",
    guarantorPhone: "",
    guarantorAddress: "",
    valuationDate: "",
    valuedBy: user?.username || "",
    collateralNotes: "",
  })

  const [files, setFiles] = useState<{
    proofOfOwnership: FileUpload
    ownerIdentification: FileUpload
    legalDocument: FileUpload
    physicalEvidence: FileUpload
  }>({
    proofOfOwnership: { file: null, preview: null, error: null },
    ownerIdentification: { file: null, preview: null, error: null },
    legalDocument: { file: null, preview: null, error: null },
    physicalEvidence: { file: null, preview: null, error: null },
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRefs = {
    proofOfOwnership: useRef<HTMLInputElement>(null),
    ownerIdentification: useRef<HTMLInputElement>(null),
    legalDocument: useRef<HTMLInputElement>(null),
    physicalEvidence: useRef<HTMLInputElement>(null),
  }

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveToLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const dataToSave = {
          formData,
          currentStep,
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem("loan-application-draft", JSON.stringify(dataToSave))
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error("Failed to save to localStorage:", error)
      }
    }
  }, [formData, currentStep])

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(saveToLocalStorage, 500)
  }, [saveToLocalStorage])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("loan-application-draft")
        if (saved) {
          const data = JSON.parse(saved)
          setFormData(data.formData)
          setCurrentStep(data.currentStep)
          setLastSaved(new Date(data.timestamp))
          toast.success("Form restored from previous session", { duration: 2000 })
        }
      } catch (error) {
        console.error("Failed to load from localStorage:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (user?.username && !formData.valuedBy) {
      setFormData(prev => ({
        ...prev,
        valuedBy: user.username
      }))
    }
  }, [user?.username, formData.valuedBy])

  useEffect(() => {
    setHasUnsavedChanges(true)
    debouncedSave()
  }, [formData, debouncedSave])

  useEffect(() => {
    const fetchFundingData = async () => {
      try {
        const userString = localStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;

        if (user?.organizationId) {
          const result = await dispatch(getFundingStructure(user.organizationId)).unwrap();
          setFundingStructure(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch funding structure:", error);
      }
    };

    fetchFundingData();
  }, [dispatch]);

  const validateLoanAmount = (requestedAmount: number): { isValid: boolean; message: string } => {
    if (!fundingStructure?.summary) {
      return { isValid: true, message: "" };
    }

    const availableFunds = fundingStructure.summary.totalFundingStructure;

    if (requestedAmount > availableFunds) {
      return {
        isValid: false,
        message: `Loan amount (${requestedAmount.toLocaleString()} RWF) exceeds available organization funds (${availableFunds.toLocaleString()} RWF). Please request a lower amount.`
      };
    }

    return { isValid: true, message: "" };
  };

  // Initialize locations
  useEffect(() => {
    setProvinces(RwandaLocationService.getProvinces())
  }, [])

  // Update dependent dropdowns
  useEffect(() => {
    const { province, district, sector, cell } = formData.address

    if (province) {
      setDistricts(RwandaLocationService.getDistricts(province))
    } else {
      setDistricts([])
      setSectors([])
      setCells([])
      setVillages([])
    }

    if (province && district) {
      setSectors(RwandaLocationService.getSectors(province, district))
    } else {
      setSectors([])
      setCells([])
      setVillages([])
    }

    if (province && district && sector) {
      setCells(RwandaLocationService.getCells(province, district, sector))
    } else {
      setCells([])
      setVillages([])
    }

    if (province && district && sector && cell) {
      setVillages(RwandaLocationService.getVillages(province, district, sector, cell))
    } else {
      setVillages([])
    }
  }, [formData.address])

  const handleFileUpload = useCallback(
    (fileType: keyof typeof files) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      let error = null
      if (file.size > maxSize) {
        error = "File size must be less than 10MB"
      } else if (!allowedTypes.includes(file.type)) {
        error = "Invalid file type. Please upload PDF, Word, or image files."
      }

      let preview = null
      if (file.type.startsWith("image/") && !error) {
        preview = URL.createObjectURL(file)
      }

      setFiles((prev) => ({
        ...prev,
        [fileType]: { file: error ? null : file, preview, error },
      }))

      if (!error) {
        setFormData((prev) => ({ ...prev, [fileType]: file }))
      }
    },
    [],
  )

  const removeFile = useCallback((fileType: keyof typeof files) => {
    setFiles((prev) => ({
      ...prev,
      [fileType]: { file: null, preview: null, error: null },
    }))
    setFormData((prev) => ({ ...prev, [fileType]: undefined }))

    if (fileInputRefs[fileType].current) {
      fileInputRefs[fileType].current!.value = ""
    }
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case 1: // Borrower Info
        if (!formData.firstName.trim()) errors.firstName = "First name is required"
        if (!formData.lastName.trim()) errors.lastName = "Last name is required"
        if (!formData.nationalId.trim()) errors.nationalId = "National ID is required"
        else if (!/^\d{16}$/.test(formData.nationalId)) errors.nationalId = "National ID must be 16 digits"
        if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
        if (!formData.primaryPhone.trim()) errors.primaryPhone = "Primary phone is required"
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Invalid email format"
        }
        break

      case 2: // Address & Employment
        if (!formData.address.province) errors["address.province"] = "Province is required"
        if (!formData.address.district) errors["address.district"] = "District is required"
        if (!formData.address.sector) errors["address.sector"] = "Sector is required"
        break

      case 3: // Loan Details - ✅ SIMPLIFIED VALIDATION
        if (!formData.purposeOfLoan.trim()) errors.purposeOfLoan = "Purpose of loan is required"
        if (!formData.branchName.trim()) errors.branchName = "Branch name is required"
        if (!formData.loanOfficer.trim()) errors.loanOfficer = "Loan officer is required"
        if (!formData.disbursedAmount || formData.disbursedAmount <= 0)
          errors.disbursedAmount = "Amount must be greater than 0"
        break

      case 4: // Collateral
        // Optional validation for collateral
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    if (formData.disbursedAmount) {
      const fundingValidation = validateLoanAmount(formData.disbursedAmount);
      if (!fundingValidation.isValid) {
        toast.error(fundingValidation.message);
        return;
      }
    }

    setIsSubmitting(true);
    dispatch(clearError());

    try {
      const submitData: LoanApplicationRequest = { ...formData }

      // Add files to submit data
      if (files.proofOfOwnership.file) submitData.proofOfOwnership = files.proofOfOwnership.file
      if (files.ownerIdentification.file) submitData.ownerIdentification = files.ownerIdentification.file
      if (files.legalDocument.file) submitData.legalDocument = files.legalDocument.file
      if (files.physicalEvidence.file) submitData.physicalEvidence = files.physicalEvidence.file

      await dispatch(createLoanApplication(submitData)).unwrap()

      // ✅ UPDATED SUCCESS MESSAGE
      toast.success("Loan application submitted for review!")

      // Clear localStorage on successful submission
      if (typeof window !== "undefined") {
        localStorage.removeItem("loan-application-draft")
      }

      // Reset form to initial state for new customer
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        nationalId: "",
        gender: Gender.MALE,
        dateOfBirth: "",
        maritalStatus: MaritalStatus.SINGLE,
        primaryPhone: "",
        alternativePhone: "",
        email: "",
        address: {
          country: "Rwanda",
          village: "",
          cell: "",
          sector: "",
          district: "",
          province: "",
        },
        occupation: "",
        monthlyIncome: undefined,
        incomeSource: "",
        relationshipWithNDFSP: RelationshipType.NEW_BORROWER,
        previousLoansPaidOnTime: undefined,
        borrowerNotes: "",
        purposeOfLoan: "",
        branchName: "",
        loanOfficer: "",
        disbursedAmount: undefined,
        loanNotes: "",
        collateralType: CollateralType.IMMOVABLE,
        collateralDescription: "",
        collateralValue: undefined,
        guarantorName: "",
        guarantorPhone: "",
        guarantorAddress: "",
        valuationDate: "",
        valuedBy: user?.username || "",
        collateralNotes: "",
      })

      setFiles({
        proofOfOwnership: { file: null, preview: null, error: null },
        ownerIdentification: { file: null, preview: null, error: null },
        legalDocument: { file: null, preview: null, error: null },
        physicalEvidence: { file: null, preview: null, error: null },
      })

      setCurrentStep(1)
      setValidationErrors({})
      setLastSaved(null)
      setHasUnsavedChanges(false)

      // Clear file input refs
      Object.values(fileInputRefs).forEach(ref => {
        if (ref.current) ref.current.value = ""
      })

    } catch (error: any) {
      toast.error(error || "Failed to create loan application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[
        { num: 1, label: "Borrower" },
        { num: 2, label: "Address" },
        { num: 3, label: "Loan" },
        { num: 4, label: "Security" },
        { num: 5, label: "Review" },
      ].map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-200 ${step.num <= currentStep ? "bg-[#5B7FA2]" : "bg-gray-300"
                }`}
            />
            <span
              className={`mt-1 text-xs font-medium transition-all duration-200 ${step.num <= currentStep ? "text-[#5B7FA2]" : "text-gray-400"
                }`}
            >
              {step.label}
            </span>
          </div>
          {index < 4 && (
            <div
              className={`w-12 h-0.5 mx-2 mt-[-8px] transition-all duration-200 ${step.num < currentStep ? "bg-[#5B7FA2]" : "bg-gray-300"
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const FileUploadCard = ({
    fileType,
    label,
    icon: Icon,
  }: {
    fileType: keyof typeof files
    label: string
    icon: React.ElementType
  }) => (
    <motion.div
      className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-blue-200 transition-all duration-200"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-[#5B7FA2]" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {files[fileType].file && (
          <button
            type="button"
            onClick={() => removeFile(fileType)}
            className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRefs[fileType]}
        onChange={handleFileUpload(fileType)}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
      />

      {files[fileType].error && (
        <p className="text-xs text-red-500 flex items-center mb-2">
          <AlertCircle className="w-3 h-3 mr-1" />
          {files[fileType].error}
        </p>
      )}

      {files[fileType].file ? (
        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{files[fileType].file!.name}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRefs[fileType].current?.click()}
          className="w-full p-2 border border-dashed border-gray-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs text-gray-500 flex items-center justify-center space-x-2"
        >
          <Upload className="w-3 h-3" />
          <span>Upload {label}</span>
        </button>
      )}
    </motion.div>
  )

  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
    const [show, setShow] = useState(false)
    return (
      <div className="relative inline-block">
        <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
          {children}
        </div>
        {show && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
            {content}
          </div>
        )}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <User className="w-10 h-10 text-[#5B7FA2] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800">Borrower Information</h2>
              <p className="text-sm text-gray-600">Personal details and identification</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter first name"
                />
                {validationErrors.firstName && <p className="text-xs text-red-500">{validationErrors.firstName}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter last name"
                />
                {validationErrors.lastName && <p className="text-xs text-red-500">{validationErrors.lastName}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Middle Name
                  <Tooltip content="Optional middle name or initial">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={formData.middleName || ""}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter middle name (optional)"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">National ID *</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="16-digit National ID"
                  maxLength={16}
                />
                {validationErrors.nationalId && <p className="text-xs text-red-500">{validationErrors.nationalId}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                {validationErrors.dateOfBirth && <p className="text-xs text-red-500">{validationErrors.dateOfBirth}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value={MaritalStatus.SINGLE}>Single</option>
                  <option value={MaritalStatus.MARRIED}>Married</option>
                  <option value={MaritalStatus.DIVORCED}>Divorced</option>
                  <option value={MaritalStatus.WIDOWED}>Widowed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Primary Phone *</label>
                <PhoneInput
                  defaultCountry="rw"
                  value={formData.primaryPhone}
                  onChange={(value) => handleInputChange("primaryPhone", value)}
                  inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  countrySelectorStyleProps={{
                    buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                    dropdownStyleProps: {
                      className: "z-50 max-h-60 overflow-y-auto"
                    }
                  }}
                />
                {validationErrors.primaryPhone && (
                  <p className="text-xs text-red-500">{validationErrors.primaryPhone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Alternative Phone
                  <Tooltip content="Secondary contact number for emergencies">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <PhoneInput
                  defaultCountry="rw"
                  value={formData.alternativePhone || ""}
                  onChange={(value) => handleInputChange("alternativePhone", value)}
                  inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  countrySelectorStyleProps={{
                    buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                    dropdownStyleProps: {
                      className: "z-50 max-h-60 overflow-y-auto"
                    }
                  }}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                  <Tooltip content="Email for loan notifications and updates">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="your.email@example.com (optional)"
                />
                {validationErrors.email && <p className="text-xs text-red-500">{validationErrors.email}</p>}
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <MapPin className="w-10 h-10 text-[#5B7FA2] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800">Address & Employment</h2>
              <p className="text-sm text-gray-600">Location and employment details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Province *</label>
                <select
                  value={formData.address.province || ""}
                  onChange={(e) => handleAddressChange("province", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {validationErrors["address.province"] && (
                  <p className="text-xs text-red-500">{validationErrors["address.province"]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">District *</label>
                <select
                  value={formData.address.district || ""}
                  onChange={(e) => handleAddressChange("district", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={!formData.address.province}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {validationErrors["address.district"] && (
                  <p className="text-xs text-red-500">{validationErrors["address.district"]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Sector *</label>
                <select
                  value={formData.address.sector || ""}
                  onChange={(e) => handleAddressChange("sector", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={!formData.address.district}
                >
                  <option value="">Select Sector</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
                {validationErrors["address.sector"] && (
                  <p className="text-xs text-red-500">{validationErrors["address.sector"]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Cell</label>
                <select
                  value={formData.address.cell || ""}
                  onChange={(e) => handleAddressChange("cell", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={!formData.address.sector}
                >
                  <option value="">Select Cell</option>
                  {cells.map((cell) => (
                    <option key={cell} value={cell}>
                      {cell}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Village</label>
                <select
                  value={formData.address.village || ""}
                  onChange={(e) => handleAddressChange("village", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={!formData.address.cell}
                >
                  <option value="">Select Village</option>
                  {villages.map((village) => (
                    <option key={village} value={village}>
                      {village}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation || ""}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter occupation"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Monthly Income (RWF)</label>
                <input
                  type="number"
                  value={formData.monthlyIncome || ""}
                  onChange={(e) =>
                    handleInputChange("monthlyIncome", e.target.value ? Number.parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter monthly income"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Income Source
                  <Tooltip content="Primary source of income (salary, business, etc.)">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <select
                  value={formData.incomeSource || ""}
                  onChange={(e) => handleInputChange("incomeSource", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Income Source</option>
                  <option value="salary">Salary/Employment</option>
                  <option value="business">Business Income</option>
                  <option value="farming">Agricultural/Farming</option>
                  <option value="freelance">Freelance/Contract Work</option>
                  <option value="rental">Rental Income</option>
                  <option value="pension">Pension</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Relationship with NDFSP
                  <Tooltip content="Your previous relationship with the financial service provider">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <select
                  value={formData.relationshipWithNDFSP}
                  onChange={(e) => handleInputChange("relationshipWithNDFSP", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value={RelationshipType.NEW_BORROWER}>New Borrower</option>
                  <option value={RelationshipType.REPEAT_BORROWER}>Repeat Borrower</option>
                  <option value={RelationshipType.RETURNING_BORROWER}>Returning Borrower</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Previous Loans Paid On Time
                  <Tooltip content="Number of previous loans successfully repaid">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  min="0"
                  value={
                    formData.previousLoansPaidOnTime !== undefined
                      ? formData.previousLoansPaidOnTime
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "previousLoansPaidOnTime",
                      e.target.value === "" ? undefined : Number.parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Number of loans"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes
                  <Tooltip content="Any additional information about the borrower">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <textarea
                  value={formData.borrowerNotes || ""}
                  onChange={(e) => handleInputChange("borrowerNotes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Any additional borrower information..."
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        // ✅ STEP 3 - SIMPLIFIED (6 FIELDS REMOVED)
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <DollarSign className="w-10 h-10 text-[#5B7FA2] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800">Loan Details</h2>
              <p className="text-sm text-gray-600">Basic loan information (terms set during approval)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Purpose of Loan *</label>
                <input
                  type="text"
                  value={formData.purposeOfLoan}
                  onChange={(e) => handleInputChange("purposeOfLoan", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Describe the purpose of the loan"
                />
                {validationErrors.purposeOfLoan && (
                  <p className="text-xs text-red-500">{validationErrors.purposeOfLoan}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Amount (RWF) *</label>
                <input
                  type="number"
                  value={formData.disbursedAmount || ""}
                  onChange={(e) => {
                    const amount = e.target.value ? Number.parseFloat(e.target.value) : undefined;
                    handleInputChange("disbursedAmount", amount);
                  }}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter loan amount"
                />
                {validationErrors.disbursedAmount && (
                  <p className="text-xs text-red-500">{validationErrors.disbursedAmount}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Branch Name *</label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter branch name"
                />
                {validationErrors.branchName && <p className="text-xs text-red-500">{validationErrors.branchName}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Officer *</label>
                <input
                  type="text"
                  value={formData.loanOfficer}
                  onChange={(e) => handleInputChange("loanOfficer", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter loan officer name"
                />
                {validationErrors.loanOfficer && <p className="text-xs text-red-500">{validationErrors.loanOfficer}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Business Type/Structure
                  <Tooltip content="Select business size category or legal structure">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <select
                  value={formData.businessType || ""}
                  onChange={(e) => handleInputChange("businessType", e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Business Type (Optional)</option>
                  <optgroup label="Business Size">
                    <option value={BusinessType.MICRO}>Micro Business</option>
                    <option value={BusinessType.SMALL}>Small Business (SME)</option>
                    <option value={BusinessType.MEDIUM}>Medium Business (SME)</option>
                    <option value={BusinessType.LARGE}>Large Business</option>
                    <option value={BusinessType.YOUTH_BUSINESS}>Youth Business</option>
                  </optgroup>
                  <optgroup label="Legal Structure">
                    <option value={BusinessType.PUBLIC_COMPANY}>Public Company</option>
                    <option value={BusinessType.PRIVATE_COMPANY}>Private Company</option>
                    <option value={BusinessType.COOPERATIVE}>Cooperative</option>
                    <option value={BusinessType.PARTNERSHIP}>Partnership</option>
                    <option value={BusinessType.FOUNDATION}>Foundation</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Economic Sector
                  <Tooltip content="Select the primary economic sector of the business">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <select
                  value={formData.economicSector || ""}
                  onChange={(e) => handleInputChange("economicSector", e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Economic Sector (Optional)</option>
                  <option value={EconomicSector.AGRICULTURE_LIVESTOCK_FISHING}>
                    Agriculture, Livestock, Fishing
                  </option>
                  <option value={EconomicSector.PUBLIC_WORKS_CONSTRUCTION}>
                    Public Works, Construction
                  </option>
                  <option value={EconomicSector.COMMERCE_RESTAURANTS_HOTELS}>
                    Commerce, Restaurants, Hotels
                  </option>
                  <option value={EconomicSector.TRANSPORT_WAREHOUSES}>
                    Transport, Warehouses
                  </option>
                  <option value={EconomicSector.MANUFACTURING}>
                    Manufacturing
                  </option>
                  <option value={EconomicSector.SERVICES}>
                    Services
                  </option>
                  <option value={EconomicSector.TECHNOLOGY}>
                    Technology/IT
                  </option>
                  <option value={EconomicSector.HEALTHCARE}>
                    Healthcare
                  </option>
                  <option value={EconomicSector.EDUCATION}>
                    Education
                  </option>
                  <option value={EconomicSector.FINANCIAL_SERVICES}>
                    Financial Services
                  </option>
                  <option value={EconomicSector.OTHERS}>
                    Others
                  </option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Loan Notes
                  <Tooltip content="Additional notes about the loan request">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <textarea
                  value={formData.loanNotes || ""}
                  onChange={(e) => handleInputChange("loanNotes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Additional loan request information..."
                />
              </div>
            </div>

            {/* ✅ ADDED: Notice about approval process */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-[#5B7FA2] mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Loan Terms Will Be Set During Approval
                  </h3>
                  <p className="text-sm text-blue-700">
                    Interest rate, repayment schedule, and other loan terms will be determined by the
                    loan officer during the approval process. You will be notified once your application
                    is reviewed.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <Shield className="w-10 h-10 text-[#5B7FA2] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800">Collateral & Security</h2>
              <p className="text-sm text-gray-600">Collateral information and documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Collateral Type</label>
                <select
                  value={formData.collateralType}
                  onChange={(e) => handleInputChange("collateralType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value={CollateralType.MOVABLE}>Movable Property</option>
                  <option value={CollateralType.IMMOVABLE}>Immovable Property</option>
                  <option value={CollateralType.FINANCIAL}>Financial Assets</option>
                  <option value={CollateralType.GUARANTEE}>Personal Guarantee</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Collateral Value (RWF)</label>
                <input
                  type="number"
                  value={formData.collateralValue || ""}
                  onChange={(e) =>
                    handleInputChange("collateralValue", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter collateral value"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Collateral Description</label>
                <textarea
                  value={formData.collateralDescription || ""}
                  onChange={(e) => handleInputChange("collateralDescription", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Describe the collateral..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Guarantor Name</label>
                <input
                  type="text"
                  value={formData.guarantorName || ""}
                  onChange={(e) => handleInputChange("guarantorName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter guarantor name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Guarantor Phone</label>
                <PhoneInput
                  defaultCountry="rw"
                  value={formData.guarantorPhone}
                  onChange={(value) => handleInputChange("guarantorPhone", value)}
                  inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  countrySelectorStyleProps={{
                    buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                    dropdownStyleProps: {
                      className: "z-50 max-h-60 overflow-y-auto"
                    }
                  }}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Guarantor Address</label>
                <input
                  type="text"
                  value={formData.guarantorAddress || ""}
                  onChange={(e) => handleInputChange("guarantorAddress", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter guarantor address"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Valuation Date</label>
                <input
                  type="date"
                  value={formData.valuationDate || ""}
                  onChange={(e) => handleInputChange("valuationDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Valued By</label>
                <input
                  type="text"
                  value={formData.valuedBy || ""}
                  onChange={(e) => handleInputChange("valuedBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Name of valuator"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Collateral Notes
                  <Tooltip content="Additional information about the collateral">
                    <HelpCircle className="w-3 h-3 text-gray-400 ml-1 inline" />
                  </Tooltip>
                </label>
                <textarea
                  value={formData.collateralNotes || ""}
                  onChange={(e) => handleInputChange("collateralNotes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Any additional collateral information..."
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Collateral Documents</h3>
                <span className="text-sm text-gray-600">
                  {Object.values(files).filter((file) => file.file).length}/4 files uploaded
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FileUploadCard fileType="proofOfOwnership" label="Proof of Ownership" icon={FileText} />
                <FileUploadCard fileType="ownerIdentification" label="Owner Identification" icon={User} />
                <FileUploadCard fileType="legalDocument" label="Legal Document" icon={FileText} />
                <FileUploadCard fileType="physicalEvidence" label="Physical Evidence" icon={Building2} />
              </div>
            </div>
          </motion.div>
        )

      case 5:
        // ✅ STEP 5 - FIXED AND SIMPLIFIED REVIEW (NO CALCULATIONS)
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#5B7FA2] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800">Review Application</h2>
              <p className="text-sm text-gray-600">Verify all information before submission</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {hasUnsavedChanges ? "Saving changes..." : "All changes saved"}
                  </span>
                </div>
                {lastSaved && (
                  <span className="text-xs text-blue-600">Last saved: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Borrower Summary */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Borrower Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">
                      {formData.firstName} {formData.middleName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">National ID</p>
                    <p className="font-medium">{formData.nationalId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{formData.primaryPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{formData.email || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Loan Details Summary */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Loan Request Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Purpose</p>
                    <p className="font-medium">{formData.purposeOfLoan}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Requested Amount</p>
                    <p className="font-bold text-green-600">
                      {formData.disbursedAmount?.toLocaleString()} RWF
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Branch</p>
                    <p className="font-medium">{formData.branchName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loan Officer</p>
                    <p className="font-medium">{formData.loanOfficer}</p>
                  </div>
                  {formData.businessType && (
                    <div>
                      <p className="text-gray-600">Business Type</p>
                      <p className="font-medium capitalize">
                        {formData.businessType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}

                  {formData.economicSector && (
                    <div>
                      <p className="text-gray-600">Economic Sector</p>
                      <p className="font-medium capitalize">
                        {formData.economicSector.replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Collateral Summary */}
              {(formData.collateralType || formData.collateralDescription || formData.collateralValue) && (
                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Collateral Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {formData.collateralType && (
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium capitalize">{formData.collateralType}</p>
                      </div>
                    )}
                    {formData.collateralValue && (
                      <div>
                        <p className="text-gray-600">Value</p>
                        <p className="font-bold text-purple-600">
                          {formData.collateralValue.toLocaleString()} RWF
                        </p>
                      </div>
                    )}
                    {formData.guarantorName && (
                      <div>
                        <p className="text-gray-600">Guarantor</p>
                        <p className="font-medium">{formData.guarantorName}</p>
                      </div>
                    )}
                    {formData.valuedBy && (
                      <div>
                        <p className="text-gray-600">Valued By</p>
                        <p className="font-medium">{formData.valuedBy}</p>
                      </div>
                    )}
                  </div>
                  {formData.collateralDescription && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-gray-600 text-sm">Description</p>
                      <p className="font-medium text-sm">{formData.collateralDescription}</p>
                    </div>
                  )}

                </div>
              )}

              {/* Files Upload Summary */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Proof of Ownership</p>
                    <p className="font-medium">
                      {files.proofOfOwnership.file ? "✓ Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Owner Identification</p>
                    <p className="font-medium">
                      {files.ownerIdentification.file ? "✓ Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Legal Document</p>
                    <p className="font-medium">
                      {files.legalDocument.file ? "✓ Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Physical Evidence</p>
                    <p className="font-medium">
                      {files.physicalEvidence.file ? "✓ Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ ADDED: Notice about approval process */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-[#5B7FA2] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                      Loan Terms Will Be Set During Approval
                    </h3>
                    <p className="text-sm text-blue-700">
                      Interest rate, repayment schedule, and other loan terms will be determined by the
                      loan officer during the approval process. You will be notified once your application
                      is reviewed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Funding Structure Summary */}
              {fundingStructure?.summary && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Organization Funding Structure
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-green-600 font-medium">Total Funds</p>
                      <p className="text-green-800 font-bold">
                        {fundingStructure.summary.totalFundingStructure.toLocaleString()} RWF
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Share Capital</p>
                      <p className="text-green-800 font-bold">
                        {fundingStructure.summary.totalShareCapital.toLocaleString()} RWF
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Borrowings</p>
                      <p className="text-green-800 font-bold">
                        {fundingStructure.summary.totalBorrowings.toLocaleString()} RWF
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Grants</p>
                      <p className="text-green-800 font-bold">
                        {fundingStructure.summary.totalGrants.toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Review Warning */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Final Review
                </h3>
                <p className="text-sm text-yellow-700">
                  Please review all information carefully before submitting. Once submitted, the loan application will
                  be processed by our team and you'll be notified of the status within 2-3 business days.
                </p>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3 sticky top-1 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-[#5B7FA2] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center">
                  <Building2 className="w-6 h-6 mr-2" />
                  Professional Loan Application
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-xs">Secure & Professional</p>
                <p className="text-white font-semibold text-sm">Banking Excellence</p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4">
            <StepIndicator />
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <div className="mx-0 mb-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Step Content */}
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-3">
                {hasUnsavedChanges && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </span>
                )}

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow text-sm"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoading}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow text-sm"
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-6 text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>© 2025 Banking System. All rights reserved. | Secure SSL Encryption</p>
        </motion.div>
      </div>
    </div>
  )
}

export default CompactLoanApplicationForm