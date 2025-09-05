"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { deactivateUser, fetchUsers } from "@/lib/features/users/userSlice";
import { 
  AlertTriangle, 
  X, 
  User, 
  FileText, 
  Loader2,
  Shield,
  Users,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface DeactivateUserModalProps {
  user: any;
  onClose: () => void;
}

export function DeactivateUserModal({ user, onClose }: DeactivateUserModalProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { users, isUpdating } = useAppSelector((state) => state.user);

  const [reassignTo, setReassignTo] = useState<number | undefined>();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeUsers = users.filter((u) => u.id !== user?.id && u.isActive);
  const hasAssignedLoans = user?.assignedLoansCount && user.assignedLoansCount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.organizationId || !user) return;

    // Validation
    if (hasAssignedLoans && !reassignTo) {
      setError("Please select a user to reassign the active loans");
      return;
    }

    setError(null);

    try {
      const result = await dispatch(
        deactivateUser({
          organizationId: currentUser.organizationId,
          userId: user.id,
          reassignTo,
          reason: reason.trim() || undefined,
        })
      ).unwrap();

      if (result.type === "users/deactivate/fulfilled") {
        toast.success("User deactivated successfully!");
        dispatch(fetchUsers({ organizationId: currentUser.organizationId, filters: {} }));
        onClose();
      }
    } catch (error: any) {
      setError(error.message || "Failed to deactivate user");
      toast.error("Failed to deactivate user");
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 border-b border-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Deactivate User Account
                </h3>
                <p className="text-red-100 text-sm">
                  {user.firstName} {user.lastName} • @{user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {user.isActive ? "Active" : "Inactive"}
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Action Required
                  </h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Warning Section */}
            <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-red-100 to-rose-100 px-4 py-3 border-b border-red-200">
                <h4 className="text-sm font-semibold text-red-800 flex items-center uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                  Important Notice
                </h4>
              </div>
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-sm text-red-800 font-medium">
                      You are about to deactivate this user account. This action will:
                    </p>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Immediately revoke system access for this user</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Prevent the user from logging into the system</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Preserve all user data and activity history</span>
                      </li>
                      {hasAssignedLoans && (
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>
                            Require reassignment of <strong>{user.assignedLoansCount} active loans</strong>
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Reassignment Section */}
            {hasAssignedLoans && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-200">
                  <h4 className="text-sm font-semibold text-amber-800 flex items-center uppercase tracking-wide">
                    <FileText className="w-4 h-4 mr-2 text-amber-600" />
                    Loan Reassignment Required
                  </h4>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium mb-2">
                        This user has {user.assignedLoansCount} active loan(s) that must be reassigned.
                      </p>
                      <p className="text-sm text-amber-700">
                        Please select an active user to transfer these loans to. The selected user will become responsible for managing these loans.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Loans To <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={reassignTo || ""}
                        onChange={(e) => {
                          setReassignTo(Number(e.target.value) || undefined);
                          setError(null);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        required
                      >
                        <option value="">Select a user to transfer loans...</option>
                        {activeUsers.map((activeUser) => (
                          <option key={activeUser.id} value={activeUser.id}>
                            {activeUser.firstName} {activeUser.lastName} - 
                            {activeUser.role === "manager" ? " Manager/Director" : " Loan Officer"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Only active users with the same or higher role level are shown
                    </p>
                  </div>

                  {activeUsers.length === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">
                        No active users available for loan reassignment. You must have at least one other active user to proceed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reason for Deactivation */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Deactivation Details
                </h4>
              </div>
              <div className="p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Deactivation (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Provide a reason for deactivating this user account (e.g., Employee left the company, role change, etc.)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This information will be stored in the system logs for audit purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Final Confirmation */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-2">
                    Final Confirmation Required
                  </h4>
                  <p className="text-sm text-red-700">
                    Please review all information carefully. This action cannot be undone automatically. 
                    The user will need to be reactivated by an administrator if access needs to be restored.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            User ID: <span className="font-mono">{user.id}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isUpdating || (hasAssignedLoans && activeUsers.length === 0)}
              className="flex items-center px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Confirm Deactivation
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DeactivateUserModal;