import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface BoardDirector {
  // Core fields
  id?: number
  name: string
  position: string
  nationality: string
  idPassport: string
  phone: string
  email: string
  address: {
    country: string
    province: string
    district: string
    sector: string
    cell?: string
    village?: string
    street?: string
    houseNumber?: string
    poBox?: string
  }
  qualifications: string
  experience: string
  currentOccupation: string
  
  // Extended personal details
  accountNumber?: string | null
  salutation?: string | null
  surname?: string | null
  forename1?: string | null
  forename2?: string | null
  forename3?: string | null
  nationalIdNumber?: string | null
  passportNo?: string | null
  dateOfBirth?: string | null
  placeOfBirth?: string | null
  postalAddressLine1?: string | null
  postalCode?: string | null
  town?: string | null

  // Professional & employment details
  currentEmployer?: string | null
  appointmentDate?: string | null
  termStartDate?: string | null
  termEndDate?: string | null
  termLengthYears?: number
  isActive?: boolean
  isIndependent?: boolean
  
  // Document URLs
  idProofDocumentUrl?: string | null
  cvDocumentUrl?: string | null
  appointmentLetterUrl?: string | null
  qualificationCertificates?: string[] | null
  additionalDocuments?: string[] | null
  
  // Remuneration & attendance
  monthlyRemuneration?: number | null
  meetingAllowance?: number | null
  meetingsAttended?: number
  totalMeetings?: number
  
  // Additional professional details
  specialization?: string | null
  committees?: string[] | null
  notes?: string | null

  // System fields
  organizationId?: number
  createdBy?: number | null
  updatedBy?: number | null
  createdAt?: string
  updatedAt?: string
}
export interface SeniorManagement {
  id?: number
  name: string
  position: string
  experienceBackground: string
  phone: string
  email: string
  address: {
    country: string
    province: string
    district: string
    sector: string
    cell?: string
    village?: string
    street?: string
    houseNumber?: string
    poBox?: string
  }
  createdAt?: string
  updatedAt?: string
}

interface ManagementState {
  boardDirectors: BoardDirector[]
  seniorManagement: SeniorManagement[]
  isLoading: boolean
  error: string | null
  currentDirector: BoardDirector | null
  currentManager: SeniorManagement | null
}

const initialState: ManagementState = {
  boardDirectors: [],
  seniorManagement: [],
  isLoading: false,
  error: null,
  currentDirector: null,
  currentManager: null,
}

// API Base URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export const extendBoardDirector = createAsyncThunk(
  "management/extendBoardDirector",
  async ({ 
    id, 
    extendedData 
  }: { 
    id: number; 
    extendedData: {
      accountNumber?: string;
      salutation?: string;
      surname?: string;
      forename1?: string;
      forename2?: string;
      forename3?: string;
      nationalIdNumber?: string;
      passportNo?: string;
      dateOfBirth?: Date;
      placeOfBirth?: string;
      postalAddressLine1?: string;
      postalCode?: string;
      town?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${user.organizationId}/management/board-directors/${id}/extend`, 
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(extendedData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to extend board director information")
      }

      const responseData = await response.json()
      return responseData.data || responseData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Async thunks for Board Directors
export const fetchBoardDirectors = createAsyncThunk(
  "management/fetchBoardDirectors",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
     const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/board-directors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch board directors")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)
// Update the createBoardDirector thunk to accept FormData
export const createBoardDirector = createAsyncThunk(
  "management/createBoardDirector",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/board-directors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header when using FormData
          // The browser will set it automatically with the correct boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create board director")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const createSeniorManagement = createAsyncThunk(
  "management/createSeniorManagement",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/senior-management`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create senior management")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)
export const updateBoardDirector = createAsyncThunk(
  "management/updateBoardDirector",
  async ({ id, data }: { id: number; data: Partial<BoardDirector> }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
       const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/board-directors/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update board director")
      }

      const responseData = await response.json()
      return responseData.data || responseData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteBoardDirector = createAsyncThunk(
  "management/deleteBoardDirector",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
           const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/board-directors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete board director")
      }

      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Async thunks for Senior Management
export const fetchSeniorManagement = createAsyncThunk(
  "management/fetchSeniorManagement",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
           const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/senior-management`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch senior management")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)



export const updateSeniorManagement = createAsyncThunk(
  "management/updateSeniorManagement",
  async ({ id, data }: { id: number; data: Partial<SeniorManagement> }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
         const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/senior-management/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update senior management")
      }

      const responseData = await response.json()
      return responseData.data || responseData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteSeniorManagement = createAsyncThunk(
  "management/deleteSeniorManagement",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
           const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/management/senior-management/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete senior management")
      }

      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Slice
const managementSlice = createSlice({
  name: "management",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentDirector: (state, action: PayloadAction<BoardDirector | null>) => {
      state.currentDirector = action.payload
    },
    setCurrentManager: (state, action: PayloadAction<SeniorManagement | null>) => {
      state.currentManager = action.payload
    },
  },
  extraReducers: (builder) => {
    // Board Directors
    builder
      .addCase(fetchBoardDirectors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBoardDirectors.fulfilled, (state, action) => {
        state.isLoading = false
        state.boardDirectors = action.payload
      })
      .addCase(fetchBoardDirectors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createBoardDirector.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBoardDirector.fulfilled, (state, action) => {
        state.isLoading = false
        state.boardDirectors.push(action.payload)
      })
      .addCase(createBoardDirector.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateBoardDirector.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBoardDirector.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.boardDirectors.findIndex((d) => d.id === action.payload.id)
        if (index !== -1) {
          state.boardDirectors[index] = action.payload
        }
      })
      .addCase(updateBoardDirector.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteBoardDirector.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteBoardDirector.fulfilled, (state, action) => {
        state.isLoading = false
        state.boardDirectors = state.boardDirectors.filter((d) => d.id !== action.payload)
      })
      .addCase(deleteBoardDirector.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Senior Management
      .addCase(fetchSeniorManagement.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSeniorManagement.fulfilled, (state, action) => {
        state.isLoading = false
        state.seniorManagement = action.payload
      })
      .addCase(fetchSeniorManagement.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createSeniorManagement.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSeniorManagement.fulfilled, (state, action) => {
        state.isLoading = false
        state.seniorManagement.push(action.payload)
      })
      .addCase(createSeniorManagement.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateSeniorManagement.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSeniorManagement.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.seniorManagement.findIndex((m) => m.id === action.payload.id)
        if (index !== -1) {
          state.seniorManagement[index] = action.payload
        }
      })
      .addCase(updateSeniorManagement.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteSeniorManagement.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSeniorManagement.fulfilled, (state, action) => {
        state.isLoading = false
        state.seniorManagement = state.seniorManagement.filter((m) => m.id !== action.payload)
      })
      .addCase(deleteSeniorManagement.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

       .addCase(extendBoardDirector.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(extendBoardDirector.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.boardDirectors.findIndex((d) => d.id === action.payload.id)
        if (index !== -1) {
          state.boardDirectors[index] = action.payload
        }
      })
      .addCase(extendBoardDirector.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentDirector, setCurrentManager } = managementSlice.actions
export default managementSlice.reducer
