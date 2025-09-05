// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  Shield,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

const ExtendCollateralModal = ({ isOpen, onClose, collateral, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    collateralType: '',
    collateralValue: '',
    collateralLastValuationDate: '',
    collateralExpiryDate: ''
  });

  useEffect(() => {
    if (collateral) {
      setFormData({
        accountNumber: collateral.accountNumber || '',
        collateralType: collateral.extendedCollateralType || '',
        collateralValue: collateral.extendedCollateralValue?.toString() || '',
        collateralLastValuationDate: collateral.collateralLastValuationDate || '',
        collateralExpiryDate: collateral.collateralExpiryDate || ''
      });
    }
  }, [collateral]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Filter out empty values
      const filteredData = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== '' && formData[key] !== null) {
          // Convert collateralValue to number if present
          if (key === 'collateralValue') {
            acc[key] = parseFloat(formData[key]);
          } else {
            acc[key] = formData[key];
          }
        }
        return acc;
      }, {});

      await onSubmit(collateral.id, filteredData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!collateral) return null;

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">
                      Extend Collateral Information
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {collateral.collateralId} - Complete Extended Details
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

            {/* Current Collateral Info */}
            <div className="p-6 border-b">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Current Collateral Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Type:</span>{' '}
                        <span className="text-blue-900">{collateral.collateralType}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Value:</span>{' '}
                        <span className="text-blue-900">{collateral.collateralValue?.toLocaleString()} RWF</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Guarantor:</span>{' '}
                        <span className="text-blue-900">{collateral.guarantorName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Description:</span>{' '}
                        <span className="text-blue-900">{collateral.description?.substring(0, 30)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Extended Collateral Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account Number */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>

                  {/* Collateral Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collateral Type (Extended)
                    </label>
                    <input
                      type="text"
                      name="collateralType"
                      value={formData.collateralType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Land Title, Vehicle Registration"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Specific collateral type classification
                    </p>
                  </div>

                  {/* Collateral Value (Extended) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collateral Value (Extended)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="collateralValue"
                        value={formData.collateralValue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Current market or appraised value
                    </p>
                  </div>

                  {/* Last Valuation Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collateral Last Valuation Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="collateralLastValuationDate"
                        value={formData.collateralLastValuationDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      When was the collateral last valued?
                    </p>
                  </div>

                  {/* Collateral Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collateral Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="collateralExpiryDate"
                        value={formData.collateralExpiryDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Validity expiration date (if applicable)
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Extended Information</p>
                      <p>
                        These fields provide additional details about the collateral that may be required
                        for regulatory reporting, risk assessment, or internal tracking purposes.
                        All fields are optional but recommended for complete documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Extended Information
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

export default ExtendCollateralModal;