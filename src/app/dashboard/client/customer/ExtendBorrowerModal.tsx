// @ts-nocheck
"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  User,
  FileText,
  MapPin,
  Briefcase,
  DollarSign,
  CreditCard,
  Calendar,
  Tag
} from 'lucide-react';

const ExtendBorrowerModal = ({ isOpen, onClose, borrower, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    // Personal Details
    salutation: '',
    forename2: '',
    forename3: '',
    passportNo: '',
    nationality: '',
    taxNumber: '',
    drivingLicenseNumber: '',
    socialSecurityNumber: '',
    healthInsuranceNumber: '',
    dependantsCount: '',
    placeOfBirth: '',
    
    // Contact & Employment
    workPhone: '',
    homePhone: '',
    fax: '',
    employerName: '',
    employerAddress1: '',
    employerAddress2: '',
    employerTown: '',
    employerCountry: '',
    incomeFrequency: '',
    
    // Group & Account
    groupName: '',
    groupNumber: '',
    accountNumber: '',
    oldAccountNumber: '',
    accountType: '',
    accountStatus: '',
    classification: '',
    accountOwner: '',
    jointLoanParticipants: [],
    currencyType: '',
    dateOpened: '',
    termsDuration: '',
    repaymentTerm: '',
    
    // Financial
    creditLimit: '',
    currentBalance: '',
    availableCredit: '',
    currentBalanceIndicator: '',
    scheduledMonthlyPayment: '',
    actualPaymentAmount: '',
    amountPastDue: '',
    installmentsInArrears: '',
    daysInArrears: '',
    dateClosed: '',
    lastPaymentDate: '',
    interestRate: '',
    firstPaymentDate: '',
    
    // Categorization
    nature: '',
    category: '',
    sectorOfActivity: '',
    approvalDate: '',
    finalPaymentDate: ''
  });

  const [activeTab, setActiveTab] = useState('personal');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty values
    const filteredData = Object.keys(formData).reduce((acc, key) => {
      if (formData[key] !== '' && formData[key] !== null) {
        acc[key] = formData[key];
      }
      return acc;
    }, {});

    onSubmit(filteredData);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'contact', label: 'Contact & Employment', icon: Briefcase },
    { id: 'account', label: 'Account Details', icon: CreditCard },
    { id: 'financial', label: 'Financial Info', icon: DollarSign },
    { id: 'categorization', label: 'Categorization', icon: Tag }
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">
                      Complete Borrower Information
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {borrower?.firstName} {borrower?.lastName} - Consumer Details
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

              {/* Tabs */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Personal Details Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salutation
                      </label>
                      <select
                        name="salutation"
                        value={formData.salutation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Miss">Miss</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forename or Initial 2
                      </label>
                      <input
                        type="text"
                        name="forename2"
                        value={formData.forename2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Second forename"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forename or Initial 3
                      </label>
                      <input
                        type="text"
                        name="forename3"
                        value={formData.forename3}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Third forename"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        name="passportNo"
                        value={formData.passportNo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Passport number"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nationality"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Number
                      </label>
                      <input
                        type="text"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tax number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driving License No
                      </label>
                      <input
                        type="text"
                        name="drivingLicenseNumber"
                        value={formData.drivingLicenseNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="License number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Security Number
                      </label>
                      <input
                        type="text"
                        name="socialSecurityNumber"
                        value={formData.socialSecurityNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SSN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Health Insurance Number
                      </label>
                      <input
                        type="text"
                        name="healthInsuranceNumber"
                        value={formData.healthInsuranceNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Insurance number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No of Dependants
                      </label>
                      <input
                        type="number"
                        name="dependantsCount"
                        value={formData.dependantsCount}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Place of birth"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact & Employment Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b">
                    <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                    Contact & Employment Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Telephone
                      </label>
                      <input
                        type="tel"
                        name="workPhone"
                        value={formData.workPhone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+250 xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Home Telephone
                      </label>
                      <input
                        type="tel"
                        name="homePhone"
                        value={formData.homePhone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+250 xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fax
                      </label>
                      <input
                        type="tel"
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Fax number"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Name
                      </label>
                      <input
                        type="text"
                        name="employerName"
                        value={formData.employerName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Employer name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Income Frequency
                      </label>
                      <select
                        name="incomeFrequency"
                        value={formData.incomeFrequency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="annually">Annually</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Address Line 1
                      </label>
                      <input
                        type="text"
                        name="employerAddress1"
                        value={formData.employerAddress1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street address"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Address Line 2
                      </label>
                      <input
                        type="text"
                        name="employerAddress2"
                        value={formData.employerAddress2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional address info"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Town
                      </label>
                      <input
                        type="text"
                        name="employerTown"
                        value={formData.employerTown}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Town/City"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Country
                      </label>
                      <input
                        type="text"
                        name="employerCountry"
                        value={formData.employerCountry}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Details Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b">
                    <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                    Group & Account Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                      </label>
                      <input
                        type="text"
                        name="groupName"
                        value={formData.groupName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Group name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Number
                      </label>
                      <input
                        type="text"
                        name="groupNumber"
                        value={formData.groupNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Group number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Old Account Number
                      </label>
                      <input
                        type="text"
                        name="oldAccountNumber"
                        value={formData.oldAccountNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Previous account #"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <input
                        type="text"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Account type"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Status
                      </label>
                      <select
                        name="accountStatus"
                        value={formData.accountStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="closed">Closed</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classification
                      </label>
                      <input
                        type="text"
                        name="classification"
                        value={formData.classification}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Classification"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Owner
                      </label>
                      <input
                        type="text"
                        name="accountOwner"
                        value={formData.accountOwner}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Owner name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Type
                      </label>
                      <input
                        type="text"
                        name="currencyType"
                        value={formData.currencyType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., RWF, USD"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Opened
                      </label>
                      <input
                        type="date"
                        name="dateOpened"
                        value={formData.dateOpened}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terms Duration (months)
                      </label>
                      <input
                        type="number"
                        name="termsDuration"
                        value={formData.termsDuration}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Duration"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Repayment Term
                      </label>
                      <input
                        type="text"
                        name="repaymentTerm"
                        value={formData.repaymentTerm}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Monthly"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Information Tab */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b">
                    <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                    Financial & Loan Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credit Limit
                      </label>
                      <input
                        type="number"
                        name="creditLimit"
                        value={formData.creditLimit}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Balance
                      </label>
                      <input
                        type="number"
                        name="currentBalance"
                        value={formData.currentBalance}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Credit
                      </label>
                      <input
                        type="number"
                        name="availableCredit"
                        value={formData.availableCredit}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Balance Indicator
                      </label>
                      <input
                        type="text"
                        name="currentBalanceIndicator"
                        value={formData.currentBalanceIndicator}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., DR, CR"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Monthly Payment
                      </label>
                      <input
                        type="number"
                        name="scheduledMonthlyPayment"
                        value={formData.scheduledMonthlyPayment}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Payment Amount
                      </label>
                      <input
                        type="number"
                        name="actualPaymentAmount"
                        value={formData.actualPaymentAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount Past Due
                      </label>
                      <input
                        type="number"
                        name="amountPastDue"
                        value={formData.amountPastDue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Installments in Arrears
                      </label>
                      <input
                        type="number"
                        name="installmentsInArrears"
                        value={formData.installmentsInArrears}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Days in Arrears
                      </label>
                      <input
                        type="number"
                        name="daysInArrears"
                        value={formData.daysInArrears}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Closed
                      </label>
                      <input
                        type="date"
                        name="dateClosed"
                        value={formData.dateClosed}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Payment Date
                      </label>
                      <input
                        type="date"
                        name="lastPaymentDate"
                        value={formData.lastPaymentDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Payment Date
                      </label>
                      <input
                        type="date"
                        name="firstPaymentDate"
                        value={formData.firstPaymentDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Categorization Tab */}
              {activeTab === 'categorization' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center pb-2 border-b">
                    <Tag className="w-5 h-5 mr-2 text-red-600" />
                    Additional Categorization
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nature
                      </label>
                      <input
                        type="text"
                        name="nature"
                        value={formData.nature}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nature of account"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Category"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sector of Activity
                      </label>
                      <input
                        type="text"
                        name="sectorOfActivity"
                        value={formData.sectorOfActivity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Agriculture, Manufacturing, Services"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approval Date
                      </label>
                      <input
                        type="date"
                        name="approvalDate"
                        value={formData.approvalDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Final Payment Date
                      </label>
                      <input
                        type="date"
                        name="finalPaymentDate"
                        value={formData.finalPaymentDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Complete Borrower Profile
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

export default ExtendBorrowerModal;