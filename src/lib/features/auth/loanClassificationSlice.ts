// @ts-nocheck

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types
export interface LoanClassification {
  id: number
  loanId: number
  classificationDate: string
  daysInArrears: number
  currentStatus: LoanStatus
  previousStatus: LoanStatus
  outstandingPrincipal: number
  accruedInterest: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  riskRating: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export enum LoanStatus {
  PERFORMING = "PERFORMING",
  WATCH = "WATCH",
  SUBSTANDARD = "SUBSTANDARD",
  DOUBTFUL = "DOUBTFUL",
  LOSS = "LOSS",
}

export interface ProvisioningReport {
  totalLoans: number
  totalOutstanding: number
  totalProvisionRequired: number
  byStatus: {
    [key in LoanStatus]: {
      count: number
      outstanding: number
      provisionRequired: number
      percentage: number
    }
  }
  generatedAt: string
}

export interface BulkClassificationUpdate {
  loanIds: number[]
  newStatus: LoanStatus
  reason: string
}

export interface CreateClassificationRequest {
  loanId: number
  classificationDate: string
  daysInArrears: number
  currentStatus: LoanStatus
  previousStatus: LoanStatus
  outstandingPrincipal: number
  accruedInterest: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  riskRating: string
  notes: string
  loanClass?: string
  collateralValue?: number
  previousProvisionsHeld?: number
  additionalProvisionsThisPeriod?: number
}

export interface ClassificationResult {
  loanId: string
  borrowerName: string
  daysInArrears: number
  loanClass: string
  outstandingBalance: number
  collateralValue: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  previousProvisionsHeld: number
  additionalProvisionsThisPeriod: number
  outstandingPrincipal?: number
  accruedInterest?: number
  currentStatus?: LoanStatus
  previousStatus?: LoanStatus
  riskRating?: string
}

export interface ProvisionCalculationResponse {
  success: boolean
  message: string
  data: ClassificationResult
}


interface LoanClassificationState {
  classifications: LoanClassification[]
  currentClassification: LoanClassification | null
  provisioningReport: ProvisioningReport | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}

const initialState: LoanClassificationState = {
  classifications: [],
  currentClassification: null,
  provisioningReport: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

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

export const calculateProvisions = createAsyncThunk(
  "loanClassification/calculateProvisions",
  async ({ organizationId, loanId }: { organizationId: number; loanId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/provisions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to calculate provisions")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const createLoanClassification = createAsyncThunk(
  "loanClassification/create",
  async (
    {
      organizationId,
      loanId,
      classificationData,
    }: { organizationId: number; loanId: number; classificationData: CreateClassificationRequest },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classificationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create loan classification")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const calculateDaysInArrears = createAsyncThunk(
  "loanClassification/calculateDaysInArrears",
  async ({ organizationId, loanId }: { organizationId: number; loanId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/days-in-arrears`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to calculate days in arrears")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateLoanStatus = createAsyncThunk(
  "loanClassification/updateStatus",
  async (
    {
      organizationId,
      loanId,
      status,
      reason,
    }: { organizationId: number; loanId: number; status: LoanStatus; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, reason }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update loan status")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchLoanClassifications = createAsyncThunk(
  "loanClassification/fetchAll",
  async (
    { organizationId, page = 1, limit = 10 }: { organizationId: number; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/classification?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch loan classifications")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const generateProvisioningReport = createAsyncThunk(
  "loanClassification/generateReport",
  async ({ rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/classification/provisioning-report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const bulkUpdateClassifications = createAsyncThunk(
  "loanClassification/bulkUpdate",
  async (
    { organizationId, updateData }: { organizationId: number; updateData: BulkClassificationUpdate },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/classification/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to bulk update classifications")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const loanClassificationSlice = createSlice({
  name: "loanClassification",
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
    clearCurrentClassification: (state) => {
      state.currentClassification = null
    },
    clearProvisioningReport: (state) => {
      state.provisioningReport = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Calculate provisions
      .addCase(calculateProvisions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(calculateProvisions.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentClassification = action.payload.data
      })
      .addCase(calculateProvisions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createLoanClassification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createLoanClassification.fulfilled, (state, action) => {
        state.isLoading = false
        state.classifications.unshift(action.payload.data)
        state.currentClassification = action.payload.data
        state.totalCount += 1
      })
      .addCase(createLoanClassification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(calculateDaysInArrears.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(calculateDaysInArrears.fulfilled, (state, action) => {
        state.isLoading = false
        // Store arrears data in currentClassification for form pre-filling
        if (state.currentClassification) {
          state.currentClassification.daysInArrears = action.payload.data.daysInArrears
        }
      })
      .addCase(calculateDaysInArrears.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update loan status
      .addCase(updateLoanStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateLoanStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.classifications.findIndex((c) => c.loanId === action.payload.data.loanId)
        if (index !== -1) {
          state.classifications[index] = action.payload.data
        } else {
          state.classifications.unshift(action.payload.data)
        }
        state.currentClassification = action.payload.data
      })
      .addCase(updateLoanStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch loan classifications
      .addCase(fetchLoanClassifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanClassifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.classifications = action.payload.data
        state.totalCount = action.payload.totalCount
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchLoanClassifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Generate provisioning report
      .addCase(generateProvisioningReport.fulfilled, (state, action) => {
        state.provisioningReport = action.payload.data
      })
      // Bulk update classifications
      .addCase(bulkUpdateClassifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(bulkUpdateClassifications.fulfilled, (state, action) => {
        state.isLoading = false
        // Update the affected classifications in the state
        action.payload.data.forEach((updatedClassification: LoanClassification) => {
          const index = state.classifications.findIndex((c) => c.loanId === updatedClassification.loanId)
          if (index !== -1) {
            state.classifications[index] = updatedClassification
          }
        })
      })
      .addCase(bulkUpdateClassifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentPage, setPageSize, clearCurrentClassification, clearProvisioningReport } =
  loanClassificationSlice.actions

export default loanClassificationSlice.reducer
