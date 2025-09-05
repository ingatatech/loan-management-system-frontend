import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface Address {
  country?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  street?: string;
  houseNumber?: string;
  poBox?: string;
}

interface KeyRepresentative {
  name: string;
  position: string;
  idPassport: string;
  phone?: string;
  email?: string;
  nationality?: string;
  isAuthorizedSignatory: boolean;
}

export interface IndividualShareholder {
  id: number;
  firstname: string;
  lastname: string;
  idPassport: string;
  occupation: string | null;
  phone: string | null;
  email: string | null;
  physicalAddress: Address | null;
  residentAddress: Address | null;
  nationality: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  maritalStatus: string | null;
  idProofDocumentUrl: string | null;
  passportPhotoUrl: string | null;
  proofOfResidenceUrl: string | null;
  additionalDocuments: string[] | null;
  isActive: boolean;
  isVerified: boolean;
  verificationNotes: string | null;
   accountNumber?: string | null;
  forename2?: string | null;
  forename3?: string | null;
  passportNo?: string | null;
  placeOfBirth?: string | null;
  postalAddressLine1?: string | null;
  postalAddressLine2?: string | null;
  town?: string | null;
  country?: string | null;
  organizationId: number;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
 
}

export interface InstitutionShareholder {
  id: number;
  institutionName: string;
  tradingLicenseNumber: string;
  businessActivity: string | null;
  keyRepresentatives: KeyRepresentative[];
  fullAddress: Address | null;
  institutionType: string | null;
  incorporationDate: Date | null;
  registrationNumber: string | null;
  tinNumber: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  tradingLicenseUrl: string | null;
  certificateOfIncorporationUrl: string | null;
  memorandumOfAssociationUrl: string | null;
  articlesOfAssociationUrl: string | null;
  additionalDocuments: string[] | null;
  isActive: boolean;
  isVerified: boolean;
  verificationNotes: string | null;
  isGovernmentEntity: boolean;
  isNonProfit: boolean;
   accountNumber?: string | null;
  tradingName?: string | null;
  companyRegNo?: string | null;
  postalAddressLine1?: string | null;
  postalAddressLine2?: string | null;
  town?: string | null;
  country?: string | null;
  organizationId: number;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualShareholderCreationData {
  firstname: string;
  lastname: string;
  idPassport: string;
  occupation?: string;
  phone?: string;
  email?: string;
  physicalAddress?: Address;
  residentAddress?: Address;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
}

export interface InstitutionShareholderCreationData {
  institutionName: string;
  tradingLicenseNumber: string;
  businessActivity?: string;
  keyRepresentatives: KeyRepresentative[];
  fullAddress?: Address;
  institutionType?: string;
  incorporationDate?: string;
  registrationNumber?: string;
  tinNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  isGovernmentEntity?: boolean;
  isNonProfit?: boolean;
}

interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface ShareholdersState {
  individualShareholders: IndividualShareholder[];
  institutionShareholders: InstitutionShareholder[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
}

const initialState: ShareholdersState = {
  individualShareholders: [],
  institutionShareholders: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  },
}


export const extendIndividualShareholder = createAsyncThunk(
  "shareholders/extendIndividualShareholder",
  async (data: { 
    organizationId: number; 
    shareholderId: number; 
    extendedData: {
      accountNumber?: string;
      forename2?: string;
      forename3?: string;
      passportNo?: string;
      placeOfBirth?: string;
      postalAddressLine1?: string;
      postalAddressLine2?: string;
      town?: string;
      country?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await api.put<ServiceResponse<IndividualShareholder>>(
        `/organizations/${data.organizationId}/shareholders/individual-shareholders/${data.shareholderId}/extend`,
        data.extendedData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const extendInstitutionShareholder = createAsyncThunk(
  "shareholders/extendInstitutionShareholder",
  async (data: { 
    organizationId: number; 
    shareholderId: number; 
    extendedData: {
      accountNumber?: string;
      tradingName?: string;
      companyRegNo?: string;
      postalAddressLine1?: string;
      postalAddressLine2?: string;
      town?: string;
      country?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await api.put<ServiceResponse<InstitutionShareholder>>(
        `/organizations/${data.organizationId}/shareholders/institution-shareholders/${data.shareholderId}/extend`,
        data.extendedData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Individual Shareholder Actions
export const createIndividualShareholder = createAsyncThunk(
  "shareholders/createIndividualShareholder",
  async (data: { organizationId: number; shareholderData: IndividualShareholderCreationData }, { rejectWithValue }) => {
    try {
      const response = await api.post<ServiceResponse<IndividualShareholder>>(
        `/organizations/${data.organizationId}/shareholders/individual-shareholders`,
        data.shareholderData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getIndividualShareholders = createAsyncThunk(
  "shareholders/getIndividualShareholders",
  async (params: { 
    organizationId: number; 
    page?: number; 
    limit?: number; 
    search?: string; 
    isActive?: boolean;
    includeShareCapital?: boolean;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
      if (params.includeShareCapital) queryParams.append('includeShareCapital', params.includeShareCapital.toString())

      const response = await api.get<ServiceResponse<{
        shareholders: IndividualShareholder[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>>(
        `/organizations/${params.organizationId}/shareholders/individual-shareholders?${queryParams.toString()}`
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateIndividualShareholder = createAsyncThunk(
  "shareholders/updateIndividualShareholder",
  async (data: { 
    organizationId: number; 
    shareholderId: number; 
    shareholderData: Partial<IndividualShareholderCreationData> 
  }, { rejectWithValue }) => {
    try {
      const response = await api.put<ServiceResponse<IndividualShareholder>>(
        `/organizations/${data.organizationId}/shareholders/individual-shareholders/${data.shareholderId}`,
        data.shareholderData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteIndividualShareholder = createAsyncThunk(
  "shareholders/deleteIndividualShareholder",
  async (data: { organizationId: number; shareholderId: number }, { rejectWithValue }) => {
    try {
      const response = await api.delete<ServiceResponse<void>>(
        `/organizations/${data.organizationId}/shareholders/individual-shareholders/${data.shareholderId}`
      )
      return { ...response.data, shareholderId: data.shareholderId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Institution Shareholder Actions
export const createInstitutionShareholder = createAsyncThunk(
  "shareholders/createInstitutionShareholder",
  async (data: { organizationId: number; shareholderData: InstitutionShareholderCreationData }, { rejectWithValue }) => {
    try {
      const response = await api.post<ServiceResponse<InstitutionShareholder>>(
        `/organizations/${data.organizationId}/shareholders/institution-shareholders`,
        data.shareholderData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getInstitutionShareholders = createAsyncThunk(
  "shareholders/getInstitutionShareholders",
  async (params: { 
    organizationId: number; 
    page?: number; 
    limit?: number; 
    search?: string; 
    isActive?: boolean;
    includeShareCapital?: boolean;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
      if (params.includeShareCapital) queryParams.append('includeShareCapital', params.includeShareCapital.toString())

      const response = await api.get<ServiceResponse<{
        shareholders: InstitutionShareholder[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>>(
        `/organizations/${params.organizationId}/shareholders/institution-shareholders?${queryParams.toString()}`
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateInstitutionShareholder = createAsyncThunk(
  "shareholders/updateInstitutionShareholder",
  async (data: { 
    organizationId: number; 
    shareholderId: number; 
    shareholderData: Partial<InstitutionShareholderCreationData> 
  }, { rejectWithValue }) => {
    try {
      const response = await api.put<ServiceResponse<InstitutionShareholder>>(
        `/organizations/${data.organizationId}/shareholders/institution-shareholders/${data.shareholderId}`,
        data.shareholderData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteInstitutionShareholder = createAsyncThunk(
  "shareholders/deleteInstitutionShareholder",
  async (data: { organizationId: number; shareholderId: number }, { rejectWithValue }) => {
    try {
      const response = await api.delete<ServiceResponse<void>>(
        `/organizations/${data.organizationId}/shareholders/institution-shareholders/${data.shareholderId}`
      )
      return { ...response.data, shareholderId: data.shareholderId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Document Upload
export const uploadShareholderDocument = createAsyncThunk(
  "shareholders/uploadDocument",
  async (data: {
    organizationId: number;
    shareholderType: 'individual' | 'institution';
    shareholderId: number;
    documentType: string;
    file: File;
  }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('document', data.file)
      formData.append('documentType', data.documentType)

      const response = await api.post<ServiceResponse<{
        shareholderId: number;
        documentType: string;
        documentUrl: string;
      }>>(
        `/organizations/${data.organizationId}/shareholders/${data.shareholderType}/${data.shareholderId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Shareholder slice
const shareholdersSlice = createSlice({
  name: "shareholders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearShareholders: (state) => {
      state.individualShareholders = []
      state.institutionShareholders = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Individual Shareholder
      .addCase(createIndividualShareholder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createIndividualShareholder.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.individualShareholders.unshift(action.payload.data)
        }
      })
      .addCase(createIndividualShareholder.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to create individual shareholder"
      })
      
      // Get Individual Shareholders
      .addCase(getIndividualShareholders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getIndividualShareholders.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.individualShareholders = action.payload.data.shareholders
          state.pagination = {
            currentPage: action.payload.data.pagination.page,
            totalPages: action.payload.data.pagination.totalPages,
            totalItems: action.payload.data.pagination.total,
            perPage: action.payload.data.pagination.limit,
          }
        }
      })
      .addCase(getIndividualShareholders.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to fetch individual shareholders"
      })
      
      // Update Individual Shareholder
      .addCase(updateIndividualShareholder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateIndividualShareholder.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          const index = state.individualShareholders.findIndex(s => s.id === action.payload.data!.id)
          if (index !== -1) {
            state.individualShareholders[index] = action.payload.data
          }
        }
      })
      .addCase(updateIndividualShareholder.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to update individual shareholder"
      })
      
      // Delete Individual Shareholder
      .addCase(deleteIndividualShareholder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteIndividualShareholder.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success) {
          state.individualShareholders = state.individualShareholders.filter(
            s => s.id !== action.payload.shareholderId
          )
        }
      })
      .addCase(deleteIndividualShareholder.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to delete individual shareholder"
      })
      
      // Create Institution Shareholder
      .addCase(createInstitutionShareholder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createInstitutionShareholder.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.institutionShareholders.unshift(action.payload.data)
        }
      })
      .addCase(createInstitutionShareholder.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to create institution shareholder"
      })
      
      // Get Institution Shareholders
      .addCase(getInstitutionShareholders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getInstitutionShareholders.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.institutionShareholders = action.payload.data.shareholders
          state.pagination = {
            currentPage: action.payload.data.pagination.page,
            totalPages: action.payload.data.pagination.totalPages,
            totalItems: action.payload.data.pagination.total,
            perPage: action.payload.data.pagination.limit,
          }
        }
      })
      .addCase(getInstitutionShareholders.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to fetch institution shareholders"
      })
      
      // Update Institution Shareholder
      .addCase(updateInstitutionShareholder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateInstitutionShareholder.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          const index = state.institutionShareholders.findIndex(s => s.id === action.payload.data!.id)
          if (index !== -1) {
            state.institutionShareholders[index] = action.payload.data
          }
        }
      })
      .addCase(updateInstitutionShareholder.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to update institution shareholder"
      })
      
      // Delete Institution Shareholder
      .addCase(deleteInstitutionShareholder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteInstitutionShareholder.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success) {
          state.institutionShareholders = state.institutionShareholders.filter(
            s => s.id !== action.payload.shareholderId
          )
        }
      })
      .addCase(deleteInstitutionShareholder.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to delete institution shareholder"
      })
      
      // Upload Document
      .addCase(uploadShareholderDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadShareholderDocument.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle document upload success - you might want to update the shareholder record
      })
      .addCase(uploadShareholderDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to upload document"
      })

      .addCase(extendIndividualShareholder.pending, (state) => {
  state.isLoading = true
  state.error = null
})
.addCase(extendIndividualShareholder.fulfilled, (state, action) => {
  state.isLoading = false
  if (action.payload.success && action.payload.data) {
    const index = state.individualShareholders.findIndex(s => s.id === action.payload.data!.id)
    if (index !== -1) {
      state.individualShareholders[index] = action.payload.data
    }
  }
})
.addCase(extendIndividualShareholder.rejected, (state, action) => {
  state.isLoading = false
  state.error = typeof action.payload === 'string' ? action.payload : 
               (action.payload as any)?.message || "Failed to extend individual shareholder"
})

// Extend Institution Shareholder
.addCase(extendInstitutionShareholder.pending, (state) => {
  state.isLoading = true
  state.error = null
})
.addCase(extendInstitutionShareholder.fulfilled, (state, action) => {
  state.isLoading = false
  if (action.payload.success && action.payload.data) {
    const index = state.institutionShareholders.findIndex(s => s.id === action.payload.data!.id)
    if (index !== -1) {
      state.institutionShareholders[index] = action.payload.data
    }
  }
})
.addCase(extendInstitutionShareholder.rejected, (state, action) => {
  state.isLoading = false
  state.error = typeof action.payload === 'string' ? action.payload : 
               (action.payload as any)?.message || "Failed to extend institution shareholder"
})
  },
})

export const { clearError, clearShareholders } = shareholdersSlice.actions
export default shareholdersSlice.reducer