// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  Send,
  Clock,
  User,
  Mail,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addLoanReview, fetchLoanReviews, clearLoanReviews } from '@/lib/features/auth/loanApplicationSlice';

export const LoanReviewModal = ({ isOpen, onClose, loan }) => {
  const dispatch = useDispatch();
  const { loanReviews, reviewsLoading, reviewCount } = useSelector(
    (state) => state.loanApplication
  );

  const [activeTab, setActiveTab] = useState('add');
  const [reviewMessage, setReviewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && loan) {
      dispatch(fetchLoanReviews(loan.id));
    }
    return () => {
      if (!isOpen) {
        dispatch(clearLoanReviews());
      }
    };
  }, [isOpen, loan, dispatch]);

  const handleSubmitReview = async () => {
    if (reviewMessage.trim().length < 10) {
      toast.error('Review message must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        addLoanReview({
          loanId: loan.id,
          reviewData: { reviewMessage }
        })
      ).unwrap();

      toast.success('Review added successfully! Notifications sent to managers and clients.');
      setReviewMessage('');
      setActiveTab('history');
    } catch (error) {
      toast.error(error || 'Failed to add review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !loan) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Loan Application Review
                </h3>
                <p className="text-blue-100 text-sm">
                  {loan.loanId} • {loan.borrower?.firstName} {loan.borrower?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {reviewCount} Review{reviewCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 transition-colors p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center px-4 py-3 font-medium text-sm transition-all relative ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Add Review
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-4 py-3 font-medium text-sm transition-all relative ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Review History ({reviewCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'add' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review Message
                </label>
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="Share your thoughts on this loan application... (minimum 10 characters)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px] resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {reviewMessage.length} characters
                  </span>
                  {reviewMessage.length >= 10 && (
                    <span className="flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid length
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Notification Alert
                    </h4>
                    <p className="text-xs text-amber-800">
                      When you submit this review, email notifications will be sent to all managers and clients 
                      in your organization. They will be able to view your review and the loan application details.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting || reviewMessage.trim().length < 10}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Review & Send Notifications
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : loanReviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-500">
                    Be the first to review this loan application
                  </p>
                </div>
              ) : (
                loanReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {review.reviewer.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Shield className="w-3 h-3" />
                            <span className="capitalize">{review.reviewer.role}</span>
                            <span>•</span>
                            <Mail className="w-3 h-3" />
                            <span>{review.reviewer.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(review.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {review.reviewMessage}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{reviewCount}</span> review{reviewCount !== 1 ? 's' : ''} • 
            Last updated {reviewCount > 0 && loanReviews[0] 
              ? new Date(loanReviews[0].createdAt).toLocaleDateString() 
              : 'N/A'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};