"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase
} from "lucide-react"
import toast from "react-hot-toast"
import {
  fetchBorrowerById,
  updateBorrower,
  clearError,
  type BorrowerProfile,
  Gender,
  MaritalStatus,
  RelationshipType
} from "@/lib/features/auth/borrowerSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { RwandaLocationService } from "@/lib/rwandaLocations"

const BorrowerEditPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams()
  
  // CRITICAL FIX: Extract borrowerId correctly
  const borrowerId = params?.borrowerId as string

  const { currentBorrower, isLoading, error } = useSelector(
    (state: RootState) => state.borrowers
  )

  const [formData, setFormData] = useState<Partial<BorrowerProfile>>({
    address: {} // Initialize address object
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Location dropdowns
  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  // CRITICAL: Fetch borrower data when borrowerId is available
  useEffect(() => {
    console.log("Fetching borrower with ID:", borrowerId) // Debug log
    
    if (borrowerId && !isNaN(Number(borrowerId))) {
      dispatch(fetchBorrowerById(Number(borrowerId)))
    } else {
      console.error("Invalid borrowerId:", borrowerId)
    }
    
    setProvinces(RwandaLocationService.getProvinces())
    
    return () => {
      dispatch(clearError())
    }
  }, [dispatch, borrowerId])

  // Sync formData with currentBorrower when it loads
  useEffect(() => {
    if (currentBorrower) {
      console.log("Current borrower loaded:", currentBorrower) // Debug log
      setFormData({
        ...currentBorrower,
        address: currentBorrower.address || {}
      })
    }
  }, [currentBorrower])

  // Update location dropdowns based on selections
  useEffect(() => {
    if (formData.address?.province) {
      const districtList = RwandaLocationService.getDistricts(formData.address.province)
      setDistricts(districtList)
    } else {
      setDistricts([])
    }
  }, [formData.address?.province])

  useEffect(() => {
    if (formData.address?.province && formData.address?.district) {
      const sectorList = RwandaLocationService.getSectors(
        formData.address.province,
        formData.address.district
      )
      setSectors(sectorList)
    } else {
      setSectors([])
    }
  }, [formData.address?.district])

  useEffect(() => {
    if (formData.address?.province && formData.address?.district && formData.address?.sector) {
      const cellList = RwandaLocationService.getCells(
        formData.address.province,
        formData.address.district,
        formData.address.sector
      )
      setCells(cellList)
    } else {
      setCells([])
    }
  }, [formData.address?.sector])

  useEffect(() => {
    if (formData.address?.province && formData.address?.district && 
        formData.address?.sector && formData.address?.cell) {
      const villageList = RwandaLocationService.getVillages(
        formData.address.province,
        formData.address.district,
        formData.address.sector,
        formData.address.cell
      )
      setVillages(villageList)
    } else {
      setVillages([])
    }
  }, [formData.address?.cell])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1]
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        }
      }
      return { ...prev, [field]: value }
    })

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required"
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!formData.nationalId?.trim()) {
      errors.nationalId = "National ID is required"
    } else if (!/^\d{16}$/.test(formData.nationalId)) {
      errors.nationalId = "National ID must be exactly 16 digits"
    }

    if (!formData.primaryPhone?.trim()) {
      errors.primaryPhone = "Primary phone is required"
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.primaryPhone)) {
      errors.primaryPhone = "Invalid phone number format"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix validation errors")
      return
    }

    setIsSubmitting(true)

    try {
      await dispatch(updateBorrower({
        id: Number(borrowerId),
        data: formData
      })).unwrap()

      toast.success("Borrower updated successfully!")
      router.push(`/dashboard/client/borrower/${borrowerId}`)
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error(error || "Failed to update borrower")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while fetching initial data
  if (isLoading && !currentBorrower) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading borrower data...</p>
        </div>
      </div>
    )
  }

  // Show error if borrower not found
  if (!isLoading && !currentBorrower) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Borrower Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The requested borrower could not be loaded. Please check the ID and try again."}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/dashboard/client/borrower")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Borrowers
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <User className="w-8 h-8 mr-3 text-blue-600" />
            Edit Borrower
          </h1>
          <p className="text-gray-600 mt-1">
            Update borrower information for {formData.firstName} {formData.lastName}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName || ""}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID *
                </label>
                <input
                  type="text"
                  value={formData.nationalId || ""}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  maxLength={16}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.nationalId && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.nationalId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ""}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender || Gender.MALE}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status *
                </label>
                <select
                  value={formData.maritalStatus || MaritalStatus.SINGLE}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={MaritalStatus.SINGLE}>Single</option>
                  <option value={MaritalStatus.MARRIED}>Married</option>
                  <option value={MaritalStatus.DIVORCED}>Divorced</option>
                  <option value={MaritalStatus.WIDOWED}>Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-green-600" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  value={formData.primaryPhone || ""}
                  onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                  placeholder="+250XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.primaryPhone && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.primaryPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternativePhone || ""}
                  onChange={(e) => handleInputChange("alternativePhone", e.target.value)}
                  placeholder="+250XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {validationErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <select
                  value={formData.address?.province || ""}
                  onChange={(e) => handleInputChange("address.province", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <select
                  value={formData.address?.district || ""}
                  onChange={(e) => handleInputChange("address.district", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.address?.province}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <select
                  value={formData.address?.sector || ""}
                  onChange={(e) => handleInputChange("address.sector", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.address?.district}
                >
                  <option value="">Select Sector</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cell
                </label>
                <select
                  value={formData.address?.cell || ""}
                  onChange={(e) => handleInputChange("address.cell", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.address?.sector}
                >
                  <option value="">Select Cell</option>
                  {cells.map(cell => (
                    <option key={cell} value={cell}>{cell}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village
                </label>
                <select
                  value={formData.address?.village || ""}
                  onChange={(e) => handleInputChange("address.village", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.address?.cell}
                >
                  <option value="">Select Village</option>
                  {villages.map(village => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employment & Additional Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
              Employment & Financial Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation || ""}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (RWF)
                </label>
                <input
                  type="number"
                  value={formData.monthlyIncome || ""}
                  onChange={(e) => handleInputChange("monthlyIncome", Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Income Source
                </label>
                <input
                  type="text"
                  value={formData.incomeSource || ""}
                  onChange={(e) => handleInputChange("incomeSource", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship with NDFSP
                </label>
                <select
                  value={formData.relationshipWithNDFSP || RelationshipType.NONE}
                  onChange={(e) => handleInputChange("relationshipWithNDFSP", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={RelationshipType.NONE}>None</option>
                  <option value={RelationshipType.STAFF}>Staff</option>
                  <option value={RelationshipType.DIRECTOR}>Director</option>
                  <option value={RelationshipType.SHAREHOLDER}>Shareholder</option>
                  <option value={RelationshipType.NEW_BORROWER}>New Borrower</option>
                  <option value={RelationshipType.REPEAT_BORROWER}>Repeat Borrower</option>
                  <option value={RelationshipType.RETURNING_BORROWER}>Returning Borrower</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Loans Paid On Time
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.previousLoansPaidOnTime || 0}
                  onChange={(e) => handleInputChange("previousLoansPaidOnTime", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any additional notes about the borrower..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pb-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Borrower
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BorrowerEditPage