import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Enhanced interfaces with delayed days support
export interface RepaymentTransaction {
  id: number
  loanId: number
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  principalPaid: number
  interestPaid: number
  penaltyPaid: number
  status: "COMPLETED" | "PENDING" | "FAILED" | "REVERSED"
  transactionReference: string
  repaymentProof?: string
  receivedBy?: string
  approvedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
  // NEW: Enhanced with delayed days info
  delayedDaysInfo?: DelayedDaysInfo[]
}

export interface DelayedDaysInfo {
  installmentNumber: number
  scheduledDueDate: string
  actualPaymentDate: string
  delayedDays: number
  wasEarlyPayment: boolean
}

export interface PaymentData {
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  repaymentProof?: string
  receivedBy?: string
  approvedBy?: string
  notes?: string
}

export interface PaymentAllocation {
  principalAmount: number
  interestAmount: number
  penaltyAmount: number
  totalAmount: number
  // NEW: Enhanced with delayed days tracking
  delayedDaysInfo?: DelayedDaysInfo[]
  affectedInstallments?: Array<{
    installmentNumber: number
    currentDelayedDays: number
    projectedDelayedDays: number
    willResetDelayedDays: boolean
  }>
}

export interface PaymentSummary {
  totalPaid: number
  totalPrincipalPaid: number
  totalInterestPaid: number
  totalPenaltyPaid: number
  remainingBalance: number
  nextDueDate: string
  nextDueAmount: number
  // NEW: Enhanced with delayed days metrics
  totalDelayedDays: number
  averageDelayedDays: number
  maxDelayedDays: number
  installmentsWithDelays: number
}

export interface AccruedInterest {
  accruedAmount: number
  asOfDate: string
  daysSinceLastPayment: number
}

export interface PenaltyCalculation {
  penaltyAmount: number
  daysOverdue: number
  penaltyRate: number
}

// NEW: Delayed days report interfaces
export interface DelayedDaysReport {
  reportSummary: {
    totalLoansWithDelays: number
    totalDelayedDays: number
    averageDelayedDaysPerLoan: number
    daysThreshold: number
    reportDate: string
  }
  loanDetails: Array<{
    loanId: string
    borrowerName: string
    maxDelayedDays: number
    totalDelayedDays: number
    installmentsWithDelays: number
    schedules: Array<{
      installmentNumber: number
      dueDate: string
      delayedDays: number
      actualPaymentDate: string | null
      status: string
    }>
  }>
}

export interface DailyDelayedDaysUpdate {
  updatedSchedules: number
  totalDelayedDaysAdded: number
  organizationId: string | number
}

export interface ClassificationUpdate {
  previousStatus: string
  newStatus: string
  daysOverdue: number
  wasReclassified: boolean
}

interface RepaymentTransactionState {
  transactions: RepaymentTransaction[]
  currentTransaction: RepaymentTransaction | null
  paymentAllocation: PaymentAllocation | null
  paymentSummary: PaymentSummary | null
  accruedInterest: AccruedInterest | null
  penaltyCalculation: PenaltyCalculation | null
  // NEW: Delayed days state
  delayedDaysReport: DelayedDaysReport | null
  dailyUpdateResult: DailyDelayedDaysUpdate | null
  lastClassificationUpdate: ClassificationUpdate | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  // NEW: Loading states for delayed days operations
  isDailyUpdateLoading: boolean
  isReportLoading: boolean
}

const initialState: RepaymentTransactionState = {
  transactions: [],
  currentTransaction: null,
  paymentAllocation: null,
  paymentSummary: null,
  accruedInterest: null,
  penaltyCalculation: null,
  delayedDaysReport: null,
  dailyUpdateResult: null,
  lastClassificationUpdate: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  isDailyUpdateLoading: false,
  isReportLoading: false,
}

// Helper functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

const getOrganizationIdFromUser = () => {
  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user")
    const user = userString ? JSON.parse(userString) : null
    return user?.organizationId
  }
  return null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

export const processPayment = createAsyncThunk(
  "repaymentTransaction/processPayment",
  async (
    { loanId, paymentData }: { loanId: number; paymentData: PaymentData },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      console.log('Processing payment with auto-classification:', {
        loanId,
        paymentData,
        orgId
      })

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/loans/${loanId}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process payment")
      }

      const result = await response.json()
      console.log('Payment processed with classification:', result)

      return result
    } catch (error: any) {
      console.error('Payment processing error:', error)
      return rejectWithValue(error.message)
    }
  },
)

export const performDailyDelayedDaysUpdate = createAsyncThunk(
  "repaymentTransaction/performDailyDelayedDaysUpdate",
  async (
    { organizationId }: { organizationId?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = organizationId || getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      console.log('Performing daily delayed days update for org:', orgId)

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/loans/delayed-days/daily-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to perform daily delayed days update")
      }

      const result = await response.json()
      console.log('Daily delayed days update completed:', result.data)

      return result
    } catch (error: any) {
      console.error('Daily delayed days update error:', error)
      return rejectWithValue(error.message)
    }
  },
)

// NEW: Get delayed days report thunk
export const getDelayedDaysReport = createAsyncThunk(
  "repaymentTransaction/getDelayedDaysReport",
  async (
    { daysThreshold = 0 }: { daysThreshold?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      console.log('Fetching delayed days report for org:', orgId, 'threshold:', daysThreshold)

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/loans/delayed-days/report?daysThreshold=${daysThreshold}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch delayed days report")
      }

      const result = await response.json()
      console.log('Delayed days report retrieved:', {
        totalLoans: result.data?.reportSummary?.totalLoansWithDelays,
        totalDelayedDays: result.data?.reportSummary?.totalDelayedDays
      })

      return result
    } catch (error: any) {
      console.error('Get delayed days report error:', error)
      return rejectWithValue(error.message)
    }
  },
)

// Enhanced fetchLoanTransactions (maintains backward compatibility)
export const fetchLoanTransactions = createAsyncThunk(
  "repaymentTransaction/fetchLoanTransactions",
  async (
    {
      loanId,
      page = 1,
      limit = 10,
    }: { loanId: number; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/loans/${loanId}/transactions?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch loan transactions")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Enhanced fetchTransactionById (maintains backward compatibility)
export const fetchTransactionById = createAsyncThunk(
  "repaymentTransaction/fetchById",
  async ({ transactionId }: { transactionId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transaction")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Enhanced reverseTransaction (maintains backward compatibility)
export const reverseTransaction = createAsyncThunk(
  "repaymentTransaction/reverse",
  async (
    { transactionId, reason }: { transactionId: number; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/transactions/${transactionId}/reverse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reverse transaction")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Enhanced generatePaymentReceipt (maintains backward compatibility)
export const generatePaymentReceipt = createAsyncThunk(
  "repaymentTransaction/generateReceipt",
  async ({ transactionId }: { transactionId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/transactions/${transactionId}/receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to generate receipt")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Existing thunks (maintain backward compatibility)
export const calculateAccruedInterest = createAsyncThunk(
  "repaymentTransaction/calculateAccruedInterest",
  async (
    { loanId, asOfDate }: { loanId: number; asOfDate?: string },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const url = asOfDate
        ? `${API_BASE_URL}/organizations/${orgId}/loans/${loanId}/accrued-interest?asOfDate=${asOfDate}`
        : `${API_BASE_URL}/organizations/${orgId}/loans/${loanId}/accrued-interest`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to calculate accrued interest")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const calculatePenalties = createAsyncThunk(
  "repaymentTransaction/calculatePenalties",
  async ({ loanId }: { loanId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/loans/${loanId}/penalties`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to calculate penalties")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Enhanced fetchPaymentSummary with delayed days
export const fetchPaymentSummary = createAsyncThunk(
  "repaymentTransaction/fetchPaymentSummary",
  async ({ loanId }: { loanId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const orgId = getOrganizationIdFromUser()
      if (!orgId) {
        throw new Error("No organization ID available")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/loans/${loanId}/payment-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payment summary")
      }

      const result = await response.json()
      console.log('Enhanced payment summary retrieved with delayed days:', {
        totalDelayedDays: result.data?.totalDelayedDays,
        maxDelayedDays: result.data?.maxDelayedDays
      })

      return result
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const repaymentTransactionSlice = createSlice({
  name: "repaymentTransaction",
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
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null
    },
    clearPaymentAllocation: (state) => {
      state.paymentAllocation = null
    },
    setPaymentAllocation: (state, action: PayloadAction<PaymentAllocation>) => {
      state.paymentAllocation = action.payload
    },
    // NEW: Delayed days specific actions
    clearDelayedDaysReport: (state) => {
      state.delayedDaysReport = null
    },
    clearDailyUpdateResult: (state) => {
      state.dailyUpdateResult = null
    },
    clearClassificationUpdate: (state) => {
      state.lastClassificationUpdate = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isLoading = true
        const transactionData = action.payload.data.transaction

        const enhancedTransaction = {
          ...transactionData,
          delayedDaysInfo: action.payload.data.loanStatus?.delayedDaysInfo || []
        }

        state.transactions.unshift(enhancedTransaction)
        state.currentTransaction = enhancedTransaction
        state.totalCount += 1

        // NEW: Store classification update
        if (action.payload.data.loanStatus?.classification) {
          state.lastClassificationUpdate = action.payload.data.loanStatus.classification
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // NEW: Daily delayed days update
      .addCase(performDailyDelayedDaysUpdate.pending, (state) => {
        state.isDailyUpdateLoading = true
        state.error = null
      })
      .addCase(performDailyDelayedDaysUpdate.fulfilled, (state, action) => {
        state.isDailyUpdateLoading = false
        state.dailyUpdateResult = action.payload.data
        console.log('Daily delayed days update completed in state:', state.dailyUpdateResult)
      })
      .addCase(performDailyDelayedDaysUpdate.rejected, (state, action) => {
        state.isDailyUpdateLoading = false
        state.error = action.payload as string
      })

      // NEW: Delayed days report
      .addCase(getDelayedDaysReport.pending, (state) => {
        state.isReportLoading = true
        state.error = null
      })
      .addCase(getDelayedDaysReport.fulfilled, (state, action) => {
        state.isReportLoading = false
        state.delayedDaysReport = action.payload.data
        console.log('Delayed days report loaded in state:', {
          totalLoans: state.delayedDaysReport?.reportSummary?.totalLoansWithDelays,
          totalDelayedDays: state.delayedDaysReport?.reportSummary?.totalDelayedDays
        })
      })
      .addCase(getDelayedDaysReport.rejected, (state, action) => {
        state.isReportLoading = false
        state.error = action.payload as string
      })

      // Enhanced fetch loan transactions (maintains backward compatibility)
      .addCase(fetchLoanTransactions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanTransactions.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions = action.payload.data
        state.totalCount = action.payload.totalCount
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchLoanTransactions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Enhanced fetch transaction by ID (maintains backward compatibility)
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTransaction = action.payload.data
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Reverse transaction (maintains backward compatibility)
      .addCase(reverseTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(reverseTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.transactions.findIndex((t) => t.id === action.payload.data.id)
        if (index !== -1) {
          state.transactions[index] = action.payload.data
        }
      })
      .addCase(reverseTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Calculate accrued interest (maintains backward compatibility)
      .addCase(calculateAccruedInterest.fulfilled, (state, action) => {
        state.accruedInterest = action.payload.data
      })

      // Calculate penalties (maintains backward compatibility)
      .addCase(calculatePenalties.fulfilled, (state, action) => {
        state.penaltyCalculation = action.payload.data
      })

      // Enhanced fetch payment summary with delayed days
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.paymentSummary = action.payload.data
        console.log('Enhanced payment summary loaded in state with delayed days:', {
          totalDelayedDays: state.paymentSummary?.totalDelayedDays,
          maxDelayedDays: state.paymentSummary?.maxDelayedDays
        })
      })
  },
})

export const {
  clearError,
  setCurrentPage,
  setPageSize,
  clearCurrentTransaction,
  clearPaymentAllocation,
  setPaymentAllocation,
  clearDelayedDaysReport,
  clearDailyUpdateResult,
  clearClassificationUpdate
} = repaymentTransactionSlice.actions

export default repaymentTransactionSlice.reducer