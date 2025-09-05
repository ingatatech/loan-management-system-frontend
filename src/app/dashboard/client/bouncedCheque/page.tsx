"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileX,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Plus,
  Download,
  X,
  Calendar,
  User,
  MapPin,
  FileText,
  Shield,
  Clock,
  BarChart3,
  ExternalLink,
  Tag,
  Mail,
  Phone,
  Landmark
} from 'lucide-react';
import {
  fetchBouncedCheques,
  createBouncedCheque,
  updateBouncedCheque,
  deleteBouncedCheque,
  fetchBouncedChequeStats,
  clearBouncedCheques,
  fetchBouncedChequeById
} from '@/lib/features/auth/bouncedChequeSlice';
import toast from 'react-hot-toast';
import BouncedChequeForm from './BouncedChequeForm';
import { RootState } from '@/lib/store';

const BouncedChequeManagement = () => {
  const dispatch = useDispatch();
  const {
    cheques,
    currentCheque,
    stats,
    isLoading,
    pagination,
    error
  } = useSelector((state: RootState) => state.bouncedCheque);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: 'create',
    cheque: null
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    cheque: null
  });
  const [activeViewTab, setActiveViewTab] = useState('basic');

  useEffect(() => {
    if (user?.organizationId) {
      dispatch(fetchBouncedCheques({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        type: typeFilter,
        reason: reasonFilter
      }));
      dispatch(fetchBouncedChequeStats());
    }

    return () => {
      dispatch(clearBouncedCheques());
    };
  }, [dispatch, user?.organizationId, currentPage, itemsPerPage, searchTerm, typeFilter, reasonFilter]);

  const handleCreate = () => {
    setFormModal({
      isOpen: true,
      mode: 'create',
      cheque: null
    });
  };

  const handleEdit = (cheque) => {
    setFormModal({
      isOpen: true,
      mode: 'edit',
      cheque
    });
  };

    const handleViewClick = (cheque) => {
    setViewModal({
      isOpen: true,
      cheque: cheque
    });
  };


  const handleFormSubmit = async (formData) => {
    try {
      if (formModal.mode === 'create') {
        await dispatch(createBouncedCheque(formData)).unwrap();
        toast.success('Bounced cheque record created successfully');
      } else {
        await dispatch(updateBouncedCheque({
          chequeId: formModal.cheque.id,
          updateData: formData
        })).unwrap();
        toast.success('Bounced cheque record updated successfully');
      }
      
      setFormModal({ isOpen: false, mode: 'create', cheque: null });
      dispatch(fetchBouncedCheques({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        type: typeFilter,
        reason: reasonFilter
      }));
      dispatch(fetchBouncedChequeStats());
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleDelete = async (chequeId) => {
    try {
      await dispatch(deleteBouncedCheque(chequeId)).unwrap();
      toast.success('Bounced cheque record deleted successfully');
      setDeleteConfirm(null);
      dispatch(fetchBouncedCheques({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        type: typeFilter,
        reason: reasonFilter
      }));
      dispatch(fetchBouncedChequeStats());
    } catch (error) {
      toast.error(error || 'Failed to delete record');
    }
  };

  const formatCurrency = (amount:any) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date:any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReasonLabel = (reason:any) => {
    const labels = {
      insufficient_funds: 'Insufficient Funds',
      account_closed: 'Account Closed',
      signature_mismatch: 'Signature Mismatch',
      post_dated: 'Post Dated',
      payment_stopped: 'Payment Stopped',
      refer_to_drawer: 'Refer to Drawer',
      technical_reason: 'Technical Reason',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  const getTypeIcon = (type:any) => {
    return type === 'individual' ? 
      <Users className="w-5 h-5" /> : 
      <Building className="w-5 h-5" />;
  };



  // Enhanced Stats Cards like hit codes
  const StatCard = ({ title, value, icon, bgGradient, accentColor, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
    >
      <div className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 h-[80px] rounded-xl">
        <div className="p-0 relative h-full">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-100 to-transparent transform rotate-12"></div>
          </div>

          <div className="flex items-center relative z-10 h-full">
            <div className={`${bgGradient} p-2 flex items-center justify-center relative overflow-hidden h-full`}>
              <div className={`absolute inset-0 ${accentColor} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
              <motion.div
                className="text-white text-sm relative z-10"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20 rounded-full"></div>
            </div>

            <div className="p-4 flex-1 bg-gradient-to-r from-transparent to-gray-50/30 min-w-0">
              <p className="text-xs text-gray-600 font-medium mb-0.5 tracking-wide uppercase truncate">{title}</p>
              <div className="overflow-x-auto scrollbar-hide">
                <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300 whitespace-nowrap">
                  {value}
                </p>
              </div>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced View Modal Component
  const renderViewModal = () => (
    <AnimatePresence>
      {viewModal.isOpen && viewModal.cheque && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewModal({ isOpen: false, cheque: null })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className={`bg-[#5B7FA2] px-8 py-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-4 border-white/30">
                    {getTypeIcon(viewModal.cheque.type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {viewModal.cheque.type === 'individual' 
                        ? `${viewModal.cheque.surname} ${viewModal.cheque.forename1}`
                        : viewModal.cheque.institutionName
                      }
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-white/90 text-sm font-mono">
                        {viewModal.cheque.accountNumber}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                        {viewModal.cheque.type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        viewModal.cheque.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewModal.cheque.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewModal({ isOpen: false, cheque: null })}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Enhanced Content with Tabs */}
            <div className="flex-1 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8" aria-label="Tabs">
                  {['Basic', 'Financial', 'Dates', 'Party', 'Address', 'Additional'].map((tab) => (
                    <button
                      key={tab}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeViewTab === tab.toLowerCase()
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveViewTab(tab.toLowerCase())}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {activeViewTab === 'basic' && renderBasicInfo()}
                {activeViewTab === 'financial' && renderFinancialInfo()}
                {activeViewTab === 'dates' && renderDatesInfo()}
                {activeViewTab === 'party' && renderPartyInfo()}
                {activeViewTab === 'address' && renderAddressInfo()}
                {activeViewTab === 'additional' && renderAdditionalInfo()}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-red-50 px-8 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Created: {formatDate(viewModal.cheque.createdAt)}
                {viewModal.cheque.updatedAt && ` • Updated: ${formatDate(viewModal.cheque.updatedAt)}`}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(viewModal.cheque)}
                  className="px-4 py-2 bg-[#5B7FA2]  text-white rounded-lg transition-colors flex items-center text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setViewModal({ isOpen: false, cheque: null })}
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
  );

  // Basic Information Tab
  const renderBasicInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <FileX className="w-5 h-5 mr-2 text-red-600" />
            Cheque Details
          </h3>
          <div className="space-y-2">
            <InfoRow label="Account Number" value={viewModal.cheque.accountNumber} />
            <InfoRow label="Cheque Number" value={viewModal.cheque.chequeNumber} />
            <InfoRow label="Type" value={viewModal.cheque.type} />
            <InfoRow label="Status" value={viewModal.cheque.isActive ? 'Active' : 'Inactive'} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Shield className="w-5 h-5 mr-2 text-purple-600" />
            Return Information
          </h3>
          <div className="space-y-2">
            <InfoRow label="Return Reason" value={getReasonLabel(viewModal.cheque.returnedChequeReason)} />
            <InfoRow label="Currency" value={viewModal.cheque.currency} />
            <InfoRow label="Beneficiary" value={viewModal.cheque.beneficiaryName} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Financial Information
          </h3>
          <div className="space-y-2">
            <InfoRow label="Amount" value={formatCurrency(viewModal.cheque.amount)} />
            <InfoRow label="Coverage Status" value={
              viewModal.cheque.loanId ? 'Linked to Loan' : 'Standalone'
            } />
            <InfoRow label="Risk Level" value={
              parseFloat(viewModal.cheque.amount) > 1000000 ? 'High' :
              parseFloat(viewModal.cheque.amount) > 500000 ? 'Medium' : 'Low'
            } />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Additional Information
          </h3>
          <div className="space-y-2">
            <InfoRow label="Loan ID" value={viewModal.cheque.loanId} />
            <InfoRow label="Borrower ID" value={viewModal.cheque.borrowerId} />
            <InfoRow label="Organization" value={user?.organizationId} />
          </div>
        </div>
      </div>
    </div>
  );

  // Financial Information Tab
  const renderFinancialInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Amount Details
          </h3>
          <div className="space-y-2">
            <InfoRow label="Cheque Amount" value={formatCurrency(viewModal.cheque.amount)} />
            <InfoRow label="Currency" value={viewModal.cheque.currency} />
            <InfoRow label="Financial Impact" value={
              parseFloat(viewModal.cheque.amount) > 1000000 ? 'Significant' :
              parseFloat(viewModal.cheque.amount) > 500000 ? 'Moderate' : 'Minor'
            } />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Risk Assessment
          </h3>
          <div className="space-y-2">
            <InfoRow label="Amount Category" value={
              parseFloat(viewModal.cheque.amount) > 1000000 ? 'Large' :
              parseFloat(viewModal.cheque.amount) > 500000 ? 'Medium' : 'Small'
            } />
            <InfoRow label="Recovery Probability" value={
              viewModal.cheque.type === 'individual' ? 'Medium' : 'High'
            } />
            <InfoRow label="Priority Level" value={
              parseFloat(viewModal.cheque.amount) > 1000000 ? 'High' :
              parseFloat(viewModal.cheque.amount) > 500000 ? 'Medium' : 'Low'
            } />
          </div>
        </div>
      </div>
    </div>
  );

  // Dates Information Tab
  const renderDatesInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Cheque Timeline
          </h3>
          <div className="space-y-2">
            <InfoRow label="Cheque Date" value={formatDate(viewModal.cheque.chequeDate)} />
            <InfoRow label="Reported Date" value={formatDate(viewModal.cheque.reportedDate)} />
            <InfoRow label="Days Since Bounce" value={
              Math.floor((new Date() - new Date(viewModal.cheque.reportedDate)) / (1000 * 60 * 60 * 24))
            } />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            System Timeline
          </h3>
          <div className="space-y-2">
            <InfoRow label="Created Date" value={formatDate(viewModal.cheque.createdAt)} />
            <InfoRow label="Last Updated" value={formatDate(viewModal.cheque.updatedAt)} />
            <InfoRow label="Record Age" value={
              Math.floor((new Date() - new Date(viewModal.cheque.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
            } />
          </div>
        </div>
      </div>
    </div>
  );

  // Party Information Tab
  const renderPartyInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {viewModal.cheque.type === 'individual' ? (
        <>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-2">
                <InfoRow label="Surname" value={viewModal.cheque.surname} />
                <InfoRow label="First Name" value={viewModal.cheque.forename1} />
                <InfoRow label="Middle Name" value={viewModal.cheque.forename2} />
                <InfoRow label="Other Name" value={viewModal.cheque.forename3} />
                <InfoRow label="Date of Birth" value={formatDate(viewModal.cheque.dateOfBirth)} />
                <InfoRow label="Place of Birth" value={viewModal.cheque.placeOfBirth} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Identification
              </h3>
              <div className="space-y-2">
                <InfoRow label="National ID" value={viewModal.cheque.nationalId} />
                <InfoRow label="Passport Number" value={viewModal.cheque.passportNo} />
                <InfoRow label="Nationality" value={viewModal.cheque.nationality} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Building className="w-5 h-5 mr-2 text-purple-600" />
                Institution Details
              </h3>
              <div className="space-y-2">
                <InfoRow label="Institution Name" value={viewModal.cheque.institutionName} />
                <InfoRow label="Trading Name" value={viewModal.cheque.tradingName} />
                <InfoRow label="Company Reg No" value={viewModal.cheque.companyRegNo} />
                <InfoRow label="Registration Date" value={formatDate(viewModal.cheque.companyRegistrationDate)} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Address Information Tab
  const renderAddressInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <MapPin className="w-5 h-5 mr-2 text-orange-600" />
            Postal Address
          </h3>
          <div className="space-y-2">
            <InfoRow label="Address Line 1" value={viewModal.cheque.postalAddressLine1} />
            <InfoRow label="Address Line 2" value={viewModal.cheque.postalAddressLine2} />
            <InfoRow label="Town/City" value={viewModal.cheque.town} />
            <InfoRow label="Postal Code" value={viewModal.cheque.postalCode} />
            <InfoRow label="Country" value={viewModal.cheque.country} />
          </div>
        </div>
      </div>
    </div>
  );

  // Additional Information Tab
  const renderAdditionalInfo = () => (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <FileText className="w-5 h-5 mr-2 text-gray-600" />
          Notes & Additional Information
        </h3>
        <div className="space-y-4">
          {viewModal.cheque.notes ? (
            <div className="bg-white/60 rounded border border-gray-200 p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {viewModal.cheque.notes}
              </p>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No additional notes provided</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Reusable InfoRow component
  const InfoRow = ({ label, value, type = 'text' }) => {
    if (value === null || value === undefined || value === '') {
      return (
        <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded border border-white opacity-50">
          <span className="text-sm font-medium text-gray-500">{label}:</span>
          <span className="text-sm text-gray-400 italic">Not provided</span>
        </div>
      );
    }

    let displayValue = value;
    if (type === 'currency' && value) {
      displayValue = formatCurrency(value);
    } else if (type === 'date' && value) {
      displayValue = formatDate(value);
    }

    return (
      <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded border border-white">
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <span className="text-sm text-gray-900 font-mono max-w-[60%] text-right break-words">
          {displayValue}
        </span>
      </div>
    );
  };

  const filteredCheques = cheques.filter(cheque =>
    cheque.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cheque.chequeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cheque.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cheque.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cheque.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileX className="w-7 h-7 mr-3 text-red-600" />
                Bounced Cheque Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage bounced cheque records
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-[#5B7FA2] text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Bounced Cheque
            </button>
          </div>
        </div>

        {/* Error Display */}
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

        {/* Enhanced Stats Cards */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Total Cheques"
              value={stats.totalCheques}
              icon={<FileX className="w-4 h-4" />}
              bgGradient="bg-gradient-to-br from-red-400 to-red-600"
              accentColor="bg-red-400"
            />

            <StatCard
              title="Total Amount"
              value={formatCurrency(stats.totalAmount)}
              icon={<DollarSign className="w-4 h-4" />}
              bgGradient="bg-gradient-to-br from-orange-400 to-orange-600"
              accentColor="bg-orange-400"
            />

            <StatCard
              title="Recent (30 days)"
              value={stats.recentCount}
              icon={<TrendingUp className="w-4 h-4" />}
              bgGradient="bg-gradient-to-br from-yellow-400 to-yellow-600"
              accentColor="bg-yellow-400"
            />

            <StatCard
              title="Overdue"
              value={stats.overdueCount}
              icon={<AlertTriangle className="w-4 h-4" />}
              bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
              accentColor="bg-purple-400"
            />
          </motion.div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by account, cheque number, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Types</option>
                <option value="individual">Individual</option>
                <option value="institution">Institution</option>
              </select>
            </div>
            <div>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Reasons</option>
                <option value="insufficient_funds">Insufficient Funds</option>
                <option value="account_closed">Account Closed</option>
                <option value="signature_mismatch">Signature Mismatch</option>
                <option value="post_dated">Post Dated</option>
                <option value="payment_stopped">Payment Stopped</option>
                <option value="refer_to_drawer">Refer to Drawer</option>
                <option value="technical_reason">Technical Reason</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Table with Numerical Numbering */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Account & Cheque
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Party Details
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount & Reason
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Beneficiary
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
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
                        <span className="text-gray-600 text-sm">Loading bounced cheques...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCheques.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        No bounced cheques found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCheques.map((cheque, index) => (
                    <tr key={cheque.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-red-600">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">
                            {cheque.accountNumber}
                          </div>
                          <div className="text-xs text-gray-600">
                            Cheque: {cheque.chequeNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          {cheque.type === 'individual' ? (
                            <>
                              <div className="flex items-center text-sm font-medium text-gray-900">
                                <Users className="w-4 h-4 mr-1 text-blue-600" />
                                {cheque.surname} {cheque.forename1}
                              </div>
                              {cheque.nationalId && (
                                <div className="text-xs text-gray-600">
                                  ID: {cheque.nationalId}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-center text-sm font-medium text-gray-900">
                                <Building className="w-4 h-4 mr-1 text-purple-600" />
                                {cheque.institutionName}
                              </div>
                              {cheque.companyRegNo && (
                                <div className="text-xs text-gray-600">
                                  Reg: {cheque.companyRegNo}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-red-600">
                            {formatCurrency(cheque.amount)}
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {getReasonLabel(cheque.returnedChequeReason)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1 text-xs">
                          <div className="text-gray-600">
                            Cheque: {formatDate(cheque.chequeDate)}
                          </div>
                          <div className="text-gray-600">
                            Reported: {formatDate(cheque.reportedDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900">
                          {cheque.beneficiaryName}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewClick(cheque)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(cheque)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(cheque.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete"
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

        {/* Form Modal */}
        <BouncedChequeForm
          isOpen={formModal.isOpen}
          onClose={() => setFormModal({ isOpen: false, mode: 'create', cheque: null })}
          cheque={formModal.cheque}
          onSubmit={handleFormSubmit}
          mode={formModal.mode}
        />

        {/* Enhanced View Modal */}
        {renderViewModal()}

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Confirm Deletion
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Are you sure you want to delete this bounced cheque record? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2 bg-[#5B7FA2] hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Record
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BouncedChequeManagement;