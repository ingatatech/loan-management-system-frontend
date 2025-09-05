import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface InstallmentSchedule {
  id: number;
  installmentNumber: number;
  dueDate: string;
  duePrincipal: number;
  dueInterest: number;
  dueTotal: number;
  paidPrincipal: number;
  paidInterest: number;
  paidTotal: number;
  outstandingPrincipal: number;
  isPaid: boolean;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue';
  delayedDays: number;
  actualPaymentDate?: string;
  paidTimestamp?: string;
  remainingAmount: number;
  lastPaymentAttempt?: string;
  paymentAttemptCount?: number;
  canAcceptPayment: boolean;
}

export interface ScheduleSummary {
  totalScheduled: number;
  totalPaid: number;
  totalRemaining: number;
  paidCount: number;
  overdueCount: number;
  totalDelayedDays: number;
  nextDueDate: string | null;
  nextDueAmount: number;
}

export interface ScheduleFilters {
  status: 'all' | 'paid' | 'unpaid' | 'overdue';
  searchTerm: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface ScheduleState {
  schedules: InstallmentSchedule[];
  currentSchedule: InstallmentSchedule | null;
  summary: ScheduleSummary | null;
  filters: ScheduleFilters;
  isLoading: boolean;
  error: string | null;
  expandedRows: number[];
  selectedInstallments: number[];
}

const initialState: ScheduleState = {
  schedules: [],
  currentSchedule: null,
  summary: null,
  filters: {
    status: 'all',
    searchTerm: '',
    dateRange: {
      start: null,
      end: null
    }
  },
  isLoading: false,
  error: null,
  expandedRows: [],
  selectedInstallments: []
};

// Helper functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

const getOrganizationId = () => {
  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user")
    const user = userString ? JSON.parse(userString) : null
    return user?.organizationId
  }
  return null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Fetch loan repayment schedule
export const fetchLoanSchedule = createAsyncThunk(
  "schedule/fetchLoanSchedule",
  async (
    { loanId, page = 1, limit = 50 }: { loanId: number; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/schedule?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch loan schedule")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Mark installment as paid
export const markInstallmentAsPaid = createAsyncThunk(
  "schedule/markInstallmentAsPaid",
  async (
    { scheduleId, paymentData }: { scheduleId: number; paymentData: any },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/schedules/${scheduleId}/mark-paid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to mark installment as paid")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Update installment status
export const updateInstallmentStatus = createAsyncThunk(
  "schedule/updateInstallmentStatus",
  async (
    { scheduleId, status }: { scheduleId: number; status: string },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/schedules/${scheduleId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update installment status")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Get schedule summary
export const fetchScheduleSummary = createAsyncThunk(
  "schedule/fetchSummary",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/schedule/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch schedule summary")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<ScheduleFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        searchTerm: '',
        dateRange: { start: null, end: null }
      }
    },
    toggleRowExpansion: (state, action: PayloadAction<number>) => {
      const installmentNumber = action.payload
      const index = state.expandedRows.indexOf(installmentNumber)
      if (index > -1) {
        state.expandedRows.splice(index, 1)
      } else {
        state.expandedRows.push(installmentNumber)
      }
    },
    toggleInstallmentSelection: (state, action: PayloadAction<number>) => {
      const scheduleId = action.payload
      const index = state.selectedInstallments.indexOf(scheduleId)
      if (index > -1) {
        state.selectedInstallments.splice(index, 1)
      } else {
        state.selectedInstallments.push(scheduleId)
      }
    },
    clearSelections: (state) => {
      state.selectedInstallments = []
    },
    updateInstallmentLocal: (state, action: PayloadAction<InstallmentSchedule>) => {
      const index = state.schedules.findIndex(s => s.id === action.payload.id)
      if (index > -1) {
        state.schedules[index] = action.payload
      }
    },
    setCurrentSchedule: (state, action: PayloadAction<InstallmentSchedule | null>) => {
      state.currentSchedule = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch loan schedule
      .addCase(fetchLoanSchedule.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanSchedule.fulfilled, (state, action) => {
        state.isLoading = false
        state.schedules = action.payload.data?.schedules || action.payload.schedules || []
        state.summary = action.payload.data?.summary || action.payload.summary || null
      })
      .addCase(fetchLoanSchedule.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Mark installment as paid
      .addCase(markInstallmentAsPaid.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markInstallmentAsPaid.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedSchedule = action.payload.data?.schedule
        if (updatedSchedule) {
          const index = state.schedules.findIndex(s => s.id === updatedSchedule.id)
          if (index > -1) {
            state.schedules[index] = updatedSchedule
          }
        }
      })
      .addCase(markInstallmentAsPaid.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Update installment status
      .addCase(updateInstallmentStatus.fulfilled, (state, action) => {
        const updatedSchedule = action.payload.data?.schedule
        if (updatedSchedule) {
          const index = state.schedules.findIndex(s => s.id === updatedSchedule.id)
          if (index > -1) {
            state.schedules[index] = updatedSchedule
          }
        }
      })
      
      // Fetch schedule summary
      .addCase(fetchScheduleSummary.fulfilled, (state, action) => {
        state.summary = action.payload.data || action.payload
      })
  }
})

export const {
  clearError,
  setFilters,
  clearFilters,
  toggleRowExpansion,
  toggleInstallmentSelection,
  clearSelections,
  updateInstallmentLocal,
  setCurrentSchedule
} = scheduleSlice.actions

export default scheduleSlice.reducer