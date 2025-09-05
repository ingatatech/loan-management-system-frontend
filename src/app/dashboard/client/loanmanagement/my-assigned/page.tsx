// @ts-nocheck

"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchMyAssignedLoans,
  getWorkflowForLoan,
  getAvailableReviewers,
  addReviewWithWorkflow,
  clearForwardSuccess,
} from "@/lib/features/workflow/workflowSlice";
import {
  ClipboardList,
  Search,
  Eye,
  Send,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GitBranch,
  ArrowRight,
  Calendar,
} from "lucide-react";
import ForwardLoanModal from "@/components/workflow/ForwardLoanModal";
import {WorkflowHistoryModal} from "@/components/workflow/WorkflowHistoryModal";

export default function MyAssignedLoansPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myAssignedLoans, isLoading, pagination, forwardSuccess } = useAppSelector(
    (state) => state.workflow
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (user?.organizationId) {
      dispatch(
        fetchMyAssignedLoans({
          organizationId: user.organizationId,
          page: 1,
          limit: 20,
        })
      );
    }
  }, [dispatch, user?.organizationId]);

  useEffect(() => {
    if (forwardSuccess) {
      setShowForwardModal(false);
      setSelectedLoanId(null);
      dispatch(clearForwardSuccess());
      // Refresh list
      if (user?.organizationId) {
        dispatch(
          fetchMyAssignedLoans({
            organizationId: user.organizationId,
            page: 1,
            limit: 20,
          })
        );
      }
    }
  }, [forwardSuccess, dispatch, user?.organizationId]);

  const filteredLoans = myAssignedLoans.filter((workflow) => {
    const loan = workflow.loan;
    const borrower = loan?.borrower;
    const searchLower = searchTerm.toLowerCase();

    return (
      loan?.loanId?.toLowerCase().includes(searchLower) ||
      borrower?.firstName?.toLowerCase().includes(searchLower) ||
      borrower?.lastName?.toLowerCase().includes(searchLower) ||
      borrower?.nationalId?.toLowerCase().includes(searchLower)
    );
  });

  const getStepBadgeColor = (step: string) => {
    switch (step) {
      case "loan_officer":
        return "bg-blue-100 text-blue-700";
      case "board_director":
        return "bg-purple-100 text-purple-700";
      case "senior_manager":
        return "bg-orange-100 text-orange-700";
      case "managing_director":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStepLabel = (step: string) => {
    const labels: Record<string, string> = {
      loan_officer: "Loan Officer Review",
      board_director: "Board Director Review",
      senior_manager: "Senior Manager Review",
      managing_director: "Managing Director Approval",
    };
    return labels[step] || step;
  };

  const getDaysSinceAssignment = (startedAt: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Loans</h1>
        <p className="text-gray-600 mt-1">
          Loan applications assigned to you for review
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {myAssignedLoans.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Action</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {myAssignedLoans.filter((w) => w.status === "in_progress").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {myAssignedLoans
                  .reduce((sum, w) => sum + (w.loan?.disbursedAmount || 0), 0)
                  .toLocaleString()}{" "}
                RWF
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by loan ID, borrower name, or national ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loan Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Days Pending
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600 mt-2">Loading assigned loans...</p>
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-600 mt-2">
                      {searchTerm
                        ? "No loans found matching your search"
                        : "No loans assigned to you"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((workflow) => {
                  const loan = workflow.loan;
                  const borrower = loan?.borrower;
                  const daysPending = getDaysSinceAssignment(workflow.startedAt);

                  return (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{loan?.loanId}</p>
                          <p className="text-sm text-gray-500">
                            {loan?.purposeOfLoan?.substring(0, 40)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {borrower?.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {borrower?.firstName} {borrower?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{borrower?.nationalId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {loan?.disbursedAmount?.toLocaleString()} RWF
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStepBadgeColor(
                            workflow.currentStep
                          )}`}
                        >
                          {getStepLabel(workflow.currentStep)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock
                            className={`w-4 h-4 ${
                              daysPending > 3 ? "text-red-500" : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              daysPending > 3 ? "text-red-600" : "text-gray-700"
                            }`}
                          >
                            {daysPending} {daysPending === 1 ? "day" : "days"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedLoanId(loan.id);
                              setShowHistoryModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Workflow History"
                          >
                            <GitBranch className="w-5 h-5 text-gray-600" />
                          </button>
                          <a
                            href={`/dashboard/client/loanmanagement/pendingLoan?loanId=${loan.id}`}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Loan Details"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </a>
                          <button
                            onClick={() => {
                              setSelectedLoanId(loan.id);
                              setShowForwardModal(true);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Review & Forward
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showForwardModal && selectedLoanId && (
        <ForwardLoanModal
          loanId={selectedLoanId}
          onClose={() => {
            setShowForwardModal(false);
            setSelectedLoanId(null);
          }}
        />
      )}

      {showHistoryModal && selectedLoanId && (
        <WorkflowHistoryModal
          loanId={selectedLoanId}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedLoanId(null);
          }}
        />
      )}
    </div>
  );
}