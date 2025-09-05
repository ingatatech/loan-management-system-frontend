import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface Organization {
  id: number
  name: string
  isActive: boolean
  created_at: string
  updated_at: string
}

interface User {
  user_id: number
  username: string
  role: string
  is_active: boolean
  last_login: string
  organization: Organization
}

interface DashboardStats {
  totalOrganizations: number
  activeOrganizations: number
  totalUsers: number
  activeUsers: number
  totalEmployees: number
  activeEmployees: number
}

interface AdminState {
  organizations: Organization[]
  users: User[]
  dashboardStats: DashboardStats | null
  isLoading: boolean
  error: string | null
}

const initialState: AdminState = {
  organizations: [],
  users: [],
  dashboardStats: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchDashboardStats = createAsyncThunk("admin/fetchDashboardStats", async () => {
  const response = await api.get("/admin/dashboard/stats")
  return response.data.data
})

export const fetchOrganizations = createAsyncThunk("admin/fetchOrganizations", async () => {
  const response = await api.get("/admin/organizations")
  return response.data.data
})

export const toggleOrganizationStatus = createAsyncThunk("admin/toggleOrganizationStatus", async (id: number) => {
  const response = await api.patch(`/admin/organizations/${id}/toggle-status`)
  return response.data.data
})

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async () => {
  const response = await api.get("/admin/users")
  return response.data.data
})

export const createUser = createAsyncThunk("admin/createUser", async (userData: Partial<User>) => {
  const response = await api.post("/admin/users", userData)
  return response.data.data
})

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, data }: { id: number; data: Partial<User> }) => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data.data
  },
)

export const deleteUser = createAsyncThunk("admin/deleteUser", async (id: number) => {
  await api.delete(`/admin/users/${id}`)
  return id
})

export const toggleUserStatus = createAsyncThunk("admin/toggleUserStatus", async (id: number) => {
  const response = await api.patch(`/admin/users/${id}/toggle-status`)
  return response.data.data
})

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch dashboard stats"
      })
      // Organizations
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload
      })
      .addCase(toggleOrganizationStatus.fulfilled, (state, action) => {
        const index = state.organizations.findIndex((org) => org.id === action.payload.id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
      })
      // Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.user_id === action.payload.user_id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.user_id !== action.payload)
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.user_id === action.payload.user_id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
