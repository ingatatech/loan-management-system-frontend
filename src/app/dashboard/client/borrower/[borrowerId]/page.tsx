"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Award,
  FileText,
  Activity
} from "lucide-react"
import toast from "react-hot-toast"
import {
  fetchBorrowerById,
  fetchBorrowerStats,
  deleteBorrower,
  clearError,
  type BorrowerProfile,
  type BorrowerStats
} from "@/lib/features/auth/borrowerSlice"
import type { AppDispatch, RootState } from "@/lib/store"

const BorrowerDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams()
  const borrowerId = params?.borrowerId as string

  const { currentBorrower, borrowerStats, isLoading, error } = useSelector(
    (state: RootState) => state.borrowers
  )

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (borrowerId) {
      dispatch(fetchBorrowerById(Number(borrowerId)))
      dispatch(fetchBorrowerStats(Number(borrowerId)))
    }

    return () => {
      dispatch(clearError())
    }
  }, [dispatch, borrowerId])

  const handleDelete = async () => {
    try {
      await dispatch(deleteBorrower(Number(borrowerId))).unwrap()
      toast.success("Borrower deleted successfully")
      router.push("/dashboard/client/borrower")
    } catch (error: any) {
      toast.error(error || "Failed to delete borrower")
    }
  }

  if (isLoading && !currentBorrower) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading borrower...</span>
      </div>
    )
  }

  if (!currentBorrower) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Borrower Not Found</h2>
          <p className="text-gray-600 mb-4">The borrower you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/dashboard/client/borrower")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Borrowers
          </button>
        </div>
      </div>
    )
  }

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
    <div className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400" />
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-base font-medium text-gray-800">{value || "N/A"}</p>
      </div>
    </div>
  )

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    bgColor: string 
  }) => (
    <div className={`${bgColor} rounded-lg p-4 border ${color.replace('text-', 'border-')}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${color}`}>{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/client/borrower")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Borrowers
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                {currentBorrower.firstName[0]}{currentBorrower.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {currentBorrower.firstName} {currentBorrower.middleName} {currentBorrower.lastName}
                </h1>
                <p className="text-gray-600">{currentBorrower.borrowerId}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {currentBorrower.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/dashboard/client/borrower/edit/${borrowerId}`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
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
          </motion.div>
        )}

        {/* Statistics Cards */}
        {borrowerStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Loans"
              value={borrowerStats.totalLoans}
              icon={FileText}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Active Loans"
              value={borrowerStats.activeLoans}
              icon={Activity}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Total Disbursed"
              value={`${borrowerStats.totalDisbursed.toLocaleString()} RWF`}
              icon={DollarSign}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              title="Credit Score"
              value={borrowerStats.creditScore}
              icon={Award}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "financial", label: "Financial Info", icon: DollarSign },
              { id: "loans", label: "Loan History", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      label="National ID"
                      value={currentBorrower.nationalId}
                      icon={CreditCard}
                    />
                    <InfoRow
                      label="Gender"
                      value={currentBorrower.gender}
                      icon={User}
                    />
                    <InfoRow
                      label="Date of Birth"
                      value={new Date(currentBorrower.dateOfBirth).toLocaleDateString()}
                      icon={Calendar}
                    />
                    <InfoRow
                      label="Marital Status"
                      value={currentBorrower.maritalStatus}
                      icon={User}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      label="Primary Phone"
                      value={currentBorrower.primaryPhone}
                      icon={Phone}
                    />
                    {currentBorrower.alternativePhone && (
                      <InfoRow
                        label="Alternative Phone"
                        value={currentBorrower.alternativePhone}
                        icon={Phone}
                      />
                    )}
                    {currentBorrower.email && (
                      <InfoRow
                        label="Email"
                        value={currentBorrower.email}
                        icon={Mail}
                      />
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                    Address
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      label="Province"
                      value={currentBorrower.address?.province || "N/A"}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="District"
                      value={currentBorrower.address?.district || "N/A"}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="Sector"
                      value={currentBorrower.address?.sector || "N/A"}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="Cell"
                      value={currentBorrower.address?.cell || "N/A"}
                      icon={MapPin}
                    />
                    <InfoRow
                      label="Village"
                      value={currentBorrower.address?.village || "N/A"}
                      icon={MapPin}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Additional Details
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      label="Relationship with NDFSP"
                      value={currentBorrower.relationshipWithNDFSP || "N/A"}
                      icon={FileText}
                    />
                    <InfoRow
                      label="Previous Loans Paid On Time"
                      value={currentBorrower.previousLoansPaidOnTime || 0}
                      icon={CheckCircle}
                    />
                    <InfoRow
                      label="Member Since"
                      value={new Date(currentBorrower.createdAt || "").toLocaleDateString()}
                      icon={Calendar}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === "financial" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                      Employment Information
                    </h3>
                    <div className="space-y-1">
                      <InfoRow
                        label="Occupation"
                        value={currentBorrower.occupation || "N/A"}
                        icon={Briefcase}
                      />
                      <InfoRow
                        label="Monthly Income"
                        value={currentBorrower.monthlyIncome ? `${currentBorrower.monthlyIncome.toLocaleString()} RWF` : "N/A"}
                        icon={DollarSign}
                      />
                      <InfoRow
                        label="Income Source"
                        value={currentBorrower.incomeSource || "N/A"}
                        icon={TrendingUp}
                      />
                    </div>
                  </div>

                  {borrowerStats && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Financial Summary
                      </h3>
                      <div className="space-y-1">
                        <InfoRow
                          label="Total Disbursed"
                          value={`${borrowerStats.totalDisbursed.toLocaleString()} RWF`}
                          icon={DollarSign}
                        />
                        <InfoRow
                          label="Total Outstanding"
                          value={`${borrowerStats.totalOutstanding.toLocaleString()} RWF`}
                          icon={DollarSign}
                        />
                        <InfoRow
                          label="Total Paid"
                          value={`${borrowerStats.totalPaid.toLocaleString()} RWF`}
                          icon={CheckCircle}
                        />
                        <InfoRow
                          label="Risk Level"
                          value={borrowerStats.riskLevel}
                          icon={AlertCircle}
                        />
                        <InfoRow
                          label="Eligible for Loan"
                          value={borrowerStats.isEligibleForLoan ? "Yes" : "No"}
                          icon={borrowerStats.isEligibleForLoan ? CheckCircle : AlertCircle}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {borrowerStats && borrowerStats.repaymentHistory && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      Repayment History
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">On-Time Payments</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {borrowerStats.repaymentHistory.onTime}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Payments</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {borrowerStats.repaymentHistory.total}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {borrowerStats.repaymentHistory.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentBorrower.notes && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      Notes
                    </h3>
                    <p className="text-gray-700">{currentBorrower.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Loans Tab */}
            {activeTab === "loans" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan History</h3>
                {borrowerStats && borrowerStats.totalLoans > 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      This borrower has {borrowerStats.totalLoans} loan(s) with {borrowerStats.activeLoans} currently active.
                    </p>
                    <button
                      onClick={() => router.push(`/dashboard/client/borrower/loans?borrowerId=${borrowerId}`)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Loan Details
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No loan history available for this borrower.</p>
                    <button
                      onClick={() => router.push(`/dashboard/cleint/loanapplication/create?borrowerId=${borrowerId}`)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create New Loan Application
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Delete Borrower?
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <strong>
                  {currentBorrower.firstName} {currentBorrower.lastName}
                </strong>
                ? This action cannot be undone.
              </p>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
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
      </div>
    </div>
  )
}

export default BorrowerDetailPage