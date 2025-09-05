import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
export interface OtherInformation {
  borrowings: {
    shareholders: { amount: number; description: string };
    relatedParties: { amount: number; description: string };
    banks: { amount: number; description: string };
    otherSources: { amount: number; description: string };
    total: { amount: number; description: string };
  };
  womenEnterprises: {
    disbursedCount: { value: number; description: string };
    outstandingCount: { value: number; description: string };
    disbursedValue: { value: number; description: string };
    outstandingValue: { value: number; description: string };
  };
  smes: {
    disbursedCount: { value: number; description: string };
    outstandingCount: { value: number; description: string };
    disbursedValue: { value: number; description: string };
    outstandingValue: { value: number; description: string };
  };
  youthEntities: {
    disbursedCount: { value: number; description: string };
    outstandingCount: { value: number; description: string };
    disbursedValue: { value: number; description: string };
    outstandingValue: { value: number; description: string };
  };
  loanApplications: {
    appliedCount: { value: number; description: string };
    rejectedCount: { value: number; description: string };
    appliedAmount: { value: number; description: string };
    rejectedAmount: { value: number; description: string };
  };
  staffNumbers: {
    men: { value: number; description: string };
    women: { value: number; description: string };
    total: { value: number; description: string };
  };
  boardMembers: {
    men: { value: number; description: string };
    women: { value: number; description: string };
    total: { value: number; description: string };
  };
  shareholders: {
    men: { value: number; description: string };
    women: { value: number; description: string };
    legalEntities: { value: number; description: string };
    total: { value: number; description: string };
  };
}

// Add this interface after OtherInformation interface
export interface SupplementaryInformation {
  reportPeriod: {
    quarter: string;
    year: number;
    startDate: string;
    endDate: string;
  };
  outstandingLoans: {
    numberByCategory: {
      men: { count: number; description: string };
      women: { count: number; description: string };
      groupsAndEntities: { count: number; description: string };
      total: { count: number };
    };
    valueByGender: {
      men: { amount: number };
      women: { amount: number };
      groupsAndEntities: { amount: number };
      total: { amount: number };
      validation: { isValid: boolean; message: string };
    };
    valueBySector: {
      agriculture: { amount: number; description: string };
      publicWorks: { amount: number; description: string };
      commerce: { amount: number; description: string };
      transport: { amount: number; description: string };
      others: { amount: number; description: string };
      total: { amount: number };
      validation: { isValid: boolean; message: string };
    };
    classification: {
      current: { count: number; amount: number; description: string };
      watch: { count: number; amount: number; description: string };
      substandard: { count: number; amount: number; description: string };
      doubtful: { count: number; amount: number; description: string };
      loss: { count: number; amount: number; description: string };
      restructured: { count: number; amount: number; description: string };
      total: { count: number; amount: number };
      validation: { isValid: boolean; message: string };
    };
  };
  newLoans: {
    numberByCategory: {
      men: { count: number; description: string };
      women: { count: number; description: string };
      groupsAndEntities: { count: number; description: string };
      total: { count: number };
    };
    valueByGender: {
      men: { amount: number; description: string };
      women: { amount: number; description: string };
      groupsAndEntities: { amount: number; description: string };
      total: { amount: number };
    };
    valueBySector: {
      agriculture: { amount: number; description: string };
      publicWorks: { amount: number; description: string };
      commerce: { amount: number; description: string };
      transport: { amount: number; description: string };
      others: { amount: number; description: string };
      total: { amount: number };
    };
    validation: {
      genderEqualsSector: boolean;
      message: string;
    };
  };
}

export interface CreateClassificationRequest {
  loanId: number
  classificationDate: string
  daysInArrears: number
  currentStatus: LoanStatus
  previousStatus: LoanStatus
  outstandingPrincipal: number
  accruedInterest: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  riskRating: string
  notes: string
}

export interface CreateClassificationResponse {
  success: boolean;
  message: string;
  data: {
    classification: LoanClassification;
    calculationDetails: ClassificationResult;
  };
}

export interface LoanClassification {
  id: number
  loanId: number
  classificationDate: string
  daysInArrears: number
  currentStatus: LoanStatus
  previousStatus: LoanStatus
  outstandingPrincipal: number
  accruedInterest: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  riskRating: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export enum LoanStatus {
  PERFORMING = "PERFORMING",
  WATCH = "WATCH",
  SUBSTANDARD = "SUBSTANDARD",
  DOUBTFUL = "DOUBTFUL",
  LOSS = "LOSS",
}

export interface ClassificationResult {
  loanId: string
  borrowerName: string
  daysInArrears: number
  loanClass: string
  outstandingBalance: number
  collateralValue: number
  netExposure: number
  provisioningRate: number
  provisionRequired: number
  previousProvisionsHeld: number
  additionalProvisionsThisPeriod: number
}

export interface ProvisioningReport {
  totalLoans: number
  totalOutstanding: number
  totalProvisionRequired: number
  totalAdditionalProvisions: number
  byStatus: {
    [key in LoanStatus]: {
      count: number
      outstanding: number
      provisionRequired: number
      percentage: number
    }
  }
  organizationId: number
  reportDate: string
  classificationBreakdown: {
    [key: string]: {
      count: number
      totalBalance: number
      totalProvisions: number
    }
  }
  portfolioAtRisk?: number
  averageLoanAmount?: number
  statusBreakdown?: Record<string, number>
  calculationTimestamp?: string
  totalDisbursed?: number
  totalInArrears?: number
  performingLoansRatio?: number
  watchLoansRatio?: number
  npmRatio?: number
}

export interface BulkClassificationUpdate {
  loanIds: number[]
  newStatus: LoanStatus
  reason: string
}

export interface DaysInArrearsResponse {
  success: boolean
  message: string
  data: number
}

export interface CalculateProvisionsResponse {
  success: boolean
  message: string
  data: ClassificationResult
}

// Comprehensive Report Interfaces
export interface ClassificationReport {
  summary: {
    classCount: number
    totalOutstanding: number
    totalProvisionsRequired: number
    averageDaysOverdue: number
    collateralCoverage: number
    totalDisbursed: number
    averageLoanSize: number
  }
  loanDetails: LoanDetail[]
  movements: {
    summary: {
      totalInClass: number
      enteredThisClass: number
      exitedThisClass: number
      netChange: number
      trendIndicator: string
    }
  }
}

// Enhanced LoanDetail interface with all properties used in exportToExcel
export interface LoanDetail {
  loanId: string
  status: string
  disbursedAmount: number
  disbursementDate: string
  agreedMaturityDate: string
  purposeOfLoan: string
  branchName: string
  loanOfficer: string
  termInMonths: number
  annualInterestRate: string
  interestMethod: string
  repaymentFrequency: string
  gracePeriodMonths: number
  totalNumberOfInstallments: number
  borrowerInfo: {
    borrowerId: string
    fullName: string
    firstName: string
    lastName: string
    middleName?: string
    nationalId: string
    gender: string
    dateOfBirth: string
    age: number
    maritalStatus: string
    primaryPhone: string
    alternativePhone?: string
    email?: string
    address?: {
      district?: string
      sector?: string
      cell?: string
      village?: string
      country?: string
      province?: string
    }
    occupation: string
    monthlyIncome: string
    incomeSource?: string
    relationshipWithNDFSP: string
    previousLoansPaidOnTime: number
    creditScore: number
    isEligibleForLoan: boolean
  }
  collaterals?: Array<{
    collateralId: string
    collateralType: string
    description: string
    originalValue: number
    effectiveValue: number
    valuationPercentage: number
    haircutPercentage: number
    haircutAmount: number
    valuationDate?: string
    valuedBy?: string
    needsRevaluation: boolean
    valuationAge: number
    guarantorName?: string
    guarantorPhone?: string
    guarantorAddress?: string
    proofOfOwnershipUrl?: string
    proofOfOwnershipType?: string
    ownerIdentificationUrl?: string
    legalDocumentUrl?: string
    physicalEvidenceUrl?: string
    additionalDocumentsUrls?: string[]
    notes?: string
    isActive: boolean
  }>
  collateralSummary: {
    totalOriginalValue: number
    totalEffectiveValue: number
    totalHaircutAmount: number
    collateralCount: number
    collateralTypes?: string[]
    needsRevaluationCount: number
  }
  repaymentScheduleSummary: {
    totalInstallments: number
    paidInstallments: number
    unpaidInstallments: number
    overdueInstallments: number
    nextPaymentDue: string
    nextPaymentAmount: string
  }
  paymentHistory: {
    totalPayments: number
    totalAmountPaid: number | null
    totalPrincipalPaid: number | null
    totalInterestPaid: number | null
    totalPenaltiesPaid: number | null
    lastPaymentDate: string | null
    lastPaymentAmount: string | null
  }
  financialMetrics: {
    outstandingBalance: number
    outstandingPrincipal: number
    accruedInterest: number
    totalAmountToBeRepaid: number
    remainingBalance: number | null
    monthlyInstallmentAmount: number
    principalRecoveryRate: number
    paymentCompletionRate: number
  }
  riskAssessment: {
    daysOverdue: number
    daysInArrears: number
    currentClassification: string
    collateralCoverageRatio: number
    netExposure: number
    provisionRequired: number
    provisioningRate: number
    isOverdue: boolean
    riskLevel: string
    isAdequatelyCollateralized: boolean
    collateralDeficiency: number
  }
  metadata?: {
    createdAt: string
    updatedAt: string
    createdBy: number
    isActive: boolean
    notes?: string
  }
  provisionDetails?: {
    previousProvisionsHeld: number;
    currentProvisionRequired: number;
    additionalProvisionsNeeded: number;
    provisionChangeStatus: string;
    provisionChangePercentage: number;
    interpretation: string;
  };
}

export interface ComprehensiveReport {
  overallSummary: {
    totalPortfolio: number
    totalProvisionsRequired: number
    averageCollateralCoverage: number
    portfolioHealthScore: number
  }
  classificationReports: {
    normal: ClassificationReport
    watch: ClassificationReport
    substandard: ClassificationReport
    doubtful: ClassificationReport
    loss: ClassificationReport
  }
  aggregatedInsights: {
    riskDistribution: Record<string, number>
    recommendations: string[]
  }
}

interface LoanClassificationState {
  classifications: LoanClassification[]
  currentClassification: LoanClassification | null
  currentCalculation: ClassificationResult | null
  provisioningReport: ProvisioningReport | null
  comprehensiveReport: ComprehensiveReport | null
  otherInformation: OtherInformation | null
  supplementaryInformation: SupplementaryInformation | null
  isLoading: boolean
  isLoadingComprehensive: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}

const initialState: LoanClassificationState = {
  classifications: [],
  currentClassification: null,
  currentCalculation: null,
  provisioningReport: null,
  comprehensiveReport: null,
  otherInformation: null,
  supplementaryInformation: null,
  isLoading: false,
  isLoadingComprehensive: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

// Helper functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

const getOrganizationId = () => {
  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user")
    const user = userString ? JSON.parse(userString) : null
    return user?.organizationId
  }
  return null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const fetchOtherInformation = createAsyncThunk(
  "loanClassification/fetchOtherInformation",
  async ({ organizationId }: { organizationId?: number } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const orgId = organizationId || getOrganizationId()

      if (!orgId) {
        throw new Error("Organization ID is required")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/other-information`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch other information")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)
// Add this after fetchOtherInformation thunk
export const fetchSupplementaryInformation = createAsyncThunk(
  "loanClassification/fetchSupplementaryInformation",
  async ({ organizationId }: { organizationId?: number } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const orgId = organizationId || getOrganizationId()

      if (!orgId) {
        throw new Error("Organization ID is required")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/other-information/supplementary-information`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch supplementary information")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)
export const fetchComprehensiveClassificationReport = createAsyncThunk(
  "loanClassification/fetchComprehensiveReport",
  async ({
    organizationId,
    asOfDate
  }: {
    organizationId?: number;
    asOfDate?: string
  } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const orgId = organizationId || getOrganizationId()

      if (!orgId) {
        throw new Error("Organization ID is required")
      }

      const queryParams = asOfDate ? `?asOfDate=${asOfDate}` : ''
      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/loans/classification/comprehensive-report${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch comprehensive classification report")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Calculate days in arrears for a loan
export const calculateDaysInArrears = createAsyncThunk(
  "loanClassification/calculateDaysInArrears",
  async ({ organizationId, loanId }: { organizationId: number; loanId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/days-in-arrears`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to calculate days in arrears");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

export const calculateProvisions = createAsyncThunk(
  "loanClassification/calculateProvisions",
  async ({ organizationId, loanId }: { organizationId: number; loanId: number }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/provisions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to calculate provisions");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

// Update loan status
export const updateLoanStatus = createAsyncThunk(
  "loanClassification/updateLoanStatus",
  async (
    {
      organizationId,
      loanId,
    }: { organizationId: number; loanId: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update loan status");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

export const createLoanClassification = createAsyncThunk(
  "loanClassification/createClassification",
  async (
    {
      organizationId,
      loanId,
      classificationData,
    }: {
      organizationId: number;
      loanId: number;
      classificationData: CreateClassificationRequest
    },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            classificationDate: classificationData.classificationDate,
            daysInArrears: classificationData.daysInArrears,
            currentStatus: classificationData.currentStatus,
            previousStatus: classificationData.previousStatus,
            outstandingPrincipal: classificationData.outstandingPrincipal,
            accruedInterest: classificationData.accruedInterest,
            provisioningRate: classificationData.provisioningRate,
            riskRating: classificationData.riskRating,
            notes: classificationData.notes,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create loan classification");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

// Fetch loan classifications
export const fetchLoanClassifications = createAsyncThunk(
  "loanClassification/fetchAll",
  async (
    { organizationId, page = 1, limit = 10 }: { organizationId: number; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/classification?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch loan classifications");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

// Generate provisioning report
export const generateProvisioningReport = createAsyncThunk(
  "loanClassification/generateReport",
  async ({ organizationId, asOfDate }: { organizationId?: number; asOfDate?: string } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const orgId = organizationId || getOrganizationId()

      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      const queryParams = asOfDate ? `?asOfDate=${asOfDate}` : '';
      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/loans/classification/provisioning-report${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate provisioning report");
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Bulk update loan classifications
export const bulkUpdateLoanClassifications = createAsyncThunk(
  "loanClassification/bulkUpdate",
  async (
    { organizationId }: { organizationId: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/classification/bulk-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to bulk update classifications")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

// Get loan classification history
export const getLoanClassificationHistory = createAsyncThunk(
  "loanClassification/getHistory",
  async (
    {
      organizationId,
      loanId,
      page = 1,
      limit = 10,
    }: { organizationId: number; loanId: number; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/${loanId}/classification/history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch classification history");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

// Get loans by classification
export const getLoansByClassification = createAsyncThunk(
  "loanClassification/getLoansByClass",
  async (
    {
      organizationId,
      loanClass,
      page = 1,
      limit = 10,
    }: { organizationId: number; loanClass: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loans/classification/loans/${loanClass}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch loans by classification");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

export const bulkUpdateClassifications = createAsyncThunk(
  "loanClassification/bulkUpdate",
  async (
    { organizationId, updateData }: { organizationId: number; updateData: BulkClassificationUpdate },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/classification/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to bulk update classifications")
      }

      return await response.json()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
);

// Slice
const loanClassificationSlice = createSlice({
  name: "loanClassification",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
    },
    clearCurrentClassification: (state) => {
      state.currentClassification = null
    },
    clearCurrentCalculation: (state) => {
      state.currentCalculation = null
    },
    clearProvisioningReport: (state) => {
      state.provisioningReport = null
    },
    clearComprehensiveReport: (state) => {
      state.comprehensiveReport = null
    },
    resetState: (state) => {
      return initialState
    },
    clearOtherInformation: (state) => {
      state.otherInformation = null
    },
    clearSupplementaryInformation: (state) => {
      state.supplementaryInformation = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Comprehensive Classification Report
      .addCase(fetchComprehensiveClassificationReport.pending, (state) => {
        state.isLoadingComprehensive = true
        state.error = null
      })
      .addCase(fetchComprehensiveClassificationReport.fulfilled, (state, action) => {
        state.isLoadingComprehensive = false
        state.comprehensiveReport = action.payload.data
      })
      .addCase(fetchComprehensiveClassificationReport.rejected, (state, action) => {
        state.isLoadingComprehensive = false
        state.error = action.payload as string
      })

      // Calculate days in arrears
      .addCase(calculateDaysInArrears.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(calculateDaysInArrears.fulfilled, (state, action) => {
        state.isLoading = false
      })
      .addCase(calculateDaysInArrears.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Calculate provisions
      .addCase(calculateProvisions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(calculateProvisions.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCalculation = action.payload.data
      })
      .addCase(calculateProvisions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Update loan status
      .addCase(updateLoanStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateLoanStatus.fulfilled, (state, action) => {
        state.isLoading = false
      })
      .addCase(updateLoanStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Create loan classification
      .addCase(createLoanClassification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createLoanClassification.fulfilled, (state, action) => {
        state.isLoading = false
        const newClassification = action.payload.data?.classification || action.payload.data
        if (newClassification) {
          state.classifications.unshift(newClassification)
          state.currentClassification = newClassification
        }
      })
      .addCase(createLoanClassification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch loan classifications
      .addCase(fetchLoanClassifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanClassifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.classifications = action.payload.data || []
        if (action.payload.pagination) {
          state.totalCount = action.payload.pagination.totalItems
          state.currentPage = action.payload.pagination.currentPage
        }
      })
      .addCase(fetchLoanClassifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Generate provisioning report
      .addCase(generateProvisioningReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(generateProvisioningReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.provisioningReport = action.payload.data
      })
      .addCase(generateProvisioningReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Bulk update classifications
      .addCase(bulkUpdateLoanClassifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(bulkUpdateLoanClassifications.fulfilled, (state, action) => {
        state.isLoading = false
      })
      .addCase(bulkUpdateLoanClassifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get loan classification history
      .addCase(getLoanClassificationHistory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getLoanClassificationHistory.fulfilled, (state, action) => {
        state.isLoading = false
      })
      .addCase(getLoanClassificationHistory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Get loans by classification
      .addCase(getLoansByClassification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getLoansByClassification.fulfilled, (state, action) => {
        state.isLoading = false
      })
      .addCase(getLoansByClassification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchOtherInformation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOtherInformation.fulfilled, (state, action) => {
        state.isLoading = false
        state.otherInformation = action.payload.data
      })
      .addCase(fetchOtherInformation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSupplementaryInformation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSupplementaryInformation.fulfilled, (state, action) => {
        state.isLoading = false
        state.supplementaryInformation = action.payload.data
      })
      .addCase(fetchSupplementaryInformation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setCurrentPage,
  setPageSize,
  clearCurrentClassification,
  clearCurrentCalculation,
  clearProvisioningReport,
  clearComprehensiveReport,
  clearOtherInformation,
  clearSupplementaryInformation,
  resetState
} = loanClassificationSlice.actions

export default loanClassificationSlice.reducer