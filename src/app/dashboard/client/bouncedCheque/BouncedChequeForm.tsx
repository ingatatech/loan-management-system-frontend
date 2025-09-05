// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  FileX,
  AlertCircle,
  User,
  Building,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign
} from 'lucide-react';

const BouncedChequeForm = ({ isOpen, onClose, cheque, onSubmit, mode = 'create' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    type: 'individual',
    // Individual fields
    surname: '',
    forename1: '',
    forename2: '',
    forename3: '',
    nationalId: '',
    dateOfBirth: '',
    placeOfBirth: '',
    // Institution fields
    institutionName: '',
    tradingName: '',
    companyRegNo: '',
    companyRegistrationDate: '',
    // Common fields
    passportNo: '',
    nationality: '',
    postalAddressLine1: '',
    postalAddressLine2: '',
    town: '',
    postalCode: '',
    country: 'Rwanda',
    // Cheque details
    chequeNumber: '',
    chequeDate: '',
    reportedDate: new Date().toISOString().split('T')[0],
    currency: 'RWF',
    amount: '',
    returnedChequeReason: 'insufficient_funds',
    beneficiaryName: '',
    notes: ''
  });

  useEffect(() => {
    if (cheque && mode === 'edit') {
      setFormData({
        accountNumber: cheque.accountNumber || '',
        type: cheque.type || 'individual',
        surname: cheque.surname || '',
        forename1: cheque.forename1 || '',
        forename2: cheque.forename2 || '',
        forename3: cheque.forename3 || '',
        nationalId: cheque.nationalId || '',
        dateOfBirth: cheque.dateOfBirth ? new Date(cheque.dateOfBirth).toISOString().split('T')[0] : '',
        placeOfBirth: cheque.placeOfBirth || '',
        institutionName: cheque.institutionName || '',
        tradingName: cheque.tradingName || '',
        companyRegNo: cheque.companyRegNo || '',
        companyRegistrationDate: cheque.companyRegistrationDate ? new Date(cheque.companyRegistrationDate).toISOString().split('T')[0] : '',
        passportNo: cheque.passportNo || '',
        nationality: cheque.nationality || '',
        postalAddressLine1: cheque.postalAddressLine1 || '',
        postalAddressLine2: cheque.postalAddressLine2 || '',
        town: cheque.town || '',
        postalCode: cheque.postalCode || '',
        country: cheque.country || 'Rwanda',
        chequeNumber: cheque.chequeNumber || '',
        chequeDate: cheque.chequeDate ? new Date(cheque.chequeDate).toISOString().split('T')[0] : '',
        reportedDate: cheque.reportedDate ? new Date(cheque.reportedDate).toISOString().split('T')[0] : '',
        currency: cheque.currency || 'RWF',
        amount: cheque.amount?.toString() || '',
        returnedChequeReason: cheque.returnedChequeReason || 'insufficient_funds',
        beneficiaryName: cheque.beneficiaryName || '',
        notes: cheque.notes || ''
      });
    }
  }, [cheque, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const returnReasons = [
    { value: 'insufficient_funds', label: 'Insufficient Funds' },
    { value: 'account_closed', label: 'Account Closed' },
    { value: 'signature_mismatch', label: 'Signature Mismatch' },
    { value: 'post_dated', label: 'Post Dated' },
    { value: 'payment_stopped', label: 'Payment Stopped' },
    { value: 'refer_to_drawer', label: 'Refer to Drawer' },
    { value: 'technical_reason', label: 'Technical Reason' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#5B7FA2] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full">
                    <FileX className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">
                      {mode === 'create' ? 'Create Bounced Cheque Record' : 'Edit Bounced Cheque'}
                    </h3>
                    <p className="text-red-100 text-sm">
                      Record bounced cheque information
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Account & Type */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b mb-4">
                    <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="individual">Individual</option>
                        <option value="institution">Institution</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Individual Fields */}
                {formData.type === 'individual' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b mb-4">
                      <User className="w-5 h-5 mr-2 text-red-600" />
                      Individual Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surname <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                          required={formData.type === 'individual'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forename 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="forename1"
                          value={formData.forename1}
                          onChange={handleChange}
                          required={formData.type === 'individual'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forename 2
                        </label>
                        <input
                          type="text"
                          name="forename2"
                          value={formData.forename2}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forename 3
                        </label>
                        <input
                          type="text"
                          name="forename3"
                          value={formData.forename3}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          National ID
                        </label>
                        <input
                          type="text"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          maxLength={16}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Place of Birth
                        </label>
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Institution Fields */}
                {formData.type === 'institution' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b mb-4">
                      <Building className="w-5 h-5 mr-2 text-red-600" />
                      Institution Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="institutionName"
                          value={formData.institutionName}
                          onChange={handleChange}
                          required={formData.type === 'institution'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trading Name
                        </label>
                        <input
                          type="text"
                          name="tradingName"
                          value={formData.tradingName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Reg No
                        </label>
                        <input
                          type="text"
                          name="companyRegNo"
                          value={formData.companyRegNo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Registration Date
                        </label>
                        <input
                          type="date"
                          name="companyRegistrationDate"
                          value={formData.companyRegistrationDate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Fields */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b mb-4">
                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                    Contact & Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport No
                      </label>
                      <input
                        type="text"
                        name="passportNo"
                        value={formData.passportNo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Address Line 1
                      </label>
                      <input
                        type="text"
                        name="postalAddressLine1"
                        value={formData.postalAddressLine1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Address Line 2
                      </label>
                      <input
                        type="text"
                        name="postalAddressLine2"
                        value={formData.postalAddressLine2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Town
                      </label>
                      <input
                        type="text"
                        name="town"
                        value={formData.town}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Cheque Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b mb-4">
                    <FileX className="w-5 h-5 mr-2 text-red-600" />
                    Cheque Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="chequeNumber"
                        value={formData.chequeNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="chequeDate"
                        value={formData.chequeDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reported Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="reportedDate"
                        value={formData.reportedDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Returned Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="returnedChequeReason"
                        value={formData.returnedChequeReason}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {returnReasons.map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beneficiary Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="beneficiaryName"
                        value={formData.beneficiaryName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#5B7FA2] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {mode === 'create' ? 'Create Record' : 'Update Record'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BouncedChequeForm;