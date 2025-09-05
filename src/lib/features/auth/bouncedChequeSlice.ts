import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export enum BouncedChequeType {
  INDIVIDUAL = "individual",
  INSTITUTION = "institution",
}

export enum ChequeReturnReason {
  INSUFFICIENT_FUNDS = "insufficient_funds",
  ACCOUNT_CLOSED = "account_closed",
  SIGNATURE_MISMATCH = "signature_mismatch",
  POST_DATED = "post_dated",
  PAYMENT_STOPPED = "payment_stopped",
  REFER_TO_DRAWER = "refer_to_drawer",
  TECHNICAL_REASON = "technical_reason",
  OTHER = "other",
}

export interface BouncedCheque {
  id: number;
  accountNumber: string;
  type: BouncedChequeType;
  surname?: string;
  forename1?: string;
  forename2?: string;
  forename3?: string;
  nationalId?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  institutionName?: string;
  tradingName?: string;
  companyRegNo?: string;
  companyRegistrationDate?: string;
  passportNo?: string;
  nationality?: string;
  postalAddressLine1?: string;
  postalAddressLine2?: string;
  town?: string;
  postalCode?: string;
  country?: string;
  chequeNumber: string;
  chequeDate: string;
  reportedDate: string;
  currency: string;
  amount: number;
  returnedChequeReason: ChequeReturnReason;
  beneficiaryName: string;
  notes?: string;
  loanId?: number;
  borrowerId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BouncedChequeStats {
  totalCheques: number;
  totalAmount: number;
  byType: Record<string, number>;
  byReason: Record<string, number>;
  overdueCount: number;
  recentCount: number;
}

interface BouncedChequeState {
  cheques: BouncedCheque[];
  currentCheque: BouncedCheque | null;
  stats: BouncedChequeStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;
}

const initialState: BouncedChequeState = {
  cheques: [],
  currentCheque: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: null,
};

// Helper functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const getOrganizationId = () => {
  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    return user?.organizationId;
  }
  return null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all bounced cheques
 */
export const fetchBouncedCheques = createAsyncThunk(
  "bouncedCheque/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: BouncedChequeType;
      reason?: ChequeReturnReason;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.type) queryParams.append("type", params.type);
      if (params.reason) queryParams.append("reason", params.reason);

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bounced cheques");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch bounced cheque statistics
 */
export const fetchBouncedChequeStats = createAsyncThunk(
  "bouncedCheque/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch statistics");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch single bounced cheque by ID
 */
export const fetchBouncedChequeById = createAsyncThunk(
  "bouncedCheque/fetchById",
  async (chequeId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques/${chequeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bounced cheque");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create a new bounced cheque
 */
export const createBouncedCheque = createAsyncThunk(
  "bouncedCheque/create",
  async (chequeData: Partial<BouncedCheque>, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chequeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create bounced cheque");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update a bounced cheque
 */
export const updateBouncedCheque = createAsyncThunk(
  "bouncedCheque/update",
  async (
    {
      chequeId,
      updateData,
    }: {
      chequeId: number;
      updateData: Partial<BouncedCheque>;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques/${chequeId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bounced cheque");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete a bounced cheque
 */
export const deleteBouncedCheque = createAsyncThunk(
  "bouncedCheque/delete",
  async (chequeId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques/${chequeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bounced cheque");
      }

      return chequeId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Link bounced cheque to a loan
 */
export const linkBouncedChequeToLoan = createAsyncThunk(
  "bouncedCheque/linkToLoan",
  async (
    { chequeId, loanId }: { chequeId: number; loanId: number },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/bounced-cheques/${chequeId}/link-loan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ loanId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to link to loan");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bouncedChequeSlice = createSlice({
  name: "bouncedCheque",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCheque: (state, action) => {
      state.currentCheque = action.payload;
    },
    clearBouncedCheques: (state) => {
      state.cheques = [];
      state.currentCheque = null;
      state.pagination = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bounced cheques
      .addCase(fetchBouncedCheques.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBouncedCheques.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cheques = action.payload.data || action.payload;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchBouncedCheques.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch bounced cheque statistics
      .addCase(fetchBouncedChequeStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBouncedChequeStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchBouncedChequeStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single bounced cheque
      .addCase(fetchBouncedChequeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBouncedChequeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCheque = action.payload;
      })
      .addCase(fetchBouncedChequeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create bounced cheque
      .addCase(createBouncedCheque.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBouncedCheque.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cheques.unshift(action.payload);
      })
      .addCase(createBouncedCheque.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update bounced cheque
      .addCase(updateBouncedCheque.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBouncedCheque.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cheques.findIndex(
          (cheque) => cheque.id === action.payload.id
        );
        if (index !== -1) {
          state.cheques[index] = action.payload;
        }
        if (state.currentCheque?.id === action.payload.id) {
          state.currentCheque = action.payload;
        }
      })
      .addCase(updateBouncedCheque.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete bounced cheque
      .addCase(deleteBouncedCheque.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBouncedCheque.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cheques = state.cheques.filter(
          (cheque) => cheque.id !== action.payload
        );
        if (state.currentCheque?.id === action.payload) {
          state.currentCheque = null;
        }
      })
      .addCase(deleteBouncedCheque.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Link to loan
      .addCase(linkBouncedChequeToLoan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(linkBouncedChequeToLoan.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cheques.findIndex(
          (cheque) => cheque.id === action.payload.id
        );
        if (index !== -1) {
          state.cheques[index] = action.payload;
        }
        if (state.currentCheque?.id === action.payload.id) {
          state.currentCheque = action.payload;
        }
      })
      .addCase(linkBouncedChequeToLoan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentCheque,
  clearBouncedCheques,
  clearStats,
} = bouncedChequeSlice.actions;

export default bouncedChequeSlice.reducer;