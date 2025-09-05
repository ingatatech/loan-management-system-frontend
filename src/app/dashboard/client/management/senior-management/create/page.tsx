// @ts-nocheck

"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Save,
  Users,
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
  FileText,
  Upload,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createSeniorManagement, clearError } from "@/lib/features/auth/management-slice"
import type { AppDispatch, RootState } from "@/lib/store"
import rwandaData from "../../../../../../../data.json"
import toast from "react-hot-toast"

const MANAGEMENT_POSITIONS = [
  "Chief Executive Officer (CEO)",
  "Chief Financial Officer (CFO)",
  "Chief Operating Officer (COO)",
  "Chief Technology Officer (CTO)",
  "Chief Marketing Officer (CMO)",
  "Chief Human Resources Officer (CHRO)",
  "General Manager",
  "Deputy General Manager",
  "Head of Operations",
  "Head of Finance",
  "Head of Marketing",
  "Head of Human Resources",
  "Head of IT",
  "Head of Legal Affairs",
  "Head of Risk Management",
  "Head of Compliance",
  "Senior Manager",
  "Manager",
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
  experienceBackground: string
  phone: string
  email: string
  address: Address
}

const CreateSeniorManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isLoading, error } = useSelector((state: RootState) => state.management)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    position: "",
    experienceBackground: "",
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  const maxSteps = 3

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
      if (!formData.name.trim()) newErrors.name = "Manager name is required"
      if (!formData.position) newErrors.position = "Position is required"
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
      if (!formData.address.country) newErrors.country = "Address country is required"
      if (!formData.address.province) newErrors.province = "Address province is required"
      if (!formData.experienceBackground.trim()) newErrors.experienceBackground = "Experience background is required"
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
    // Create FormData object instead of sending JSON
    const formDataToSend = new FormData()
    
    // Add all form data with correct field names
    formDataToSend.append("name", formData.name)
    formDataToSend.append("position", formData.position)
    formDataToSend.append("experienceBackground", formData.experienceBackground)
    formDataToSend.append("phone", formData.phone)
    formDataToSend.append("email", formData.email)
    
    // Add address data with proper nested structure
    formDataToSend.append("address[country]", formData.address.country)
    formDataToSend.append("address[province]", formData.address.province)
    formDataToSend.append("address[district]", formData.address.district)
    formDataToSend.append("address[sector]", formData.address.sector)
    formDataToSend.append("address[cell]", formData.address.cell || "")
    formDataToSend.append("address[village]", formData.address.village || "")
    formDataToSend.append("address[street]", formData.address.street || "")
    formDataToSend.append("address[houseNumber]", formData.address.houseNumber || "")
    formDataToSend.append("address[poBox]", formData.address.poBox || "")
    
    // Add files with correct field names that match backend
    if (uploadedFiles.cv) {
      formDataToSend.append("cvDocument", uploadedFiles.cv)
    }
    if (uploadedFiles.qualifications) {
      formDataToSend.append("qualificationCertificates", uploadedFiles.qualifications)
    }

    await dispatch(createSeniorManagement(formDataToSend)).unwrap()
    
    // Reset form after successful submission
    setFormData({
      name: "",
      position: "",
      experienceBackground: "",
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
    })
    
    // Reset uploaded files
    setUploadedFiles({})
    
    // Reset to first step
    setCurrentStep(1)
    
    // Show success message
    if (typeof window !== 'undefined') {
      toast.success('Senior manager created successfully!')
    }
    
    // router.push("/management/senior-management")
  } catch (error) {
    console.error("Failed to create senior management:", error)
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
// Update the renderFileUpload function to use correct field names
const renderFileUpload = (documentType: string, label: string, backendFieldName: string) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
      {uploadedFiles[documentType] ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-6 h-6 text-white" />
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
            name={backendFieldName} // Use backend field name here
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
          <Users className="w-5 h-5 mr-2 text-white" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select position</option>
              {MANAGEMENT_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="manager@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
          <MapPin className="w-5 h-5 mr-2 text-red-600" />
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              value={formData.address.country}
              onChange={(e) => handleInputChange("address.country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
            <input
              type="text"
              value={formData.address.houseNumber}
              onChange={(e) => handleInputChange("address.houseNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter house number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
            <input
              type="text"
              value={formData.address.poBox}
              onChange={(e) => handleInputChange("address.poBox", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter P.O. Box"
            />
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
          <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
          Professional Background
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience Background *
            </label>
            <textarea
              value={formData.experienceBackground}
              onChange={(e) => handleInputChange("experienceBackground", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe professional experience, achievements, and background in detail..."
              rows={6}
            />
            {errors.experienceBackground && (
              <p className="text-red-500 text-sm mt-1">{errors.experienceBackground}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Include education, previous roles, key achievements, certifications, and relevant experience.
            </p>
          </div>
        </div>
      </div>

      {/* Optional Document Upload Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Document Upload (Optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{renderFileUpload('cv', 'CV/Resume', 'cvDocument')}
{renderFileUpload('qualifications', 'Professional Qualifications', 'qualificationCertificates')}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Upload Guidelines:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Maximum file size: 10MB per document</li>
            <li>• Supported formats: PDF, JPG, PNG</li>
            <li>• Documents are optional but recommended for verification</li>
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
          className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-[#5B7FA2] transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-[#5B7FA2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Manager
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
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-4xl mx-auto px-1 sm:px-2 lg:px-3">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-full bg-[#5B7FA2]">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Create Senior Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add a new senior management team member
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

export default CreateSeniorManagement