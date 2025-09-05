// @ts-nocheck
"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Briefcase,
  Phone,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Mail,
  IdCard,
  Globe,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  CreditCard,
  Users,
  Heart,
  Info
} from "lucide-react"

import { createBorrower, clearError } from "@/lib/features/auth/borrowerSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import rwandaData from "../../../../../../data.json"
import toast from "react-hot-toast"

import {
  Gender,
  MaritalStatus,
  RelationshipType,
  type BorrowerProfile,
  type Address
} from "@/lib/features/auth/borrowerSlice"

const COUNTRIES = [
  "Rwanda",
  "Other",
]

const OCCUPATIONS = [
  "Software Engineer",
  "Teacher",
  "Doctor",
  "Nurse",
  "Farmer",
  "Business Owner",
  "Civil Servant",
  "Student",
  "Trader",
  "Driver",
  "Engineer",
  "Accountant",
  "Lawyer",
  "Other"
]

interface FormData {
  firstName: string
  lastName: string
  middleName: string
  nationalId: string
  gender: Gender
  dateOfBirth: string
  maritalStatus: MaritalStatus
  primaryPhone: string
  alternativePhone: string
  email: string
  address: Address
  occupation: string
  monthlyIncome: number | string
  incomeSource: string
  relationshipWithNDFSP: RelationshipType
  previousLoansPaidOnTime: number | string
  notes: string
}

const CreateBorrowerPages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.borrowers)
  const router = useRouter()
const { user } = useSelector((state: RootState) => state.auth)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
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
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      street: "",
      houseNumber: "",
      poBox: "",
    },
    occupation: "",
    monthlyIncome: "",
    incomeSource: "",
    relationshipWithNDFSP: RelationshipType.NEW_BORROWER,
    previousLoansPaidOnTime: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Rwanda location data states
  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  const maxSteps = 5

  // Initialize provinces from Rwanda data
  useEffect(() => {
    dispatch(clearError())
    const provinceList = Object.keys(rwandaData)
    setProvinces(provinceList)
  }, [dispatch])

  // Update districts when province changes
  useEffect(() => {
    if (formData.address.province) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtList = Object.keys(provinceData)
      setDistricts(districtList)

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          district: "",
          sector: "",
          cell: "",
          village: "",
        },
      }))
      setSectors([])
      setCells([])
      setVillages([])
    }
  }, [formData.address.province])

  // Update sectors when district changes
  useEffect(() => {
    if (formData.address.province && formData.address.district) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorList = Object.keys(districtData)
      setSectors(sectorList)

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          sector: "",
          cell: "",
          village: "",
        },
      }))
      setCells([])
      setVillages([])
    }
  }, [formData.address.district])

  // Update cells when sector changes
  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorData = districtData[formData.address.sector as keyof typeof districtData]
      const cellList = Object.keys(sectorData)
      setCells(cellList)

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          cell: "",
          village: "",
        },
      }))
      setVillages([])
    }
  }, [formData.address.sector])

  // Update villages when cell changes
  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector && formData.address.cell) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData]
      const districtData = provinceData[formData.address.district as keyof typeof provinceData]
      const sectorData = districtData[formData.address.sector as keyof typeof districtData]
      const cellData = sectorData[formData.address.cell as keyof typeof sectorData]

      if (Array.isArray(cellData)) {
        setVillages(cellData)

        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            village: "",
          },
        }))
      }
    }
  }, [formData.address.cell])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) {
          newErrors.firstName = "First name is required"
        } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 100) {
          newErrors.firstName = "First name must be between 2 and 100 characters"
        } else if (!/^[A-Za-z\s\-'.]+$/.test(formData.firstName)) {
          newErrors.firstName = "First name contains invalid characters"
        }

        if (!formData.lastName.trim()) {
          newErrors.lastName = "Last name is required"
        } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 100) {
          newErrors.lastName = "Last name must be between 2 and 100 characters"
        } else if (!/^[A-Za-z\s\-'.]+$/.test(formData.lastName)) {
          newErrors.lastName = "Last name contains invalid characters"
        }

        if (formData.middleName && !/^[A-Za-z\s\-'.]+$/.test(formData.middleName)) {
          newErrors.middleName = "Middle name contains invalid characters"
        }

        if (!formData.nationalId.trim()) {
          newErrors.nationalId = "National ID is required"
        } else if (!/^\d{16}$/.test(formData.nationalId)) {
          newErrors.nationalId = "National ID must be exactly 16 digits"
        }

        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = "Date of birth is required"
        } else {
          const birthDate = new Date(formData.dateOfBirth)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          if (age < 18 || age > 100) {
            newErrors.dateOfBirth = "Age must be between 18 and 100 years"
          }
        }
        break

      case 2: // Contact Information
        if (!formData.primaryPhone.trim()) {
          newErrors.primaryPhone = "Primary phone is required"
        } else if (!/^\+[1-9]\d{1,14}$/.test(formData.primaryPhone)) {
          newErrors.primaryPhone = "Invalid international phone number format"
        }

        if (formData.alternativePhone && !/^\+[1-9]\d{1,14}$/.test(formData.alternativePhone)) {
          newErrors.alternativePhone = "Invalid international phone number format"
        }

        if (formData.alternativePhone && !/^\+?[1-9]\d{1,14}$/.test(formData.alternativePhone)) {
          newErrors.alternativePhone = "Invalid alternative phone number format"
        }

        if (formData.alternativePhone && formData.alternativePhone === formData.primaryPhone) {
          newErrors.alternativePhone = "Alternative phone should be different from primary phone"
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid"
        }
        break

      case 3: // Address Information
        if (!formData.address.country) newErrors.country = "Country is required"
        if (!formData.address.province) newErrors.province = "Province is required"
        if (!formData.address.district) newErrors.district = "District is required"
        if (!formData.address.sector) newErrors.sector = "Sector is required"
        break

      case 4: // Employment & Income
        if (!formData.occupation.trim()) {
          newErrors.occupation = "Occupation is required"
        } else if (formData.occupation.trim().length > 100) {
          newErrors.occupation = "Occupation must not exceed 100 characters"
        }

        if (!formData.monthlyIncome) {
          newErrors.monthlyIncome = "Monthly income is required"
        } else if (Number(formData.monthlyIncome) <= 0) {
          newErrors.monthlyIncome = "Monthly income must be greater than 0"
        }

        if (!formData.incomeSource.trim()) {
          newErrors.incomeSource = "Income source is required"
        } else if (formData.incomeSource.trim().length > 255) {
          newErrors.incomeSource = "Income source must not exceed 255 characters"
        }

        if (Number(formData.monthlyIncome) > 0 && !formData.incomeSource.trim()) {
          newErrors.incomeSource = "Income source should be provided when monthly income is specified"
        }
        break

      case 5: // Relationship & Additional Info
        if (formData.previousLoansPaidOnTime && Number(formData.previousLoansPaidOnTime) < 0) {
          newErrors.previousLoansPaidOnTime = "Previous loans paid on time cannot be negative"
        }

        if (formData.notes && formData.notes.length > 1000) {
          newErrors.notes = "Notes must not exceed 1000 characters"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, maxSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split(".")
    if (keys.length === 1) {
      setFormData((prev) => ({ ...prev, [field]: value }))
    } else if (keys.length === 2) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof FormData],
          [keys[1]]: value,
        },
      }))
    }

    // Clear error when user starts typing
    if (errors[field] || errors[keys[keys.length - 1]]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        delete newErrors[keys[keys.length - 1]]
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(maxSteps)) return

    setIsSubmitting(true)

    try {
      const borrowerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        nationalId: formData.nationalId,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        primaryPhone: formData.primaryPhone,
        alternativePhone: formData.alternativePhone || undefined,
        email: formData.email || undefined,
        address: formData.address,
        occupation: formData.occupation || undefined,
        monthlyIncome: Number(formData.monthlyIncome) || undefined,
        incomeSource: formData.incomeSource || undefined,
        relationshipWithNDFSP: formData.relationshipWithNDFSP,
        previousLoansPaidOnTime: Number(formData.previousLoansPaidOnTime) || 0,
        notes: formData.notes || undefined,
      }

      await dispatch(createBorrower(borrowerData)).unwrap()

      // Reset form after successful submission
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
          province: "",
          district: "",
          sector: "",
          cell: "",
          village: "",
          street: "",
          houseNumber: "",
          poBox: "",
        },
        occupation: "",
        monthlyIncome: "",
        incomeSource: "",
        relationshipWithNDFSP: RelationshipType.NEW_BORROWER,
        previousLoansPaidOnTime: "",
        notes: "",
      })

      // Reset to first step
      setCurrentStep(1)

      // Show success toast
      if (typeof window !== 'undefined') {
        toast.success('Borrower profile created successfully!')
      }

    } catch (error) {
      console.error("Failed to create borrower profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: maxSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${step <= currentStep
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white shadow-lg'
                : 'border-gray-300 text-gray-500 bg-white'
              }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <span className="text-sm font-semibold">{step}</span>
            )}
          </div>
          {step < maxSteps && (
            <div
              className={`w-20 h-0.5 mx-3 transition-all duration-300 ${step < currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                  : 'bg-gray-300'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              First Name * <span className="text-xs text-gray-500">(2-100 characters)</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Last Name * <span className="text-xs text-gray-500">(2-100 characters)</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.lastName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Middle Name
            </label>
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => handleInputChange("middleName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter middle name (optional)"
            />
            {errors.middleName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.middleName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              National ID * <span className="text-xs text-gray-500">(16 digits)</span>
            </label>
            <input
              type="text"
              value={formData.nationalId}
              onChange={(e) => handleInputChange("nationalId", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter 16-digit National ID"
              maxLength={16}
            />
            {errors.nationalId && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.nationalId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
              <option value={Gender.OTHER}>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Date of Birth * <span className="text-xs text-gray-500">(18-100 years)</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Marital Status *
            </label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value={MaritalStatus.SINGLE}>Single</option>
              <option value={MaritalStatus.MARRIED}>Married</option>
              <option value={MaritalStatus.DIVORCED}>Divorced</option>
              <option value={MaritalStatus.WIDOWED}>Widowed</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Primary Phone * <span className="text-xs text-gray-500">(International format)</span>
            </label>
            <PhoneInput
              defaultCountry="rw"
              value={formData.primaryPhone}
              onChange={(phone) => handleInputChange("primaryPhone", phone)}
              inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              countrySelectorStyleProps={{
                buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                dropdownStyleProps: {
                  className: "z-50 max-h-60 overflow-y-auto"
                }
              }}
              placeholder="+250 XXX XXX XXX"
            />
            {errors.primaryPhone && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.primaryPhone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Alternative Phone
            </label>
            <PhoneInput
              defaultCountry="rw"
              value={formData.alternativePhone}
              onChange={(phone) => handleInputChange("alternativePhone", phone)}
              inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              countrySelectorStyleProps={{
                buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                dropdownStyleProps: {
                  className: "z-50 max-h-60 overflow-y-auto"
                }
              }}
              placeholder="+250 XXX XXX XXX (optional)"
            />
            {errors.alternativePhone && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.alternativePhone}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="borrower@example.com (optional)"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-2 bg-red-100 rounded-lg mr-3">
            <MapPin className="w-6 h-6 text-red-600" />
          </div>
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Country *</label>
            <select
              value={formData.address.country}
              onChange={(e) => handleInputChange("address.country", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.country}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Province *</label>
            <select
              value={formData.address.province}
              onChange={(e) => handleInputChange("address.province", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              disabled={formData.address.country !== "Rwanda"}
            >
              <option value="">Select province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.province}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">District *</label>
            <select
              value={formData.address.district}
              onChange={(e) => handleInputChange("address.district", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              disabled={!formData.address.province || formData.address.country !== "Rwanda"}
            >
              <option value="">Select district</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.district}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Sector *</label>
            <select
              value={formData.address.sector}
              onChange={(e) => handleInputChange("address.sector", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              disabled={!formData.address.district || formData.address.country !== "Rwanda"}
            >
              <option value="">Select sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            {errors.sector && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.sector}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Cell</label>
            <select
              value={formData.address.cell}
              onChange={(e) => handleInputChange("address.cell", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              disabled={!formData.address.sector || formData.address.country !== "Rwanda"}
            >
              <option value="">Select cell</option>
              {cells.map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Village</label>
            <select
              value={formData.address.village}
              onChange={(e) => handleInputChange("address.village", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              disabled={!formData.address.cell || formData.address.country !== "Rwanda"}
            >
              <option value="">Select village</option>
              {villages.map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange("address.street", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter street"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">House Number</label>
            <input
              type="text"
              value={formData.address.houseNumber}
              onChange={(e) => handleInputChange("address.houseNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter house number"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">P.O. Box</label>
            <input
              type="text"
              value={formData.address.poBox}
              onChange={(e) => handleInputChange("address.poBox", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter P.O. Box"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <Briefcase className="w-6 h-6 text-purple-600" />
          </div>
          Employment & Income Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Occupation * <span className="text-xs text-gray-500">(Max 100 characters)</span>
            </label>
            <select
              value={formData.occupation}
              onChange={(e) => handleInputChange("occupation", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="">Select occupation</option>
              {OCCUPATIONS.map((occupation) => (
                <option key={occupation} value={occupation}>
                  {occupation}
                </option>
              ))}
            </select>
            {errors.occupation && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.occupation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Monthly Income (RWF) *
            </label>
            <input
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter monthly income"
              min="0"
            />
            {errors.monthlyIncome && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.monthlyIncome}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Income Source * <span className="text-xs text-gray-500">(Max 255 characters)</span>
            </label>
            <textarea
              value={formData.incomeSource}
              onChange={(e) => handleInputChange("incomeSource", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Describe your primary source of income"
              rows={3}
              maxLength={255}
            />
            {errors.incomeSource && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.incomeSource}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-2 bg-orange-100 rounded-lg mr-3">
            <CreditCard className="w-6 h-6 text-orange-600" />
          </div>
          Relationship & Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Relationship with NDFSP *
            </label>
            <select
              value={formData.relationshipWithNDFSP}
              onChange={(e) => handleInputChange("relationshipWithNDFSP", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value={RelationshipType.NEW_BORROWER}>New Borrower</option>
              <option value={RelationshipType.REPEAT_BORROWER}>Repeat Borrower</option>
              <option value={RelationshipType.RETURNING_BORROWER}>Returning Borrower</option>
              <option value={RelationshipType.STAFF}>Staff</option>
              <option value={RelationshipType.DIRECTOR}>Director</option>
              <option value={RelationshipType.SHAREHOLDER}>Shareholder</option>
              <option value={RelationshipType.NONE}>None</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Previous Loans Paid On Time
            </label>
            <input
              type="number"
              value={formData.previousLoansPaidOnTime}
              onChange={(e) => handleInputChange("previousLoansPaidOnTime", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Number of loans paid on time"
              min="0"
            />
            {errors.previousLoansPaidOnTime && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.previousLoansPaidOnTime}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Additional Notes <span className="text-xs text-gray-500">(Max 1000 characters)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Any additional information about the borrower..."
              rows={4}
              maxLength={1000}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.notes}
              </p>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Review Your Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Full Name:</span>
              <span className="ml-2 text-gray-800">
                {formData.firstName} {formData.middleName} {formData.lastName}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">National ID:</span>
              <span className="ml-2 text-gray-800">{formData.nationalId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="ml-2 text-gray-800">{formData.primaryPhone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Monthly Income:</span>
              <span className="ml-2 text-gray-800">
                {formData.monthlyIncome ? `RWF ${Number(formData.monthlyIncome).toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Location:</span>
              <span className="ml-2 text-gray-800">
                {[formData.address.district, formData.address.sector, formData.address.cell, formData.address.village]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Relationship:</span>
              <span className="ml-2 text-gray-800 capitalize">
                {formData.relationshipWithNDFSP.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Validation Info */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-600 flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                All required fields have been validated according to NDFSP standards.
                This profile will be assigned a unique borrower ID upon creation.
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center pt-8">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
          }`}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Previous
      </button>

      <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
        Step {currentStep} of {maxSteps}
      </div>

      {currentStep < maxSteps ? (
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Create Borrower
            </>
          )}
        </button>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Borrower</h1>
          <p className="text-lg text-gray-600">
            Add a new borrower profile to your organization
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-8">
            {renderStepIndicator()}

            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {renderNavigationButtons()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBorrowerPages