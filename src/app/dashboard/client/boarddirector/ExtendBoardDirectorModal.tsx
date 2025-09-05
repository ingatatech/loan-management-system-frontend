// @ts-nocheck
"use client"

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  UserPlus,
  FileText,
  MapPin,
  CreditCard,
  Calendar
} from 'lucide-react';
import { extendBoardDirector } from '@/lib/features/auth/management-slice';
import toast from 'react-hot-toast';

interface ExtendBoardDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  directorId: number;
  directorName: string;
}

const ExtendBoardDirectorModal: React.FC<ExtendBoardDirectorModalProps> = ({
  isOpen,
  onClose,
  directorId,
  directorName
}) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [extendData, setExtendData] = useState({
    accountNumber: '',
    salutation: '',
    surname: '',
    forename1: '',
    forename2: '',
    forename3: '',
    nationalIdNumber: '',
    passportNo: '',
    dateOfBirth: '',
    placeOfBirth: '',
    postalAddressLine1: '',
    postalCode: '',
    town: '',
  });

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form
      setExtendData({
        accountNumber: '',
        salutation: '',
        surname: '',
        forename1: '',
        forename2: '',
        forename3: '',
        nationalIdNumber: '',
        passportNo: '',
        dateOfBirth: '',
        placeOfBirth: '',
        postalAddressLine1: '',
        postalCode: '',
        town: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty values
      const filteredData = Object.entries(extendData).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      await dispatch(extendBoardDirector({
        id: directorId,
        extendedData: filteredData
      })).unwrap();

      toast.success('Board director information completed successfully');
      handleClose();
    } catch (error: any) {
      toast.error(error || 'Failed to complete board director information');
      console.error('Extend error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#5B7FA2] px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <UserPlus className="w-6 h-6 text-[#5B7FA2]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Complete Board Director Register
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {directorName}
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Account Information */}
              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={extendData.accountNumber}
                      onChange={(e) => setExtendData({...extendData, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter unique account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salutation
                    </label>
                    <select
                      value={extendData.salutation}
                      onChange={(e) => setExtendData({...extendData, salutation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Salutation</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Names */}
              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                  Full Name Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname
                    </label>
                    <input
                      type="text"
                      value={extendData.surname}
                      onChange={(e) => setExtendData({...extendData, surname: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter surname"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forename or Initial 1
                    </label>
                    <input
                      type="text"
                      value={extendData.forename1}
                      onChange={(e) => setExtendData({...extendData, forename1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First forename or initial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forename or Initial 2
                    </label>
                    <input
                      type="text"
                      value={extendData.forename2}
                      onChange={(e) => setExtendData({...extendData, forename2: e.target.value})}
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
                      value={extendData.forename3}
                      onChange={(e) => setExtendData({...extendData, forename3: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Third forename or initial"
                    />
                  </div>
                </div>
              </div>

              {/* Identification Details */}
              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                  Identification & Birth Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      value={extendData.nationalIdNumber}
                      onChange={(e) => setExtendData({...extendData, nationalIdNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter national ID number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={extendData.passportNo}
                      onChange={(e) => setExtendData({...extendData, passportNo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter passport number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={extendData.dateOfBirth}
                        onChange={(e) => setExtendData({...extendData, dateOfBirth: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      value={extendData.placeOfBirth}
                      onChange={(e) => setExtendData({...extendData, placeOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter place of birth"
                    />
                  </div>
                </div>
              </div>

              {/* Postal Address */}
              <div>
                <h4 className="text-md font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                  Postal Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Address Line 1
                    </label>
                    <input
                      type="text"
                      value={extendData.postalAddressLine1}
                      onChange={(e) => setExtendData({...extendData, postalAddressLine1: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street number and name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={extendData.postalCode}
                      onChange={(e) => setExtendData({...extendData, postalCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Town
                    </label>
                    <input
                      type="text"
                      value={extendData.town}
                      onChange={(e) => setExtendData({...extendData, town: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter town/city"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
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
                      Complete Register
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
};

export default ExtendBoardDirectorModal;