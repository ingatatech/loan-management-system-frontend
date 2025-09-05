// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { X, Send, User, Briefcase, Loader2, ArrowRight, MessageSquare } from 'lucide-react';

export const SelectReviewerModal = ({ isOpen, onClose, loan, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('board_director');
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && loan) {
      fetchReviewers();
    }
  }, [isOpen, loan, activeTab]);

  const fetchReviewers = async () => {
    setIsLoading(true);
    try {
      const organizationId = loan.organizationId;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/loan-applications/${loan.id}/workflow/available-reviewers`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // ✅ FIX: Extract the reviewers array from data.data.reviewers
        setReviewers(data.data?.reviewers || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviewers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedReviewer) {
      newErrors.reviewer = 'Please select a reviewer';
    }
    if (reviewMessage.trim().length < 10) {
      newErrors.message = 'Review message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        loanId: loan.id,
        reviewMessage: reviewMessage.trim(),
        forwardTo: selectedReviewer.id,
        forwardToRole: activeTab
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { key: 'board_director', label: 'Board Directors' },
    { key: 'senior_manager', label: 'Senior Managers' },
    { key: 'managing_director', label: 'Managing Directors' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Start Review Process</h2>
              <p className="text-sm text-blue-100">{loan?.loanId} - Select Initial Reviewer</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-medium text-sm transition-all relative ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* Review Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Review Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewMessage}
              onChange={(e) => {
                setReviewMessage(e.target.value);
                if (errors.message) setErrors({ ...errors, message: '' });
              }}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.message ? 'border-red-500' : ''
              }`}
              placeholder="Provide context for the reviewer about this loan application..."
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
          </div>

          {/* Reviewers List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Reviewer <span className="text-red-500">*</span>
            </label>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-600 mt-2">Loading reviewers...</p>
              </div>
            ) : reviewers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p>No reviewers available in this category</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reviewers.map(reviewer => (
                  <label
                    key={reviewer.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedReviewer?.id === reviewer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedReviewer?.id === reviewer.id}
                      onChange={() => {
                        setSelectedReviewer(reviewer);
                        if (errors.reviewer) setErrors({ ...errors, reviewer: '' });
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{reviewer.name}</p>
                          <p className="text-sm text-gray-500">{reviewer.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            <Briefcase className="w-3 h-3" />
                            {reviewer.roleLabel || reviewer.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.reviewer && <p className="text-red-500 text-sm mt-2">{errors.reviewer}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Starting Review Process</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The loan will be assigned to the selected reviewer</li>
              <li>• You will receive updates as the review progresses</li>
              <li>• The reviewer can forward to other levels as needed</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || reviewers.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Start Review Process
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ForwardLoanModal - For MANAGER to forward to next level
export const ForwardLoanModal = ({ isOpen, onClose, loan, onSubmit }) => {
  const [reviewMessage, setReviewMessage] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && loan) {
      fetchReviewers();
    }
  }, [isOpen, loan]);

  const fetchReviewers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${loan.organizationId}/loan-applications/${loan.id}/workflow/available-reviewers`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviewers(data.data?.reviewers || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviewers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedReviewer) newErrors.reviewer = 'Please select a reviewer';
    if (reviewMessage.trim().length < 10) {
      newErrors.message = 'Review message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // ✅ FIXED: Pass correct field names that backend expects
      await onSubmit({
        loanId: loan.id,
        reviewMessage: reviewMessage.trim(),
        decision: 'forward',
        forwardTo: selectedReviewer.id, 
        forwardToRole: selectedReviewer.role
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Review & Forward Loan</h2>
              <p className="text-sm text-purple-100">{loan?.loanId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewMessage}
              onChange={(e) => {
                setReviewMessage(e.target.value);
                if (errors.message) setErrors({ ...errors, message: '' });
              }}
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                errors.message ? 'border-red-500' : ''
              }`}
              placeholder="Add your review and recommendations..."
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Forward To <span className="text-red-500">*</span>
            </label>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              </div>
            ) : reviewers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p>No reviewers available. You may be at the final approval step.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reviewers.map(reviewer => (
                  <label
                    key={reviewer.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                      selectedReviewer?.id === reviewer.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedReviewer?.id === reviewer.id}
                      onChange={() => {
                        setSelectedReviewer(reviewer);
                        if (errors.reviewer) setErrors({ ...errors, reviewer: '' });
                      }}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{reviewer.name}</p>
                      <p className="text-sm text-gray-500">{reviewer.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {reviewer.roleLabel || reviewer.role}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {errors.reviewer && <p className="text-red-500 text-sm mt-2">{errors.reviewer}</p>}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || reviewers.length === 0}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Forwarding...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Forward Loan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { SelectReviewerModal, ForwardLoanModal };