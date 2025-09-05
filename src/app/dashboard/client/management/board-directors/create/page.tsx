// @ts-nocheck

"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  FileText,
  Upload,
  X
} from "lucide-react"

import { createBoardDirector, clearError } from "@/lib/features/auth/management-slice"
import type { AppDispatch, RootState } from "@/lib/store"
import rwandaData from "../../../../../../../data.json"
import toast from "react-hot-toast"
const DIRECTOR_POSITIONS = [
  "Chairperson",
  "Vice Chairperson", 
  "Director",
  "Independent Director",
  "Executive Director",
  "Non-Executive Director",
]

const COUNTRIES = [
  "Rwanda",
  "Uganda",
  "Kenya",
  "Tanzania",
  "Burundi",
  "DRC",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Other",
]

interface Address {
  country: string
  province: string
  district: string
  sector: string
  cell: string
  village: string
  street: string
  houseNumber: string
  poBox: string
}

interface FormData {
  name: string
  position: string
  nationality: string
  idPassport: string
  phone: string
  email: string
  address: Address
  qualifications: string
  experience: string
  currentOccupation: string
}

const CreateBoardDirector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.management)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    position: "",
    nationality: "Rwanda",
    idPassport: "",
    phone: "",
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
    qualifications: "",
    experience: "",
    currentOccupation: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  const maxSteps = 4

  useEffect(() => {
    dispatch(clearError())
    const provinceList = Object.keys(rwandaData)
    setProvinces(provinceList)
  }, [dispatch])

  // Location data effects
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
        if (!formData.name.trim()) newErrors.name = "Director name is required"
        if (!formData.position) newErrors.position = "Position is required"
        if (!formData.nationality.trim()) newErrors.nationality = "Nationality is required"
        if (!formData.idPassport.trim()) newErrors.idPassport = "ID/Passport is required"
        break
      case 2: // Contact Information
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
        else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
          newErrors.phone = "Invalid phone number format"
        }
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
        break
      case 3: // Address Information
        if (!formData.address.country) newErrors.country = "Country is required"
        if (!formData.address.province) newErrors.province = "Province is required"
        if (!formData.address.district) newErrors.district = "District is required"
        if (!formData.address.sector) newErrors.sector = "Sector is required"
        break
      case 4: // Professional Details
        if (!formData.qualifications.trim()) newErrors.qualifications = "Qualification is required"
        if (!formData.experience.trim()) newErrors.experience = "Experience is required"
        if (!formData.currentOccupation.trim()) newErrors.currentOccupation = "Current occupation is required"
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

// Update the handleSubmit function
const handleSubmit = async () => {
  if (!validateStep(maxSteps)) return

  setIsSubmitting(true)

  try {
    const formDataToSend = new FormData()
    
    // Add all form data
    formDataToSend.append("name", formData.name)
    formDataToSend.append("position", formData.position)
    formDataToSend.append("nationality", formData.nationality)
    formDataToSend.append("idPassport", formData.idPassport)
    formDataToSend.append("phone", formData.phone)
    formDataToSend.append("email", formData.email)
    formDataToSend.append("qualifications", formData.qualifications)
    formDataToSend.append("experience", formData.experience)
    formDataToSend.append("currentOccupation", formData.currentOccupation)
    
    // Add address data
    formDataToSend.append("address[country]", formData.address.country)
    formDataToSend.append("address[province]", formData.address.province)
    formDataToSend.append("address[district]", formData.address.district)
    formDataToSend.append("address[sector]", formData.address.sector)
    formDataToSend.append("address[cell]", formData.address.cell || "")
    formDataToSend.append("address[village]", formData.address.village || "")
    formDataToSend.append("address[street]", formData.address.street || "")
    formDataToSend.append("address[houseNumber]", formData.address.houseNumber || "")
    formDataToSend.append("address[poBox]", formData.address.poBox || "")
    
    // Add files - USE THE CORRECT FIELD NAMES THAT MATCH BACKEND
    if (uploadedFiles.cvDocument) {
      formDataToSend.append("cvDocument", uploadedFiles.cvDocument)
    }
    if (uploadedFiles.qualificationCertificates) {
      formDataToSend.append("qualificationCertificates", uploadedFiles.qualificationCertificates)
    }
    if (uploadedFiles.idProofDocument) {
      formDataToSend.append("idProofDocument", uploadedFiles.idProofDocument)
    }
    if (uploadedFiles.appointmentLetter) {
      formDataToSend.append("appointmentLetter", uploadedFiles.appointmentLetter)
    }

    await dispatch(createBoardDirector(formDataToSend)).unwrap()
    
    // Reset form after successful submission
    setFormData({
      name: "",
      position: "",
      nationality: "Rwanda",
      idPassport: "",
      phone: "",
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
      qualifications: "",
      experience: "",
      currentOccupation: "",
    })
    
    // Reset uploaded files
    setUploadedFiles({})
    
    // Reset to first step
    setCurrentStep(1)
    
    // Show success toast
    if (typeof window !== 'undefined') {

      toast.success('Board director created successfully!')
    }
    
  } catch (error) {
    console.error("Failed to create board director:", error)
  } finally {
    setIsSubmitting(false)
  }
}
  const handleFileChange = (documentType: string, file: File | null) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [documentType]: file }))
    } else {
      setUploadedFiles(prev => {
        const newFiles = { ...prev }
        delete newFiles[documentType]
        return newFiles
      })
    }
  }

  const removeFile = (documentType: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[documentType]
      return newFiles
    })
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: maxSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step <= currentStep
                ? 'bg-[#5B7FA2] border-[#5B7FA2] text-white'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-semibold">{step}</span>
            )}
          </div>
          {step < maxSteps && (
            <div
              className={`w-16 h-0.5 mx-2 ${
                step < currentStep ? 'bg-[#5B7FA2]' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

// Update the file upload section to use consistent field names
const renderFileUpload = (documentType: string, label: string) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
      {uploadedFiles[documentType] ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                {uploadedFiles[documentType].name}
              </p>
              <p className="text-xs text-gray-500">
                {(uploadedFiles[documentType].size / (1024 * 1024)).toFixed(2)}MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFile(documentType)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(documentType, e.target.files?.[0] || null)}
            className="hidden"
            id={documentType}
            name={documentType} // Add name attribute to match backend
          />
          <label htmlFor={documentType} className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload {label.toLowerCase()}
            </p>
            <p className="text-xs text-gray-500">
              Max size: 10MB | Formats: PDF, JPG, PNG
            </p>
          </label>
        </div>
      )}
    </div>
    {errors[documentType] && (
      <p className="text-red-500 text-sm mt-1">{errors[documentType]}</p>
    )}
  </div>
)
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position *
            </label>
            <select
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select position</option>
              {DIRECTOR_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality *
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID/Passport Number *
            </label>
            <input
              type="text"
              value={formData.idPassport}
              onChange={(e) => handleInputChange("idPassport", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ID or passport number"
            />
            {errors.idPassport && <p className="text-red-500 text-sm mt-1">{errors.idPassport}</p>}
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
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Phone className="w-5 h-5 mr-2 text-green-600" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+250 XXX XXX XXX"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="director@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-red-600" />
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              value={formData.address.country}
              onChange={(e) => handleInputChange("address.country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
            <select
              value={formData.address.province}
              onChange={(e) => handleInputChange("address.province", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={formData.address.country !== "Rwanda"}
            >
              <option value="">Select province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
            <select
              value={formData.address.district}
              onChange={(e) => handleInputChange("address.district", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.address.province || formData.address.country !== "Rwanda"}
            >
              <option value="">Select district</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
            <select
              value={formData.address.sector}
              onChange={(e) => handleInputChange("address.sector", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.address.district || formData.address.country !== "Rwanda"}
            >
              <option value="">Select sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
            <select
              value={formData.address.cell}
              onChange={(e) => handleInputChange("address.cell", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
            <select
              value={formData.address.village}
              onChange={(e) => handleInputChange("address.village", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange("address.street", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
            <input
              type="text"
              value={formData.address.houseNumber}
              onChange={(e) => handleInputChange("address.houseNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter house number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
            <input
              type="text"
              value={formData.address.poBox}
              onChange={(e) => handleInputChange("address.poBox", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
        Professional Details
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
          <textarea
            value={formData.qualifications}
            onChange={(e) => handleInputChange("qualifications", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter educational qualifications and certifications"
            rows={3}
          />
          {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
          <textarea
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter professional experience and achievements"
            rows={3}
          />
          {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Occupation *</label>
          <input
            type="text"
            value={formData.currentOccupation}
            onChange={(e) => handleInputChange("currentOccupation", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current job title and company"
          />
          {errors.currentOccupation && <p className="text-red-500 text-sm mt-1">{errors.currentOccupation}</p>}
        </div>
      </div>
    </div>

    {/* Document Upload Section */}
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        Document Upload
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFileUpload('idProofDocument', 'ID Proof Document')}
        {renderFileUpload('cvDocument', 'CV/Resume')}
        {renderFileUpload('appointmentLetter', 'Appointment Letter')}
        {renderFileUpload('qualificationCertificates', 'Qualification Certificates')}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Upload Guidelines:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Maximum file size: 10MB per document</li>
          <li>• Supported formats: PDF, JPG, PNG</li>
          <li>• Documents are required for verification</li>
          <li>• Ensure documents are clear and legible</li>
        </ul>
      </div>
    </div>
  </motion.div>
)

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center pt-6">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
          currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </button>

      <div className="text-sm text-gray-500">
        Step {currentStep} of {maxSteps}
      </div>

      {currentStep < maxSteps ? (
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Director
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
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-4xl mx-auto px-1 sm:px-2 lg:px-3">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-full bg-blue-100">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Create Board Director</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add a new board director to your organization
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md"
          >
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-xs text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3">
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

export default CreateBoardDirector