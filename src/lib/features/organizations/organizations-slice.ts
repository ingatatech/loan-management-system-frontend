import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

export interface Organization {
  registrationNumber: any
  id: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface OrganizationsState {
  organizations: Organization[]
  currentOrganization: Organization | null
  loading: boolean
  isLoading: boolean
  error: string | null
}

const initialState: OrganizationsState = {
  organizations: [],
  currentOrganization: null,
  loading: false,
  isLoading: false,

  error: null,
}

// Async thunks
export const fetchOrganizations = createAsyncThunk("organizations/fetchOrganizations", async () => {
  const response = await api.get("/organizations")
  return response.data
})

export const getOrganizationById = createAsyncThunk("organizations/getOrganizationById", async (id: string) => {
  const response = await api.get(`/organizations/${id}`)
  return response.data
})

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (organizationData: Omit<Organization, "id" | "createdAt" | "updatedAt">) => {
    const response = await api.post("/organizations", organizationData)
    return response.data
  },
)

export const updateOrganization = createAsyncThunk(
  "organizations/updateOrganization",
  async ({ id, data }: { id: string; data: Partial<Organization> }) => {
    const response = await api.put(`/organizations/${id}`, data)
    return response.data
  },
)

export const toggleOrganizationStatus = createAsyncThunk(
  "organizations/toggleOrganizationStatus",
  async (id: string) => {
    const response = await api.patch(`/organizations/${id}/toggle-status`)
    return response.data
  },
)

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
  },
  extraReducers: (builder) => {
    builder
      // Fetch organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false
        state.organizations = action.payload
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch organizations"
      })
      // Fetch organization by ID
      .addCase(getOrganizationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOrganizationById.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrganization = action.payload
      })
      .addCase(getOrganizationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch organization"
      })
      // Create organization
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.push(action.payload)
      })
      // Update organization
      .addCase(updateOrganization.fulfilled, (state, action) => {
        const index = state.organizations.findIndex((org) => org.id === action.payload.id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload
        }
      })
      // Toggle organization status
      .addCase(toggleOrganizationStatus.fulfilled, (state, action) => {
        const index = state.organizations.findIndex((org) => org.id === action.payload.id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
      })
  },
})

export const { clearError, clearCurrentOrganization } = organizationsSlice.actions
export default organizationsSlice.reducer
