// @ts-nocheck
"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Users,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  XCircle,
  AlertTriangle
} from "lucide-react"
import toast from "react-hot-toast"
import {
  fetchBorrowers,
  deleteBorrower,
  clearError,
  type BorrowerProfile,
  Gender,
  MaritalStatus
} from "@/lib/features/auth/borrowerSlice"
import type { AppDispatch, RootState } from "@/lib/store"

const BorrowerListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { borrowers, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.borrowers
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerProfile | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Fetch borrowers on component mount and when filters change
  useEffect(() => {
    dispatch(fetchBorrowers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      isActive: filterActive
    }))
  }, [dispatch, currentPage, itemsPerPage, searchQuery, filterActive])

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    dispatch(fetchBorrowers({
      page: 1,
      limit: itemsPerPage,
      search: searchQuery,
      isActive: filterActive
    }))
  }

  const handleRefresh = () => {
    dispatch(fetchBorrowers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      isActive: filterActive
    }))
    toast.success("Borrowers list refreshed")
  }

  const handleDelete = async () => {
    if (!selectedBorrower?.id) return

    try {
      await dispatch(deleteBorrower(selectedBorrower.id)).unwrap()
      toast.success("Borrower deleted successfully")
      setShowDeleteConfirm(false)
      setSelectedBorrower(null)

      // Refresh list
      dispatch(fetchBorrowers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        isActive: filterActive
      }))
    } catch (error: any) {
      toast.error(error || "Failed to delete borrower")
    }
  }

  const handleExport = () => {
    if (!borrowers || borrowers.length === 0) {
      toast.error("No borrowers to export")
      return
    }

    // Create CSV content
    const headers = [
      "Borrower ID",
      "Full Name",
      "National ID",
      "Phone",
      "Email",
      "Gender",
      "Marital Status",
      "District",
      "Sector",
      "Date of Birth",
      "Status"
    ]

    const csvContent = [
      headers.join(","),
      ...borrowers.map((borrower) =>
        [
          borrower.borrowerId || "",
          `"${borrower.firstName} ${borrower.middleName || ''} ${borrower.lastName}"`,
          borrower.nationalId,
          borrower.primaryPhone,
          borrower.email || "",
          borrower.gender,
          borrower.maritalStatus,
          borrower.address?.district || "",
          borrower.address?.sector || "",
          new Date(borrower.dateOfBirth).toLocaleDateString(),
          borrower.isActive ? "Active" : "Inactive"
        ].join(",")
      )
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `borrowers_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Borrowers exported successfully")
  }

  const handleView = (borrower: BorrowerProfile) => {
    setSelectedBorrower(borrower)
    setViewDialogOpen(true)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const renderBorrowersTable = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Borrower Info
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Personal Info
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                      <span className="text-gray-600 text-sm">Loading borrowers...</span>
                      <p className="text-xs text-gray-500 mt-1">Please wait while we fetch your data</p>
                    </div>
                  </td>
                </tr>
              ) : borrowers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="text-gray-500 text-sm">
                      {searchQuery || filterActive !== undefined
                        ? 'No borrowers match your search criteria'
                        : 'No borrowers found'}
                    </div>
                  </td>
                </tr>
              ) : (
                borrowers.map((borrower, index) => (
                  <tr key={borrower.id} className="hover:bg-gray-50 transition-colors">
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
                            {borrower.firstName} {borrower.middleName} {borrower.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate">{borrower.primaryPhone}</span>
                        </div>

                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Gender:</span> {borrower.gender}
                        </div>

                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate">{borrower.address?.district || "N/A"}</span>
                        </div>
                        {borrower.address?.sector && (
                          <div className="text-xs text-gray-500">
                            {borrower.address.sector}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {borrower.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}

                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(borrower)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/client/borrower/edit/${borrower.id}`)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit borrower"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBorrower(borrower)
                            setShowDeleteConfirm(true)
                          }}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete borrower"
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
      {showDeleteConfirm && selectedBorrower && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
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
                      Delete Borrower
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-red-100 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  "{selectedBorrower.firstName} {selectedBorrower.lastName}"?
                </p>
                <p className="text-sm text-gray-500">
                  This will permanently remove the borrower and all associated data.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
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

  const renderViewModal = () => (
    <AnimatePresence>
      {viewDialogOpen && selectedBorrower && (
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
            className="bg-white rounded-2xl shadow-2xl w-[80%] max-w-5xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-3 border-white/30">
                    {getInitials(selectedBorrower.firstName, selectedBorrower.lastName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedBorrower.firstName} {selectedBorrower.middleName} {selectedBorrower.lastName}
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-blue-100 text-sm">{selectedBorrower.borrowerId}</span>
                      {selectedBorrower.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">National ID:</span>
                        <span className="text-sm text-gray-900">{selectedBorrower.nationalId}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                        <span className="text-sm font-medium text-gray-600">Gender:</span>
                        <span className="text-sm text-gray-900">{selectedBorrower.gender}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedBorrower.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                        <span className="text-sm font-medium text-gray-600">Marital Status:</span>
                        <span className="text-sm text-gray-900">{selectedBorrower.maritalStatus}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                      <Phone className="w-5 h-5 mr-2 text-green-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Primary Phone:</span>
                        <span className="text-sm text-gray-900">{selectedBorrower.primaryPhone}</span>
                      </div>
                      {selectedBorrower.alternativePhone && (
                        <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                          <span className="text-sm font-medium text-gray-600">Alt. Phone:</span>
                          <span className="text-sm text-gray-900">{selectedBorrower.alternativePhone}</span>
                        </div>
                      )}
                      {selectedBorrower.email && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm font-medium text-gray-600">Email:</span>
                          <span className="text-sm text-gray-900 break-all">{selectedBorrower.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                      <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                      Address Information
                    </h3>
                    {selectedBorrower.address ? (
                      <div className="space-y-3">
                        {selectedBorrower.address.country && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm font-medium text-gray-600">Country:</span>
                            <span className="text-sm text-gray-900">{selectedBorrower.address.country}</span>
                          </div>
                        )}
                        {selectedBorrower.address.province && (
                          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                            <span className="text-sm font-medium text-gray-600">Province:</span>
                            <span className="text-sm text-gray-900">{selectedBorrower.address.province}</span>
                          </div>
                        )}
                        {selectedBorrower.address.district && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm font-medium text-gray-600">District:</span>
                            <span className="text-sm text-gray-900">{selectedBorrower.address.district}</span>
                          </div>
                        )}
                        {selectedBorrower.address.sector && (
                          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                            <span className="text-sm font-medium text-gray-600">Sector:</span>
                            <span className="text-sm text-gray-900">{selectedBorrower.address.sector}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No address information</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                      <Award className="w-5 h-5 mr-2 text-purple-600" />
                      Financial Information
                    </h3>
                    <div className="space-y-3">
                      {selectedBorrower.occupation && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm font-medium text-gray-600">Occupation:</span>
                          <span className="text-sm text-gray-900">{selectedBorrower.occupation}</span>
                        </div>
                      )}
                      {selectedBorrower.monthlyIncome && (
                        <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                          <span className="text-sm font-medium text-gray-600">Monthly Income:</span>
                          <span className="text-sm text-gray-900">
                            {selectedBorrower.monthlyIncome.toLocaleString()} RWF
                          </span>
                        </div>
                      )}
                      {selectedBorrower.incomeSource && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm font-medium text-gray-600">Income Source:</span>
                          <span className="text-sm text-gray-900">{selectedBorrower.incomeSource}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedBorrower.notes && (
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                        Notes
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedBorrower.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                      <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                      System Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Created:</span>
                        <span className="text-sm text-gray-900">
                          {selectedBorrower.createdAt
                            ? new Date(selectedBorrower.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                        <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                        <span className="text-sm text-gray-900">
                          {selectedBorrower.updatedAt
                            ? new Date(selectedBorrower.updatedAt).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewDialogOpen(false)
                  router.push(`/dashboard/client/borrower/edit/${selectedBorrower.id}`)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center text-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Borrower
              </button>
              <button
                onClick={() => setViewDialogOpen(false)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
            disabled={currentPage === pagination.totalPages}
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
                {((currentPage - 1) * itemsPerPage) + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.total}</span> borrowers
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-600" />
                Borrowers Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage your borrower profiles and track lending activities
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/client/borrower/create")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Borrower
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Borrowers</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {pagination?.total || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {borrowers.filter(b => b.isActive).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {borrowers.filter(b => {
                      const created = new Date(b.createdAt || "")
                      const now = new Date()
                      return created.getMonth() === now.getMonth() &&
                        created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Credit Score</p>
                  <p className="text-2xl font-bold text-orange-600">750</p>
                </div>
                <Award className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
              <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, or phone..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${showFilters
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>

                <button
                  onClick={handleRefresh}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filterActive === undefined ? "all" : filterActive ? "active" : "inactive"}
                        onChange={(e) => {
                          const value = e.target.value
                          setFilterActive(
                            value === "all" ? undefined : value === "active"
                          )
                          setCurrentPage(1)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Items Per Page
                      </label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setFilterActive(undefined)
                          setCurrentPage(1)
                          dispatch(fetchBorrowers({ page: 1, limit: itemsPerPage }))
                        }}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Borrowers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderBorrowersTable()}
        </motion.div>

        {/* Empty State */}
        {!isLoading && borrowers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-lg border border-gray-100 mt-6"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Borrowers Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "No borrowers match your search criteria"
                : "Get started by adding your first borrower"}
            </p>
            <button
              onClick={() => router.push("/dashboard/client/borrower/create")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Borrower
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {renderPagination()}

        {/* Modals */}
        {renderDeleteModal()}
        {renderViewModal()}
      </div>
    </div>
  )
}

export default BorrowerListPage