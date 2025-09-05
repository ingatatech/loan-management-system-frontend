"use client";

import { 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Calendar, 
  Loader2, 
  X, 
  RefreshCw,
  Clock,
  User,
  FileText,
  AlertCircle,
  TrendingUp,
  Activity,
  Send,
  CheckCircle,
  Ban
} from "lucide-react";

interface WorkflowHistoryModalProps {
  isOpen: boolean;
  loanId: number | null;
  onClose: () => void;
  workflowHistory: any; 
  isLoading?: boolean;
  onRetry?: () => void; 
}

export function WorkflowHistoryModal({ 
  isOpen, 
  loanId, 
  onClose, 
  workflowHistory, 
  isLoading = false,
  onRetry 
}: WorkflowHistoryModalProps) {

  if (!isOpen) return null;

  // Format role for display (remove underscores and capitalize)
  const formatRole = (role: string) => {
    if (!role) return "";
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format status for display (keep original formatting, just capitalize)
  const formatStatus = (status: string) => {
    if (!status) return "";
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "forwarded":
      case "forward":
        return <Send className="w-4 h-4 text-purple-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <Ban className="w-4 h-4 text-red-600" />;
      case "reviewed":
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return "bg-blue-100 border-blue-200";
      case "forwarded":
      case "forward":
        return "bg-purple-100 border-purple-200";
      case "approved":
        return "bg-green-100 border-green-200";
      case "rejected":
        return "bg-red-100 border-red-200";
      case "reviewed":
        return "bg-blue-100 border-blue-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (days: number) => {
    if (days === 0) return "Less than a day";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Enhanced Header */}
        <div className="bg-[#5B7FA2] px-5 py-3 border-b border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Workflow History</h2>
                <p className="text-xs text-purple-100">
                  Complete loan review timeline • Loan #{loanId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRetry && (
                <button 
                  onClick={onRetry}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 group"
                  title="Refresh history"
                >
                  <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                <div className="absolute inset-0 w-10 h-10 animate-ping text-purple-400 opacity-20">
                  <Loader2 className="w-10 h-10" />
                </div>
              </div>
              <p className="text-gray-600 mt-3 text-sm font-medium">Loading workflow history...</p>
              <p className="text-gray-400 text-xs mt-1">Please wait</p>
            </div>
          ) : workflowHistory && workflowHistory.history && workflowHistory.history.length > 0 ? (
            <div className="space-y-4">
              {/* Workflow Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Current Step</span>
                  </div>
                  <p className="text-sm font-bold text-blue-900">
                    {formatRole(workflowHistory.currentStep) || "N/A"}
                  </p>
                </div>

                <div className={`bg-gradient-to-br rounded-lg p-3 border ${
                  workflowHistory.status?.toLowerCase() === 'approved' ? 'from-green-50 to-green-100 border-green-200' :
                  workflowHistory.status?.toLowerCase() === 'rejected' ? 'from-red-50 to-red-100 border-red-200' :
                  'from-yellow-50 to-yellow-100 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    {workflowHistory.status?.toLowerCase() === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                     workflowHistory.status?.toLowerCase() === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                     <Clock className="w-4 h-4 text-yellow-600" />}
                    <span className="text-xs font-medium text-gray-700">Status</span>
                  </div>
                  <p className={`text-sm font-bold capitalize ${
                    workflowHistory.status?.toLowerCase() === 'approved' ? 'text-green-900' :
                    workflowHistory.status?.toLowerCase() === 'rejected' ? 'text-red-900' :
                    'text-yellow-900'
                  }`}>
                    {formatStatus(workflowHistory.status) || "N/A"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Total Duration</span>
                  </div>
                  <p className="text-sm font-bold text-purple-900">
                    {workflowHistory.totalDuration !== null ? formatDuration(workflowHistory.totalDuration) : "N/A"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-700">Current Step</span>
                  </div>
                  <p className="text-sm font-bold text-indigo-900">
                    {formatDuration(workflowHistory.currentStepDuration || 0)}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                  <GitBranch className="w-4 h-4 mr-2 text-purple-600" />
                  Timeline ({workflowHistory.history.length} events)
                </h3>

                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-gray-200" />

                  <div className="space-y-4">
                    {workflowHistory.history.map((entry: any, index: number) => (
                      <div key={index} className="relative flex gap-3">
                        {/* Timeline Node */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md ${getActionColor(entry.action)}`}>
                            {getActionIcon(entry.action)}
                          </div>
                          {/* Connector dot */}
                          {index < workflowHistory.history.length - 1 && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-10 w-1 h-4 bg-gradient-to-b from-gray-300 to-transparent" />
                          )}
                        </div>

                        {/* Event Card */}
                        <div className="flex-1 pb-3">
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 capitalize text-sm">
                                    {entry.action.replace("_", " ")}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(entry.action)}`}>
                                    {entry.action}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <User className="w-3 h-3" />
                                  <span className="font-medium">
                                    {entry.fromUserName || entry.toUserName || "System"}
                                  </span>
                                  {entry.fromUserRole && (
                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                      {formatRole(entry.fromUserRole)}
                                    </span>
                                  )}
                                  {!entry.fromUserRole && entry.toUserRole && (
                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                      {formatRole(entry.toUserRole)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">{formatDate(entry.timestamp)}</span>
                              </div>
                            </div>

                            {/* Message */}
                            {entry.message && (
                              <div className="mt-2 bg-white rounded-md p-2 border border-gray-200">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {entry.message}
                                </p>
                              </div>
                            )}

                            {/* Forward Details */}
                            {entry.action === "forwarded" && entry.toUser && (
                              <div className="mt-2 flex items-center gap-2 text-xs bg-purple-50 border border-purple-100 rounded-md p-2">
                                <ArrowRight className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                <span className="text-gray-600">Forwarded to:</span>
                                <span className="font-semibold text-gray-900">
                                  {entry.toUser.name}
                                </span>
                                <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs font-medium ml-auto">
                                  {formatRole(entry.toUser.role)}
                                </span>
                              </div>
                            )}

                            {/* Additional Metadata */}
                            {(entry.fromUser || entry.toStep) && (
                              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                {entry.fromUser && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    From: {entry.fromUser.name}
                                  </span>
                                )}
                                {entry.toStep && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    Step: {formatRole(entry.toStep)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Summary Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Workflow Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-indigo-700 font-medium">Current Status</span>
                        <p className={`text-sm font-bold mt-1 capitalize px-2 py-1 rounded inline-block ${getStatusBadgeColor(workflowHistory.status)}`}>
                          {formatStatus(workflowHistory.status)}
                        </p>
                      </div>
                      <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-indigo-700 font-medium">Current Step</span>
                        <p className="text-sm font-bold text-indigo-900 mt-1">
                          {formatRole(workflowHistory.currentStep) || "N/A"}
                        </p>
                      </div>
                      <GitBranch className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-indigo-700 font-medium">Total Duration</span>
                        <p className="text-sm font-bold text-indigo-900 mt-1">
                          {workflowHistory.totalDuration !== null ? formatDuration(workflowHistory.totalDuration) : "N/A"}
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-indigo-700 font-medium">Step Duration</span>
                        <p className="text-sm font-bold text-indigo-900 mt-1">
                          {formatDuration(workflowHistory.currentStepDuration || 0)}
                        </p>
                      </div>
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <GitBranch className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-1">No Workflow History</p>
              <p className="text-gray-500 text-sm mb-4">
                No workflow events have been recorded for this loan yet.
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}