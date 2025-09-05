import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  organizationId: number;
  assignedLoansCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ✅ FIXED: Updated to use correct roles
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "loan_officer" | "board_director" | "senior_manager" | "managing_director";
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface UserState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  createSuccess: boolean;
  updateSuccess: boolean;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  filters: {
    role: undefined,
    search: "",
    page: 1,
    limit: 10,
    isActive: true,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  pagination: null,
  createSuccess: false,
  updateSuccess: false,
};

// Async Thunks

/**
 * Create a new user
 */
export const createUser = createAsyncThunk(
  "users/create",
  async (
    { organizationId, userData }: { organizationId: number; userData: CreateUserData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/organizations/${organizationId}/users`,
        userData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
);

/**
 * Fetch all users
 */
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (
    { organizationId, filters }: { organizationId: number; filters?: UserFilters },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append("role", filters.role);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());

      const response = await api.get(
        `/organizations/${organizationId}/users?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

/**
 * Fetch user by ID
 */
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (
    { organizationId, userId }: { organizationId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/organizations/${organizationId}/users/${userId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

/**
 * Update user
 */
export const updateUser = createAsyncThunk(
  "users/update",
  async (
    {
      organizationId,
      userId,
      userData,
    }: {
      organizationId: number;
      userId: number;
      userData: UpdateUserData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/organizations/${organizationId}/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

/**
 * Deactivate user
 */
export const deactivateUser = createAsyncThunk(
  "users/deactivate",
  async (
    {
      organizationId,
      userId,
      reassignTo,
      reason,
    }: {
      organizationId: number;
      userId: number;
      reassignTo?: number;
      reason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `/organizations/${organizationId}/users/${userId}/deactivate`,
        { reassignTo, reason }
      );
      return { userId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to deactivate user"
      );
    }
  }
);

/**
 * Reset user password
 */
export const resetUserPassword = createAsyncThunk(
  "users/resetPassword",
  async (
    { organizationId, userId }: { organizationId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/organizations/${organizationId}/users/${userId}/reset-password`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// Slice
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessFlags: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = true;
        // Add new user to list if it matches current filters
        if (action.payload.data?.user) {
          state.users.unshift(action.payload.data.user);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload.data?.user || null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        // Update user in list
        const updatedUser = action.payload.data;
        const index = state.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Deactivate User
    builder
      .addCase(deactivateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const userId = action.payload.userId;
        // Update user status in list
        const index = state.users.findIndex((u) => u.id === userId);
        if (index !== -1) {
          state.users[index].isActive = false;
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetUserPassword.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearSelectedUser, clearError, clearSuccessFlags } =
  userSlice.actions;

export default userSlice.reducer;