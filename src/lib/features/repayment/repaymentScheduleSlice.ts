import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types
export interface RepaymentSchedule {
  id: number
  loanId: number
  installmentNumber: number
  dueDate: string
  duePrincipal: number
  dueInterest: number
  dueTotal: number
  paidPrincipal: number
  paidInterest: number
  paidTotal: number
  outstandingPrincipal: number
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID"
  daysInArrears: number
  penaltyAmount: number
  createdAt: string
  updatedAt: string
}

export interface ScheduleRecalculationOptions {
  type: "REDUCE_INSTALLMENT" | "REDUCE_TERM"
  effectiveDate?: string
}

export interface OverdueInstallment {
  installmentNumber: number
  dueDate: string
  dueAmount: number
  paidAmount: number
  outstandingAmount: number
  daysOverdue: number
  penaltyAmount: number
}

interface RepaymentScheduleState {
  schedules: RepaymentSchedule[]
  currentSchedule: RepaymentSchedule | null
  overdueInstallments: OverdueInstallment[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}

const initialState: RepaymentScheduleState = {
  schedules: [],
  currentSchedule: null,
  overdueInstallments: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}
// Helper functions (unchanged)
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
export const fetchRepaymentSchedule = createAsyncThunk(
  "repaymentSchedule/fetchSchedule",
  async ({  loanId }: {  loanId: number }, { rejectWithValue }) => {
    try {
      
     const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }
      const response = await fetch(`/api/organizations/${organizationId}/loans/${loanId}/schedule`)

      if (!response.ok) {
        throw new Error("Failed to fetch repayment schedule")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateScheduleAfterPayment = createAsyncThunk(
  "repaymentSchedule/updateAfterPayment",
  async (
    {  loanId, transactionId }: {  loanId: number; transactionId: number },
    { rejectWithValue },
  ) => {
    try {

      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }
      const response = await fetch(
        `/api/organizations/${organizationId}/loans/${loanId}/schedule/update-after-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactionId }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update schedule after payment")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const recalculateSchedule = createAsyncThunk(
  "repaymentSchedule/recalculate",
  async (
    {
      organizationId,
      loanId,
      options,
    }: { organizationId: number; loanId: number; options: ScheduleRecalculationOptions },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/loans/${loanId}/schedule/recalculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to recalculate schedule")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOverdueInstallments = createAsyncThunk(
  "repaymentSchedule/fetchOverdue",
  async ({ organizationId, loanId }: { organizationId: number; loanId: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/loans/${loanId}/schedule/overdue`)

      if (!response.ok) {
        throw new Error("Failed to fetch overdue installments")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const handlePartialPayment = createAsyncThunk(
  "repaymentSchedule/handlePartialPayment",
  async (
    {
      organizationId,
      loanId,
      installmentId,
      amount,
    }: { organizationId: number; loanId: number; installmentId: number; amount: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/loans/${loanId}/schedule/${installmentId}/partial-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to handle partial payment")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const repaymentScheduleSlice = createSlice({
  name: "repaymentSchedule",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
    },
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null
    },
    clearOverdueInstallments: (state) => {
      state.overdueInstallments = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch repayment schedule
      .addCase(fetchRepaymentSchedule.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRepaymentSchedule.fulfilled, (state, action) => {
        state.isLoading = false
        state.schedules = action.payload.data
        state.totalCount = action.payload.totalCount || action.payload.data.length
      })
      .addCase(fetchRepaymentSchedule.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update schedule after payment
      .addCase(updateScheduleAfterPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateScheduleAfterPayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.schedules = action.payload.data
      })
      .addCase(updateScheduleAfterPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Recalculate schedule
      .addCase(recalculateSchedule.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(recalculateSchedule.fulfilled, (state, action) => {
        state.isLoading = false
        state.schedules = action.payload.data
      })
      .addCase(recalculateSchedule.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch overdue installments
      .addCase(fetchOverdueInstallments.fulfilled, (state, action) => {
        state.overdueInstallments = action.payload.data
      })
      // Handle partial payment
      .addCase(handlePartialPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(handlePartialPayment.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.schedules.findIndex((s) => s.id === action.payload.data.id)
        if (index !== -1) {
          state.schedules[index] = action.payload.data
        }
      })
      .addCase(handlePartialPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentPage, setPageSize, clearCurrentSchedule, clearOverdueInstallments } =
  repaymentScheduleSlice.actions

export default repaymentScheduleSlice.reducer
