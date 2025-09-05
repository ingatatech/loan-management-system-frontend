
"use client"

import React from "react"
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
    User,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Calendar,
    CheckCircle,
    XCircle,
    X,
    Save,
    UserCheck,
    Globe,
    Filter,
    Users,
    AlertTriangle,
      Building,
  FileText,
  Home,
  DollarSign,
  ClipboardList,
  FolderOpen,
  ExternalLink,
  CreditCard,
  TrendingUp,
  Award,
  Shield
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ExtendBoardDirectorModal from './ExtendBoardDirectorModal';
import { FileCheck } from 'lucide-react';
import {
    fetchBoardDirectors,
    deleteBoardDirector,
    updateBoardDirector,
    setCurrentDirector,
    clearError,
    type BoardDirector,
} from "@/lib/features/auth/management-slice"
import type { AppDispatch, RootState } from "@/lib/store"

const BoardDirectorsManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { boardDirectors, isLoading, error } = useSelector((state: RootState) => state.management)
    const [activeViewTab, setActiveViewTab] = useState('personal')
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("")
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        directorId: number | null;
        directorName: string;
    }>({
        isOpen: false,
        directorId: null,
        directorName: ''
    })

    const [extendModal, setExtendModal] = useState<{
        isOpen: boolean;
        directorId: number | null;
        directorName: string;
    }>({
        isOpen: false,
        directorId: null,
        directorName: ''
    });

    // Add handler to open extend modal
    const handleExtendClick = (director: BoardDirector) => {
        setExtendModal({
            isOpen: true,
            directorId: director.id!,
            directorName: director.name
        });
    };


    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedDirector, setSelectedDirector] = useState<BoardDirector | null>(null)
    const [updateModal, setUpdateModal] = useState<{
        isOpen: boolean;
        data: BoardDirector | null;
    }>({
        isOpen: false,
        data: null
    })
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [loadedData, setLoadedData] = useState(false)

    useEffect(() => {
        dispatch(fetchBoardDirectors())
        dispatch(clearError())
        setLoadedData(true)
    }, [dispatch])

    const filteredDirectors = boardDirectors.filter((director) => {
        const matchesSearch =
            director.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            director.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            director.position.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPosition = !selectedPosition || director.position === selectedPosition
        return matchesSearch && matchesPosition
    })

    const uniquePositions = Array.from(new Set(boardDirectors.map((d) => d.position)))

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({
            isOpen: true,
            directorId: id,
            directorName: name
        })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteModal.directorId) return

        setActionLoading(deleteModal.directorId)
        try {
            await dispatch(deleteBoardDirector(deleteModal.directorId)).unwrap()
            setDeleteModal({ isOpen: false, directorId: null, directorName: '' })
            toast.success("Director deleted successfully!")
        } catch (error: any) {
            console.error("Failed to delete director:", error)
            toast.error(error.message || "Failed to delete director")
        } finally {
            setActionLoading(null)
        }
    }

 

    const handleView = (director: BoardDirector) => {
        setSelectedDirector(director)
        setViewDialogOpen(true)
    }

    const handleUpdateClick = (director: BoardDirector) => {
        setUpdateModal({
            isOpen: true,
            data: director
        })
    }

    const handleUpdateSubmit = async (updatedData: Partial<BoardDirector>) => {
        if (!updateModal.data?.id) return

        setActionLoading(updateModal.data.id)
        try {
            await dispatch(updateBoardDirector({
                id: updateModal.data.id,
                data: updatedData
            })).unwrap()

            setUpdateModal({ isOpen: false, data: null })
            toast.success("Director updated successfully!")
        } catch (error: any) {
            console.error("Failed to update director:", error)
            toast.error(error.message || "Failed to update director")
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
            Chairperson: "bg-purple-100 text-purple-800 border-purple-200",
            "Vice Chairperson": "bg-blue-100 text-blue-800 border-blue-200",
            Director: "bg-green-100 text-green-800 border-green-200",
            "Independent Director": "bg-orange-100 text-orange-800 border-orange-200",
            "Executive Director": "bg-red-100 text-red-800 border-red-200",
            "Non-Executive Director": "bg-gray-100 text-gray-800 border-gray-200",
        }
        return colors[position] || "bg-gray-100 text-gray-800 border-gray-200"
    }

    const renderDirectorsTable = () => {
        const paginatedDirectors = filteredDirectors.slice(
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
                                    Full Name
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Professional Details
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <div className="flex flex-col justify-center items-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                                            <span className="text-gray-600 text-sm">Loading board directors...</span>
                                            <p className="text-xs text-gray-500 mt-1">Please wait while we fetch your data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedDirectors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <div className="text-gray-500 text-sm">
                                            {searchTerm || selectedPosition
                                                ? 'No board directors match your search criteria'
                                                : 'No board directors found'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedDirectors.map((director, index) => (
                                    <tr key={director.id} className="hover:bg-gray-50 transition-colors">
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
                                                        {director.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">
                                                {director.phone && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                        <span className="truncate">{director.phone}</span>
                                                    </div>
                                                )}

                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">

                                                {director.currentOccupation && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Briefcase className="w-3 h-3 mr-1 text-gray-400" />
                                                        <span className="truncate">{director.currentOccupation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Active
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {director.createdAt ? new Date(director.createdAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(director)}
                                                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateClick(director)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit director"
                                                    disabled={actionLoading === director.id}
                                                >
                                                    {actionLoading === director.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Edit className="w-4 h-4" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleExtendClick(director)}
                                                    className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                                    title="Complete register information"
                                                >
                                                    <FileCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(director.id!, director.name)}
                                                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete director"
                                                    disabled={actionLoading === director.id}
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
                    onClick={() => !actionLoading && setDeleteModal({ isOpen: false, directorId: null, directorName: '' })}
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
                                            Delete Director
                                        </h3>
                                        <p className="text-red-100 text-sm">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </div>
                                {!actionLoading && (
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, directorId: null, directorName: '' })}
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
                                    "{deleteModal.directorName}"?
                                </p>
                                <p className="text-sm text-gray-500">
                                    This will permanently remove the board director and all associated data.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => !actionLoading && setDeleteModal({ isOpen: false, directorId: null, directorName: '' })}
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
        const [formData, setFormData] = useState<Partial<BoardDirector>>(
            updateModal.data || {
                name: "",
                position: "",
                nationality: "",
                idPassport: "",
                phone: "",
                email: "",
                address: {
                    country: "Rwanda",
                    province: "",
                    district: "",
                    sector: "",
                },
                qualifications: "",
                experience: "",
                currentOccupation: "",
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
                    qualifications: updateModal.data.qualifications || "",
                })
            }
        }, [updateModal.data])

        const handleInputChange = (field: keyof BoardDirector, value: any) => {
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
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 sticky top-0 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-white">
                                                Update Board Director
                                            </h3>
                                            <p className="text-blue-100 text-sm">
                                                Edit director information
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
                                            <User className="w-5 h-5 mr-2 text-blue-600" />
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
                                            <option value="Chairperson">Chairperson</option>
                                            <option value="Vice Chairperson">Vice Chairperson</option>
                                            <option value="Director">Director</option>
                                            <option value="Independent Director">Independent Director</option>
                                            <option value="Executive Director">Executive Director</option>
                                            <option value="Non-Executive Director">Non-Executive Director</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nationality *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nationality || ''}
                                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID/Passport Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.idPassport || ''}
                                            onChange={(e) => handleInputChange('idPassport', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Occupation
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.currentOccupation || ''}
                                            onChange={(e) => handleInputChange('currentOccupation', e.target.value)}
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
                                            Qualification *
                                        </label>
                                        <textarea
                                            value={formData.qualifications || ''}
                                            onChange={(e) => handleInputChange('qualifications', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Experience *
                                        </label>
                                        <textarea
                                            value={formData.experience || ''}
                                            onChange={(e) => handleInputChange('experience', e.target.value)}
                                            rows={3}
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
                                                Update Director
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
    {viewDialogOpen && selectedDirector && (
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
          className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className="bg-[#5B7FA2] px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-3 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                    {getInitials(selectedDirector.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedDirector.name}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge className={`${getPositionColor(selectedDirector.position)} border-0 text-xs`}>
                      {selectedDirector.position}
                    </Badge>
                    <span className="text-blue-100 text-sm">{selectedDirector.nationality}</span>
                    {selectedDirector.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
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

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {[
                { id: 'personal', label: 'Personal', icon: User },
                { id: 'professional', label: 'Professional', icon: Briefcase },
                { id: 'employment', label: 'Employment', icon: Building },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'extended', label: 'Extended', icon: UserCheck }
              ].map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveViewTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                      activeViewTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeViewTab === 'personal' && renderPersonalInfo()}
            {activeViewTab === 'professional' && renderProfessionalInfo()}
            {activeViewTab === 'employment' && renderEmploymentInfo()}
            {activeViewTab === 'documents' && renderDocumentsInfo()}
            {activeViewTab === 'extended' && renderExtendedInfo()}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Created: {selectedDirector.createdAt ? new Date(selectedDirector.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setViewDialogOpen(false)
                  handleUpdateClick(selectedDirector)
                }}
                className="px-4 py-2 bg-[#5B7FA2] hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center text-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Director
              </button>
              <button
                onClick={() => setViewDialogOpen(false)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors text-sm"
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

// Personal Information Tab
const renderPersonalInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Basic Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Full Name" value={selectedDirector.name} />
          <InfoRow label="Salutation" value={selectedDirector.salutation} />
          <InfoRow label="Surname" value={selectedDirector.surname} />
          <InfoRow label="Forename 1" value={selectedDirector.forename1} />
          <InfoRow label="Forename 2" value={selectedDirector.forename2} />
          <InfoRow label="Forename 3" value={selectedDirector.forename3} />
          <InfoRow label="Nationality" value={selectedDirector.nationality} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          Birth & Identification
        </h3>
        <div className="space-y-2">
          <InfoRow label="Date of Birth" value={selectedDirector.dateOfBirth ? new Date(selectedDirector.dateOfBirth).toLocaleDateString() : 'N/A'} />
          <InfoRow label="Place of Birth" value={selectedDirector.placeOfBirth} />
          <InfoRow label="ID/Passport" value={selectedDirector.idPassport} />
          <InfoRow label="National ID Number" value={selectedDirector.nationalIdNumber} />
          <InfoRow label="Passport Number" value={selectedDirector.passportNo} />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Phone className="w-5 h-5 mr-2 text-purple-600" />
          Contact Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Email" value={selectedDirector.email} type="email" />
          <InfoRow label="Phone" value={selectedDirector.phone} type="phone" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <MapPin className="w-5 h-5 mr-2 text-orange-600" />
          Address Information
        </h3>
        {selectedDirector.address ? (
          <div className="space-y-2">
            <InfoRow label="Country" value={selectedDirector.address.country} />
            <InfoRow label="Province" value={selectedDirector.address.province} />
            <InfoRow label="District" value={selectedDirector.address.district} />
            <InfoRow label="Sector" value={selectedDirector.address.sector} />
            <InfoRow label="Cell" value={selectedDirector.address.cell} />
            <InfoRow label="Village" value={selectedDirector.address.village} />
            <InfoRow label="Street" value={selectedDirector.address.street} />
            <InfoRow label="House Number" value={selectedDirector.address.houseNumber} />
            <InfoRow label="PO Box" value={selectedDirector.address.poBox} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No address information</p>
        )}
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Home className="w-5 h-5 mr-2 text-cyan-600" />
          Postal Address
        </h3>
        <div className="space-y-2">
          <InfoRow label="Address Line 1" value={selectedDirector.postalAddressLine1} />
          <InfoRow label="Town/City" value={selectedDirector.town} />
          <InfoRow label="Postal Code" value={selectedDirector.postalCode} />
        </div>
      </div>
    </div>
  </div>
)

// Professional Information Tab
const renderProfessionalInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          Professional Details
        </h3>
        <div className="space-y-2">
          <InfoRow label="Position" value={selectedDirector.position} />
          <InfoRow label="Current Occupation" value={selectedDirector.currentOccupation} />
          <InfoRow label="Current Employer" value={selectedDirector.currentEmployer} />
          <InfoRow label="Specialization" value={selectedDirector.specialization} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Award className="w-5 h-5 mr-2 text-green-600" />
          Qualifications
        </h3>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {selectedDirector.qualifications || 'No qualifications provided'}
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Globe className="w-5 h-5 mr-2 text-purple-600" />
          Experience
        </h3>
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {selectedDirector.experience || 'No experience information provided'}
          </p>
        </div>
      </div>

      {selectedDirector.committees && selectedDirector.committees.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Users className="w-5 h-5 mr-2 text-orange-600" />
            Committees
          </h3>
          <div className="space-y-2">
            {selectedDirector.committees.map((committee, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700 bg-white/60 px-3 py-2 rounded border">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {committee}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)

// Employment Information Tab
const renderEmploymentInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Term Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Appointment Date" value={selectedDirector.appointmentDate ? new Date(selectedDirector.appointmentDate).toLocaleDateString() : 'N/A'} />
          <InfoRow label="Term Start Date" value={selectedDirector.termStartDate ? new Date(selectedDirector.termStartDate).toLocaleDateString() : 'N/A'} />
          <InfoRow label="Term End Date" value={selectedDirector.termEndDate ? new Date(selectedDirector.termEndDate).toLocaleDateString() : 'N/A'} />
          <InfoRow label="Term Length" value={selectedDirector.termLengthYears ? `${selectedDirector.termLengthYears} years` : 'N/A'} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Status & Type
        </h3>
        <div className="space-y-2">
          <InfoRow label="Active Status" value={selectedDirector.isActive ? 'Active' : 'Inactive'} />
          <InfoRow label="Independent Director" value={selectedDirector.isIndependent ? 'Yes' : 'No'} />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
          Remuneration
        </h3>
        <div className="space-y-2">
          <InfoRow label="Monthly Remuneration" value={selectedDirector.monthlyRemuneration ? `${selectedDirector.monthlyRemuneration.toLocaleString()} RWF` : 'N/A'} />
          <InfoRow label="Meeting Allowance" value={selectedDirector.meetingAllowance ? `${selectedDirector.meetingAllowance.toLocaleString()} RWF` : 'N/A'} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <ClipboardList className="w-5 h-5 mr-2 text-orange-600" />
          Meeting Attendance
        </h3>
        <div className="space-y-2">
          <InfoRow label="Meetings Attended" value={selectedDirector.meetingsAttended} />
          <InfoRow label="Total Meetings" value={selectedDirector.totalMeetings} />
          <InfoRow label="Attendance Rate" value={
            selectedDirector.totalMeetings && selectedDirector.meetingsAttended !== undefined
              ? `${((selectedDirector.meetingsAttended / selectedDirector.totalMeetings) * 100).toFixed(1)}%`
              : 'N/A'
          } />
        </div>
      </div>
    </div>
  </div>
)

// Documents Information Tab
const renderDocumentsInfo = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Document URLs
        </h3>
        <div className="space-y-3">
          <DocumentRow label="ID Proof Document" url={selectedDirector.idProofDocumentUrl} />
          <DocumentRow label="CV Document" url={selectedDirector.cvDocumentUrl} />
          <DocumentRow label="Appointment Letter" url={selectedDirector.appointmentLetterUrl} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Award className="w-5 h-5 mr-2 text-green-600" />
          Qualification Certificates
        </h3>
        {selectedDirector.qualificationCertificates && selectedDirector.qualificationCertificates.length > 0 ? (
          <div className="space-y-2">
            {selectedDirector.qualificationCertificates.map((certificate, index) => (
              <DocumentRow key={index} label={`Certificate ${index + 1}`} url={certificate} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No qualification certificates</p>
        )}
      </div>
    </div>

    {selectedDirector.additionalDocuments && selectedDirector.additionalDocuments.length > 0 && (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <FolderOpen className="w-5 h-5 mr-2 text-orange-600" />
          Additional Documents
        </h3>
        <div className="space-y-2">
          {selectedDirector.additionalDocuments.map((document, index) => (
            <DocumentRow key={index} label={`Additional Document ${index + 1}`} url={document} />
          ))}
        </div>
      </div>
    )}

    {selectedDirector.notes && (
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <FileText className="w-5 h-5 mr-2 text-gray-600" />
          Notes
        </h3>
        <div className="bg-white p-4 rounded border">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {selectedDirector.notes}
          </p>
        </div>
      </div>
    )}
  </div>
)

// Extended Information Tab
const renderExtendedInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Account Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Account Number" value={selectedDirector.accountNumber} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
          System Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Organization ID" value={selectedDirector.organizationId} />
          <InfoRow label="Created By" value={selectedDirector.createdBy} />
          <InfoRow label="Updated By" value={selectedDirector.updatedBy} />
          <InfoRow label="Created" value={selectedDirector.createdAt ? new Date(selectedDirector.createdAt).toLocaleString() : 'N/A'} />
          <InfoRow label="Last Updated" value={selectedDirector.updatedAt ? new Date(selectedDirector.updatedAt).toLocaleString() : 'N/A'} />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <UserCheck className="w-5 h-5 mr-2 text-green-600" />
          Extended Personal Details
        </h3>
        <div className="space-y-2">
          <InfoRow label="Salutation" value={selectedDirector.salutation} />
          <InfoRow label="Surname" value={selectedDirector.surname} />
          <InfoRow label="Forename 1" value={selectedDirector.forename1} />
          <InfoRow label="Forename 2" value={selectedDirector.forename2} />
          <InfoRow label="Forename 3" value={selectedDirector.forename3} />
          <InfoRow label="National ID Number" value={selectedDirector.nationalIdNumber} />
          <InfoRow label="Passport Number" value={selectedDirector.passportNo} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <MapPin className="w-5 h-5 mr-2 text-orange-600" />
          Extended Address
        </h3>
        <div className="space-y-2">
          <InfoRow label="Postal Address Line 1" value={selectedDirector.postalAddressLine1} />
          <InfoRow label="Town/City" value={selectedDirector.town} />
          <InfoRow label="Postal Code" value={selectedDirector.postalCode} />
        </div>
      </div>
    </div>
  </div>
)

// Reusable InfoRow component
const InfoRow = ({ label, value, type = 'text' }: { label: string; value: any; type?: string }) => {
  if (value === null || value === undefined || value === '') return null

  let displayValue = value
  if (type === 'phone' && value) {
    displayValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
  }

  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded border border-white">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className={`text-sm text-gray-900 ${type === 'email' ? 'break-all' : 'text-right'} max-w-[60%]`}>
        {displayValue}
      </span>
    </div>
  )
}

// Reusable DocumentRow component
const DocumentRow = ({ label, url }: { label: string; url: string | null }) => {
  if (!url) return null

  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded border border-white">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        View Document
      </a>
    </div>
  )
}
    const renderPagination = () => {
        const totalPages = Math.ceil(filteredDirectors.length / itemsPerPage)
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
                                {Math.min(currentPage * itemsPerPage, filteredDirectors.length)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{filteredDirectors.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
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
                                Next
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
  

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Users className="w-7 h-7 mr-3 text-blue-600" />
                                Board Directors Information
                            </h1>
                 
                        </div>

                        <Button onClick={() => router.push("/dashboard/client/management/board-directors/create")} className="w-full sm:w-auto bg-[#5B7FA2]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Director
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search directors by name, email, or position..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedPosition}
                                    onChange={(e) => setSelectedPosition(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </div>
                </div>

                {/* Directors Table */}
                {filteredDirectors.length === 0 && !isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No directors found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || selectedPosition
                                    ? "No directors match your current filters."
                                    : "Get started by adding your first board director."}
                            </p>
                            {!searchTerm && !selectedPosition && (
                                <Button onClick={() => router.push("/management/board-directors/create")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Director
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
                        {renderDirectorsTable()}
                    </motion.div>
                )}

                <ExtendBoardDirectorModal
                    isOpen={extendModal.isOpen}
                    onClose={() => setExtendModal({ isOpen: false, directorId: null, directorName: '' })}
                    directorId={extendModal.directorId!}
                    directorName={extendModal.directorName}
                />
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
export default BoardDirectorsManagement