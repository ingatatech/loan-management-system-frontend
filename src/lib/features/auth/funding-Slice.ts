// fundingSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface PaymentDetails {
  paymentMethod: string;
  paymentDate: string;
  paymentReference: string;
  bankName?: string;
  accountNumber?: string;
  transactionId?: string;
}

interface ShareCapitalFormData {
  shareholderId: number;
  shareholderType: 'individual' | 'institution';
  dateOfContribution: string;
  typeOfShare: 'ordinary' | 'preference' | 'cumulative_preference' | 'redeemable' | 'other';
  numberOfShares: number | string;
  valuePerShare: number | string;
  totalContributedCapitalValue?: number | string;
  paymentDetails: {
    paymentMethod: string;
    paymentDate: string;
    paymentReference: string;
    bankName?: string;
    accountNumber?: string;
    transactionId?: string;
  };
  notes?: string;
  // NEW FIELDS
  contributionCount?: number | string;
  firstContributionDate?: string;
  lastContributionDate?: string;
}

interface BorrowingFormData {
  lenderType: string;
  lenderName: string;
  lenderAddress: {
    country: string;
    province: string;
    district: string;
    sector?: string;
    cell?: string;
    village?: string;
  };
  lenderPhone?: string;
  lenderEmail?: string;
  amountBorrowed: number | string;
  interestRate: number | string;
  tenureMonths: number | string;
  borrowingDate: string;
  maturityDate: string;
  purpose?: string;
  collateralDescription?: string;
  collateralValue?: number | string;
}

interface GrantedFundsFormData {
  grantorName: string;
  grantorAddress: {
    country: string;
    province: string;
    district: string;
  };
  grantorPhone?: string;
  grantorEmail?: string;
  amountGranted: number | string;
  grantPurpose: string;
  grantType: string;
  grantDate: string;
  projectStartDate: string;
  projectEndDate: string;
  grantConditions: Array<{
    condition: string;
    description: string;
    dueDate?: string;
  }>;
}

interface OperationalFundsFormData {
  fundSource: string;
  fundSourceDescription?: string;
  amountCommitted: number | string;
  commitmentDate: string;
  availabilityDate?: string;
  expirationDate?: string;
  purpose?: string;
  utilizationPlan: Array<{
    category: string;
    description: string;
    allocatedAmount: number | string;
    utilizationPeriod: {
      startDate: string;
      endDate: string;
    };
  }>;
}

interface FundingStructure {
  shareCapitals: any[];
  borrowings: any[];
  grants: any[];
  operational: any[];
}

interface FundingState {
  fundingStructure: FundingStructure | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FundingState = {
  fundingStructure: null,
  isLoading: false,
  error: null,
};


export const getFundingStructure = createAsyncThunk(
  "funding/getFundingStructure",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }
      const response = await api.get(`/organizations/${user.organizationId}/funding/structure`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const recordShareCapital = createAsyncThunk(
  "funding/recordShareCapital",
  async ({ organizationId, shareCapitalData }: { organizationId: number; shareCapitalData: FormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }
      
      const response = await api.post(
        `/organizations/${user.organizationId}/funding/share-capital`,
        shareCapitalData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const recordBorrowing = createAsyncThunk(
  "funding/recordBorrowing",
  async ({ organizationId, borrowingData }: { organizationId: number; borrowingData: BorrowingFormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }
      const response = await api.post(`/organizations/${user.organizationId}/funding/borrowing`, {
        organizationId,
        ...borrowingData
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const recordGrantedFunds = createAsyncThunk(
  "funding/recordGrantedFunds",
  async (
    { grantData }: { grantData: GrantedFundsFormData }, // 👈 remove orgId from params
    { rejectWithValue }
  ) => {
    try {
      // ✅ Get the user from localStorage
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.post(
        `/organizations/${user.organizationId}/funding/grants`,
        {
          organizationId: user.organizationId, // send it in body too
          ...grantData,
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const recordOperationalFunds = createAsyncThunk(
  "funding/recordOperationalFunds",
  async ({ organizationId, operationalData }: { organizationId: number; operationalData: OperationalFundsFormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }
      const response = await api.post(`/organizations/${user.organizationId}/funding/operational`, {
        organizationId,
        ...operationalData
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const deleteShareCapital = createAsyncThunk(
  "funding/deleteShareCapital",
  async (id: number, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.delete(
        `/organizations/${user.organizationId}/funding/share-capital/${id}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const updateShareCapital = createAsyncThunk(
  "funding/updateShareCapital",
  async ({ id, shareCapitalData }: { id: number; shareCapitalData: FormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.put(
        `/organizations/${user.organizationId}/funding/share-capital/${id}`,
        shareCapitalData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFundingItem = createAsyncThunk(
  "funding/deleteFundingItem",
  async ({ type, id }: { type: 'shareCapital' | 'borrowing' | 'grant' | 'operational'; id: number }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/funding/${type}/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadFundingDocument = createAsyncThunk(
  "funding/uploadDocument",
  async ({ type, id, documentType, file }: { type: string; id: number; documentType: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await api.post(`/funding/${type}/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add these to your existing async thunks
export const updateBorrowing = createAsyncThunk(
  "funding/updateBorrowing",
  async ({ id, borrowingData }: { id: number; borrowingData: BorrowingFormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.put(`/organizations/${user.organizationId}/funding/borrowing/${id}`, borrowingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBorrowing = createAsyncThunk(
  "funding/deleteBorrowing",
  async (id: number, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.delete(`/organizations/${user.organizationId}/funding/borrowing/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add these to your existing async thunks
export const updateGrantedFunds = createAsyncThunk(
  "funding/updateGrantedFunds",
  async ({ id, grantData }: { id: number; grantData: GrantedFundsFormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.put(`/organizations/${user.organizationId}/funding/grants/${id}`, grantData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteGrantedFunds = createAsyncThunk(
  "funding/deleteGrantedFunds",
  async (id: number, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.delete(`/organizations/${user.organizationId}/funding/grants/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOperationalFunds = createAsyncThunk(
  "funding/updateOperationalFunds",
  async ({ id, operationalData }: { id: number; operationalData: OperationalFundsFormData }, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.put(`/organizations/${user.organizationId}/funding/operational/${id}`, operationalData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteOperationalFunds = createAsyncThunk(
  "funding/deleteOperationalFunds",
  async (id: number, { rejectWithValue }) => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      if (!user || !user.organizationId) {
        throw new Error("No organizationId found for the current user");
      }

      const response = await api.delete(`/organizations/${user.organizationId}/funding/operational/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const fundingSlice = createSlice({
  name: "funding",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetFundingState: (state) => {
      state.fundingStructure = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Funding Structure
      .addCase(getFundingStructure.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFundingStructure.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fundingStructure = action.payload.data;
      })
      .addCase(getFundingStructure.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Record Share Capital
      .addCase(recordShareCapital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
.addCase(recordShareCapital.fulfilled, (state, action) => {
  state.isLoading = false;
  
  // Check if this was an update to existing record or new record
  const { isNewRecord, previousTotal, newTotal } = action.payload;
  
  // You can use this information for UI feedback if needed
  if (!isNewRecord) {
    console.log(`Updated existing record. Previous total: ${previousTotal}, New total: ${newTotal}`);
  }
})
      .addCase(recordShareCapital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Record Borrowing
      .addCase(recordBorrowing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordBorrowing.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(recordBorrowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Record Granted Funds
      .addCase(recordGrantedFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordGrantedFunds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(recordGrantedFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Record Operational Funds
      .addCase(recordOperationalFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordOperationalFunds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(recordOperationalFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Share Capital
      .addCase(updateShareCapital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateShareCapital.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateShareCapital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteShareCapital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteShareCapital.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteShareCapital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Funding Item
      .addCase(deleteFundingItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFundingItem.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteFundingItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add these to your extraReducers
      .addCase(updateBorrowing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBorrowing.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateBorrowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBorrowing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBorrowing.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteBorrowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGrantedFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGrantedFunds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateGrantedFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteGrantedFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGrantedFunds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteGrantedFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOperationalFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOperationalFunds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateOperationalFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteOperationalFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOperationalFunds.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteOperationalFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload Document
      .addCase(uploadFundingDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFundingDocument.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadFundingDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetFundingState } = fundingSlice.actions;
export default fundingSlice.reducer;