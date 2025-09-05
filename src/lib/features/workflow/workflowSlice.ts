import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
export interface WorkflowHistoryEntry {
  timestamp: string;
  action: string;
  fromUserId?: number;
  fromUserName?: string;
  toUserId?: number;
  toUserName?: string;
  message?: string;
  decision?: string;
}

export interface LoanWorkflow {
  id: number;
  loanId: number;
  currentStep: string;
  currentAssigneeId: number;
  status: string;
  workflowHistory: WorkflowHistoryEntry[];
  startedAt: string;
  completedAt: string | null;
  loan: any; // Full loan object with borrower
  currentAssignee: any;
}

export interface AvailableReviewer {
  id: number;
  name: string;
  email: string;
  role: string;
  currentWorkload: number;
  isAvailable: boolean;
}

export interface WorkflowState {
  myAssignedLoans: LoanWorkflow[];
  currentWorkflow: LoanWorkflow | null;
    workflowHistory: null;
  availableReviewers: AvailableReviewer[];
  isLoading: boolean;
  isForwarding: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  forwardSuccess: boolean;
}

const initialState: WorkflowState = {
  myAssignedLoans: [],
  currentWorkflow: null,
  availableReviewers: [],
  workflowHistory: null,
  isLoading: false,
  isForwarding: false,
  error: null,
  pagination: null,
  forwardSuccess: false,
};

// Async Thunks


export const startLoanReview = createAsyncThunk(
  "workflow/startReview",
  async (
    {
      organizationId,
      loanId,
      reviewMessage,
      forwardTo,
      forwardToRole,
    }: {
      organizationId: number;
      loanId: number;
      reviewMessage: string;
      forwardTo: number;
      forwardToRole: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/organizations/${organizationId}/loan-applications/${loanId}/reviews`,
        {
          reviewMessage,
          forwardTo,
          forwardToRole,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start review"
      );
    }
  }
);



// In workflowSlice.ts - REPLACE addReviewWithWorkflow thunk

/**
 * Add review with workflow (MANAGER/CLIENT)
 * ✅ FIXED: Sends correct field names to backend
 */
export const addReviewWithWorkflow = createAsyncThunk(
  "workflow/addReview",
  async (
    {
      organizationId,
      loanId,
      reviewMessage,
      decision,
      forwardTo,        // ✅ Changed from nextReviewerId
      forwardToRole,    // ✅ Added forwardToRole
    }: {
      organizationId: number;
      loanId: number;
      reviewMessage: string;
      decision?: string;
      forwardTo?: number;      // ✅ Changed from nextReviewerId
      forwardToRole?: string;  // ✅ Added forwardToRole
    },
    { rejectWithValue }
  ) => {
    try {
      // ✅ FIXED: Send correct field names that backend expects
      const payload: any = {
        reviewMessage,
      };

      if (decision) {
        payload.decision = decision;
      }

      if (forwardTo) {
        payload.forwardTo = forwardTo;  // ✅ Changed from nextReviewerId
      }

      if (forwardToRole) {
        payload.forwardToRole = forwardToRole;  // ✅ Added forwardToRole
      }

      console.log('Sending review payload:', payload);  // ✅ Debug log

      const response = await api.post(
        `/organizations/${organizationId}/loan-applications/${loanId}/reviews`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error('Review error:', error.response?.data);  // ✅ Debug log
      return rejectWithValue(
        error.response?.data?.message || "Failed to add review"
      );
    }
  }
);

export const fetchMyAssignedLoans = createAsyncThunk(
  "workflow/fetchMyAssignedLoans",
  async (
    {
      organizationId,
      page = 1,
      limit = 10,
      status,
    }: {
      organizationId: number;
      page?: number;
      limit?: number;
      status?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      const response = await api.get(
        `/organizations/${organizationId}/loan-applications/my-assigned-loans?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assigned loans"
      );
    }
  }
);

/**
 * Get workflow for specific loan
 */
export const getWorkflowForLoan = createAsyncThunk(
  "workflow/getWorkflow",
  async (
    { organizationId, loanId }: { organizationId: number; loanId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/organizations/${organizationId}/loan-applications/${loanId}/workflow`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch workflow"
      );
    }
  }
);

/**
 * Get workflow history
 */
export const getWorkflowHistory = createAsyncThunk(
  "workflow/getHistory",
  async (
    { organizationId, loanId }: { organizationId: number; loanId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/organizations/${organizationId}/loan-applications/${loanId}/workflow/history`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch workflow history"
      );
    }
  }
);

/**
 * Get available reviewers for next step
 */
export const getAvailableReviewers = createAsyncThunk(
  "workflow/getAvailableReviewers",
  async (
    { organizationId, loanId }: { organizationId: number; loanId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/organizations/${organizationId}/loan-applications/${loanId}/workflow/available-reviewers`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch available reviewers"
      );
    }
  }
);

/**
 * Forward loan to next reviewer
 */
export const forwardLoan = createAsyncThunk(
  "workflow/forward",
  async (
    {
      organizationId,
      loanId,
      toUserId,
      message,
    }: {
      organizationId: number;
      loanId: number;
      toUserId: number;
      message: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/organizations/${organizationId}/loan-applications/${loanId}/workflow/forward`,
        { toUserId, message }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to forward loan"
      );
    }
  }
);



/**
 * Reassign loan
 */
export const reassignLoan = createAsyncThunk(
  "workflow/reassign",
  async (
    {
      organizationId,
      loanId,
      fromUserId,
      toUserId,
      reason,
    }: {
      organizationId: number;
      loanId: number;
      fromUserId: number;
      toUserId: number;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/organizations/${organizationId}/loan-applications/${loanId}/workflow/reassign`,
        { fromUserId, toUserId, reason }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reassign loan"
      );
    }
  }
);

// Slice
const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearForwardSuccess: (state) => {
      state.forwardSuccess = false;
    },
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
    },
        clearWorkflowHistory: (state) => {
      state.workflowHistory = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Assigned Loans
    builder
      .addCase(fetchMyAssignedLoans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyAssignedLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myAssignedLoans = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchMyAssignedLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Workflow
    builder
      .addCase(getWorkflowForLoan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkflowForLoan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkflow = action.payload.data;
      })
      .addCase(getWorkflowForLoan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Available Reviewers
    builder
      .addCase(getAvailableReviewers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAvailableReviewers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableReviewers = action.payload.data || [];
      })
      .addCase(getAvailableReviewers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forward Loan
    builder
      .addCase(forwardLoan.pending, (state) => {
        state.isForwarding = true;
        state.error = null;
        state.forwardSuccess = false;
      })
      .addCase(forwardLoan.fulfilled, (state) => {
        state.isForwarding = false;
        state.forwardSuccess = true;
      })
      .addCase(forwardLoan.rejected, (state, action) => {
        state.isForwarding = false;
        state.error = action.payload as string;
      });

    // Add Review
    builder
      .addCase(addReviewWithWorkflow.pending, (state) => {
        state.isForwarding = true;
        state.error = null;
      })
      .addCase(addReviewWithWorkflow.fulfilled, (state) => {
        state.isForwarding = false;
        state.forwardSuccess = true;
      })
      .addCase(addReviewWithWorkflow.rejected, (state, action) => {
        state.isForwarding = false;
        state.error = action.payload as string;
      });

    // Reassign Loan
    builder
      .addCase(reassignLoan.pending, (state) => {
        state.isForwarding = true;
        state.error = null;
      })
      .addCase(reassignLoan.fulfilled, (state) => {
        state.isForwarding = false;
      })
      .addCase(reassignLoan.rejected, (state, action) => {
        state.isForwarding = false;
        state.error = action.payload as string;
      });
      builder
      .addCase(getWorkflowHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkflowHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflowHistory = action.payload.data;
      })
      .addCase(getWorkflowHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {   clearError,
  clearForwardSuccess,
  clearCurrentWorkflow,
  clearWorkflowHistory, } =
  workflowSlice.actions;

export default workflowSlice.reducer;