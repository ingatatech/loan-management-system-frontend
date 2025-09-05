import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

export interface SystemUser {
  id: string
  username: string
  email: string
  role: "hr" | "admin" 
  isActive: boolean
  organizationId?: string
  organizationName?: string
  createdAt: string
  updatedAt: string
}

interface SystemUsersState {
  users: SystemUser[]
  currentUser: SystemUser | null
  loading: boolean
  error: string | null
}

const initialState: SystemUsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchSystemUsers = createAsyncThunk("systemUsers/fetchSystemUsers", async () => {
  const response = await api.get("/admin/users")
  return response.data
})

export const fetchSystemUserById = createAsyncThunk("systemUsers/fetchSystemUserById", async (id: string) => {
  const response = await api.get(`/admin/users/${id}`)
  return response.data
})

export const createSystemUser = createAsyncThunk(
  "systemUsers/createSystemUser",
  async (userData: Omit<SystemUser, "id" | "createdAt" | "updatedAt"> & { password: string }) => {
    const response = await api.post("/admin/users", userData)
    return response.data
  },
)

export const updateSystemUser = createAsyncThunk(
  "systemUsers/updateSystemUser",
  async ({ id, data }: { id: string; data: Partial<SystemUser> }) => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },
)

export const toggleSystemUserStatus = createAsyncThunk("systemUsers/toggleSystemUserStatus", async (id: string) => {
  const response = await api.patch(`/admin/users/${id}/toggle-status`)
  return response.data
})

const systemUsersSlice = createSlice({
  name: "systemUsers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch system users
      .addCase(fetchSystemUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSystemUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchSystemUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch system users"
      })
      // Fetch system user by ID
      .addCase(fetchSystemUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSystemUserById.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchSystemUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch system user"
      })
      // Create system user
      .addCase(createSystemUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      // Update system user
      .addCase(updateSystemUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload
        }
      })
      // Toggle system user status
      .addCase(toggleSystemUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
  },
})

export const { clearError, clearCurrentUser } = systemUsersSlice.actions
export default systemUsersSlice.reducer
