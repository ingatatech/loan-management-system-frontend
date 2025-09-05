
"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Edit,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  Tag,
  X,
  Download,
  ExternalLink,
  BarChart3,
  ShieldCheck,
  Home,
  Car,
  Landmark,
  Gem,
  TrendingUp
} from 'lucide-react';
import {
  fetchAllCollaterals,
  clearAllCollaterals,
  extendCollateral
} from '@/lib/features/auth/loanApplicationSlice';
import toast from 'react-hot-toast';
import ExtendCollateralModal from './ExtendCollateralModal';

const CollateralManagementPage = () => {
  const dispatch = useDispatch();
  const {
    allCollaterals,
    collateralLoading,
    collateralPagination,
    error
  } = useSelector((state) => state.loanApplication);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [extendModal, setExtendModal] = useState({
    isOpen: false,
    collateral: null
  });
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    collateral: null
  });
  const [activeViewTab, setActiveViewTab] = useState('basic');

  useEffect(() => {
    if (user?.organizationId) {
      dispatch(fetchAllCollaterals({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      }));
    }

    return () => {
      dispatch(clearAllCollaterals());
    };
  }, [dispatch, user?.organizationId, currentPage, itemsPerPage, searchTerm]);

  const handleExtendClick = (collateral) => {
    setExtendModal({
      isOpen: true,
      collateral
    });
  };

  const handleViewClick = (collateral) => {
    setViewModal({
      isOpen: true,
      collateral
    });
    setActiveViewTab('basic');
  };

  const handleExtendSubmit = async (collateralId, extendedData) => {
    try {
      await dispatch(extendCollateral({
        collateralId,
        extendedData
      })).unwrap();

      toast.success('Collateral information extended successfully');
      setExtendModal({ isOpen: false, collateral: null });

      dispatch(fetchAllCollaterals({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      }));
    } catch (error) {
      toast.error(error || 'Failed to extend collateral');
    }
  };

  const isCollateralExtended = (collateral) => {
    return !!(
      collateral.accountNumber ||
      collateral.extendedCollateralType ||
      collateral.extendedCollateralValue ||
      collateral.collateralLastValuationDate ||
      collateral.collateralExpiryDate
    );
  };

  const filteredCollaterals = allCollaterals.filter(collateral =>
    collateral.collateralId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collateral.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collateral.guarantorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCollateralIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'immovable':
        return <Home className="w-5 h-5" />;
      case 'movable':
        return <Car className="w-5 h-5" />;
      case 'financial':
        return <Landmark className="w-5 h-5" />;
      case 'guarantee':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Gem className="w-5 h-5" />;
    }
  };

  const getCollateralColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'immovable':
        return 'from-blue-500 to-blue-600';
      case 'movable':
        return 'from-green-500 to-green-600';
      case 'financial':
        return 'from-purple-500 to-purple-600';
      case 'guarantee':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const totals = {
    total: allCollaterals.length,
    extended: allCollaterals.filter(isCollateralExtended).length,
    needsExtension: allCollaterals.filter(c => !isCollateralExtended(c)).length,
    totalValue: allCollaterals.reduce((sum, c) => {
      const value = parseFloat(c.collateralValue) || 0;
      return sum + value;
    }, 0)
  };

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
      {viewModal.isOpen && viewModal.collateral && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewModal({ isOpen: false, collateral: null })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className={`bg-[#5B7FA2] ${getCollateralColor(viewModal.collateral.collateralType)} px-8 py-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-4 border-white/30">
                    {getCollateralIcon(viewModal.collateral.collateralType)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {viewModal.collateral.extendedCollateralType || viewModal.collateral.collateralType}
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-white/90 text-sm font-mono">
                        {viewModal.collateral.collateralId}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isCollateralExtended(viewModal.collateral) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {isCollateralExtended(viewModal.collateral) ? (
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
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                        {viewModal.collateral.collateralType}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewModal({ isOpen: false, collateral: null })}
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
                  {['Basic', 'Valuation', 'Documents', 'Loan', 'Extended', 'Guarantor'].map((tab) => (
                    <button
                      key={tab}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeViewTab === tab.toLowerCase()
                          ? 'border-blue-500 text-blue-600'
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
                {activeViewTab === 'valuation' && renderValuationInfo()}
                {activeViewTab === 'documents' && renderDocumentsInfo()}
                {activeViewTab === 'loan' && renderLoanInfo()}
                {activeViewTab === 'extended' && renderExtendedInfo()}
                {activeViewTab === 'guarantor' && renderGuarantorInfo()}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Created: {formatDate(viewModal.collateral.createdAt)}
                {viewModal.collateral.updatedAt && ` • Updated: ${formatDate(viewModal.collateral.updatedAt)}`}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleExtendClick(viewModal.collateral)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isCollateralExtended(viewModal.collateral) ? 'Update' : 'Extend'}
                </button>
                <button
                  onClick={() => setViewModal({ isOpen: false, collateral: null })}
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
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Collateral Details
          </h3>
          <div className="space-y-2">
            <InfoRow label="Type" value={viewModal.collateral.collateralType} />
            <InfoRow label="Extended Type" value={viewModal.collateral.extendedCollateralType} />
            <InfoRow label="Account Number" value={viewModal.collateral.accountNumber} />
            <InfoRow label="Status" value={viewModal.collateral.isActive ? 'Active' : 'Inactive'} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Description & Notes
          </h3>
          <div className="space-y-2">
            <div className="bg-white/60 rounded border border-white p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {viewModal.collateral.description || 'No description provided'}
              </p>
            </div>
            {viewModal.collateral.notes && (
              <div className="bg-yellow-50 rounded border border-yellow-200 p-3">
                <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                  <strong>Notes:</strong> {viewModal.collateral.notes}
                </p>
              </div>
            )}
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
            <InfoRow label="Original Value" value={formatCurrency(viewModal.collateral.collateralValue)} />
            <InfoRow label="Extended Value" value={formatCurrency(viewModal.collateral.extendedCollateralValue)} />
            <InfoRow label="Coverage Ratio" value={
              viewModal.collateral.loan?.disbursedAmount 
                ? `${((parseFloat(viewModal.collateral.collateralValue) / parseFloat(viewModal.collateral.loan.disbursedAmount)) * 100).toFixed(1)}%`
                : 'N/A'
            } />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
            Risk Assessment
          </h3>
          <div className="space-y-2">
            <InfoRow label="Data Completeness" value={
              isCollateralExtended(viewModal.collateral) ? 'Complete' : 'Incomplete'
            } />
            <InfoRow label="Verification Status" value={
              viewModal.collateral.accountNumber ? 'Verified' : 'Unverified'
            } />
            <InfoRow label="Risk Level" value={
              parseFloat(viewModal.collateral.collateralValue) > 10000000 ? 'Low' :
              parseFloat(viewModal.collateral.collateralValue) > 5000000 ? 'Medium' : 'High'
            } />
          </div>
        </div>
      </div>
    </div>
  );

  // Valuation Information Tab
  const renderValuationInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Valuation Timeline
          </h3>
          <div className="space-y-2">
            <InfoRow label="Initial Valuation Date" value={formatDate(viewModal.collateral.valuationDate)} />
            <InfoRow label="Last Valuation Date" value={formatDate(viewModal.collateral.collateralLastValuationDate)} />
            <InfoRow label="Collateral Expiry" value={formatDate(viewModal.collateral.collateralExpiryDate)} />
            <InfoRow label="Valued By" value={viewModal.collateral.valuedBy} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Status Information
          </h3>
          <div className="space-y-2">
            <InfoRow label="Days Since Last Valuation" value={
              viewModal.collateral.collateralLastValuationDate 
                ? Math.floor((new Date() - new Date(viewModal.collateral.collateralLastValuationDate)) / (1000 * 60 * 60 * 24))
                : 'N/A'
            } />
            <InfoRow label="Days Until Expiry" value={
              viewModal.collateral.collateralExpiryDate 
                ? Math.floor((new Date(viewModal.collateral.collateralExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                : 'N/A'
            } />
            <InfoRow label="Valuation Frequency" value="Annual" />
          </div>
        </div>
      </div>
    </div>
  );

  // Documents Information Tab
  const renderDocumentsInfo = () => (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
          <FileText className="w-5 h-5 mr-2 text-purple-600" />
          Document Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentLink 
            title="Proof of Ownership" 
            url={viewModal.collateral.proofOfOwnershipUrl} 
          />
          <DocumentLink 
            title="Owner Identification" 
            url={viewModal.collateral.ownerIdentificationUrl} 
          />
          <DocumentLink 
            title="Legal Document" 
            url={viewModal.collateral.legalDocumentUrl} 
          />
          <DocumentLink 
            title="Physical Evidence" 
            url={viewModal.collateral.physicalEvidenceUrl} 
          />
        </div>
      </div>
    </div>
  );

  // Loan Information Tab
  const renderLoanInfo = () => (
    <div className="grid grid-cols-1 gap-6">
      {viewModal.collateral.loan ? (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Loan Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoRow label="Loan ID" value={viewModal.collateral.loan.loanId} />
              <InfoRow label="Borrower" value={
                viewModal.collateral.loan.borrower 
                  ? `${viewModal.collateral.loan.borrower.firstName} ${viewModal.collateral.loan.borrower.lastName}`
                  : 'N/A'
              } />
              <InfoRow label="Disbursed Amount" value={
                viewModal.collateral.loan.disbursedAmount 
                  ? formatCurrency(viewModal.collateral.loan.disbursedAmount)
                  : 'N/A'
              } />
              <InfoRow label="Outstanding Principal" value={
                viewModal.collateral.loan.outstandingPrincipal 
                  ? formatCurrency(viewModal.collateral.loan.outstandingPrincipal)
                  : 'N/A'
              } />
              <InfoRow label="Interest Rate" value={
                viewModal.collateral.loan.annualInterestRate 
                  ? `${viewModal.collateral.loan.annualInterestRate}%`
                  : 'N/A'
              } />
              <InfoRow label="Loan Status" value={viewModal.collateral.loan.status} />
              <InfoRow label="Purpose" value={viewModal.collateral.loan.purposeOfLoan} />
              <InfoRow label="Branch" value={viewModal.collateral.loan.branchName} />
              <InfoRow label="Loan Officer" value={viewModal.collateral.loan.loanOfficer} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Loan Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoRow label="Disbursement Date" value={formatDate(viewModal.collateral.loan.disbursementDate)} />
              <InfoRow label="Maturity Date" value={formatDate(viewModal.collateral.loan.agreedMaturityDate)} />
              <InfoRow label="Days in Arrears" value={viewModal.collateral.loan.daysInArrears} />
              <InfoRow label="Last Updated" value={formatDate(viewModal.collateral.loan.updatedAt)} />
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
            <Tag className="w-5 h-5 mr-2 text-purple-600" />
            Extended Details
          </h3>
          <div className="space-y-2">
            <InfoRow label="Data Extension Status" value={
              isCollateralExtended(viewModal.collateral) ? 'Completed' : 'Pending'
            } />
            <InfoRow label="Extension Date" value={formatDate(viewModal.collateral.updatedAt)} />
            <InfoRow label="Account Number" value={viewModal.collateral.accountNumber} />
            <InfoRow label="Extended Collateral Type" value={viewModal.collateral.extendedCollateralType} />
            <InfoRow label="Extended Value" value={formatCurrency(viewModal.collateral.extendedCollateralValue)} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Financial Metrics
          </h3>
          <div className="space-y-2">
            <InfoRow label="Value Appreciation" value={
              viewModal.collateral.extendedCollateralValue && viewModal.collateral.collateralValue
                ? `${(((parseFloat(viewModal.collateral.extendedCollateralValue) - parseFloat(viewModal.collateral.collateralValue)) / parseFloat(viewModal.collateral.collateralValue)) * 100).toFixed(1)}%`
                : 'N/A'
            } />
            <InfoRow label="Coverage Ratio" value={
              viewModal.collateral.loan?.disbursedAmount 
                ? `${((parseFloat(viewModal.collateral.extendedCollateralValue || viewModal.collateral.collateralValue) / parseFloat(viewModal.collateral.loan.disbursedAmount)) * 100).toFixed(1)}%`
                : 'N/A'
            } />
          </div>
        </div>
      </div>
    </div>
  );

  // Guarantor Information Tab
  const renderGuarantorInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <User className="w-5 h-5 mr-2 text-green-600" />
            Guarantor Details
          </h3>
          <div className="space-y-2">
            <InfoRow label="Name" value={viewModal.collateral.guarantorName} />
            <InfoRow label="Phone" value={viewModal.collateral.guarantorPhone} />
            <InfoRow label="Address" value={viewModal.collateral.guarantorAddress} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            Contact Information
          </h3>
          <div className="space-y-2">
            <InfoRow label="Primary Contact" value={viewModal.collateral.guarantorPhone} />
            <InfoRow label="Location" value={viewModal.collateral.guarantorAddress} />
          </div>
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

  // Document Link Component
  const DocumentLink = ({ title, url }) => (
    <div className="flex items-center justify-between p-3 bg-white/60 rounded border border-white">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs transition-colors"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View
        </a>
      ) : (
        <span className="text-xs text-gray-400 italic">Not available</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-7 h-7 mr-3 text-blue-600" />
            Collateral Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and extend collateral information for loan applications
          </p>
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
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Total Collaterals"
            value={totals.total}
            icon={<Shield className="w-4 h-4" />}
            bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
            accentColor="bg-blue-400"
          />

          <StatCard
            title="Extended"
            value={totals.extended}
            icon={<CheckCircle className="w-4 h-4" />}
            bgGradient="bg-gradient-to-br from-green-400 to-green-600"
            accentColor="bg-green-400"
          />

          <StatCard
            title="Needs Extension"
            value={totals.needsExtension}
            icon={<AlertTriangle className="w-4 h-4" />}
            bgGradient="bg-gradient-to-br from-orange-400 to-orange-600"
            accentColor="bg-orange-400"
          />

          <StatCard
            title="Total Value"
            value={formatCurrency(totals.totalValue)}
            icon={<DollarSign className="w-4 h-4" />}
            bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
            accentColor="bg-purple-400"
          />
        </motion.div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search collaterals by ID, description, or guarantor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Collaterals Table */}
        <div className="bg-white rounded-lg shadow-sm  border border-gray-200">
          <div className="">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>

                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Guarantor
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Extended Info
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
                {collateralLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                        <span className="text-gray-600 text-sm">Loading collaterals...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCollaterals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        No collaterals found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCollaterals.map((collateral, index) => (
                    <tr key={collateral.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          {collateral.loan?.borrower && (
                            <div className="flex items-center text-xs text-gray-900">
                              <User className="w-3 h-3 mr-1 text-gray-400" />
                              {collateral.loan.borrower.firstName} {collateral.loan.borrower.lastName}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {collateral.guarantorName ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {collateral.guarantorName}
                            </div>
                            {collateral.guarantorPhone && (
                              <div className="text-xs text-gray-500">
                                {collateral.guarantorPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No guarantor</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {isCollateralExtended(collateral) ? (
                          <div className="space-y-1 text-xs">
                            {collateral.extendedCollateralType && (
                              <div className="text-gray-600">
                                Type: {collateral.extendedCollateralType}
                              </div>
                            )}
                            {collateral.extendedCollateralValue && (
                              <div className="text-gray-600">
                                Value: {formatCurrency(parseFloat(collateral.extendedCollateralValue) || 0)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not extended</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {isCollateralExtended(collateral) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Extended
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Needs Extension
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewClick(collateral)}
                            className="inline-flex items-center px-3 py-1.5 bg-[#5B7FA2] hover:bg-[#5B7FA2] text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleExtendClick(collateral)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {isCollateralExtended(collateral) ? 'Update' : 'Extend'}
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

        {/* View Collateral Modal */}
        {renderViewModal()}

        {/* Extend Collateral Modal */}
        <ExtendCollateralModal
          isOpen={extendModal.isOpen}
          onClose={() => setExtendModal({ isOpen: false, collateral: null })}
          collateral={extendModal.collateral}
          onSubmit={handleExtendSubmit}
        />
      </div>
    </div>
  );
};

export default CollateralManagementPage;