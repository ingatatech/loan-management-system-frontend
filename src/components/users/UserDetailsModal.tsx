"use client";

import { 
  X, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  User,
  Shield,
  Clock,
  Building2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface UserDetailsModalProps {
  user: any;
  onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "manager":
        return "Manager/Director";
      case "staff":
        return "Loan Officer";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 border-green-200";
      case "client":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-[#5B7FA2] px-6 py-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  User Profile Details
                </h3>
                <p className="text-blue-100 text-sm">
                  {user.username} • {user.organization?.name || "Organization"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                {getRoleDisplay(user.role)}
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
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Profile Overview
                </h4>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-[#5B7FA2] flex items-center justify-center text-white text-2xl font-bold">
                    {user.firstName?.charAt(0) || user.username.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600 text-sm">@{user.username}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-1" />
                        {user.organization?.name || "Organization"}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Shield className="w-4 h-4 mr-1" />
                        {getRoleDisplay(user.role)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${
                    user.isActive 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    <div className="flex items-center">
                      {user.isActive ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          <span className="font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                  <Mail className="w-4 h-4 mr-2 text-green-600" />
                  Contact Information
                </h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Email Address</p>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status & Activity */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center uppercase tracking-wide">
                  <FileText className="w-4 h-4 mr-2 text-amber-600" />
                  Account Status & Activity
                </h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Account Status</p>
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-700">Active Account</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="font-medium text-red-700">Inactive Account</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Assigned Loans</p>
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">
                          {user.assignedLoansCount || 0} active loans
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Member Since</p>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">
                          {new Date(user.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Profile viewed {new Date().toLocaleTimeString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default UserDetailsModal;