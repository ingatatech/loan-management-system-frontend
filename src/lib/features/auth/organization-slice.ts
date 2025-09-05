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
export interface Service {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  serviceCode: string | null;
  basePrice: number | null;
  pricingType: string | null;
  interestRate: number | null;
  minLoanAmount: number | null;
  maxLoanAmount: number | null;
  minTenureMonths: number | null;
  maxTenureMonths: number | null;
  requirements: string[] | null;
  eligibilityCriteria: { [key: string]: any } | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  categoryId: number;
  organizationId: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  categoryCode: string | null;
  categoryIcon: string | null;
  organizationId: number;
  services: Service[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Organization {
  id: number;
  name: string;
  selectedCategories: string[] | null;
  address: Address | null;
  tinNumber: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  registrationNumber: string | null;
  registrationDate: Date | null;
  businessSector: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  
  // Add these properties to match the API response
  categories?: Category[];
  services?: Service[];
  stats?: {
    totalCategories: number;
    totalServices: number;
    activeCategoriesCount: number;
    activeServicesCount: number;
  };
}
export interface OrganizationStats {
  totalShareholders: number;
  totalShareCapital: number;
  totalBorrowings: number;
  totalGrants: number;
  totalDirectors: number;
  totalManagement: number;
  totalCategories: number;
  totalServices: number;
  isValidForLoanApplication: boolean;
}
export interface OrganizationCreationData {
  name: string;
  selectedCategories: string[];
  categoriesData?: Array<{
    name: string;
    services: Array<{
      name: string;
      description: string;
    }>;
  }>;
  address?: Address;
  tinNumber?: string;
  website?: string;
  description?: string;
  registrationNumber?: string;
  registrationDate?: Date;
  businessSector?: string;
  phone?: string;
  email?: string;
  adminUser: {
    username: string;
    email: string;
    password?: string;
    phone?: string;
  };
}

export interface OrganizationUpdateData {
  name?: string;
  selectedCategories?: string[];
  address?: Address;
  tinNumber?: string;
  website?: string;
  description?: string;
  registrationNumber?: string;
  registrationDate?: Date;
  businessSector?: string;
  phone?: string;
  email?: string;
  categoriesData?: Array<{
    name: string;
    services: Array<{
      name: string;
      description: string;
      id?: number;
    }>;
  }>;
}


interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  debug?: any;
}

interface OrganizationsState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  organizationStats: OrganizationStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
}
const initialState: OrganizationsState = {
  organizations: [],
  currentOrganization: null,
  organizationStats: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  },
}

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (organizationData: OrganizationCreationData, { rejectWithValue }) => {
    try {
      const response = await api.post<ServiceResponse<Organization>>("/organizations", organizationData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const updateData = {
        ...data,
        categoriesData: data.categoriesData || []
      };

      const response = await api.put<ServiceResponse<Organization>>(`/organizations/${id}`, updateData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getOrganizationById = createAsyncThunk(
  "organizations/getOrganizationById",
  async ({ id }: { id: number; includeRelations?: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.get<ServiceResponse<Organization>>(`/organizations/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getAllOrganizations = createAsyncThunk(
  "organizations/getAllOrganizations",
  async ({ page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (search) params.append('search', search)

      const response = await api.get<ServiceResponse<{ organizations: Organization[]; total: number; totalPages: number }>>(
        `/organizations?${params.toString()}`
      )

      // Log the response for debugging
      console.log('API Response:', response.data);

      return response.data
    } catch (error: any) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const uploadOrganizationLogo = createAsyncThunk(
  "organizations/uploadOrganizationLogo",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await api.post<ServiceResponse<Organization>>(`/organizations/${id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getOrganizationStats = createAsyncThunk(
  "organizations/getOrganizationStats",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get<ServiceResponse<OrganizationStats>>(`/organizations/${id}/stats`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const activateOrganization = createAsyncThunk(
  "organizations/activateOrganization",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.post<ServiceResponse<void>>(`/organizations/${id}/activate`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deactivateOrganization = createAsyncThunk(
  "organizations/deactivateOrganization",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.post<ServiceResponse<void>>(`/organizations/${id}/deactivate`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.delete<ServiceResponse<void>>(`/organizations/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Organization slice
const organizationsSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null
    },
    clearOrganizationStats: (state) => {
      state.organizationStats = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Organization
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.organizations.unshift(action.payload.data)
        }
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to create organization"
      })

      // Update Organization
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          const index = state.organizations.findIndex(org => org.id === action.payload.data!.id)
          if (index !== -1) {
            state.organizations[index] = action.payload.data
          }
          if (state.currentOrganization?.id === action.payload.data.id) {
            state.currentOrganization = action.payload.data
          }
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to update organization"
      })

      // Get Organization by ID
      .addCase(getOrganizationById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrganizationById.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.currentOrganization = action.payload.data
        }
      })
      .addCase(getOrganizationById.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to fetch organization"
      })

      // Get All Organizations
      .addCase(getAllOrganizations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
// Update the getAllOrganizations.fulfilled case in your organizationsSlice
.addCase(getAllOrganizations.fulfilled, (state, action) => {
  state.isLoading = false;
  console.log('Full payload received:', action.payload);

  // Handle the correct response structure
  if (action.payload.success && action.payload.data) {
    const responseData = action.payload.data;
    
    // Extract organizations from the correct path
    const organizationsData = responseData.organizations || [];
    const totalItems = responseData.total || 0;
    const totalPages = responseData.totalPages || 1;

    state.organizations = organizationsData;
    state.pagination = {
      currentPage: 1, // You might want to track this from the request
      totalPages: totalPages,
      totalItems: totalItems,
      perPage: 10, // This should match your limit parameter
    };
  } else {
    // Handle case where success is false or data is missing
    state.organizations = [];
    state.pagination = {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      perPage: 10,
    };
  }
})
      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to fetch organizations"
      })

      // Upload Organization Logo
      .addCase(uploadOrganizationLogo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadOrganizationLogo.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          const index = state.organizations.findIndex(org => org.id === action.payload.data!.id)
          if (index !== -1) {
            state.organizations[index] = action.payload.data
          }
          if (state.currentOrganization?.id === action.payload.data.id) {
            state.currentOrganization = action.payload.data
          }
        }
      })
      .addCase(uploadOrganizationLogo.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to upload logo"
      })

      // Get Organization Stats
      .addCase(getOrganizationStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrganizationStats.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.organizationStats = action.payload.data
        }
      })
      .addCase(getOrganizationStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to fetch organization stats"
      })

      // Activate Organization
      .addCase(activateOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(activateOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success) {
          const index = state.organizations.findIndex(org => org.id === action.meta.arg)
          if (index !== -1) {
            state.organizations[index].isActive = true
          }
          if (state.currentOrganization?.id === action.meta.arg) {
            state.currentOrganization.isActive = true
          }
        }
      })
      .addCase(activateOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to activate organization"
      })

      // Deactivate Organization
      .addCase(deactivateOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deactivateOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success) {
          const index = state.organizations.findIndex(org => org.id === action.meta.arg)
          if (index !== -1) {
            state.organizations[index].isActive = false
          }
          if (state.currentOrganization?.id === action.meta.arg) {
            state.currentOrganization.isActive = false
          }
        }
      })
      .addCase(deactivateOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to deactivate organization"
      })

      // Delete Organization
      .addCase(deleteOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        const organizationId = action.meta.arg
        state.organizations = state.organizations.filter(org => org.id !== organizationId)
        if (state.currentOrganization?.id === organizationId) {
          state.currentOrganization = null
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload :
          (action.payload as any)?.message || "Failed to delete organization"
      })
  },
})

export const { clearError, clearCurrentOrganization, clearOrganizationStats } = organizationsSlice.actions
export default organizationsSlice.reducer