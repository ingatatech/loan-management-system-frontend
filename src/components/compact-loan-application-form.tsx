// @ts-nocheck

"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
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
  MapPin,
  Briefcase,
} from "lucide-react"

import {
  createLoanApplication,
  clearError,
  type LoanApplicationRequest,
  Gender,
  MaritalStatus,
  RelationshipType,
  InterestMethod,
  RepaymentFrequency,
  CollateralType,
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
  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])
  const [formData, setFormData] = useState<LoanApplicationRequest>({
    // Borrower Data
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
    monthlyIncome: 0,
    incomeSource: "",
    relationshipWithNDFSP: RelationshipType.NEW_BORROWER,
    previousLoansPaidOnTime: 0,
    borrowerNotes: "",

    // Loan Data
    purposeOfLoan: "",
    branchName: "",
    loanOfficer: "",
    disbursedAmount: 0,
    disbursementDate: "",
    annualInterestRate: 12.5,
    interestMethod: InterestMethod.REDUCING_BALANCE,
    termInMonths: 12,
    repaymentFrequency: RepaymentFrequency.MONTHLY,
    gracePeriodMonths: 0,
    loanNotes: "",

    // Collateral Data
    collateralType: CollateralType.IMMOVABLE,
    collateralDescription: "",
    collateralValue: 0,
    guarantorName: "",
    guarantorPhone: "",
    guarantorAddress: "",
    valuationDate: "",
    valuedBy: "",
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

  // File handling
  const handleFileUpload = useCallback(
    (fileType: keyof typeof files) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validation
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

      // Create preview for images
      let preview = null
      if (file.type.startsWith("image/") && !error) {
        preview = URL.createObjectURL(file)
      }

      setFiles((prev) => ({
        ...prev,
        [fileType]: { file: error ? null : file, preview, error },
      }))

      // Update form data
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

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName.trim()) errors.firstName = "First name is required"
    if (!formData.lastName.trim()) errors.lastName = "Last name is required"
    if (!formData.nationalId.trim()) errors.nationalId = "National ID is required"
    else if (!/^\d{16}$/.test(formData.nationalId)) errors.nationalId = "National ID must be 16 digits"

    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!formData.primaryPhone.trim()) errors.primaryPhone = "Primary phone is required"
    if (!formData.purposeOfLoan.trim()) errors.purposeOfLoan = "Purpose of loan is required"
    if (!formData.branchName.trim()) errors.branchName = "Branch name is required"
    if (!formData.loanOfficer.trim()) errors.loanOfficer = "Loan officer is required"
    if (!formData.disbursedAmount || formData.disbursedAmount <= 0)
      errors.disbursedAmount = "Disbursed amount must be greater than 0"
    if (!formData.disbursementDate) errors.disbursementDate = "Disbursement date is required"
    if (!formData.annualInterestRate || formData.annualInterestRate <= 0)
      errors.annualInterestRate = "Interest rate must be greater than 0"
    if (!formData.termInMonths || formData.termInMonths <= 0)
      errors.termInMonths = "Term in months must be greater than 0"

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    // Phone validation
    if (formData.primaryPhone && !/^\+?[\d\s-()]+$/.test(formData.primaryPhone)) {
      errors.primaryPhone = "Invalid phone format"
    }

    // Guarantor phone validation - must be valid phone format if provided
    if (formData.guarantorPhone && formData.guarantorPhone.trim()) {
      if (!/^\+?[\d\s-()]+$/.test(formData.guarantorPhone)) {
        errors.guarantorPhone = "Guarantor phone must be a valid phone number"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Form handlers
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

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  useEffect(() => {
    setProvinces(RwandaLocationService.getProvinces())
  }, [])

  // Update dependent dropdowns when address changes
  useEffect(() => {
    const { province, district, sector, cell } = formData.address

    // Update districts
    if (province) {
      setDistricts(RwandaLocationService.getDistricts(province))
    } else {
      setDistricts([])
      setSectors([])
      setCells([])
      setVillages([])
    }

    // Update sectors
    if (province && district) {
      setSectors(RwandaLocationService.getSectors(province, district))
    } else {
      setSectors([])
      setCells([])
      setVillages([])
    }

    // Update cells
    if (province && district && sector) {
      setCells(RwandaLocationService.getCells(province, district, sector))
    } else {
      setCells([])
      setVillages([])
    }

    // Update villages
    if (province && district && sector && cell) {
      setVillages(RwandaLocationService.getVillages(province, district, sector, cell))
    } else {
      setVillages([])
    }
  }, [formData.address])

  // Handle address change
  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    dispatch(clearError())

    try {
      const submitData: LoanApplicationRequest = { ...formData }

      // Add files to submit data
      if (files.proofOfOwnership.file) submitData.proofOfOwnership = files.proofOfOwnership.file
      if (files.ownerIdentification.file) submitData.ownerIdentification = files.ownerIdentification.file
      if (files.legalDocument.file) submitData.legalDocument = files.legalDocument.file
      if (files.physicalEvidence.file) submitData.physicalEvidence = files.physicalEvidence.file

      await dispatch(createLoanApplication(submitData)).unwrap()

      toast.success("Loan application created successfully!")

      // Reset form
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
        address: { village: "", cell: "", sector: "", district: "" },
        occupation: "",
        monthlyIncome: 0,
        incomeSource: "",
        relationshipWithNDFSP: RelationshipType.NEW_BORROWER,
        previousLoansPaidOnTime: 0,
        borrowerNotes: "",
        purposeOfLoan: "",
        branchName: "",
        loanOfficer: "",
        disbursedAmount: 0,
        disbursementDate: "",
        annualInterestRate: 12.5,
        interestMethod: InterestMethod.REDUCING_BALANCE,
        termInMonths: 12,
        repaymentFrequency: RepaymentFrequency.MONTHLY,
        gracePeriodMonths: 0,
        loanNotes: "",
        collateralType: CollateralType.IMMOVABLE,
        collateralDescription: "",
        collateralValue: 0,
        guarantorName: "",
        guarantorPhone: "",
        guarantorAddress: "",
        valuationDate: "",
        valuedBy: "",
        collateralNotes: "",
      })

      // Reset files
      setFiles({
        proofOfOwnership: { file: null, preview: null, error: null },
        ownerIdentification: { file: null, preview: null, error: null },
        legalDocument: { file: null, preview: null, error: null },
        physicalEvidence: { file: null, preview: null, error: null },
      })

      // Reset file inputs
      Object.values(fileInputRefs).forEach((ref) => {
        if (ref.current) ref.current.value = ""
      })
    } catch (error: any) {
      toast.error(error || "Failed to create loan application")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render file upload component
  const FileUploadCard = ({
    fileType,
    label,
    icon: Icon,
  }: {
    fileType: keyof typeof files
    label: string
    icon: React.ElementType
  }) => (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {files[fileType].file && (
          <button
            type="button"
            onClick={() => removeFile(fileType)}
            className="p-1 hover:bg-red-100 rounded-full text-red-500"
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
        <p className="text-xs text-red-500 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {files[fileType].error}
        </p>
      )}

      {files[fileType].file ? (
        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{files[fileType].file!.name}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRefs[fileType].current?.click()}
          className="w-full p-2 border border-dashed border-gray-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs text-gray-500 flex items-center justify-center space-x-1"
        >
          <Upload className="w-3 h-3" />
          <span>Upload {label}</span>
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Create Loan Application
          </h2>
          <p className="text-blue-100 text-sm mt-1">Complete borrower, loan, and collateral information</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Borrower Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Borrower Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
                {validationErrors.lastName && <p className="text-xs text-red-500">{validationErrors.lastName}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter middle name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">National ID *</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="16-digit National ID"
                  maxLength={16}
                />
                {validationErrors.nationalId && <p className="text-xs text-red-500">{validationErrors.nationalId}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {validationErrors.dateOfBirth && <p className="text-xs text-red-500">{validationErrors.dateOfBirth}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={MaritalStatus.SINGLE}>Single</option>
                  <option value={MaritalStatus.MARRIED}>Married</option>
                  <option value={MaritalStatus.DIVORCED}>Divorced</option>
                  <option value={MaritalStatus.WIDOWED}>Widowed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Primary Phone *</label>
                <input
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+250 XXX XXX XXX"
                />
                {validationErrors.primaryPhone && (
                  <p className="text-xs text-red-500">{validationErrors.primaryPhone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="borrower@example.com"
                />
                {validationErrors.email && <p className="text-xs text-red-500">{validationErrors.email}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Country Field - Added to match backend expectation */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <input
                    type="text"
                    value="Rwanda"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Province Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Province *</label>
                  <select
                    value={formData.address.province || ""}
                    onChange={(e) => handleAddressChange("province", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">District *</label>
                  <select
                    value={formData.address.district || ""}
                    onChange={(e) => handleAddressChange("district", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.address.province}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sector Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Sector *</label>
                  <select
                    value={formData.address.sector || ""}
                    onChange={(e) => handleAddressChange("sector", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.address.district}
                  >
                    <option value="">Select Sector</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cell Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Cell *</label>
                  <select
                    value={formData.address.cell || ""}
                    onChange={(e) => handleAddressChange("cell", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Village Field */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Village *</label>
                  <select
                    value={formData.address.village || ""}
                    onChange={(e) => handleAddressChange("village", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              </div>
            </div>

            {/* Employment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter occupation"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Monthly Income (RWF)</label>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange("monthlyIncome", Number.parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter monthly income"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                <select
                  value={formData.relationshipWithNDFSP}
                  onChange={(e) => handleInputChange("relationshipWithNDFSP", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={RelationshipType.NEW_BORROWER}>New Borrower</option>
                  <option value={RelationshipType.REPEAT_BORROWER}>Repeat Borrower</option>
                  <option value={RelationshipType.RETURNING_BORROWER}>Returning Borrower</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Loan Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Purpose of Loan *</label>
                <input
                  type="text"
                  value={formData.purposeOfLoan}
                  onChange={(e) => handleInputChange("purposeOfLoan", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the purpose of the loan"
                />
                {validationErrors.purposeOfLoan && (
                  <p className="text-xs text-red-500">{validationErrors.purposeOfLoan}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Disbursed Amount (RWF) *</label>
                <input
                  type="number"
                  value={formData.disbursedAmount}
                  onChange={(e) => handleInputChange("disbursedAmount", Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan officer name"
                />
                {validationErrors.loanOfficer && <p className="text-xs text-red-500">{validationErrors.loanOfficer}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Disbursement Date *</label>
                <input
                  type="date"
                  value={formData.disbursementDate}
                  onChange={(e) => handleInputChange("disbursementDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {validationErrors.disbursementDate && (
                  <p className="text-xs text-red-500">{validationErrors.disbursementDate}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Annual Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.annualInterestRate}
                  onChange={(e) => handleInputChange("annualInterestRate", Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12.5"
                />
                {validationErrors.annualInterestRate && (
                  <p className="text-xs text-red-500">{validationErrors.annualInterestRate}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Interest Method</label>
                <select
                  value={formData.interestMethod}
                  onChange={(e) => handleInputChange("interestMethod", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={InterestMethod.FLAT}>Flat</option>
                  <option value={InterestMethod.REDUCING_BALANCE}>Reducing Balance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Term (Months) *</label>
                <input
                  type="number"
                  value={formData.termInMonths}
                  onChange={(e) => handleInputChange("termInMonths", Number.parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12"
                />
                {validationErrors.termInMonths && (
                  <p className="text-xs text-red-500">{validationErrors.termInMonths}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Repayment Frequency</label>
                <select
                  value={formData.repaymentFrequency}
                  onChange={(e) => handleInputChange("repaymentFrequency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={RepaymentFrequency.DAILY}>Daily</option>
                  <option value={RepaymentFrequency.WEEKLY}>Weekly</option>
                  <option value={RepaymentFrequency.BIWEEKLY}>Biweekly</option>
                  <option value={RepaymentFrequency.MONTHLY}>Monthly</option>
                  <option value={RepaymentFrequency.QUARTERLY}>Quarterly</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Grace Period (Months)</label>
                <input
                  type="number"
                  value={formData.gracePeriodMonths}
                  onChange={(e) => handleInputChange("gracePeriodMonths", Number.parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Collateral Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Collateral Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Collateral Type</label>
                <select
                  value={formData.collateralType}
                  onChange={(e) => handleInputChange("collateralType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={CollateralType.MOVABLE}>Movable</option>
                  <option value={CollateralType.IMMOVABLE}>Immovable</option>
                  <option value={CollateralType.FINANCIAL}>Financial</option>
                  <option value={CollateralType.GUARANTEE}>Guarantee</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Collateral Value (RWF)</label>
                <input
                  type="number"
                  value={formData.collateralValue}
                  onChange={(e) => handleInputChange("collateralValue", Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter collateral value"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Guarantor Name</label>
                <input
                  type="text"
                  value={formData.guarantorName}
                  onChange={(e) => handleInputChange("guarantorName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter guarantor name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Guarantor Phone</label>
                <input
                  type="tel"
                  value={formData.guarantorPhone}
                  onChange={(e) => handleInputChange("guarantorPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+250 XXX XXX XXX"
                />
                {validationErrors.guarantorPhone && (
                  <p className="text-xs text-red-500">{validationErrors.guarantorPhone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Valuation Date</label>
                <input
                  type="date"
                  value={formData.valuationDate}
                  onChange={(e) => handleInputChange("valuationDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Valued By</label>
                <input
                  type="text"
                  value={formData.valuedBy}
                  onChange={(e) => handleInputChange("valuedBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Who valued the collateral"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Collateral Description</label>
              <textarea
                value={formData.collateralDescription}
                onChange={(e) => handleInputChange("collateralDescription", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe the collateral in detail"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Guarantor Address</label>
              <textarea
                value={formData.guarantorAddress}
                onChange={(e) => handleInputChange("guarantorAddress", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter guarantor address"
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Collateral Documents</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <FileUploadCard fileType="proofOfOwnership" label="Proof of Ownership" icon={FileText} />
                <FileUploadCard fileType="ownerIdentification" label="Owner ID" icon={User} />
                <FileUploadCard fileType="legalDocument" label="Legal Document" icon={FileText} />
                <FileUploadCard fileType="physicalEvidence" label="Physical Evidence" icon={Building2} />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Income Source</label>
                <textarea
                  value={formData.incomeSource}
                  onChange={(e) => handleInputChange("incomeSource", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe your income source"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Previous Loans Paid On Time</label>
                <input
                  type="number"
                  value={formData.previousLoansPaidOnTime}
                  onChange={(e) => handleInputChange("previousLoansPaidOnTime", Number.parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of loans paid on time"
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Borrower Notes</label>
                <textarea
                  value={formData.borrowerNotes}
                  onChange={(e) => handleInputChange("borrowerNotes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Additional notes about the borrower..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Notes</label>
                <textarea
                  value={formData.loanNotes}
                  onChange={(e) => handleInputChange("loanNotes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Additional notes about the loan..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Collateral Notes</label>
                <textarea
                  value={formData.collateralNotes}
                  onChange={(e) => handleInputChange("collateralNotes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Additional notes about the collateral..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Application...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Loan Application
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CompactLoanApplicationForm
