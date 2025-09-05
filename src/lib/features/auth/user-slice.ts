import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import api from "@/lib/api"
import Cookies from "js-cookie"
export enum UserRole {
  SYSTEM_OWNER = "system_owner",
  CLIENT = "client",
  MANAGER = "manager",
  STAFF = "staff",
  ADMIN = "admin",
  board_director="board_director",
  senior_manager="senior_manager",
  managing_director="managing_director",
  loan_officer="loan_officer"

  
}

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

interface Organization {
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
}

interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone: string | null;
  organization: Organization | null;
  organizationId: number | null;
  isActive: boolean;
  isVerified: boolean;
  isFirstLogin: boolean;
  failedLoginAttempts: number;
  accountLockedUntil: Date | null;
  lastLoginAt: Date | null;
  firstName: string | null;
  lastName: string | null;
  telephone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    organization?: {
      id: number;
      name: string;
      isActive: boolean;
    };
  };
  token?: string;
  requiresPasswordReset?: boolean;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresPasswordReset: boolean;
  resetEmail: string | null;
  resetToken: string | null;
}

// Storage helpers
const setToStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value)
  }
}

const removeFromStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
  }
}

const getFromStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key)
  }
  return null
}

// Initial state
const initialState: AuthState = {
  token: Cookies.get("token") || getFromStorage("token"),
  user: Cookies.get("user") ? JSON.parse(Cookies.get("user") as string) : null,
  isAuthenticated: !!(Cookies.get("token") || getFromStorage("token")),
  isLoading: false,
  error: null,
  requiresPasswordReset: false,
  resetEmail: null,
  resetToken: null,
}

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        "/auth/request-password-reset",
        { email }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; message: string; resetToken: string }>(
        "/auth/verify-otp",
        data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { email: string; token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        "/auth/reset-password",
        data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { newPassword: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        "/auth/change-password",
        data
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AuthResponse>("/auth/profile")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put<AuthResponse>("/auth/profile", profileData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; message: string; data?: any }>(
        "/auth/verify-token",
        { token }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/refresh-token")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; message: string }>("/auth/logout")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createSystemOwner = createAsyncThunk(
  "auth/createSystemOwner",
  async (data: { firstName: string; lastName: string; email: string; phone: string; organizationId?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/create-system-owner", data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const changeSystemOwner = createAsyncThunk(
  "auth/changeSystemOwner",
  async (data: { firstName: string; lastName: string; email: string; telephone: string; organizationId?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/change-system-owner", data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    setRequiresPasswordReset: (state, action: PayloadAction<{ requiresPasswordReset: boolean; email?: string }>) => {
      state.requiresPasswordReset = action.payload.requiresPasswordReset
      state.resetEmail = action.payload.email || null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.token && action.payload.data) {
          state.token = action.payload.token
          state.user = action.payload.data.user
          state.isAuthenticated = true
          state.requiresPasswordReset = false
          
          Cookies.set("token", action.payload.token, { expires: 1 })
          Cookies.set("user", JSON.stringify(action.payload.data.user), { expires: 1 })
          setToStorage("token", action.payload.token)
          setToStorage("user", JSON.stringify(action.payload.data.user))
        } else if (action.payload.requiresPasswordReset) {
          state.requiresPasswordReset = true
          state.resetEmail = action.payload.email || null
        }
      })
  // In your login.rejected case
.addCase(login.rejected, (state, action) => {
  state.isLoading = false
  
  // Handle different error formats
  if (typeof action.payload === 'string') {
    state.error = action.payload
  } else if (typeof action.payload === 'object' && action.payload !== null) {
    // Handle error object - extract message if available
    const errorObj = action.payload as any
    state.error = errorObj.message || errorObj.error || JSON.stringify(errorObj)
  } else {
    state.error = "Login failed"
  }
  
  state.requiresPasswordReset = (action.payload as any)?.requiresPasswordReset || false
  state.resetEmail = (action.payload as any)?.email || null
})
      
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Password reset request failed"
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.resetToken = action.payload.resetToken
        setToStorage("reset_token", action.payload.resetToken)
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "OTP verification failed"
        state.resetToken = null
        removeFromStorage("reset_token")
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
        state.requiresPasswordReset = false
        state.resetEmail = null
        state.resetToken = null
        removeFromStorage("reset_token")
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Password reset failed"
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Password change failed"
      })
      
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user
          Cookies.set("user", JSON.stringify(action.payload.data.user), { expires: 1 })
          setToStorage("user", JSON.stringify(action.payload.data.user))
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to fetch profile"
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user
          Cookies.set("user", JSON.stringify(action.payload.data.user), { expires: 1 })
          setToStorage("user", JSON.stringify(action.payload.data.user))
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to update profile"
      })
      
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Token verification failed"
        state.token = null
        state.user = null
        state.isAuthenticated = false
        Cookies.remove("token")
        Cookies.remove("user")
        removeFromStorage("token")
        removeFromStorage("user")
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success && action.payload.token && action.payload.data) {
          state.token = action.payload.token
          state.user = action.payload.data.user
          state.isAuthenticated = true
          
          Cookies.set("token", action.payload.token, { expires: 1 })
          Cookies.set("user", JSON.stringify(action.payload.data.user), { expires: 1 })
          setToStorage("token", action.payload.token)
          setToStorage("user", JSON.stringify(action.payload.data.user))
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Token refresh failed"
        state.token = null
        state.user = null
        state.isAuthenticated = false
        Cookies.remove("token")
        Cookies.remove("user")
        removeFromStorage("token")
        removeFromStorage("user")
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.token = null
        state.user = null
        state.isAuthenticated = false
        state.error = null
        state.requiresPasswordReset = false
        state.resetEmail = null
        state.resetToken = null
        
        Cookies.remove("token")
        Cookies.remove("user")
        removeFromStorage("token")
        removeFromStorage("user")
        removeFromStorage("reset_token")
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Logout failed"
        // Still clear auth state even if logout API call fails
        state.token = null
        state.user = null
        state.isAuthenticated = false
        Cookies.remove("token")
        Cookies.remove("user")
        removeFromStorage("token")
        removeFromStorage("user")
        removeFromStorage("reset_token")
      })
      
      // Create System Owner
      .addCase(createSystemOwner.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSystemOwner.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(createSystemOwner.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to create system owner"
      })
      
      // Change System Owner
      .addCase(changeSystemOwner.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changeSystemOwner.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changeSystemOwner.rejected, (state, action) => {
        state.isLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 
                     (action.payload as any)?.message || "Failed to change system owner"
      })
  },
})

export const { clearAuthError, setRequiresPasswordReset } = authSlice.actions
export default authSlice.reducer