// @ts-nocheck
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  UserPlus,
  Building,
  FileText,
  MapPin,
  CreditCard
} from 'lucide-react';
import { extendIndividualShareholder, extendInstitutionShareholder } from '@/lib/features/auth/shareholderSlice';
import toast from 'react-hot-toast';

const ExtendShareholderModals = ({ user }) => {
  const dispatch = useDispatch();
  const [extendModal, setExtendModal] = useState({
    isOpen: false,
    type: null,
    shareholderId: null,
    shareholderName: ''
  });

  const [individualExtendData, setIndividualExtendData] = useState({
    accountNumber: '',
    forename2: '',
    forename3: '',
    passportNo: '',
    placeOfBirth: '',
    postalAddressLine1: '',
    postalAddressLine2: '',
    town: '',
    country: 'Rwanda'
  });

  const [institutionExtendData, setInstitutionExtendData] = useState({
    accountNumber: '',
    tradingName: '',
    companyRegNo: '',
    postalAddressLine1: '',
    postalAddressLine2: '',
    town: '',
    country: 'Rwanda'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenExtendModal = (type, shareholderId, shareholderName) => {
    setExtendModal({
      isOpen: true,
      type,
      shareholderId,
      shareholderName
    });

    // Reset forms
    if (type === 'individual') {
      setIndividualExtendData({
        accountNumber: '',
        forename2: '',
        forename3: '',
        passportNo: '',
        placeOfBirth: '',
        postalAddressLine1: '',
        postalAddressLine2: '',
        town: '',
        country: 'Rwanda'
      });
    } else {
      setInstitutionExtendData({
        accountNumber: '',
        tradingName: '',
        companyRegNo: '',
        postalAddressLine1: '',
        postalAddressLine2: '',
        town: '',
        country: 'Rwanda'
      });
    }
  };

  const handleCloseExtendModal = () => {
    if (!isSubmitting) {
      setExtendModal({
        isOpen: false,
        type: null,
        shareholderId: null,
        shareholderName: ''
      });
    }
  };

  const handleIndividualExtendSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.organizationId || !extendModal.shareholderId) return;

    setIsSubmitting(true);

    try {
      await dispatch(extendIndividualShareholder({
        organizationId: user.organizationId,
        shareholderId: extendModal.shareholderId,
        extendedData: individualExtendData
      })).unwrap();

      toast.success('Individual shareholder information extended successfully');
      handleCloseExtendModal();
    } catch (error) {
      toast.error('Failed to extend shareholder information');
      console.error('Extend error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstitutionExtendSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.organizationId || !extendModal.shareholderId) return;

    setIsSubmitting(true);

    try {
      await dispatch(extendInstitutionShareholder({
        organizationId: user.organizationId,
        shareholderId: extendModal.shareholderId,
        extendedData: institutionExtendData
      })).unwrap();

      toast.success('Institution shareholder information extended successfully');
      handleCloseExtendModal();
    } catch (error) {
      toast.error('Failed to extend shareholder information');
      console.error('Extend error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIndividualExtendModal = () => (
    <AnimatePresence>
      {extendModal.isOpen && extendModal.type === 'individual' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseExtendModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#5B7FA2] px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Complete Individual Shareholder
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {extendModal.shareholderName}
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={handleCloseExtendModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleIndividualExtendSubmit} className="p-6 space-y-6">
              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.accountNumber}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter unique account number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Names
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forename or Initial 2
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.forename2}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, forename2: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Second forename or initial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forename or Initial 3
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.forename3}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, forename3: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Third forename or initial"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Identification Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.passportNo}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, passportNo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter passport number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.placeOfBirth}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, placeOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter place of birth"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Postal Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Address Line 1 (Number)
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.postalAddressLine1}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, postalAddressLine1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street number and name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Address Line 2 (Postal Code)
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.postalAddressLine2}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, postalAddressLine2: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Town
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.town}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, town: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter town/city"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={individualExtendData.country}
                      onChange={(e) => setIndividualExtendData({...individualExtendData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseExtendModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#5B7FA2] hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Complete Information
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderInstitutionExtendModal = () => (
    <AnimatePresence>
      {extendModal.isOpen && extendModal.type === 'institution' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseExtendModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Complete Institution Shareholder
                    </h3>
                    <p className="text-green-100 text-sm">
                      {extendModal.shareholderName}
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={handleCloseExtendModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleInstitutionExtendSubmit} className="p-6 space-y-6">
              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.accountNumber}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter unique account number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Institution Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trading Name (Alternative Name)
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.tradingName}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, tradingName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter trading name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Registration Number
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.companyRegNo}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, companyRegNo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter company reg number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Postal Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Address Line 1 (Number)
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.postalAddressLine1}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, postalAddressLine1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Street number and name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Address Line 2 (Postal Code)
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.postalAddressLine2}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, postalAddressLine2: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Town
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.town}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, town: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter town/city"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={institutionExtendData.country}
                      onChange={(e) => setInstitutionExtendData({...institutionExtendData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseExtendModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Complete Information
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {renderIndividualExtendModal()}
      {renderInstitutionExtendModal()}
    </>
  );
};

export default ExtendShareholderModals;