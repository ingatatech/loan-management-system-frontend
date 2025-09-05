import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}
export enum BusinessType {
  MICRO = "micro",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  YOUTH_BUSINESS = "youth_business",
  PUBLIC_COMPANY = "public_company",
  PRIVATE_COMPANY = "private_company",
  COOPERATIVE = "cooperative",
  PARTNERSHIP = "partnership",
  FOUNDATION = "foundation"
}
export enum EconomicSector {
  AGRICULTURE_LIVESTOCK_FISHING = "agriculture_livestock_fishing",
  PUBLIC_WORKS_CONSTRUCTION = "public_works_construction",
  COMMERCE_RESTAURANTS_HOTELS = "commerce_restaurants_hotels",
  TRANSPORT_WAREHOUSES = "transport_warehouses",
  MANUFACTURING = "manufacturing",
  SERVICES = "services",
  TECHNOLOGY = "technology",
  HEALTHCARE = "healthcare",
  EDUCATION = "education",
  FINANCIAL_SERVICES = "financial_services",
  OTHERS = "others"
}
export interface LoanReview {
  id: number;
  reviewMessage: string;
  status: string;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}


export interface ExtendedCollateralData {
  accountNumber?: string;
  collateralType?: string;
  collateralValue?: number;
  collateralLastValuationDate?: string;
  collateralExpiryDate?: string;
}

export interface Collateral {
  id: number;
  collateralId: string;
  loanId: number;
  collateralType: CollateralType;
  description: string;
  collateralValue: number;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  proofOfOwnershipUrl?: string;
  ownerIdentificationUrl?: string;
  legalDocumentUrl?: string;
  physicalEvidenceUrl?: string;
  valuationDate?: string;
  valuedBy?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Extended fields
  accountNumber?: string;
  extendedCollateralType?: string;
  extendedCollateralValue?: number;
  collateralLastValuationDate?: string;
  collateralExpiryDate?: string;
  
  // Relations
  loan?: LoanApplication;
}

export interface CollateralsResponse {
  collaterals: Collateral[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}


export interface LoanReviewRequest {
  reviewMessage: string;
}
export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
}

// NEW: Performance Metrics Interface
export interface LoanPerformanceMetrics {
  totalInstallments: number;
  installmentsPaid: number;
  installmentsOutstanding: number;
  principalRepaid: number;
  balanceOutstanding: number;
  paymentCompletionRate: number;
  principalRecoveryRate: number;
}




export enum RelationshipType {
  NEW_BORROWER = "new_borrower",
  REPEAT_BORROWER = "repeat_borrower",
  RETURNING_BORROWER = "returning_borrower",
}

export enum InterestMethod {
  FLAT = "flat",
  REDUCING_BALANCE = "reducing_balance",
}

export enum RepaymentFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUALLY = "semi_annually",
  ANNUALLY = "annually",
}

export enum LoanStatus {
  PENDING = "pending",
  APPROVED = "approved",
  DISBURSED = "disbursed",
  PERFORMING = "performing",
  WATCH = "watch",
  SUBSTANDARD = "substandard",
  DOUBTFUL = "doubtful",
  LOSS = "loss",
  WRITTEN_OFF = "written_off",
  CLOSED = "closed",
  REJECTED = "rejected",
}
export interface LoanApprovalRequest {
  annualInterestRate: number
  disbursementDate: string
  agreedMaturityDate: string
  repaymentFrequency: RepaymentFrequency
  interestMethod: InterestMethod
  gracePeriodMonths?: number
  notes?: string
}

export interface LoanRejectionRequest {
  rejectionReason: string
  notes?: string
}


export enum CollateralType {
  MOVABLE = "movable",
  IMMOVABLE = "immovable",
  FINANCIAL = "financial",
  GUARANTEE = "guarantee",
}

export interface LoanClassificationReport {
  current?: { amount: number; count: number }
  pastDue1to30?: { amount: number; count: number }
  pastDue31to60?: { amount: number; count: number }
  pastDue61to90?: { amount: number; count: number }
  pastDue90Plus?: { amount: number; count: number }
}

export interface LoanStatusChangeRequest {
  newStatus: LoanStatus
  notes?: string
  sendEmail?: boolean
  customMessage?: string
  dueDate?: string
}

export interface BulkLoanStatusChangeRequest {
  loanIds: number[]
  newStatus: LoanStatus
  notes?: string
  sendEmail?: boolean
  customMessage?: string
}

export interface LoanStatusChangeResult {
  loanId: string
  success: boolean
  message: string
  emailSent: boolean
}

export interface ValidStatusTransition {
  status: LoanStatus
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// NEW: Interfaces for enhanced functionality
export interface LoanCalculationUpdate {
  outstandingPrincipal: number
  accruedInterestToDate: number
  daysInArrears: number
  status: LoanStatus
}

export interface DailyCalculationResult {
  totalLoansProcessed: number
  totalInterestAccrued: number
  loansWithUpdatedStatus: number
  errors: string[]
  loansUpdated?: number
}

export interface PortfolioSummary {
  totalLoans: number
  totalDisbursed: number
  totalOutstandingPrincipal: number
  totalAccruedInterest: number
  totalInArrears: number
  portfolioAtRisk: number
  averageLoanAmount: number
  statusBreakdown: Record<string, number>
  calculationTimestamp: string
  performingLoans?: number
  nonPerformingLoans?: number
  averageInterestRate?: number
}

export interface LoanClassificationReport {
  loanId: string
  borrowerName: string
  disbursedAmount: number
  outstandingPrincipal: number
  accruedInterest: number
  daysInArrears: number
  classificationCategory: string
  provisioningRate: number
  netExposure: number
  provisionRequired: number
  status: LoanStatus
}

export interface OverdueLoan {
  id: number
  loanId: string
  borrower: {
    firstName: string
    lastName: string
    primaryPhone?: string
  }
  currentBalances: {
    outstandingPrincipal: number
    accruedInterestToDate: number
    daysInArrears: number
    status: LoanStatus
  }
  disbursedAmount: number
  loanOfficer: string
  branchName: string
  agreedFirstPaymentDate: string
  borrowerName?: string
  borrowerPhone?: string
  loanAmount?: number
  currentBalance?: number
  nextPaymentAmount?: number
  daysPastDue?: number
}

export interface Address {
  village?: string
  cell?: string
  sector?: string
  district?: string
  province?: string
  country?: string
}

export interface BorrowerProfileData {
  firstName: string
  lastName: string
  middleName?: string
  nationalId: string
  gender: Gender
  dateOfBirth: string
  maritalStatus: MaritalStatus
  primaryPhone: string
  alternativePhone?: string
  email?: string
  address: Address
  occupation?: string
  monthlyIncome?: number
  incomeSource?: string
  relationshipWithNDFSP?: RelationshipType
  previousLoansPaidOnTime?: number
  notes?: string
}

export interface LoanData {
  purposeOfLoan: string
  branchName: string
  loanOfficer: string
  disbursedAmount: number
  disbursementDate: string
  annualInterestRate: number
  interestMethod: InterestMethod
  termInMonths: number
  repaymentFrequency: RepaymentFrequency
  gracePeriodMonths?: number
  notes?: string
}

export interface CollateralData {
  collateralType: CollateralType
  description: string
  collateralValue: number
  guarantorName?: string
  guarantorPhone?: string
  guarantorAddress?: string
  valuationDate?: string
  valuedBy?: string
  notes?: string
}

export interface LoanApplicationRequest {
  // Borrower Data
  firstName: string
  lastName: string
  middleName?: string
  nationalId: string
  gender: Gender
  dateOfBirth: string
  maritalStatus: MaritalStatus
  primaryPhone: string
  alternativePhone?: string
  email?: string
  address: Address
  occupation?: string
  monthlyIncome?: number
  incomeSource?: string
  relationshipWithNDFSP?: RelationshipType
  previousLoansPaidOnTime?: number
  borrowerNotes?: string

  // Loan Data
  purposeOfLoan: string
  branchName: string
  loanOfficer: string
  disbursedAmount: number
  businessType?: BusinessType | null
  economicSector?: EconomicSector | null  
  disbursementDate: string
  agreedMaturityDate: string
  annualInterestRate: number
  interestMethod: InterestMethod
  termInMonths: number
  repaymentFrequency: RepaymentFrequency
  gracePeriodMonths?: number
  loanNotes?: string

  // Collateral Data
  collateralType?: CollateralType
  collateralDescription?: string
  collateralValue?: number
  guarantorName?: string
  guarantorPhone?: string
  guarantorAddress?: string
  valuationDate?: string
  valuedBy?: string
  collateralNotes?: string

  // Files
  proofOfOwnership?: File
  ownerIdentification?: File
  legalDocument?: File
  physicalEvidence?: File
}



export interface ExtendedGuarantorData {
  // Basic Information
  accountNumber?: string;
  guarantorType?: 'individual' | 'institution';
  
  // Individual fields
  surname?: string;
  forename1?: string;
  forename2?: string;
  forename3?: string;
  nationalId?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  
  // Institution fields
  institutionName?: string;
  tradingName?: string;
  companyRegNo?: string;
  companyRegistrationDate?: string;
  
  // Common fields
  passportNo?: string;
  nationality?: string;
  
  // Postal Address
  postalAddressLine1?: string;
  postalAddressLine2?: string;
  town?: string;
  postalCode?: string;
  country?: string;
  
  // Contact
  workTelephone?: string;
  homeTelephone?: string;
  mobileTelephone?: string;

}

export interface Guarantor {
  id: number;
  loanId: number;
  collateralId: number;
  borrowerId: number;
  organizationId: number;
  name: string;
  phone: string;
  address: string;
  guaranteedAmount: number;
  collateralType: string;
  collateralDescription: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Extended fields (all optional)
  accountNumber?: string;
  guarantorType?: 'individual' | 'institution';
  surname?: string;
  institutionName?: string;
  forename1?: string;
  tradingName?: string;
  forename2?: string;
  forename3?: string;
  nationalId?: string;
  companyRegNo?: string;
  passportNo?: string;
  nationality?: string;
  dateOfBirth?: string;
  companyRegistrationDate?: string;
  placeOfBirth?: string;
  postalAddressLine1?: string;
  postalAddressLine2?: string;
  town?: string;
  postalCode?: string;
  country?: string;
  workTelephone?: string;
  homeTelephone?: string;
  mobileTelephone?: string;
  
  // Relations
  loan?: any;
  collateral?: any;
  borrower?: any;
}

export interface GuarantorsExtendedResponse {
  all: Guarantor[];
  extended: Guarantor[];
  nonExtended: Guarantor[];
  total: number;
  extendedCount: number;
  needsExtension: number;
}

export interface LoanApplication {
  id: number
  loanId: string
  borrower: {
    id: number
    borrowerId: string
    firstName: string
    lastName: string
    middleName?: string
    nationalId: string
    gender: Gender
    dateOfBirth: string
    maritalStatus: MaritalStatus
    primaryPhone: string
    alternativePhone?: string
    email?: string
    address: any
    occupation?: string
    monthlyIncome?: number
    incomeSource?: string
    relationshipWithNDFSP: RelationshipType
    previousLoansPaidOnTime: number
    notes?: string
  }
  purposeOfLoan: string
  branchName: string
  loanOfficer: string
  disbursedAmount: number
  disbursementDate?: string
  annualInterestRate?: number
  interestMethod?: InterestMethod
  termInMonths?: number
  repaymentFrequency?: RepaymentFrequency
  gracePeriodMonths?: number
  agreedMaturityDate?: string
  agreedFirstPaymentDate?: string
  totalNumberOfInstallments?: number
  totalInterestAmount?: number
  totalAmountToBeRepaid?: number
  monthlyInstallmentAmount?: number
  outstandingPrincipal: number
  accruedInterestToDate: number
  daysInArrears: number
  status: LoanStatus
  notes?: string
  collaterals: Array<any>
  repaymentSchedules?: Array<any>
  performanceMetrics?: any
  approvedBy?: number
  approvedAt?: string
  rejectedBy?: number
  rejectedAt?: string
  rejectionReason?: string
  createdAt: string
}


export interface LoanApplicationStats {
  totalApplications: number
  statusBreakdown: Record<string, number>
  totalDisbursed: number
  totalOutstanding: number
  averageLoanAmount: number
  activeLoansCount: number
  portfolioHealthMetrics?: {
    performingLoansRatio: number
    watchLoansRatio: number
    npmRatio: number
  }
  lastCalculated?: string
  // ADD these missing properties:
  averageProcessingTime?: number
  totalDisbursedAmount?: number
  disbursedApplications?: number
  rejectedApplications?: number
  approvedApplications?: number
  pendingApplications?: number
}

// ENHANCED: State interface with new fields for status management
interface LoanApplicationState {
  applications: LoanApplication[]
  currentApplication: LoanApplication | null
  stats: LoanApplicationStats | null
  // NEW: Additional state for enhanced functionality
  portfolioSummary: PortfolioSummary | null
  overdueLoans: OverdueLoan[]
  classificationReport: LoanClassificationReport[]
  dailyCalculationResult: DailyCalculationResult | null
  pendingLoans: LoanApplication[]
  approvalLoading: boolean
  rejectionLoading: boolean
  loanGuarantors: Guarantor[];
  guarantorsNeedingExtension: Guarantor[];
  guarantorsExtendedStatus: GuarantorsExtendedResponse | null;
  guarantorLoading: boolean;
  eligibleLoans: LoanApplication[]
  validTransitions: ValidStatusTransition[]
  statusChangeResults: LoanStatusChangeResult[]
  rejectedLoans: LoanApplication[]
  loanReviews: LoanReview[];
   allCollaterals: Collateral[];
  collateralLoading: boolean;
  collateralPagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;
  reviewsLoading: boolean;
  reviewCount: number;
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    totalItems: number
    total: number
    totalPages: number
  } | null
}

const initialState: LoanApplicationState = {
  applications: [],
  currentApplication: null,
  stats: null,
  // NEW: Initialize new state fields
  portfolioSummary: null,
  overdueLoans: [],
  classificationReport: [],
  dailyCalculationResult: null,
 loanGuarantors: [],
  guarantorsNeedingExtension: [],
  guarantorsExtendedStatus: null,
  guarantorLoading: false,
  eligibleLoans: [],
  allCollaterals: [],
  collateralLoading: false,
  collateralPagination: null,
  validTransitions: [],
  statusChangeResults: [],
  pendingLoans: [],
  approvalLoading: false,
  rejectionLoading: false,
  rejectedLoans: [],
  loanReviews: [],
  reviewsLoading: false,
  reviewCount: 0,
  isLoading: false,
  error: null,
  pagination: null,
}

// Helper functions (unchanged)
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



export const fetchLoanGuarantors = createAsyncThunk(
  "loanApplication/fetchLoanGuarantors",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/guarantors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch guarantors");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);




/**
 * Fetch all collaterals added during loan application creation
 */
export const fetchAllCollaterals = createAsyncThunk(
  "loanApplication/fetchAllCollaterals",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
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

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/collaterals/all?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch collaterals");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Extend collateral with additional fields
 */
export const extendCollateral = createAsyncThunk(
  "loanApplication/extendCollateral",
  async (
    {
      collateralId,
      extendedData,
    }: {
      collateralId: number;
      extendedData: ExtendedCollateralData;
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
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/collaterals/${collateralId}/extend`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(extendedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to extend collateral");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


/**
 * Get loan guarantors with extended status
 */
export const fetchLoanGuarantorsExtended = createAsyncThunk(
  "loanApplication/fetchLoanGuarantorsExtended",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/guarantors/extended`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch extended guarantors");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get guarantors needing extension
 */
export const fetchGuarantorsNeedingExtension = createAsyncThunk(
  "loanApplication/fetchGuarantorsNeedingExtension",
  async (
    params: {
      page?: number;
      limit?: number;
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

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/guarantors/needs-extension?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch guarantors needing extension");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Extend a guarantor
 */
export const extendGuarantor = createAsyncThunk(
  "loanApplication/extendGuarantor",
  async (
    {
      guarantorId,
      extendedData,
    }: {
      guarantorId: number;
      extendedData: ExtendedGuarantorData;
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
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/guarantors/${guarantorId}/extend`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(extendedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to extend guarantor");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Bulk extend guarantors
 */
export const bulkExtendGuarantors = createAsyncThunk(
  "loanApplication/bulkExtendGuarantors",
  async (
    guarantorUpdates: Array<{ guarantorId: number; extendedData: ExtendedGuarantorData }>,
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/guarantors/bulk-extend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ guarantorUpdates }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to bulk extend guarantors");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update guarantor (basic update - maintains original functionality)
 */
export const updateGuarantor = createAsyncThunk(
  "loanApplication/updateGuarantor",
  async (
    {
      guarantorId,
      updateData,
    }: {
      guarantorId: number;
      updateData: Partial<Guarantor>;
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
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/guarantors/${guarantorId}`,
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
        throw new Error(errorData.message || "Failed to update guarantor");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);



export const addLoanReview = createAsyncThunk(
  "loanApplication/addReview",
  async (
    {
      loanId,
      reviewData,
    }: {
      loanId: number;
      reviewData: LoanReviewRequest;
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
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/reviews`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add review");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get all reviews for a loan
 */
export const fetchLoanReviews = createAsyncThunk(
  "loanApplication/fetchReviews",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reviews");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRejectedLoanApplications = createAsyncThunk(
  "loanApplication/fetchRejected",
  async (
    params: {
      page?: number
      limit?: number
      search?: string
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.search) queryParams.append("search", params.search)

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/rejected?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch rejected loan applications")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Update fetchPendingLoanApplications to support filter
export const fetchPendingLoanApplications = createAsyncThunk(
  "loanApplication/fetchPending",
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      statusFilter?: 'pending' | 'rejected' | 'all'
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.search) queryParams.append("search", params.search)
      if (params.statusFilter) queryParams.append("statusFilter", params.statusFilter)

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/pending?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch loan applications")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)
/**
 * Approve loan application
 */
export const approveLoanApplication = createAsyncThunk(
  "loanApplication/approve",
  async (
    {
      loanId,
      approvalData,
    }: {
      loanId: number
      approvalData: LoanApprovalRequest
    },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve loan application")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

/**
 * Reject loan application
 */
export const rejectLoanApplication = createAsyncThunk(
  "loanApplication/reject",
  async (
    {
      loanId,
      rejectionData,
    }: {
      loanId: number
      rejectionData: LoanRejectionRequest
    },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rejectionData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reject loan application")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)


// NEW: Change individual loan status
export const changeLoanStatus = createAsyncThunk(
  "loanApplication/changeLoanStatus",
  async (
    { loanId, statusData }: { loanId: number; statusData: LoanStatusChangeRequest },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/status/change`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change loan status")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// NEW: Bulk change loan status
export const bulkChangeLoanStatus = createAsyncThunk(
  "loanApplication/bulkChangeLoanStatus",
  async (statusData: BulkLoanStatusChangeRequest, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/status/bulk-change`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to bulk change loan status")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// NEW: Get loans eligible for status change
export const getLoansEligibleForStatusChange = createAsyncThunk(
  "loanApplication/getLoansEligibleForStatusChange",
  async (currentStatus: LoanStatus | undefined = undefined, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const queryParams = currentStatus ? `?currentStatus=${currentStatus}` : ''

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/eligible-for-status-change${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch eligible loans")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// NEW: Get valid status transitions
export const getValidStatusTransitions = createAsyncThunk(
  "loanApplication/getValidStatusTransitions",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/status/transitions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch valid transitions")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createLoanApplication = createAsyncThunk(
  "loanApplication/create",
  async (applicationData: LoanApplicationRequest, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const formData = new FormData()

      // Borrower data
      formData.append("firstName", applicationData.firstName)
      formData.append("lastName", applicationData.lastName)
      if (applicationData.middleName) formData.append("middleName", applicationData.middleName)
      formData.append("nationalId", applicationData.nationalId)
      formData.append("gender", applicationData.gender)
      formData.append("dateOfBirth", applicationData.dateOfBirth)
      formData.append("maritalStatus", applicationData.maritalStatus)
      formData.append("primaryPhone", applicationData.primaryPhone)
      
      if (applicationData.alternativePhone) formData.append("alternativePhone", applicationData.alternativePhone)
      if (applicationData.email) formData.append("email", applicationData.email)
      if (applicationData.businessType) 
      formData.append("businessType", applicationData.businessType)
      if (applicationData.economicSector) 
      formData.append("economicSector", applicationData.economicSector)
      // Address as JSON string (as per backend expectation)
      const addressObject = {
        country: "Rwanda",
        province: applicationData.address.province || "",
        district: applicationData.address.district || "",
        sector: applicationData.address.sector || "",
        cell: applicationData.address.cell || "",
        village: applicationData.address.village || "",
      }
      formData.append("address", JSON.stringify(addressObject))

      if (applicationData.occupation) formData.append("occupation", applicationData.occupation)
      if (applicationData.monthlyIncome) formData.append("monthlyIncome", applicationData.monthlyIncome.toString())
      if (applicationData.incomeSource) formData.append("incomeSource", applicationData.incomeSource)
      if (applicationData.relationshipWithNDFSP)
        formData.append("relationshipWithNDFSP", applicationData.relationshipWithNDFSP)
      if (applicationData.previousLoansPaidOnTime)
        formData.append("previousLoansPaidOnTime", applicationData.previousLoansPaidOnTime.toString())
      if (applicationData.borrowerNotes) formData.append("borrowerNotes", applicationData.borrowerNotes)

      // Loan data - ADD agreedMaturityDate HERE!
      formData.append("purposeOfLoan", applicationData.purposeOfLoan)
      formData.append("branchName", applicationData.branchName)
      formData.append("loanOfficer", applicationData.loanOfficer)
      formData.append("disbursedAmount", applicationData.disbursedAmount.toString())
      formData.append("disbursementDate", applicationData.disbursementDate)
      formData.append("agreedMaturityDate", applicationData.agreedMaturityDate) // ← ADD THIS LINE
      formData.append("annualInterestRate", applicationData.annualInterestRate.toString())
      formData.append("interestMethod", applicationData.interestMethod)
      formData.append("termInMonths", applicationData.termInMonths.toString())
      formData.append("repaymentFrequency", applicationData.repaymentFrequency)
      if (applicationData.gracePeriodMonths)
        formData.append("gracePeriodMonths", applicationData.gracePeriodMonths.toString())
      if (applicationData.loanNotes) formData.append("loanNotes", applicationData.loanNotes)

      // Collateral data
      if (applicationData.collateralType) formData.append("collateralType", applicationData.collateralType)
      if (applicationData.collateralDescription)
        formData.append("collateralDescription", applicationData.collateralDescription)
      if (applicationData.collateralValue)
        formData.append("collateralValue", applicationData.collateralValue.toString())
      if (applicationData.guarantorName) formData.append("guarantorName", applicationData.guarantorName)
      if (applicationData.guarantorPhone) formData.append("guarantorPhone", applicationData.guarantorPhone)
      if (applicationData.guarantorAddress) formData.append("guarantorAddress", applicationData.guarantorAddress)
      if (applicationData.valuationDate) formData.append("valuationDate", applicationData.valuationDate)
      if (applicationData.valuedBy) formData.append("valuedBy", applicationData.valuedBy)
      if (applicationData.collateralNotes) formData.append("collateralNotes", applicationData.collateralNotes)

      // Files
      if (applicationData.proofOfOwnership) formData.append("proofOfOwnership", applicationData.proofOfOwnership)
      if (applicationData.ownerIdentification)
        formData.append("ownerIdentification", applicationData.ownerIdentification)
      if (applicationData.legalDocument) formData.append("legalDocument", applicationData.legalDocument)
      if (applicationData.physicalEvidence) formData.append("physicalEvidence", applicationData.physicalEvidence)

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create loan application")
      }

      const data = await response.json()
      return data.data?.loanApplication || data.loanApplication || data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchLoanApplications = createAsyncThunk(
  "loanApplication/fetchAll",
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      status?: string
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.search) queryParams.append("search", params.search)
      if (params.status) queryParams.append("status", params.status)

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch loan applications")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// ENHANCED: Fetch loan application by ID (now includes currentBalances)
export const fetchLoanApplicationById = createAsyncThunk(
  "loanApplication/fetchById",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch loan application")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// NEW: Daily Interest Accrual
export const performDailyInterestAccrual = createAsyncThunk(
  "loanApplication/performDailyAccrual",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications/accrual/daily`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to perform daily interest accrual")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// NEW: Get Current Balances for a specific loan
export const getLoanCurrentBalances = createAsyncThunk(
  "loanApplication/getCurrentBalances",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/balances/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch current balances")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchLoanPerformanceMetrics = createAsyncThunk(
  "loanApplication/fetchPerformanceMetrics",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error("No organization ID found for the current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}/performance-metrics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch performance metrics");
      }

      const data = await response.json();
      return { loanId, metrics: data.data || data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPortfolioSummary = createAsyncThunk(
  "loanApplication/getPortfolioSummary",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/portfolio/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch portfolio summary")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// NEW: Get Overdue Loans
export const getOverdueLoans = createAsyncThunk<any, number | undefined>(
  "loanApplication/getOverdueLoans",
  async (daysOverdue = 1, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/overdue?daysOverdue=${daysOverdue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch overdue loans")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// NEW: Update Organization Loan Balances
export const updateOrganizationLoanBalances = createAsyncThunk(
  "loanApplication/updateOrgBalances",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/balances/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update loan balances")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// NEW: Get Loan Classification Report
export const getLoanClassificationReport = createAsyncThunk(
  "loanApplication/getClassificationReport",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/loan-applications/classification/report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch classification report")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// EXISTING: Other thunks (unchanged for compatibility)
export const updateLoanApplication = createAsyncThunk(
  "loanApplication/update",
  async (
    { loanId, applicationData }: { loanId: number; applicationData: Partial<LoanApplicationRequest> },
    { rejectWithValue },
  ) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const formData = new FormData()

      Object.entries(applicationData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          !["proofOfOwnership", "ownerIdentification", "legalDocument", "physicalEvidence"].includes(key)
        ) {
          if (typeof value === "object" && key === "address") {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      if (applicationData.proofOfOwnership) formData.append("proofOfOwnership", applicationData.proofOfOwnership)
      if (applicationData.ownerIdentification)
        formData.append("ownerIdentification", applicationData.ownerIdentification)
      if (applicationData.legalDocument) formData.append("legalDocument", applicationData.legalDocument)
      if (applicationData.physicalEvidence) formData.append("physicalEvidence", applicationData.physicalEvidence)

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update loan application")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteLoanApplication = createAsyncThunk(
  "loanApplication/delete",
  async (loanId: number, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications/${loanId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete loan application")
      }

      return loanId
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// ENHANCED: Fetch loan application stats (now with enhanced metrics)
export const fetchLoanApplicationStats = createAsyncThunk(
  "loanApplication/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const organizationId = getOrganizationId()

      if (!organizationId) {
        throw new Error("No organization ID found for the current user")
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/loan-applications/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch loan application stats")
      }

      const data = await response.json()
      return data.data || data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const loanApplicationSlice = createSlice({
  name: "loanApplication",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentApplication: (state, action: PayloadAction<LoanApplication | null>) => {
      state.currentApplication = action.payload
    },
    clearStats: (state) => {
      state.stats = null
    },
    resetPagination: (state) => {
      state.pagination = null
    },
    // NEW: Additional reducers for enhanced functionality
    clearPortfolioSummary: (state) => {
      state.portfolioSummary = null
    },
    clearOverdueLoans: (state) => {
      state.overdueLoans = []
    },
    clearClassificationReport: (state) => {
      state.classificationReport = []
    },
    clearDailyCalculationResult: (state) => {
      state.dailyCalculationResult = null
    },
    // NEW: Status management reducers
    clearEligibleLoans: (state) => {
      state.eligibleLoans = []
    },
    clearValidTransitions: (state) => {
      state.validTransitions = []
    },
    clearStatusChangeResults: (state) => {
      state.statusChangeResults = []
    },
    clearPendingLoans: (state) => {
      state.pendingLoans = []
    },
    clearRejectedLoans: (state) => {
      state.rejectedLoans = []
    },
    clearLoanReviews: (state) => {
      state.loanReviews = [];
      state.reviewCount = 0;
    },
    clearLoanGuarantors: (state) => {
      state.loanGuarantors = [];
      state.guarantorsExtendedStatus = null;
    },
    clearGuarantorsNeedingExtension: (state) => {
      state.guarantorsNeedingExtension = [];
    },
      clearAllCollaterals: (state) => {
    state.allCollaterals = [];
    state.collateralPagination = null;
  },
  
  resetCollateralPagination: (state) => {
    state.collateralPagination = null;
  },
  },
  extraReducers: (builder) => {
    builder
      // EXISTING: Create Loan Application (unchanged)
      .addCase(createLoanApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createLoanApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.applications.unshift(action.payload)
      })
      .addCase(createLoanApplication.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // EXISTING: Fetch Loan Applications (unchanged)
      .addCase(fetchLoanApplications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.applications = action.payload.data || action.payload
        state.pagination = action.payload.pagination || null
      })
      .addCase(fetchLoanApplications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // ENHANCED: Fetch Loan Application by ID (now includes currentBalances)
      .addCase(fetchLoanApplicationById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanApplicationById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentApplication = action.payload
      })
      .addCase(fetchLoanApplicationById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // EXISTING: Update Loan Application (unchanged)
      .addCase(updateLoanApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateLoanApplication.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.applications.findIndex((app) => app.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload
        }
      })
      .addCase(updateLoanApplication.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // EXISTING: Delete Loan Application (unchanged)
      .addCase(deleteLoanApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteLoanApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.applications = state.applications.filter((app) => app.id !== action.payload)
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null
        }
      })
      .addCase(deleteLoanApplication.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // ENHANCED: Fetch Stats (now includes enhanced metrics)
      .addCase(fetchLoanApplicationStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLoanApplicationStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
      })
      .addCase(fetchLoanApplicationStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Change Loan Status
      .addCase(changeLoanStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changeLoanStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedLoan = action.payload.data?.loan
        if (updatedLoan) {
          const index = state.applications.findIndex((app) => app.id === updatedLoan.id)
          if (index !== -1) {
            state.applications[index] = updatedLoan
          }
          if (state.currentApplication?.id === updatedLoan.id) {
            state.currentApplication = updatedLoan
          }
        }
      })
      .addCase(changeLoanStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Bulk Change Loan Status
      .addCase(bulkChangeLoanStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(bulkChangeLoanStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.statusChangeResults = action.payload.data?.results || []
        // Refresh applications after bulk change
        if (action.payload.success) {
          // You might want to refresh the applications list here
        }
      })
      .addCase(bulkChangeLoanStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Get Loans Eligible for Status Change
      .addCase(getLoansEligibleForStatusChange.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getLoansEligibleForStatusChange.fulfilled, (state, action) => {
        state.isLoading = false
        state.eligibleLoans = action.payload.data?.loans || []
      })
      .addCase(getLoansEligibleForStatusChange.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Get Valid Status Transitions
      .addCase(getValidStatusTransitions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getValidStatusTransitions.fulfilled, (state, action) => {
        state.isLoading = false
        state.validTransitions = action.payload.data?.transitionDescriptions || []
      })
      .addCase(getValidStatusTransitions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Daily Interest Accrual
      .addCase(performDailyInterestAccrual.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(performDailyInterestAccrual.fulfilled, (state, action) => {
        state.isLoading = false
        state.dailyCalculationResult = action.payload
      })
      .addCase(performDailyInterestAccrual.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Get Current Balances
      .addCase(getLoanCurrentBalances.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getLoanCurrentBalances.fulfilled, (state, action) => {
        state.isLoading = false
        // Update current application if it matches
        if (state.currentApplication && state.currentApplication.id === action.payload.id) {
          state.currentApplication = action.payload
        }
        // Update in applications list
        const index = state.applications.findIndex((app) => app.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
      })
      .addCase(getLoanCurrentBalances.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Get Portfolio Summary
      .addCase(getPortfolioSummary.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPortfolioSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.portfolioSummary = action.payload
      })
      .addCase(getPortfolioSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Get Overdue Loans
      .addCase(getOverdueLoans.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOverdueLoans.fulfilled, (state, action) => {
        state.isLoading = false
        state.overdueLoans = action.payload.overdueLoans || action.payload
      })
      .addCase(getOverdueLoans.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Update Organization Loan Balances
      .addCase(updateOrganizationLoanBalances.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrganizationLoanBalances.fulfilled, (state, action) => {
        state.isLoading = false
        state.dailyCalculationResult = action.payload
      })
      .addCase(updateOrganizationLoanBalances.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Get Loan Classification Report
      .addCase(getLoanClassificationReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getLoanClassificationReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.classificationReport = action.payload.classificationData || action.payload
      })
      .addCase(getLoanClassificationReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Fetch Performance Metrics
      .addCase(fetchLoanPerformanceMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanPerformanceMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        const { loanId, metrics } = action.payload;

        // Update in applications list
        const appIndex = state.applications.findIndex((app) => app.id === loanId);
        if (appIndex !== -1) {
          state.applications[appIndex].performanceMetrics = metrics;
        }

        // Update current application if it matches
        if (state.currentApplication?.id === loanId) {
          state.currentApplication.performanceMetrics = metrics;
        }
      })
      .addCase(fetchLoanPerformanceMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchPendingLoanApplications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPendingLoanApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingLoans = action.payload.data || action.payload
        state.pagination = action.payload.pagination || null
      })
      .addCase(fetchPendingLoanApplications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // NEW: Approve Loan Application
      .addCase(approveLoanApplication.pending, (state) => {
        state.approvalLoading = true
        state.error = null
      })
      .addCase(approveLoanApplication.fulfilled, (state, action) => {
        state.approvalLoading = false
        const approvedLoan = action.payload.data?.loan

        if (approvedLoan) {
          // Update in applications array
          const index = state.applications.findIndex((app) => app.id === approvedLoan.id)
          if (index !== -1) {
            state.applications[index] = approvedLoan
          }

          // Remove from pending loans
          state.pendingLoans = state.pendingLoans.filter((app) => app.id !== approvedLoan.id)

          // Update current application if it matches
          if (state.currentApplication?.id === approvedLoan.id) {
            state.currentApplication = approvedLoan
          }
        }
      })
      .addCase(approveLoanApplication.rejected, (state, action) => {
        state.approvalLoading = false
        state.error = action.payload as string
      })

      // NEW: Reject Loan Application
      .addCase(rejectLoanApplication.pending, (state) => {
        state.rejectionLoading = true
        state.error = null
      })
      .addCase(rejectLoanApplication.fulfilled, (state, action) => {
        state.rejectionLoading = false
        const rejectedLoan = action.payload.data?.loan

        if (rejectedLoan) {
          // Update in applications array
          const index = state.applications.findIndex((app) => app.id === rejectedLoan.id)
          if (index !== -1) {
            state.applications[index] = rejectedLoan
          }

          // Remove from pending loans
          state.pendingLoans = state.pendingLoans.filter((app) => app.id !== rejectedLoan.id)

          // Update current application if it matches
          if (state.currentApplication?.id === rejectedLoan.id) {
            state.currentApplication = rejectedLoan
          }
        }
      })
      .addCase(rejectLoanApplication.rejected, (state, action) => {
        state.rejectionLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchRejectedLoanApplications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRejectedLoanApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.rejectedLoans = action.payload.data || action.payload
        state.pagination = action.payload.pagination || null
      })
      .addCase(fetchRejectedLoanApplications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addLoanReview.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(addLoanReview.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        const newReview = action.payload.data?.review;
        if (newReview) {
          state.loanReviews.unshift(newReview);
          state.reviewCount = action.payload.data?.reviewCount || state.loanReviews.length;
        }
      })
      .addCase(addLoanReview.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLoanReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.loanReviews = action.payload.data?.reviews || [];
        state.reviewCount = action.payload.data?.totalReviews || 0;
      })
      .addCase(fetchLoanReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload as string;
      })


      .addCase(fetchLoanGuarantors.pending, (state) => {
        state.guarantorLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanGuarantors.fulfilled, (state, action) => {
        state.guarantorLoading = false;
        state.loanGuarantors = action.payload;
      })
      .addCase(fetchLoanGuarantors.rejected, (state, action) => {
        state.guarantorLoading = false;
        state.error = action.payload as string;
      })

    // Fetch Loan Guarantors Extended
      .addCase(fetchLoanGuarantorsExtended.pending, (state) => {
        state.guarantorLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanGuarantorsExtended.fulfilled, (state, action) => {
        state.guarantorLoading = false;
        state.guarantorsExtendedStatus = action.payload;
        state.loanGuarantors = action.payload.all;
      })
      .addCase(fetchLoanGuarantorsExtended.rejected, (state, action) => {
        state.guarantorLoading = false;
        state.error = action.payload as string;
      })

    // Fetch Guarantors Needing Extension
      .addCase(fetchGuarantorsNeedingExtension.pending, (state) => {
        state.guarantorLoading = true;
        state.error = null;
      })
      .addCase(fetchGuarantorsNeedingExtension.fulfilled, (state, action) => {
        state.guarantorLoading = false;
        state.guarantorsNeedingExtension = action.payload.data || [];
      })
      .addCase(fetchGuarantorsNeedingExtension.rejected, (state, action) => {
        state.guarantorLoading = false;
        state.error = action.payload as string;
      })

    // Extend Guarantor
      .addCase(extendGuarantor.pending, (state) => {
        state.guarantorLoading = true;
        state.error = null;
      })
      .addCase(extendGuarantor.fulfilled, (state, action) => {
        state.guarantorLoading = false;
        const updatedGuarantor = action.payload;
        
        // Update in loanGuarantors array
        const index = state.loanGuarantors.findIndex(g => g.id === updatedGuarantor.id);
        if (index !== -1) {
          state.loanGuarantors[index] = updatedGuarantor;
        }
        
        // Remove from guarantorsNeedingExtension
        state.guarantorsNeedingExtension = state.guarantorsNeedingExtension.filter(
          g => g.id !== updatedGuarantor.id
        );
      })
      .addCase(extendGuarantor.rejected, (state, action) => {
        state.guarantorLoading = false;
        state.error = action.payload as string;
      })

    // Bulk Extend Guarantors
      .addCase(bulkExtendGuarantors.pending, (state) => {
        state.guarantorLoading = true;
        state.error = null;
      })
      .addCase(bulkExtendGuarantors.fulfilled, (state, action) => {
        state.guarantorLoading = false;
        const { updated } = action.payload;
        
        // Update all extended guarantors
        updated.forEach((updatedGuarantor: Guarantor) => {
          const index = state.loanGuarantors.findIndex(g => g.id === updatedGuarantor.id);
          if (index !== -1) {
            state.loanGuarantors[index] = updatedGuarantor;
          }
        });
        
        // Remove extended guarantors from needsExtension list
        const updatedIds = updated.map((g: Guarantor) => g.id);
        state.guarantorsNeedingExtension = state.guarantorsNeedingExtension.filter(
          g => !updatedIds.includes(g.id)
        );
      })
      .addCase(bulkExtendGuarantors.rejected, (state, action) => {
        state.guarantorLoading = false;
        state.error = action.payload as string;
      })

    // Update Guarantor
      .addCase(updateGuarantor.pending, (state) => {
        state.guarantorLoading = true;
        state.error = null;
      })
      .addCase(updateGuarantor.fulfilled, (state, action) => {
        state.guarantorLoading = false;
        const updatedGuarantor = action.payload;
        
        const index = state.loanGuarantors.findIndex(g => g.id === updatedGuarantor.id);
        if (index !== -1) {
          state.loanGuarantors[index] = updatedGuarantor;
        }
      })
      .addCase(updateGuarantor.rejected, (state, action) => {
        state.guarantorLoading = false;
        state.error = action.payload as string;
      })
       .addCase(fetchAllCollaterals.pending, (state) => {
      state.collateralLoading = true;
      state.error = null;
    })
    .addCase(fetchAllCollaterals.fulfilled, (state, action) => {
      state.collateralLoading = false;
      state.allCollaterals = action.payload.data || [];
      state.collateralPagination = action.payload.pagination || null;
    })
    .addCase(fetchAllCollaterals.rejected, (state, action) => {
      state.collateralLoading = false;
      state.error = action.payload as string;
    })

    // Extend Collateral
    .addCase(extendCollateral.pending, (state) => {
      state.collateralLoading = true;
      state.error = null;
    })
    .addCase(extendCollateral.fulfilled, (state, action) => {
      state.collateralLoading = false;
      const updatedCollateral = action.payload;
      
      // Update in allCollaterals array
      const index = state.allCollaterals.findIndex(
        (c) => c.id === updatedCollateral.id
      );
      if (index !== -1) {
        state.allCollaterals[index] = updatedCollateral;
      }
      
      // Update in current application if it contains this collateral
      if (state.currentApplication?.collaterals) {
        const collateralIndex = state.currentApplication.collaterals.findIndex(
          (c) => c.id === updatedCollateral.id
        );
        if (collateralIndex !== -1) {
          state.currentApplication.collaterals[collateralIndex] = updatedCollateral;
        }
      }
    })
    .addCase(extendCollateral.rejected, (state, action) => {
      state.collateralLoading = false;
      state.error = action.payload as string;
    });
  },
})

export const {
  clearError,
  setCurrentApplication,
  clearStats,
  resetPagination,
  clearPortfolioSummary,
  clearOverdueLoans,
  clearClassificationReport,
  clearDailyCalculationResult,
  clearEligibleLoans,
  clearValidTransitions,
  clearStatusChangeResults,
  clearPendingLoans,
  clearRejectedLoans,
  clearLoanReviews,
  clearLoanGuarantors,
  clearGuarantorsNeedingExtension,
  clearAllCollaterals,
  resetCollateralPagination,
} = loanApplicationSlice.actions

export default loanApplicationSlice.reducer