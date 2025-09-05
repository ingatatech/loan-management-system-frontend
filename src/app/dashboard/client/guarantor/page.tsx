// @ts-nocheck
"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Building,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Plus,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Phone,
  MapPin,
  FileText,
  User, Mail, Shield, CreditCard, Banknote, Users, Award, TrendingUp, Tag, X
} from 'lucide-react';
import {
  fetchGuarantorsNeedingExtension,
  fetchLoanGuarantorsExtended,
  extendGuarantor,
  clearGuarantorsNeedingExtension
} from '@/lib/features/auth/loanApplicationSlice';
import toast from 'react-hot-toast';
import ExtendGuarantorModal from './ExtendGuarantorModal';
import { RootState } from '@/lib/store';


const SmartGuarantorManagement = () => {
  const dispatch = useDispatch();
  const {
    guarantorsNeedingExtension,
    guarantorLoading,
    error
  } = useSelector((state: RootState) => state.loanApplication);
  const { user } = useSelector((state: RootState) => state.auth);
const [activeViewTab, setActiveViewTab] = useState('basic');
const [viewModal, setViewModal] = useState<ViewModalState>({
  isOpen: false,
  guarantor: null
});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'individual', 'institution'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [extendModal, setExtendModal] = useState({
    isOpen: false,
    guarantor: null
  });

  useEffect(() => {
    if (user?.organizationId) {
      dispatch(fetchGuarantorsNeedingExtension({
        page: currentPage,
        limit: itemsPerPage
      }));
    }

    return () => {
      dispatch(clearGuarantorsNeedingExtension());
    };
  }, [dispatch, user?.organizationId, currentPage, itemsPerPage]);

  const handleExtendClick = (guarantor: any) => {
    setExtendModal({
      isOpen: true,
      guarantor
    });
  };

  const handleExtendSubmit = async (guarantorId, extendedData) => {
    try {
      await dispatch(extendGuarantor({
        guarantorId,
        extendedData
      })).unwrap();

      toast.success('Guarantor information extended successfully');
      setExtendModal({ isOpen: false, guarantor: null });

      // Refresh the list
      dispatch(fetchGuarantorsNeedingExtension({
        page: currentPage,
        limit: itemsPerPage
      }));
    } catch (error) {
      toast.error(error || 'Failed to extend guarantor');
    }
  };

  // Add this function to handle view clicks
  const handleViewClick = (guarantor: any) => {
    setViewModal({
      isOpen: true,
      guarantor
    });
  };

  const filteredGuarantors = guarantorsNeedingExtension.filter(guarantor => {
    const matchesSearch =
      guarantor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guarantor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guarantor.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'individual' && !guarantor.institutionName) ||
      (filterType === 'institution' && guarantor.institutionName);

    return matchesSearch && matchesFilter;
  });




  const renderViewModal = () => (
  <AnimatePresence>
    {viewModal.isOpen && viewModal.guarantor && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setViewModal({ isOpen: false, guarantor: null })}
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
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-3 border-white/30">
                  {getGuarantorInitials(viewModal.guarantor)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {viewModal.guarantor.guarantorType === 'institution' 
                      ? viewModal.guarantor.institutionName 
                      : `${viewModal.guarantor.surname || ''} ${viewModal.guarantor.forename1 || ''}`.trim() || viewModal.guarantor.name
                    }
                  </h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-purple-100 text-sm font-mono">
                      {viewModal.guarantor.accountNumber || 'No Account'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      viewModal.guarantor.isExtended?.() ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {viewModal.guarantor.isExtended?.() ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Extended
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Extension
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {viewModal.guarantor.guarantorType || 'Unknown Type'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewModal({ isOpen: false, guarantor: null })}
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
                {['Basic', 'Contact', 'Guarantee', 'Loan', 'Extended'].map((tab) => (
                  <button
                    key={tab}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeViewTab === tab.toLowerCase()
                        ? 'border-purple-500 text-purple-600'
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
              {activeViewTab === 'contact' && renderContactInfo()}
              {activeViewTab === 'guarantee' && renderGuaranteeInfo()}
              {activeViewTab === 'loan' && renderLoanInfo()}
              {activeViewTab === 'extended' && renderExtendedInfo()}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-8 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Created: {viewModal.guarantor.createdAt ? new Date(viewModal.guarantor.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExtendClick(viewModal.guarantor)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Extend Info
              </button>
              <button
                onClick={() => setViewModal({ isOpen: false, guarantor: null })}
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

const getGuarantorInitials = (guarantor) => {
  if (guarantor.guarantorType === 'institution') {
    return guarantor.institutionName?.substring(0, 2).toUpperCase() || 'CO';
  }
  
  const surname = guarantor.surname?.charAt(0) || '';
  const forename1 = guarantor.forename1?.charAt(0) || '';
  
  if (surname || forename1) {
    return `${surname}${forename1}`.toUpperCase();
  }
  
  return guarantor.name?.substring(0, 2).toUpperCase() || 'GU';
};

// Basic Information Tab
const renderBasicInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Basic Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Guarantor Type" value={viewModal.guarantor.guarantorType} />
          <InfoRow label="Account Number" value={viewModal.guarantor.accountNumber} />
          {viewModal.guarantor.guarantorType === 'individual' ? (
            <>
              <InfoRow label="Surname" value={viewModal.guarantor.surname} />
              <InfoRow label="Forename 1" value={viewModal.guarantor.forename1} />
              <InfoRow label="Forename 2" value={viewModal.guarantor.forename2} />
              <InfoRow label="Forename 3" value={viewModal.guarantor.forename3} />
              <InfoRow label="National ID" value={viewModal.guarantor.nationalId} />
              <InfoRow label="Date of Birth" value={viewModal.guarantor.dateOfBirth ? new Date(viewModal.guarantor.dateOfBirth).toLocaleDateString() : 'N/A'} />
              <InfoRow label="Place of Birth" value={viewModal.guarantor.placeOfBirth} />
            </>
          ) : (
            <>
              <InfoRow label="Institution Name" value={viewModal.guarantor.institutionName} />
              <InfoRow label="Trading Name" value={viewModal.guarantor.tradingName} />
              <InfoRow label="Company Reg No" value={viewModal.guarantor.companyRegNo} />
              <InfoRow label="Registration Date" value={viewModal.guarantor.companyRegistrationDate ? new Date(viewModal.guarantor.companyRegistrationDate).toLocaleDateString() : 'N/A'} />
            </>
          )}
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Award className="w-5 h-5 mr-2 text-green-600" />
          Identification & Nationality
        </h3>
        <div className="space-y-2">
          <InfoRow label="Passport No" value={viewModal.guarantor.passportNo} />
          <InfoRow label="Nationality" value={viewModal.guarantor.nationality} />
          <InfoRow label="Original Name" value={viewModal.guarantor.name} />
          <InfoRow label="Status" value={viewModal.guarantor.isActive ? 'Active' : 'Inactive'} />
        </div>
      </div>

      {viewModal.guarantor.collateralDescription && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <FileText className="w-5 h-5 mr-2 text-orange-600" />
            Collateral Notes
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white/50 p-3 rounded border">
            {viewModal.guarantor.collateralDescription}
          </p>
        </div>
      )}
    </div>
  </div>
);

// Contact Information Tab
const renderContactInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Phone className="w-5 h-5 mr-2 text-blue-600" />
          Phone Contacts
        </h3>
        <div className="space-y-2">
          <InfoRow label="Primary Phone" value={viewModal.guarantor.phone} type="phone" />
          <InfoRow label="Mobile Telephone" value={viewModal.guarantor.mobileTelephone} type="phone" />
          <InfoRow label="Work Telephone" value={viewModal.guarantor.workTelephone} type="phone" />
          <InfoRow label="Home Telephone" value={viewModal.guarantor.homeTelephone} type="phone" />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <MapPin className="w-5 h-5 mr-2 text-purple-600" />
          Address Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Original Address" value={viewModal.guarantor.address} />
          <InfoRow label="Postal Address Line 1" value={viewModal.guarantor.postalAddressLine1} />
          <InfoRow label="Postal Address Line 2" value={viewModal.guarantor.postalAddressLine2} />
          <InfoRow label="Town/City" value={viewModal.guarantor.town} />
          <InfoRow label="Postal Code" value={viewModal.guarantor.postalCode} />
          <InfoRow label="Country" value={viewModal.guarantor.country} />
        </div>
      </div>
    </div>
  </div>
);

// Guarantee Information Tab
const renderGuaranteeInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
          Guarantee Details
        </h3>
        <div className="space-y-2">
          <InfoRow label="Guaranteed Amount" value={viewModal.guarantor.guaranteedAmount ? `${viewModal.guarantor.guaranteedAmount.toLocaleString()} RWF` : 'N/A'} />
          <InfoRow label="Collateral Type" value={viewModal.guarantor.collateralType} />
          <InfoRow label="Coverage Percentage" value={
            viewModal.guarantor.loan?.disbursedAmount 
              ? `${((viewModal.guarantor.guaranteedAmount / viewModal.guarantor.loan.disbursedAmount) * 100).toFixed(2)}%`
              : 'N/A'
          } />
          <InfoRow label="Is Active" value={viewModal.guarantor.isActive ? 'Yes' : 'No'} />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <CreditCard className="w-5 h-5 mr-2 text-green-600" />
          Risk Assessment
        </h3>
        <div className="space-y-2">
          <InfoRow label="Guarantor Strength" value={
            viewModal.guarantor.guaranteedAmount > 10000000 ? 'High' :
            viewModal.guarantor.guaranteedAmount > 5000000 ? 'Medium' : 'Low'
          } />
          <InfoRow label="Data Completeness" value={
            viewModal.guarantor.isExtended?.() ? 'Complete' : 'Incomplete'
          } />
          <InfoRow label="Verification Status" value={
            viewModal.guarantor.accountNumber ? 'Verified' : 'Unverified'
          } />
        </div>
      </div>
    </div>
  </div>
);

// Loan Information Tab
const renderLoanInfo = () => (
  <div className="grid grid-cols-1 gap-6">
    {viewModal.guarantor.loan ? (
      <>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Banknote className="w-5 h-5 mr-2 text-blue-600" />
            Loan Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoRow label="Loan ID" value={viewModal.guarantor.loan.loanId} />
            <InfoRow label="Borrower" value={
              viewModal.guarantor.loan.borrower 
                ? `${viewModal.guarantor.loan.borrower.firstName} ${viewModal.guarantor.loan.borrower.lastName}`
                : 'N/A'
            } />
            <InfoRow label="Disbursed Amount" value={
              viewModal.guarantor.loan.disbursedAmount 
                ? `${viewModal.guarantor.loan.disbursedAmount.toLocaleString()} RWF`
                : 'N/A'
            } />
            <InfoRow label="Outstanding Principal" value={
              viewModal.guarantor.loan.outstandingPrincipal 
                ? `${viewModal.guarantor.loan.outstandingPrincipal.toLocaleString()} RWF`
                : 'N/A'
            } />
            <InfoRow label="Interest Rate" value={
              viewModal.guarantor.loan.annualInterestRate 
                ? `${viewModal.guarantor.loan.annualInterestRate}%`
                : 'N/A'
            } />
            <InfoRow label="Loan Status" value={viewModal.guarantor.loan.status} />
            <InfoRow label="Purpose" value={viewModal.guarantor.loan.purposeOfLoan} />
            <InfoRow label="Branch" value={viewModal.guarantor.loan.branchName} />
            <InfoRow label="Loan Officer" value={viewModal.guarantor.loan.loanOfficer} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Loan Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoRow label="Disbursement Date" value={
              viewModal.guarantor.loan.disbursementDate 
                ? new Date(viewModal.guarantor.loan.disbursementDate).toLocaleDateString()
                : 'N/A'
            } />
            <InfoRow label="Maturity Date" value={
              viewModal.guarantor.loan.agreedMaturityDate 
                ? new Date(viewModal.guarantor.loan.agreedMaturityDate).toLocaleDateString()
                : 'N/A'
            } />
            <InfoRow label="Days in Arrears" value={viewModal.guarantor.loan.daysInArrears} />
            <InfoRow label="Last Updated" value={
              viewModal.guarantor.loan.updatedAt 
                ? new Date(viewModal.guarantor.loan.updatedAt).toLocaleDateString()
                : 'N/A'
            } />
          </div>
        </div>
      </>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No loan information available</p>
      </div>
    )}
  </div>
);

// Extended Information Tab
const renderExtendedInfo = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Extended Details
        </h3>
        <div className="space-y-2">
          <InfoRow label="Data Extension Status" value={
            viewModal.guarantor.isExtended?.() ? 'Completed' : 'Pending'
          } />
          <InfoRow label="Extension Date" value={
            viewModal.guarantor.updatedAt ? new Date(viewModal.guarantor.updatedAt).toLocaleDateString() : 'N/A'
          } />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Financial Metrics
        </h3>
        <div className="space-y-2">
          <InfoRow label="Guarantee to Loan Ratio" value={
            viewModal.guarantor.loan?.disbursedAmount 
              ? `${((viewModal.guarantor.guaranteedAmount / viewModal.guarantor.loan.disbursedAmount) * 100).toFixed(1)}%`
              : 'N/A'
          } />
          <InfoRow label="Risk Level" value={
            viewModal.guarantor.guaranteedAmount > viewModal.guarantor.loan?.disbursedAmount 
              ? 'Low Risk' : 'Medium Risk'
          } />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <Tag className="w-5 h-5 mr-2 text-orange-600" />
          System Information
        </h3>
        <div className="space-y-2">
          <InfoRow label="Organization ID" value={viewModal.guarantor.organizationId} />
          <InfoRow label="Borrower ID" value={viewModal.guarantor.borrowerId} />
          <InfoRow label="Collateral ID" value={viewModal.guarantor.collateralId} />
          <InfoRow label="Created By" value={viewModal.guarantor.createdBy} />
          <InfoRow label="Updated By" value={viewModal.guarantor.updatedBy} />
        </div>
      </div>
    </div>
  </div>
);

// Reusable InfoRow component for consistent styling
const InfoRow = ({ label, value, type = 'text' }: { label: string; value: any; type?: string }) => {
  if (value === null || value === undefined || value === '') {
    return (
      <div className="flex justify-between items-center py-2 px-3 bg-white/60 rounded border border-white opacity-50">
        <span className="text-sm font-medium text-gray-500">{label}:</span>
        <span className="text-sm text-gray-400 italic">Not provided</span>
      </div>
    );
  }

  let displayValue = value;
  if (type === 'phone' && value) {
    displayValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShieldCheck className="w-7 h-7 mr-3 text-purple-600" />
                Guarantor Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Complete guarantor information for better risk assessment
              </p>
            </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Guarantors
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {guarantorsNeedingExtension.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Needs Extension
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {filteredGuarantors.length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  0%
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guarantors by name, phone, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="institution">Institution</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guarantors Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Guarantor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Loan Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Collateral
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {guarantorLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
                        <span className="text-gray-600 text-sm">Loading guarantors...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGuarantors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        {searchTerm || filterType !== 'all'
                          ? 'No guarantors match your search criteria'
                          : 'No guarantors need extension'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGuarantors.map((guarantor, index) => (
                    <tr key={guarantor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {guarantor.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {guarantor.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              <span>{guarantor.phone}</span>
                            </div>
                          )}

                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {guarantor.loan?.borrower && (
                            <div className="text-xs text-gray-600">
                              Borrower: {guarantor.loan.borrower.firstName} {guarantor.loan.borrower.lastName}
                            </div>
                          )}
                          <div className="text-xs font-medium text-gray-900">
                            Amount: {guarantor.guaranteedAmount?.toLocaleString()} RWF
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {guarantor.collateralDescription && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {guarantor.collateralDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Extension
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap flex flex-row gap-2">
                        <button
                          onClick={() => handleViewClick(guarantor)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors ml-2"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleExtendClick(guarantor)}
                          className="inline-flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Extend
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
{renderViewModal()}
        {/* Extend Modal */}
        <ExtendGuarantorModal
          isOpen={extendModal.isOpen}
          onClose={() => setExtendModal({ isOpen: false, guarantor: null })}
          guarantor={extendModal.guarantor}
          onSubmit={handleExtendSubmit}
        />
      </div>
    </div>
  );
};

export default SmartGuarantorManagement;