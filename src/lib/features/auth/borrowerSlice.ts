import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Maintains 100% original enums and interfaces
export interface Address {
  country?: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  street?: string
  houseNumber?: string
  poBox?: string
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed"
}

export enum RelationshipType {
  NEW_BORROWER = "new_borrower",
  REPEAT_BORROWER = "repeat_borrower",
  RETURNING_BORROWER = "returning_borrower",
  STAFF = "staff",
  DIRECTOR = "director",
  SHAREHOLDER = "shareholder",
  NONE = "none"
}
// Enhanced BorrowerProfile interface with all backend fields
export interface BorrowerProfile {
  // Core fields
  id?: number
  borrowerId?: string
  firstName: string
  lastName: string
  middleName?: string
  nationalId: string
  gender: Gender
  dateOfBirth: string
  maritalStatus: MaritalStatus
  primaryPhone: string
  alternativePhone?: string
  email?: string
  address: Address
  occupation?: string
  monthlyIncome?: number
  incomeSource?: string
  relationshipWithNDFSP?: RelationshipType
  previousLoansPaidOnTime?: number
  notes?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string

  // Extended personal details
  salutation?: string
  forename2?: string
  forename3?: string
  passportNo?: string
  nationality?: string
  taxNumber?: string
  drivingLicenseNumber?: string
  socialSecurityNumber?: string
  healthInsuranceNumber?: string
  dependantsCount?: number
  placeOfBirth?: string

  // Extended contact & employment
  workPhone?: string
  homePhone?: string
  fax?: string
  employerName?: string
  employerAddress1?: string
  employerAddress2?: string
  employerTown?: string
  employerCountry?: string
  incomeFrequency?: string

  // Group & account details
  groupName?: string
  groupNumber?: string
  accountNumber?: string
  oldAccountNumber?: string
  accountType?: string
  accountStatus?: string
  classification?: string
  accountOwner?: string
  jointLoanParticipants?: string[]
  currencyType?: string
  dateOpened?: string
  termsDuration?: number
  repaymentTerm?: string

  // Financial information
  creditLimit?: number
  currentBalance?: number
  availableCredit?: number
  currentBalanceIndicator?: string
  scheduledMonthlyPayment?: number
  actualPaymentAmount?: number
  amountPastDue?: number
  installmentsInArrears?: number
  daysInArrears?: number
  dateClosed?: string
  lastPaymentDate?: string
  interestRate?: number
  firstPaymentDate?: string

  // Additional categorization
  nature?: string
  category?: string
  sectorOfActivity?: string
  approvalDate?: string
  finalPaymentDate?: string

  // Loans relationship
  loans?: any
}

export interface BorrowerStats {
  totalLoans: number
  activeLoans: number
  totalDisbursed: number
  totalOutstanding: number
  totalPaid: number
  creditScore: number
  isEligibleForLoan: boolean
  riskLevel: string
  lastLoanDate?: string
  repaymentHistory: {
    onTime: number
    total: number
    percentage: number
  }
}

interface BorrowerState {
  borrowers: BorrowerProfile[]
  currentBorrower: BorrowerProfile | null
  borrowerStats: BorrowerStats | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
}

const initialState: BorrowerState = {
  borrowers: [],
  currentBorrower: null,
  borrowerStats: null,
  isLoading: false,
  error: null,
  pagination: null,
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Helper functions (maintains 100% original logic)
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

export const extendBorrower = createAsyncThunk(
  "borrower/extendBorrower",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers/${id}/extend`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to extend borrower profile")
      }

      const responseData = await response.json()
      return responseData.data || responseData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBorrowers = createAsyncThunk(
  "borrower/fetchBorrowers",
  async (params: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.search) queryParams.append("search", params.search)
      if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString())

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch borrowers")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBorrower = createAsyncThunk(
  "borrower/createBorrower",
  async (borrowerData: Omit<BorrowerProfile, 'id' | 'borrowerId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(borrowerData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create borrower")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBorrowerById = createAsyncThunk(
  "borrower/fetchBorrowerById",
  async (borrowerId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers/${borrowerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch borrower")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBorrower = createAsyncThunk(
  "borrower/updateBorrower",
  async ({ id, data }: { id: number; data: Partial<BorrowerProfile> }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update borrower")
      }

      const responseData = await response.json()
      return responseData.data || responseData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteBorrower = createAsyncThunk(
  "borrower/deleteBorrower",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete borrower")
      }

      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBorrowerStats = createAsyncThunk(
  "borrower/fetchBorrowerStats",
  async (borrowerId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/borrowers/${borrowerId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch borrower stats")
      }

      const data = await response.json()
      return data.data?.statistics || data.statistics
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Slice (maintains 100% original functionality)
const borrowerSlice = createSlice({
  name: "borrower",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentBorrower: (state, action: PayloadAction<BorrowerProfile | null>) => {
      state.currentBorrower = action.payload
    },
    clearBorrowerStats: (state) => {
      state.borrowerStats = null
    },
    resetPagination: (state) => {
      state.pagination = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Borrowers
      .addCase(fetchBorrowers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBorrowers.fulfilled, (state, action) => {
        state.isLoading = false
        state.borrowers = action.payload.data || action.payload
        state.pagination = action.payload.pagination || null
      })
      .addCase(fetchBorrowers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Borrower
      .addCase(createBorrower.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBorrower.fulfilled, (state, action) => {
        state.isLoading = false
        state.borrowers.unshift(action.payload)
      })
      .addCase(createBorrower.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Borrower by ID
      .addCase(fetchBorrowerById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBorrowerById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBorrower = action.payload
      })
      .addCase(fetchBorrowerById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.currentBorrower = null
      })
      // Update Borrower
      .addCase(updateBorrower.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBorrower.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.borrowers.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          state.borrowers[index] = action.payload
        }
        if (state.currentBorrower?.id === action.payload.id) {
          state.currentBorrower = action.payload
        }
      })
      .addCase(updateBorrower.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Borrower
      .addCase(deleteBorrower.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteBorrower.fulfilled, (state, action) => {
        state.isLoading = false
        state.borrowers = state.borrowers.filter((b) => b.id !== action.payload)
        if (state.currentBorrower?.id === action.payload) {
          state.currentBorrower = null
        }
      })
      .addCase(deleteBorrower.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Borrower Stats
      .addCase(fetchBorrowerStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBorrowerStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.borrowerStats = action.payload
      })
      .addCase(fetchBorrowerStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(extendBorrower.pending, (state) => {
  state.isLoading = true
  state.error = null
})
.addCase(extendBorrower.fulfilled, (state, action) => {
  state.isLoading = false
  const index = state.borrowers.findIndex((b) => b.id === action.payload.id)
  if (index !== -1) {
    state.borrowers[index] = action.payload
  }
  if (state.currentBorrower?.id === action.payload.id) {
    state.currentBorrower = action.payload
  }
})
.addCase(extendBorrower.rejected, (state, action) => {
  state.isLoading = false
  state.error = action.payload as string
})
  },
})

export const { clearError, setCurrentBorrower, clearBorrowerStats, resetPagination } = borrowerSlice.actions
export default borrowerSlice.reducer