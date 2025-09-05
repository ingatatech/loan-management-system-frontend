// @ts-nocheck

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  X,
  Save,
  UserCheck,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  fetchSeniorManagement,
  deleteSeniorManagement,
  updateSeniorManagement,
  setCurrentManager,
  clearError,
  type SeniorManagement,
} from "@/lib/features/auth/management-slice"
import type { AppDispatch, RootState } from "@/lib/store"

const SeniorManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { seniorManagement, isLoading, error } = useSelector((state: RootState) => state.management)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    managerId: number | null;
    managerName: string;
  }>({
    isOpen: false,
    managerId: null,
    managerName: ''
  })
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState<SeniorManagement | null>(null)
  const [updateModal, setUpdateModal] = useState<{
    isOpen: boolean;
    data: SeniorManagement | null;
  }>({
    isOpen: false,
    data: null
  })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loadedData, setLoadedData] = useState(false)

  useEffect(() => {
    dispatch(fetchSeniorManagement())
    dispatch(clearError())
    setLoadedData(true)
  }, [dispatch])

  const filteredManagers = seniorManagement.filter((manager) => {
    const matchesSearch =
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = !selectedPosition || manager.position === selectedPosition
    return matchesSearch && matchesPosition
  })

  const uniquePositions = Array.from(new Set(seniorManagement.map((m) => m.position)))

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      managerId: id,
      managerName: name
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.managerId) return

    setActionLoading(deleteModal.managerId)
    try {
      await dispatch(deleteSeniorManagement(deleteModal.managerId)).unwrap()
      setDeleteModal({ isOpen: false, managerId: null, managerName: '' })
      toast.success("Manager deleted successfully!")
    } catch (error: any) {
      console.error("Failed to delete manager:", error)
      toast.error(error.message || "Failed to delete manager")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (manager: SeniorManagement) => {
    dispatch(setCurrentManager(manager))
    router.push(`/management/senior-management/edit/${manager.id}`)
  }

  const handleView = (manager: SeniorManagement) => {
    setSelectedManager(manager)
    setViewDialogOpen(true)
  }

  const handleUpdateClick = (manager: SeniorManagement) => {
    setUpdateModal({
      isOpen: true,
      data: manager
    })
  }

  const handleUpdateSubmit = async (updatedData: Partial<SeniorManagement>) => {
    if (!updateModal.data?.id) return

    setActionLoading(updateModal.data.id)
    try {
      await dispatch(updateSeniorManagement({
        id: updateModal.data.id,
        data: updatedData
      })).unwrap()

      setUpdateModal({ isOpen: false, data: null })
      toast.success("Manager updated successfully!")
    } catch (error: any) {
      console.error("Failed to update manager:", error)
      toast.error(error.message || "Failed to update manager")
    } finally {
      setActionLoading(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      "Chief Executive Officer (CEO)": "bg-purple-100 text-purple-800 border-purple-200",
      "Chief Financial Officer (CFO)": "bg-blue-100 text-blue-800 border-blue-200",
      "Chief Operating Officer (COO)": "bg-[#5B7FA2] text-green-800 border-green-200",
      "Chief Technology Officer (CTO)": "bg-orange-100 text-orange-800 border-orange-200",
      "Chief Marketing Officer (CMO)": "bg-pink-100 text-pink-800 border-pink-200",
      "General Manager": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Deputy General Manager": "bg-teal-100 text-teal-800 border-teal-200",
    }

    // Check for partial matches for positions containing "Head of" or "Manager"
    if (position.includes("Head of")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    if (position.includes("Manager")) {
      return "bg-gray-100 text-gray-800 border-gray-200"
    }

    return colors[position] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPositionLevel = (position: string) => {
    if (position.includes("CEO") || position.includes("Chief Executive")) return "Executive"
    if (position.includes("Chief") || position.includes("CFO") || position.includes("COO") || position.includes("CTO"))
      return "C-Level"
    if (position.includes("General Manager")) return "Senior"
    if (position.includes("Head of")) return "Department Head"
    if (position.includes("Manager")) return "Management"
    return "Senior"
  }

  const renderManagersTable = () => {
    const paginatedManagers = filteredManagers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position & Level
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && !loadedData ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                      <span className="text-gray-600 text-sm">Loading senior management...</span>
                      <p className="text-xs text-gray-500 mt-1">Please wait while we fetch your data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedManagers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="text-gray-500 text-sm">
                      {searchTerm || selectedPosition
                        ? 'No managers match your search criteria'
                        : 'No senior managers found'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedManagers.map((manager, index) => (
                  <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {manager.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {manager.phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="truncate">{manager.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <span className="truncate">
                          {manager.position}
                        </span>

                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="truncate">
                          {manager.address.province}, {manager.address.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(manager)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateClick(manager)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit manager"
                          disabled={actionLoading === manager.id}
                        >
                          {actionLoading === manager.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(manager.id!, manager.name)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete manager"
                          disabled={actionLoading === manager.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderDeleteModal = () => (
    <AnimatePresence>
      {deleteModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !actionLoading && setDeleteModal({ isOpen: false, managerId: null, managerName: '' })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Delete Manager
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!actionLoading && (
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, managerId: null, managerName: '' })}
                    className="text-red-100 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  "{deleteModal.managerName}"?
                </p>
                <p className="text-sm text-gray-500">
                  This will permanently remove the senior manager and all associated data.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => !actionLoading && setDeleteModal({ isOpen: false, managerId: null, managerName: '' })}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderUpdateModal = () => {
    const [formData, setFormData] = useState<Partial<SeniorManagement>>(
      updateModal.data || {
        name: "",
        position: "",
        phone: "",
        email: "",
        address: {
          country: "Rwanda",
          province: "",
          district: "",
          sector: "",
        },
        experienceBackground: "",
      }
    )

    useEffect(() => {
      if (updateModal.data) {
        setFormData({
          ...updateModal.data,
          address: {
            country: updateModal.data.address?.country || "Rwanda",
            province: updateModal.data.address?.province || "",
            district: updateModal.data.address?.district || "",
            sector: updateModal.data.address?.sector || "",
            cell: updateModal.data.address?.cell || "",
            village: updateModal.data.address?.village || "",
            street: updateModal.data.address?.street || "",
            houseNumber: updateModal.data.address?.houseNumber || "",
            poBox: updateModal.data.address?.poBox || "",
          },
        })
      }
    }, [updateModal.data])

    const handleInputChange = (field: keyof SeniorManagement, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddressChange = (field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleUpdateSubmit(formData)
    }

    return (
      <AnimatePresence>
        {updateModal.isOpen && updateModal.data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !actionLoading && setUpdateModal({ isOpen: false, data: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#5B7FA2] px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white">
                        Update Senior Manager
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Edit manager information
                      </p>
                    </div>
                  </div>
                  {!actionLoading && (
                    <button
                      onClick={() => setUpdateModal({ isOpen: false, data: null })}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold mb-4 flex items-center">
                      <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <select
                      value={formData.position || ''}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Position</option>
                      <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                      <option value="Chief Financial Officer (CFO)">Chief Financial Officer (CFO)</option>
                      <option value="Chief Operating Officer (COO)">Chief Operating Officer (COO)</option>
                      <option value="Chief Technology Officer (CTO)">Chief Technology Officer (CTO)</option>
                      <option value="Chief Marketing Officer (CMO)">Chief Marketing Officer (CMO)</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Deputy General Manager">Deputy General Manager</option>
                      <option value="Head of Department">Head of Department</option>
                      <option value="Senior Manager">Senior Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Address Information
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.address?.country || 'Rwanda'}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <input
                      type="text"
                      value={formData.address?.province || ''}
                      onChange={(e) => handleAddressChange('province', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={formData.address?.district || ''}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector
                    </label>
                    <input
                      type="text"
                      value={formData.address?.sector || ''}
                      onChange={(e) => handleAddressChange('sector', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cell
                    </label>
                    <input
                      type="text"
                      value={formData.address?.cell || ''}
                      onChange={(e) => handleAddressChange('cell', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Village
                    </label>
                    <input
                      type="text"
                      value={formData.address?.village || ''}
                      onChange={(e) => handleAddressChange('village', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      value={formData.address?.street || ''}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Number
                    </label>
                    <input
                      type="text"
                      value={formData.address?.houseNumber || ''}
                      onChange={(e) => handleAddressChange('houseNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      P.O. Box
                    </label>
                    <input
                      type="text"
                      value={formData.address?.poBox || ''}
                      onChange={(e) => handleAddressChange('poBox', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Background *
                    </label>
                    <textarea
                      value={formData.experienceBackground || ''}
                      onChange={(e) => handleInputChange('experienceBackground', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => !actionLoading && setUpdateModal({ isOpen: false, data: null })}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#5B7FA2] hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Manager
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const renderViewModal = () => (
    <AnimatePresence>
      {viewDialogOpen && selectedManager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewDialogOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-[80%] max-w-5xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className="bg-[#5B7FA2] px-8 py-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-3 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                      {getInitials(selectedManager.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedManager.name}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge className={`${getPositionColor(selectedManager.position)} border-0 text-xs`}>
                        {selectedManager.position}
                      </Badge>
                      <span className="text-green-100 text-sm">{getPositionLevel(selectedManager.position)} Level</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Compact Tabular Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 w-1/3">Full Name:</span>
                        <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.name}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                        <span className="text-sm font-medium text-gray-600 w-1/3">Position:</span>
                        <span className="text-sm text-gray-900 w-2/3 text-right font-medium">{selectedManager.position}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 w-1/3">Level:</span>
                        <span className="text-sm text-gray-900 w-2/3 text-right">{getPositionLevel(selectedManager.position)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 w-1/3">Email:</span>
                        <span className="text-sm text-gray-900 w-2/3 text-right break-all">{selectedManager.email || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                        <span className="text-sm font-medium text-gray-600 w-1/3">Phone:</span>
                        <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                      Address Information
                    </h3>
                    {selectedManager.address ? (
                      <div className="space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-sm font-medium text-gray-600 w-1/3">Country:</span>
                          <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.address.country}</span>
                        </div>
                        {selectedManager.address.province && (
                          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                            <span className="text-sm font-medium text-gray-600 w-1/3">Province:</span>
                            <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.address.province}</span>
                          </div>
                        )}
                        {selectedManager.address.district && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm font-medium text-gray-600 w-1/3">District:</span>
                            <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.address.district}</span>
                          </div>
                        )}
                        {selectedManager.address.sector && (
                          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                            <span className="text-sm font-medium text-gray-600 w-1/3">Sector:</span>
                            <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.address.sector}</span>
                          </div>
                        )}
                        {selectedManager.address.street && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm font-medium text-gray-600 w-1/3">Street:</span>
                            <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.address.street}</span>
                          </div>
                        )}
                        {selectedManager.address.poBox && (
                          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                            <span className="text-sm font-medium text-gray-600 w-1/3">P.O. Box:</span>
                            <span className="text-sm text-gray-900 w-2/3 text-right">{selectedManager.address.poBox}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No address information available</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Experience Background */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                      Experience Background
                    </h3>
                    <div className="p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedManager.experienceBackground || 'No experience information available'}
                      </p>
                    </div>
                  </div>

                  {/* System Information */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                      System Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 w-1/2">Created:</span>
                        <span className="text-sm text-gray-900 w-1/2 text-right">
                          {selectedManager.createdAt ?
                            new Date(selectedManager.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            }) : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                        <span className="text-sm font-medium text-gray-600 w-1/2">Last Updated:</span>
                        <span className="text-sm text-gray-900 w-1/2 text-right">
                          {selectedManager.updatedAt ?
                            new Date(selectedManager.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            }) : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active Status
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setViewDialogOpen(false)
                    handleUpdateClick(selectedManager)
                  }}
                  className="px-4 py-2 bg-[#5B7FA2] hover:bg-[#5B7FA2] text-white rounded-lg transition-colors duration-200 flex items-center text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Manager
                </button>
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors duration-200 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredManagers.length / itemsPerPage)
    if (totalPages <= 1) return null

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredManagers.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{filteredManagers.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && seniorManagement.length === 0 && !loadedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading senior management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/management")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-[#5B7FA2] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Senior Management</h1>
                <p className="text-gray-600">Manage your organization's senior management team</p>
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard/client/management/senior-management/create")}
              className="w-full sm:w-auto bg-[#5B7FA2] hover:bg-[#5B7FA2]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manager
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <Card className="w-full px-3 py-2 border mb-4 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search managers by name, email, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"

                  />
                </div>
              </div>

              <div className="sm:w-48">
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Positions</option>
                  {uniquePositions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managers Table */}
        {filteredManagers.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No managers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedPosition
                  ? "No managers match your current filters."
                  : "Get started by adding your first senior manager."}
              </p>
              {!searchTerm && !selectedPosition && (
                <Button
                  onClick={() => router.push("/management/senior-management/create")}
                  className="bg-[#5B7FA2] hover:bg-[#5B7FA2]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Manager
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderManagersTable()}
          </motion.div>
        )}

        {/* Pagination */}
        {renderPagination()}

        {/* Modals */}
        {renderDeleteModal()}
        {renderUpdateModal()}
        {renderViewModal()}
      </div>
    </div>
  )
}

export default SeniorManagementPage