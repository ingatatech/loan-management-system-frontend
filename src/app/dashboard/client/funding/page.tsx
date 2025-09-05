
"use client"

import React, { useState, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Building2,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  Gift,
  Briefcase,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  X,
  AlertTriangle,
  User, Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { AppDispatch, RootState } from '@/lib/store';
import {
  getFundingStructure,
  recordShareCapital,
  recordBorrowing,
  recordGrantedFunds,
  recordOperationalFunds,
  updateShareCapital,
  deleteFundingItem,
  uploadFundingDocument,
  clearError,
  deleteShareCapital,
  deleteBorrowing,
  updateBorrowing,
  deleteOperationalFunds,
  updateOperationalFunds,
  deleteGrantedFunds,
  updateGrantedFunds
} from '@/lib/features/auth/funding-Slice';
import toast from 'react-hot-toast';
import rwandaData from "../../../../../data.json";
import {
  getIndividualShareholders,
  getInstitutionShareholders,
} from '@/lib/features/auth/shareholderSlice';
import FilePreview from "reactjs-file-preview";
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
  paymentSchedule?: {
    period: string;
    interestRate: number | string;
  };
}
// Update the GrantedFundsFormData interface
interface GrantedFundsFormData {
  grantorName: string;
  grantorAddress: {
    country: string;
    province: string;
    district: string;
    sector?: string;
    cell?: string;
    village?: string;
    street?: string;
    houseNumber?: string;
    poBox?: string;
  };
  grantorPhone?: string;
  grantorEmail?: string;
  grantorWebsite?: string;
  amountGranted: number | string;
  grantPurpose: string;
  grantType: string;
  grantDate: string;
  disbursementDate?: string;
  projectStartDate: string;
  projectEndDate: string;
  status: string;
  amountDisbursed: number | string;
  amountUtilized: number | string;
  grantAgreementUrl?: string;
  projectProposalUrl?: string;
  reportingDocuments?: string[];
  complianceDocuments?: string[];
  notes?: string;
  isActive: boolean;
  requiresReporting: boolean;
  reportingFrequency?: string;
  nextReportDue?: string;
  grantConditions: Array<{
    condition: string;
    description: string;
    dueDate?: string;
    isCompleted: boolean;
    completedDate?: string;
    evidenceUrl?: string;
    notes?: string;
  }>;
  milestones?: Array<{
    milestoneNumber: number | string;
    title: string;
    description: string;
    targetDate: string;
    completionDate?: string;
    isCompleted: boolean;
    budgetAllocation: number | string;
    actualSpent?: number | string;
    evidenceUrls?: string[];
    notes?: string;
  }>;
}

// Update the initial state for grantForm


interface OperationalFundsFormData {
  fundSource: string;
  fundSourceDescription?: string;
  amountCommitted: number | string;
  commitmentDate: string;
  availabilityDate?: string;
  expirationDate?: string;
  utilizationPlan: Array<{
    category: string;
    description: string;
    allocatedAmount: number | string;
    utilizationPeriod: {
      startDate: string;
      endDate: string;
    };
    priority?: number | string;
    isCompleted?: boolean;
    actualUtilized?: number | string;
    utilizationDate?: string;
    notes?: string;
  }>;
  budgetAllocations?: Array<{
    department: string;
    allocatedAmount: number | string;
    approvedBy: string;
    approvalDate: string;
    utilizationDeadline: string;
    actualSpent: number | string;
    remainingBalance: number | string;
    utilizationPercentage: number | string;
  }>;
  purpose?: string;
  approvedBy?: string;
  approvalDate?: string;
  fundingAgreementUrl?: string;
  budgetDocumentUrl?: string;
  utilizationReports?: string[];
  notes?: string;
}
const FundingStructure: FC = function LoanManagementApp() {
  const dispatch = useDispatch<AppDispatch>();
  const { fundingStructure, isLoading, error } = useSelector((state: RootState) => state.funding);
  const { user } = useSelector((state: RootState) => state.auth);
  const shareholdersState = useSelector((state: RootState) => state.shareholders);
  const individualShareholders = shareholdersState.individualShareholders;
  const institutionShareholders = shareholdersState.institutionShareholders;
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedSections, setExpandedSections] = useState<string[]>(['shareCapital']);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedShareCapital, setSelectedShareCapital] = useState<any>(null);
  const [selectedBorrowing, setSelectedBorrowing] = useState<any>(null);
  const [editingGrant, setEditingGrant] = useState<any>(null);
  const [editingOperational, setEditingOperational] = useState<any>(null);
  const [existingShareCapital, setExistingShareCapital] = useState<any>(null);
  const [deleteGrantModal, setDeleteGrantModal] = useState({
    isOpen: false,
    grantId: null as number | null,
    grantorName: ''
  });
  const [deleteOperationalModal, setDeleteOperationalModal] = useState({
    isOpen: false,
    operationalId: null as number | null,
    fundSource: ''
  });
  const [selectedGrant, setSelectedGrant] = useState<any>(null);
  const [selectedOperational, setSelectedOperational] = useState<any>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'idProof' | 'passport' | 'residence' | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    shareCapitalId: null as number | null,
    shareholderName: ''
  });

  const [editingBorrowing, setEditingBorrowing] = useState<any>(null);
  const [deleteBorrowingModal, setDeleteBorrowingModal] = useState({
    isOpen: false,
    borrowingId: null as number | null,
    lenderName: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  // Form states
  const [shareCapitalForm, setShareCapitalForm] = useState<ShareCapitalFormData>({
    shareholderId: 0,
    shareholderType: 'individual',
    dateOfContribution: '',
    typeOfShare: 'ordinary',
    numberOfShares: '',
    valuePerShare: '',
    paymentDetails: {
      paymentMethod: '',
      paymentDate: '',
      paymentReference: '',
    }
  });
  const [borrowingForm, setBorrowingForm] = useState<BorrowingFormData>({
    lenderType: '',
    lenderName: '',
    lenderAddress: {
      country: 'Rwanda',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: ''
    },
    amountBorrowed: '',
    interestRate: '',
    tenureMonths: '',
    borrowingDate: '',
    maturityDate: '',
    purpose: '',
    collateralDescription: '',
    collateralValue: '',
    paymentSchedule: {
      period: '',
      interestRate: ''
    }
  });
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [cells, setCells] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [grantProvinces, setGrantProvinces] = useState<string[]>([]);
  const [grantDistricts, setGrantDistricts] = useState<string[]>([]);
  const [grantSectors, setGrantSectors] = useState<string[]>([]);
  const [grantCells, setGrantCells] = useState<string[]>([]);
  const [grantVillages, setGrantVillages] = useState<string[]>([]);
  // Load provinces from Rwanda data
  useEffect(() => {
    const provinceList = Object.keys(rwandaData);
    setProvinces(provinceList);
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (borrowingForm.lenderAddress.province) {
      const provinceData = rwandaData[borrowingForm.lenderAddress.province as keyof typeof rwandaData];
      const districtList = Object.keys(provinceData || {});
      setDistricts(districtList);

      setBorrowingForm(prev => ({
        ...prev,
        lenderAddress: {
          ...prev.lenderAddress,
          district: "",
          sector: "",
          cell: "",
          village: "",
        },
      }));
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [borrowingForm.lenderAddress.province]);


  // Update sectors when district changes
  useEffect(() => {
    if (borrowingForm.lenderAddress.province && borrowingForm.lenderAddress.district) {
      const provinceData = rwandaData[borrowingForm.lenderAddress.province as keyof typeof rwandaData];
      const districtData = provinceData[borrowingForm.lenderAddress.district as keyof typeof provinceData];
      const sectorList = Object.keys(districtData || {});
      setSectors(sectorList);

      setBorrowingForm(prev => ({
        ...prev,
        lenderAddress: {
          ...prev.lenderAddress,
          sector: "",
          cell: "",
          village: "",
        },
      }));
      setCells([]);
      setVillages([]);
    }
  }, [borrowingForm.lenderAddress.district]);

  // Update cells when sector changes
  useEffect(() => {
    if (borrowingForm.lenderAddress.province && borrowingForm.lenderAddress.district && borrowingForm.lenderAddress.sector) {
      const provinceData = rwandaData[borrowingForm.lenderAddress.province as keyof typeof rwandaData];
      const districtData = provinceData[borrowingForm.lenderAddress.district as keyof typeof provinceData];
      const sectorData = districtData[borrowingForm.lenderAddress.sector as keyof typeof districtData];
      const cellList = Object.keys(sectorData || {});
      setCells(cellList);

      setBorrowingForm(prev => ({
        ...prev,
        lenderAddress: {
          ...prev.lenderAddress,
          cell: "",
          village: "",
        },
      }));
      setVillages([]);
    }
  }, [borrowingForm.lenderAddress.sector]);

  // Update villages when cell changes
  useEffect(() => {
    if (borrowingForm.lenderAddress.province && borrowingForm.lenderAddress.district &&
      borrowingForm.lenderAddress.sector && borrowingForm.lenderAddress.cell) {
      const provinceData = rwandaData[borrowingForm.lenderAddress.province as keyof typeof rwandaData];
      const districtData = provinceData[borrowingForm.lenderAddress.district as keyof typeof provinceData];
      const sectorData = districtData[borrowingForm.lenderAddress.sector as keyof typeof districtData];
      const cellData = sectorData[borrowingForm.lenderAddress.cell as keyof typeof sectorData];

      if (Array.isArray(cellData)) {
        setVillages(cellData);
        setBorrowingForm(prev => ({
          ...prev,
          lenderAddress: {
            ...prev.lenderAddress,
            village: "",
          },
        }));
      }
    }
  }, [borrowingForm.lenderAddress.cell]);

  const [utilizationPlans, setUtilizationPlans] = useState<Array<{
    category: string;
    description: string;
    allocatedAmount: number | string;
    utilizationPeriod: {
      startDate: string;
      endDate: string;
    };
    priority: number | string;
    isCompleted: boolean;
    actualUtilized?: number | string;
    utilizationDate?: string;
    notes?: string;
  }>>([]);
  const [budgetAllocations, setBudgetAllocations] = useState<Array<{
    department: string;
    allocatedAmount: number | string;
    approvedBy: string;
    approvalDate: string;
    utilizationDeadline: string;
    actualSpent: number | string;
    remainingBalance: number | string;
    utilizationPercentage: number | string;
  }>>([]);
  const addUtilizationPlan = () => {
    setUtilizationPlans([
      ...utilizationPlans,
      {
        category: '',
        description: '',
        allocatedAmount: 0,
        utilizationPeriod: {
          startDate: '',
          endDate: ''
        },
        priority: 1,
        isCompleted: false
      }
    ]);
  };

  const removeUtilizationPlan = (index: number) => {
    const newPlans = [...utilizationPlans];
    newPlans.splice(index, 1);
    setUtilizationPlans(newPlans);
  };

  const updateUtilizationPlan = (index: number, field: string, value: any) => {
    const newPlans = [...utilizationPlans];

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newPlans[index] = {
        ...newPlans[index],
        [parent]: {
          ...newPlans[index][parent as keyof typeof newPlans[0]],
          [child]: value
        }
      };
    } else {
      newPlans[index] = {
        ...newPlans[index],
        [field]: value
      };
    }

    setUtilizationPlans(newPlans);
  };

  const addBudgetAllocation = () => {
    setBudgetAllocations([
      ...budgetAllocations,
      {
        department: '',
        allocatedAmount: 0,
        approvedBy: '',
        approvalDate: '',
        utilizationDeadline: '',
        actualSpent: 0,
        remainingBalance: 0,
        utilizationPercentage: 0
      }
    ]);
  };

  const removeBudgetAllocation = (index: number) => {
    const newAllocations = [...budgetAllocations];
    newAllocations.splice(index, 1);
    setBudgetAllocations(newAllocations);
  };

  const updateBudgetAllocation = (index: number, field: string, value: any) => {
    const newAllocations = [...budgetAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      [field]: value
    };
    setBudgetAllocations(newAllocations);
  };

  const [grantForm, setGrantForm] = useState<GrantedFundsFormData>({
    grantorName: '',
    grantorAddress: {
      country: 'Rwanda',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      street: '',
      houseNumber: '',
      poBox: ''
    },
    grantorPhone: '',
    grantorEmail: '',
    grantorWebsite: '',
    amountGranted: '',
    grantPurpose: '',
    grantType: 'development',
    grantDate: '',
    disbursementDate: '',
    projectStartDate: '',
    projectEndDate: '',
    status: 'pending',
    amountDisbursed: '',
    amountUtilized: '',
    grantAgreementUrl: '',
    projectProposalUrl: '',
    reportingDocuments: [],
    complianceDocuments: [],
    notes: '',
    isActive: true,
    requiresReporting: false,
    reportingFrequency: '',
    nextReportDue: '',
    grantConditions: [],
    milestones: []
  });

  useEffect(() => {
    const provinceList = Object.keys(rwandaData);
    setGrantProvinces(provinceList);
  }, []);

  // Update districts when province changes in grant form
  useEffect(() => {
    if (grantForm.grantorAddress?.province) {
      const provinceData = rwandaData[grantForm.grantorAddress.province as keyof typeof rwandaData];
      const districtList = Object.keys(provinceData || {});
      setGrantDistricts(districtList);

      setGrantForm(prev => ({
        ...prev,
        grantorAddress: {
          ...prev.grantorAddress,
          district: "",
          sector: "",
          cell: "",
          village: "",
        },
      }));
      setGrantSectors([]);
      setGrantCells([]);
      setGrantVillages([]);
    }
  }, [grantForm.grantorAddress?.province]);

  // Update sectors when district changes in grant form
  useEffect(() => {
    if (grantForm.grantorAddress?.province && grantForm.grantorAddress?.district) {
      const provinceData = rwandaData[grantForm.grantorAddress.province as keyof typeof rwandaData];
      const districtData = provinceData[grantForm.grantorAddress.district as keyof typeof provinceData];
      const sectorList = Object.keys(districtData || {});
      setGrantSectors(sectorList);

      setGrantForm(prev => ({
        ...prev,
        grantorAddress: {
          ...prev.grantorAddress,
          sector: "",
          cell: "",
          village: "",
        },
      }));
      setGrantCells([]);
      setGrantVillages([]);
    }
  }, [grantForm.grantorAddress?.district]);

  // Update cells when sector changes in grant form
  useEffect(() => {
    if (grantForm.grantorAddress?.province && grantForm.grantorAddress?.district && grantForm.grantorAddress?.sector) {
      const provinceData = rwandaData[grantForm.grantorAddress.province as keyof typeof rwandaData];
      const districtData = provinceData[grantForm.grantorAddress.district as keyof typeof provinceData];
      const sectorData = districtData[grantForm.grantorAddress.sector as keyof typeof districtData];
      const cellList = Object.keys(sectorData || {});
      setGrantCells(cellList);

      setGrantForm(prev => ({
        ...prev,
        grantorAddress: {
          ...prev.grantorAddress,
          cell: "",
          village: "",
        },
      }));
      setGrantVillages([]);
    }
  }, [grantForm.grantorAddress?.sector]);

  // Update villages when cell changes in grant form
  useEffect(() => {
    if (grantForm.grantorAddress?.province && grantForm.grantorAddress?.district &&
      grantForm.grantorAddress?.sector && grantForm.grantorAddress?.cell) {
      const provinceData = rwandaData[grantForm.grantorAddress.province as keyof typeof rwandaData];
      const districtData = provinceData[grantForm.grantorAddress.district as keyof typeof provinceData];
      const sectorData = districtData[grantForm.grantorAddress.sector as keyof typeof districtData];
      const cellData = sectorData[grantForm.grantorAddress.cell as keyof typeof sectorData];

      if (Array.isArray(cellData)) {
        setGrantVillages(cellData);
        setGrantForm(prev => ({
          ...prev,
          grantorAddress: {
            ...prev.grantorAddress,
            village: "",
          },
        }));
      }
    }
  }, [grantForm.grantorAddress?.cell]);

  const [operationalForm, setOperationalForm] = useState<OperationalFundsFormData>({
    fundSource: '',
    amountCommitted: '',
    commitmentDate: '',
    utilizationPlan: []
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const organizationId = user?.organizationId;

  useEffect(() => {
    if (organizationId) {
      dispatch(getFundingStructure(organizationId));
    }
  }, [dispatch, organizationId]);
  useEffect(() => {
    if (organizationId) {
      dispatch(getIndividualShareholders({
        organizationId,
        page: 1,
        limit: 100,
        includeShareCapital: true
      }));
      dispatch(getInstitutionShareholders({
        organizationId,
        page: 1,
        limit: 100,
        includeShareCapital: true
      }));
    }
  }, [dispatch, organizationId]);
  useEffect(() => {
    const checkExistingShareCapital = async () => {
      if (shareCapitalForm.shareholderId > 0 && organizationId) {
        try {
          // You might need to add this API call to your fundingSlice
          const response = await dispatch(getFundingStructure(organizationId)).unwrap();
          const existing = response.data?.shareCapitals?.find((sc: any) =>
            sc.shareholderId === shareCapitalForm.shareholderId &&
            sc.shareholderType === shareCapitalForm.shareholderType
          );
          setExistingShareCapital(existing || null);
        } catch (error) {
          console.error('Error checking existing share capital:', error);
          setExistingShareCapital(null);
        }
      } else {
        setExistingShareCapital(null);
      }
    };

    checkExistingShareCapital();
  }, [shareCapitalForm.shareholderId, shareCapitalForm.shareholderType, organizationId]);

  // Calculate total values for overview
  const calculateTotals = () => {
    const totalShareCapital = fundingStructure?.shareCapitals?.reduce(
      (sum, sc) => sum + Number(sc.totalContributedCapitalValue || 0), 0
    ) || 0;

    const totalBorrowings = fundingStructure?.borrowings?.reduce(
      (sum, b) => sum + Number(b.amountBorrowed || 0), 0
    ) || 0;

    const totalGrants = fundingStructure?.grants?.reduce(
      (sum, g) => sum + Number(g.amountGranted || 0), 0
    ) || 0;

    const totalOperational = fundingStructure?.operational?.reduce(
      (sum, o) => sum + Number(o.amountCommitted || 0), 0
    ) || 0;

    return {
      shareCapital: totalShareCapital,
      borrowings: totalBorrowings,
      grants: totalGrants,
      operational: totalOperational,
      total: totalShareCapital + totalBorrowings + totalGrants + totalOperational
    };
  };

  const totals = calculateTotals();

  const handleUpdateShareCapital = async () => {
    if (!organizationId || !editingItem) return;

    try {
      const formData = new FormData();

      // Append all form data
      formData.append('shareholderId', shareCapitalForm.shareholderId.toString());
      formData.append('shareholderType', shareCapitalForm.shareholderType);
      formData.append('dateOfContribution', shareCapitalForm.dateOfContribution);
      formData.append('typeOfShare', shareCapitalForm.typeOfShare);
      formData.append('numberOfShares', shareCapitalForm.numberOfShares.toString());
      formData.append('valuePerShare', shareCapitalForm.valuePerShare.toString());

      // Append individual payment details fields
      formData.append('paymentDetails[paymentMethod]', shareCapitalForm.paymentDetails.paymentMethod);
      formData.append('paymentDetails[paymentDate]', shareCapitalForm.paymentDetails.paymentDate);
      formData.append('paymentDetails[paymentReference]', shareCapitalForm.paymentDetails.paymentReference);

      // Append optional payment details fields if they exist
      if (shareCapitalForm.paymentDetails.bankName) {
        formData.append('paymentDetails[bankName]', shareCapitalForm.paymentDetails.bankName);
      }
      if (shareCapitalForm.paymentDetails.accountNumber) {
        formData.append('paymentDetails[accountNumber]', shareCapitalForm.paymentDetails.accountNumber);
      }
      if (shareCapitalForm.paymentDetails.transactionId) {
        formData.append('paymentDetails[transactionId]', shareCapitalForm.paymentDetails.transactionId);
      }

      if (shareCapitalForm.notes) {
        formData.append('notes', shareCapitalForm.notes);
      }

      // Append the file if it exists
      if (uploadedFiles.paymentProof) {
        formData.append('paymentProof', uploadedFiles.paymentProof);
      }

      await dispatch(updateShareCapital({
        id: editingItem.id,
        shareCapitalData: formData
      })).unwrap();

      toast.success('Share capital contribution updated successfully!');
      setShowForm(null);
      setEditingItem(null);
      resetShareCapitalForm();
      setUploadedFiles({});
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      console.error('Error updating share capital:', error);
      toast.error('Failed to update share capital contribution');
    }
  };


  const validateFile = (file: File): string | null => {
    // Check file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid file type (PDF, JPG, PNG, DOC, DOCX)';
    }

    return null; // No errors
  };

  const handleSubmitShareCapital = async () => {
    if (!organizationId) return;

    // Validate required file
    if (!uploadedFiles.paymentProof) {
      toast.error('Payment proof document is required');
      return;
    }

    try {
      const formData = new FormData();

      // Append all form data as individual fields (not as JSON)
      formData.append('shareholderId', shareCapitalForm.shareholderId.toString());
      formData.append('shareholderType', shareCapitalForm.shareholderType);
      formData.append('dateOfContribution', shareCapitalForm.dateOfContribution);
      formData.append('typeOfShare', shareCapitalForm.typeOfShare);
      formData.append('numberOfShares', shareCapitalForm.numberOfShares.toString());
      formData.append('valuePerShare', shareCapitalForm.valuePerShare.toString());

      // Append individual payment details fields
      formData.append('paymentDetails[paymentMethod]', shareCapitalForm.paymentDetails.paymentMethod);
      formData.append('paymentDetails[paymentDate]', shareCapitalForm.paymentDetails.paymentDate);
      formData.append('paymentDetails[paymentReference]', shareCapitalForm.paymentDetails.paymentReference);

      if (shareCapitalForm.paymentDetails.bankName) {
        formData.append('paymentDetails[bankName]', shareCapitalForm.paymentDetails.bankName);
      }
      if (shareCapitalForm.paymentDetails.accountNumber) {
        formData.append('paymentDetails[accountNumber]', shareCapitalForm.paymentDetails.accountNumber);
      }
      if (shareCapitalForm.paymentDetails.transactionId) {
        formData.append('paymentDetails[transactionId]', shareCapitalForm.paymentDetails.transactionId);
      }

      if (shareCapitalForm.notes) {
        formData.append('notes', shareCapitalForm.notes);
      }

      // Append the file - ensure this is the binary file
      formData.append('paymentProof', uploadedFiles.paymentProof);

      const response = await dispatch(recordShareCapital({
        organizationId,
        shareCapitalData: formData
      })).unwrap();

      // NEW: Show appropriate message based on whether record was created or updated
      if (response.isNewRecord) {
        toast.success('Share capital contribution recorded successfully!');
      } else {
        toast.success(
          `Contribution added successfully! ` +
          `Previous total: ${formatCurrency(response.previousTotal)} ` +
          `New total: ${formatCurrency(response.newTotal)}`
        );
      }

      setShowForm(null);
      resetShareCapitalForm();
      setUploadedFiles({});
      setExistingShareCapital(null);
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to record share capital contribution');
    }
  };
  // In your component functions
  const handleDeleteShareCapital = (shareCapital: any) => {
    const shareholderName = getShareholderName(
      shareCapital.shareholderId,
      shareCapital.shareholderType
    );

    setDeleteModal({
      isOpen: true,
      shareCapitalId: shareCapital.id,
      shareholderName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.shareCapitalId || !organizationId) return;

    setActionLoading(true);
    try {
      await dispatch(deleteShareCapital(deleteModal.shareCapitalId)).unwrap();
      toast.success('Share capital contribution deleted successfully!');
      setDeleteModal({ isOpen: false, shareCapitalId: null, shareholderName: '' });
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to delete share capital contribution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitBorrowing = async () => {
    if (!organizationId) return;

    try {
      await dispatch(recordBorrowing({
        organizationId,
        borrowingData: borrowingForm
      })).unwrap();

      toast.success('Borrowing record created successfully!');
      setShowForm(null);
      resetBorrowingForm();
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to record borrowing');
    }
  };


  const handleSubmitGrant = async () => {
    if (!organizationId) return;

    try {
      await dispatch(recordGrantedFunds({
        organizationId,
        grantData: grantForm
      })).unwrap();

      toast.success('Grant record created successfully!');
      setShowForm(null);
      resetGrantForm();
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to record grant');
    }
  };


  const resetShareCapitalForm = () => {
    setShareCapitalForm({
      shareholderId: 0,
      shareholderType: 'individual',
      dateOfContribution: '',
      typeOfShare: 'ordinary',
      numberOfShares: 0,
      valuePerShare: 0,
      paymentDetails: {
        paymentMethod: '',
        paymentDate: '',
        paymentReference: '',
      }
    });
    setEditingItem(null);
    setUploadedFiles({});
  };

  const resetBorrowingForm = () => {
    setBorrowingForm({
      lenderType: '',
      lenderName: '',
      lenderAddress: {
        country: 'Rwanda',
        province: '',
        district: '',
        sector: '',
        cell: '',
        village: ''
      },
      amountBorrowed: 0,
      interestRate: 0,
      tenureMonths: 0,
      borrowingDate: '',
      maturityDate: '',
      purpose: '',
      collateralDescription: '',
      collateralValue: 0,
      paymentSchedule: {
        period: '',
        interestRate: 0
      }
    });
  };

  const resetGrantForm = () => {
    setGrantForm({
      grantorName: '',
      grantorAddress: {
        country: 'Rwanda',
        province: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        street: '',
        houseNumber: '',
        poBox: ''
      },
      grantorPhone: '',
      grantorEmail: '',
      grantorWebsite: '',
      amountGranted: 0,
      grantPurpose: '',
      grantType: 'development',
      grantDate: '',
      disbursementDate: '',
      projectStartDate: '',
      projectEndDate: '',
      status: 'pending',
      amountDisbursed: 0,
      amountUtilized: 0,
      grantAgreementUrl: '',
      projectProposalUrl: '',
      reportingDocuments: [],
      complianceDocuments: [],
      notes: '',
      isActive: true,
      requiresReporting: false,
      reportingFrequency: '',
      nextReportDue: '',
      grantConditions: [],
      milestones: []
    });
  };


  const resetOperationalForm = () => {
    setOperationalForm({
      fundSource: '',
      amountCommitted: 0,
      commitmentDate: '',
      utilizationPlan: []
    });
    setUtilizationPlans([]);
    setBudgetAllocations([]);
  };

  const handleSubmitOperational = async () => {
    if (!organizationId) return;

    try {
      // Prepare the data in the exact format expected by backend
      const operationalData: OperationalFundsFormData = {
        fundSource: operationalForm.fundSource,
        fundSourceDescription: operationalForm.fundSourceDescription || undefined,
        amountCommitted: operationalForm.amountCommitted,
        commitmentDate: operationalForm.commitmentDate,
        availabilityDate: operationalForm.availabilityDate || undefined,
        expirationDate: operationalForm.expirationDate || undefined,
        utilizationPlan: utilizationPlans,
        budgetAllocations: budgetAllocations.length > 0 ? budgetAllocations : undefined,
        purpose: operationalForm.purpose || undefined,
        // These will be set by the backend or can be populated from your auth context
        approvedBy: undefined,
        approvalDate: undefined,
        fundingAgreementUrl: undefined,
        budgetDocumentUrl: undefined,
        utilizationReports: undefined,
        notes: undefined
      };

      await dispatch(recordOperationalFunds({
        organizationId,
        operationalData
      })).unwrap();

      toast.success('Operational funds record created successfully!');
      setShowForm(null);
      resetOperationalForm();
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to record operational funds');
    }
  };
  const handleEditShareCapital = (shareCapital: any) => {
    // Set the form data with the existing share capital values
    setShareCapitalForm({
      shareholderId: shareCapital.shareholderId,
      shareholderType: shareCapital.shareholderType,
      dateOfContribution: shareCapital.dateOfContribution,
      typeOfShare: shareCapital.typeOfShare,
      numberOfShares: shareCapital.numberOfShares,
      valuePerShare: shareCapital.valuePerShare,
      paymentDetails: {
        paymentMethod: shareCapital.paymentDetails?.paymentMethod || '',
        paymentDate: shareCapital.paymentDetails?.paymentDate || '',
        paymentReference: shareCapital.paymentDetails?.paymentReference || '',
        bankName: shareCapital.paymentDetails?.bankName || '',
        accountNumber: shareCapital.paymentDetails?.accountNumber || '',
        transactionId: shareCapital.paymentDetails?.transactionId || '',
      },
      notes: shareCapital.notes || '',
    });

    // Set the editing item
    setEditingItem(shareCapital);

    // Show the form
    setShowForm('shareCapital');
  };


  const handleEditBorrowing = (borrowing: any) => {
    setBorrowingForm({
      lenderType: borrowing.lenderType,
      lenderName: borrowing.lenderName,
      lenderAddress: {
        country: borrowing.lenderAddress?.country || 'Rwanda',
        province: borrowing.lenderAddress?.province || '',
        district: borrowing.lenderAddress?.district || '',
        sector: borrowing.lenderAddress?.sector || '',
        cell: borrowing.lenderAddress?.cell || '',
        village: borrowing.lenderAddress?.village || ''
      },
      lenderPhone: borrowing.lenderPhone || '',
      lenderEmail: borrowing.lenderEmail || '',
      amountBorrowed: borrowing.amountBorrowed,
      interestRate: borrowing.interestRate,
      tenureMonths: borrowing.tenureMonths,
      borrowingDate: borrowing.borrowingDate,
      maturityDate: borrowing.maturityDate,
      purpose: borrowing.purpose || '',
      collateralDescription: borrowing.collateralDescription || '',
      collateralValue: borrowing.collateralValue || 0,
      paymentSchedule: borrowing.paymentSchedule || {
        period: '',
        interestRate: 0
      }
    });

    setEditingBorrowing(borrowing);
    setShowForm('borrowing');
  };

  const handleUpdateBorrowing = async () => {
    if (!organizationId || !editingBorrowing) return;

    try {
      await dispatch(updateBorrowing({
        id: editingBorrowing.id,
        borrowingData: borrowingForm
      })).unwrap();

      toast.success('Borrowing record updated successfully!');
      setShowForm(null);
      setEditingBorrowing(null);
      resetBorrowingForm();
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to update borrowing record');
    }
  };

  const handleDeleteBorrowing = (borrowing: any) => {
    setDeleteBorrowingModal({
      isOpen: true,
      borrowingId: borrowing.id,
      lenderName: borrowing.lenderName
    });
  };

  const handleDeleteBorrowingConfirm = async () => {
    if (!deleteBorrowingModal.borrowingId || !organizationId) return;

    setActionLoading(true);
    try {
      await dispatch(deleteBorrowing(deleteBorrowingModal.borrowingId)).unwrap();
      toast.success('Borrowing record deleted successfully!');
      setDeleteBorrowingModal({ isOpen: false, borrowingId: null, lenderName: '' });
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to delete borrowing record');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentPreview = (url: string, type: 'idProof' | 'passport' | 'residence') => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const handleViewShareCapital = (shareCapital: any) => {
    setSelectedShareCapital(shareCapital);
    setViewModalOpen(true);
  };
  const handleViewBorrowing = (borrowing: any) => {
    setSelectedBorrowing(borrowing);
    setViewModalOpen(true);
  };


  // Grant handlers
  const handleEditGrant = (grant: any) => {
    setGrantForm({
      grantorName: grant.grantorName,
      grantorAddress: {
        country: grant.grantorAddress?.country || 'Rwanda',
        province: grant.grantorAddress?.province || '',
        district: grant.grantorAddress?.district || '',
        sector: grant.grantorAddress?.sector || '',
        cell: grant.grantorAddress?.cell || '',
        village: grant.grantorAddress?.village || '',
        street: grant.grantorAddress?.street || '',
        houseNumber: grant.grantorAddress?.houseNumber || '',
        poBox: grant.grantorAddress?.poBox || ''
      },
      grantorPhone: grant.grantorPhone || '',
      grantorEmail: grant.grantorEmail || '',
      grantorWebsite: grant.grantorWebsite || '',
      amountGranted: grant.amountGranted,
      grantPurpose: grant.grantPurpose,
      grantType: grant.grantType,
      grantDate: grant.grantDate,
      disbursementDate: grant.disbursementDate || '',
      projectStartDate: grant.projectStartDate,
      projectEndDate: grant.projectEndDate,
      status: grant.status,
      amountDisbursed: grant.amountDisbursed || 0,
      amountUtilized: grant.amountUtilized || 0,
      grantAgreementUrl: grant.grantAgreementUrl || '',
      projectProposalUrl: grant.projectProposalUrl || '',
      reportingDocuments: grant.reportingDocuments || [],
      complianceDocuments: grant.complianceDocuments || [],
      notes: grant.notes || '',
      isActive: grant.isActive,
      requiresReporting: grant.requiresReporting,
      reportingFrequency: grant.reportingFrequency || '',
      nextReportDue: grant.nextReportDue || '',
      grantConditions: grant.grantConditions || [],
      milestones: grant.milestones || []
    });

    setEditingGrant(grant);
    setShowForm('grant');
  };

  const handleUpdateGrant = async () => {
    if (!organizationId || !editingGrant) return;

    try {
      await dispatch(updateGrantedFunds({
        id: editingGrant.id,
        grantData: grantForm
      })).unwrap();

      toast.success('Grant record updated successfully!');
      setShowForm(null);
      setEditingGrant(null);
      resetGrantForm();
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to update grant record');
    }
  };

  const handleDeleteGrant = (grant: any) => {
    setDeleteGrantModal({
      isOpen: true,
      grantId: grant.id,
      grantorName: grant.grantorName
    });
  };

  const handleDeleteGrantConfirm = async () => {
    if (!deleteGrantModal.grantId || !organizationId) return;

    setActionLoading(true);
    try {
      await dispatch(deleteGrantedFunds(deleteGrantModal.grantId)).unwrap();
      toast.success('Grant record deleted successfully!');
      setDeleteGrantModal({ isOpen: false, grantId: null, grantorName: '' });
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to delete grant record');
    } finally {
      setActionLoading(false);
    }
  };

  // Operational handlers
  const handleEditOperational = (operational: any) => {
    setOperationalForm({
      fundSource: operational.fundSource,
      fundSourceDescription: operational.fundSourceDescription || '',
      amountCommitted: operational.amountCommitted,
      commitmentDate: operational.commitmentDate,
      availabilityDate: operational.availabilityDate || '',
      expirationDate: operational.expirationDate || '',
      purpose: operational.purpose || '',
      utilizationPlan: operational.utilizationPlan || []
    });

    setUtilizationPlans(operational.utilizationPlan || []);
    setBudgetAllocations(operational.budgetAllocations || []);

    setEditingOperational(operational);
    setShowForm('operational');
  };

  const handleUpdateOperational = async () => {
    if (!organizationId || !editingOperational) return;

    try {
      const operationalData: OperationalFundsFormData = {
        fundSource: operationalForm.fundSource,
        fundSourceDescription: operationalForm.fundSourceDescription || undefined,
        amountCommitted: operationalForm.amountCommitted,
        commitmentDate: operationalForm.commitmentDate,
        availabilityDate: operationalForm.availabilityDate || undefined,
        expirationDate: operationalForm.expirationDate || undefined,
        utilizationPlan: utilizationPlans,
        budgetAllocations: budgetAllocations.length > 0 ? budgetAllocations : undefined,
        purpose: operationalForm.purpose || undefined
      };

      await dispatch(updateOperationalFunds({
        id: editingOperational.id,
        operationalData
      })).unwrap();

      toast.success('Operational funds record updated successfully!');
      setShowForm(null);
      setEditingOperational(null);
      resetOperationalForm();
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to update operational funds record');
    }
  };

  const handleDeleteOperational = (operational: any) => {
    setDeleteOperationalModal({
      isOpen: true,
      operationalId: operational.id,
      fundSource: operational.fundSource
    });
  };

  const handleDeleteOperationalConfirm = async () => {
    if (!deleteOperationalModal.operationalId || !organizationId) return;

    setActionLoading(true);
    try {
      await dispatch(deleteOperationalFunds(deleteOperationalModal.operationalId)).unwrap();
      toast.success('Operational funds record deleted successfully!');
      setDeleteOperationalModal({ isOpen: false, operationalId: null, fundSource: '' });
      dispatch(getFundingStructure(organizationId));
    } catch (error) {
      toast.error('Failed to delete operational funds record');
    } finally {
      setActionLoading(false);
    }
  };

  // View handlers
  const handleViewGrant = (grant: any) => {
    setSelectedGrant(grant);
    setViewModalOpen(true);
  };

  const handleViewOperational = (operational: any) => {
    setSelectedOperational(operational);
    setViewModalOpen(true);
  };
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getShareholderName = (shareholderId: number, shareholderType: string) => {
    if (shareholderType === 'individual') {
      const shareholder = individualShareholders.find(s => s.id === shareholderId);
      return shareholder ? `${shareholder.firstname} ${shareholder.lastname}` : 'Unknown';
    } else {
      const shareholder = institutionShareholders.find(s => s.id === shareholderId);
      return shareholder ? shareholder.institutionName : 'Unknown';
    }
  };
  // Update the StatCard component to show loader when data is loading
  const StatCard = ({
    title,
    value,
    icon,
    color,
    bgGradient,
    accentColor,
    subtitle,
    isLoading = false
  }: {
    title: string
    value: string
    icon: React.ReactNode
    color: string
    bgGradient: string
    accentColor: string
    subtitle?: string
    isLoading?: boolean
  }) => (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
    >
      <div className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 h-[80px] rounded-xl">
        <div className="p-0 relative h-full">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-100 to-transparent transform rotate-12"></div>
          </div>

          <div className="flex items-center relative z-10 h-full">
            <div className={`${bgGradient} p-2 flex items-center justify-center relative overflow-hidden h-full`}>
              <div className={`absolute inset-0 ${accentColor} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
              <motion.div
                className="text-white text-sm relative z-10"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20 rounded-full"></div>
            </div>

            <div className="p-4 flex-1 bg-gradient-to-r from-transparent to-gray-50/30 min-w-0">
              <p className="text-xs text-gray-600 font-medium mb-0.5 tracking-wide uppercase truncate">{title}</p>
              {isLoading ? (
                <div className="flex justify-center items-center h-6">
                  <div className="w-4 h-4 border-2 border-t-blue-500 border-r-blue-400 border-b-blue-300 border-l-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto scrollbar-hide">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300 whitespace-nowrap">
                      {value}
                    </p>
                  </div>
                  {subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatCard
          title="Share Capital"
          value={formatCurrency(totals.shareCapital)}
          icon={<Users className="w-4 h-4" />}
          color="bg-blue-500"
          bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
          accentColor="bg-blue-400"
          subtitle={`${fundingStructure?.shareCapitals?.length || 0} contributions`}
          isLoading={isLoading} // Add isLoading prop
        />

        <StatCard
          title="Borrowings"
          value={formatCurrency(totals.borrowings)}
          icon={<CreditCard className="w-4 h-4" />}
          color="bg-red-500"
          bgGradient="bg-gradient-to-br from-red-400 to-red-600"
          accentColor="bg-red-400"
          subtitle={`${fundingStructure?.borrowings?.length || 0} loans`}
          isLoading={isLoading} // Add isLoading prop
        />

        <StatCard
          title="Grants"
          value={formatCurrency(totals.grants)}
          icon={<Gift className="w-4 h-4" />}
          color="bg-green-500"
          bgGradient="bg-gradient-to-br from-green-400 to-green-600"
          accentColor="bg-green-400"
          subtitle={`${fundingStructure?.grants?.length || 0} grants`}
          isLoading={isLoading} // Add isLoading prop
        />

        <StatCard
          title="Operational"
          value={formatCurrency(totals.operational)}
          icon={<Briefcase className="w-4 h-4" />}
          color="bg-purple-500"
          bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
          accentColor="bg-purple-400"
          subtitle={`${fundingStructure?.operational?.length || 0} funds`}
          isLoading={isLoading} // Add isLoading prop
        />
      </motion.div>

      {/* Funding Breakdown - Keep existing code as is */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Funding Breakdown</h3>

        {/* Share Capital Section */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between cursor-pointer p-3 bg-blue-50 rounded-lg"
            onClick={() => toggleSection('shareCapital')}
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <h4 className="font-medium text-blue-900">Share Capital Contributions</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-medium">{formatCurrency(totals.shareCapital)}</span>
              {expandedSections.includes('shareCapital') ?
                <ChevronDown className="w-4 h-4 text-blue-600" /> :
                <ChevronRight className="w-4 h-4 text-blue-600" />
              }
            </div>
          </div>

          {expandedSections.includes('shareCapital') && (
            <div className="mt-3 space-y-2">
              {fundingStructure?.shareCapitals?.map((sc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getShareholderName(sc.shareholderId, sc.shareholderType)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sc.numberOfShares} {sc.typeOfShare} shares @ {formatCurrency(sc.valuePerShare)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(sc.totalContributedCapitalValue)}</p>
                    <p className="text-sm text-gray-600">{sc.dateOfContribution}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Borrowings Section */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between cursor-pointer p-3 bg-red-50 rounded-lg"
            onClick={() => toggleSection('borrowings')}
          >
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-red-600 mr-3" />
              <h4 className="font-medium text-red-900">Borrowings</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-700 font-medium">{formatCurrency(totals.borrowings)}</span>
              {expandedSections.includes('borrowings') ?
                <ChevronDown className="w-4 h-4 text-red-600" /> :
                <ChevronRight className="w-4 h-4 text-red-600" />
              }
            </div>
          </div>

          {expandedSections.includes('borrowings') && (
            <div className="mt-3 space-y-2">
              {fundingStructure?.borrowings?.map((borrowing, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{borrowing.lenderName}</p>
                    <p className="text-sm text-gray-600">
                      {borrowing.interestRate}% for {borrowing.tenureMonths} months
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(borrowing.amountBorrowed)}</p>
                    <p className="text-sm text-gray-600">Maturity: {borrowing.maturityDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar sections for Grants and Operational Funds */}
      </div>
    </motion.div>
  );

  const renderShareCapitalForm = () => {
    const isEditMode = !!editingItem;

    // Set form title based on mode
    const formTitle = isEditMode
      ? "Edit Share Capital Contribution"
      : "Record Share Capital Contribution";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{formTitle}</h3>
          {isEditMode && (
            <button
              onClick={() => {
                setEditingItem(null);
                resetShareCapitalForm();
                setExistingShareCapital(null);
              }}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New Contribution
            </button>
          )}
        </div>
        {/* NEW: Show existing contribution warning */}
        {!isEditMode && existingShareCapital && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  Existing Contributions Found
                </h4>
                <p className="text-blue-700 text-sm mb-3">
                  This shareholder already has share capital contributions. The new amount will be added to the existing total.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Current Shares:</span>
                    <p className="text-blue-900">{existingShareCapital.numberOfShares.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Total Value:</span>
                    <p className="text-blue-900">{formatCurrency(existingShareCapital.totalContributedCapitalValue)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Contributions:</span>
                    <p className="text-blue-900">{existingShareCapital.contributionCount || 1}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Last Contribution:</span>
                    <p className="text-blue-900">
                      {existingShareCapital.lastContributionDate
                        ? new Date(existingShareCapital.lastContributionDate).toLocaleDateString()
                        : new Date(existingShareCapital.dateOfContribution).toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shareholder Type *
            </label>
            <select
              value={shareCapitalForm.shareholderType}
              onChange={(e) => setShareCapitalForm(prev => ({
                ...prev,
                shareholderType: e.target.value as 'individual' | 'institution',
                shareholderId: 0
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isEditMode} // Disable editing shareholder type in edit mode
            >
              <option value="individual">Individual Shareholder</option>
              <option value="institution">Institution Shareholder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shareholder *
            </label>
            <select
              value={shareCapitalForm.shareholderId}
              onChange={(e) => setShareCapitalForm(prev => ({ ...prev, shareholderId: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isEditMode} // Disable editing shareholder in edit mode
            >
              <option value={0}>Select Shareholder</option>
              {shareCapitalForm.shareholderType === 'individual'
                ? individualShareholders.map(shareholder => (
                  <option key={shareholder.id} value={shareholder.id}>
                    {shareholder.firstname} {shareholder.lastname}
                  </option>
                ))
                : institutionShareholders.map(shareholder => (
                  <option key={shareholder.id} value={shareholder.id}>
                    {shareholder.institutionName}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Contribution *
            </label>
            <input
              type="date"
              value={shareCapitalForm.dateOfContribution}
              onChange={(e) => setShareCapitalForm(prev => ({ ...prev, dateOfContribution: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Share *
            </label>
            <select
              value={shareCapitalForm.typeOfShare}
              onChange={(e) => setShareCapitalForm(prev => ({ ...prev, typeOfShare: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ordinary">Ordinary Shares</option>
              <option value="preference">Preference Shares</option>
              <option value="cumulative_preference">Cumulative Preference</option>
              <option value="redeemable">Redeemable Shares</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Shares *
            </label>
            <input
              type="number"
              value={shareCapitalForm.numberOfShares}
              onChange={(e) => setShareCapitalForm(prev => ({
                ...prev,
                numberOfShares: e.target.value === '' ? '' : Number(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of shares"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value per Share (RWF) *
            </label>
            <input
              type="number"
              value={shareCapitalForm.valuePerShare}
              onChange={(e) => setShareCapitalForm(prev => ({ ...prev, valuePerShare: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Value per Share"
              min="0"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={shareCapitalForm.paymentDetails.paymentMethod}
              onChange={(e) => setShareCapitalForm(prev => ({
                ...prev,
                paymentDetails: { ...prev.paymentDetails, paymentMethod: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date *
            </label>
            <input
              type="date"
              value={shareCapitalForm.paymentDetails.paymentDate}
              onChange={(e) => setShareCapitalForm(prev => ({
                ...prev,
                paymentDetails: { ...prev.paymentDetails, paymentDate: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference *
            </label>
            <input
              type="text"
              value={shareCapitalForm.paymentDetails.paymentReference}
              onChange={(e) => setShareCapitalForm(prev => ({
                ...prev,
                paymentDetails: { ...prev.paymentDetails, paymentReference: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter payment reference number"
            />
          </div>

          {shareCapitalForm.paymentDetails.paymentMethod === 'bank_transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={shareCapitalForm.paymentDetails.bankName || ''}
                  onChange={(e) => setShareCapitalForm(prev => ({
                    ...prev,
                    paymentDetails: { ...prev.paymentDetails, bankName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={shareCapitalForm.paymentDetails.accountNumber || ''}
                  onChange={(e) => setShareCapitalForm(prev => ({
                    ...prev,
                    paymentDetails: { ...prev.paymentDetails, accountNumber: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={shareCapitalForm.notes || ''}
              onChange={(e) => setShareCapitalForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this contribution"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Proof Document (Max 10MB)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const validationError = validateFile(file);
                    if (validationError) {
                      toast.error(validationError);
                      e.target.value = '';
                      return;
                    }
                    setUploadedFiles(prev => ({ ...prev, paymentProof: file }));
                  }
                }}
                className="hidden"
                id="paymentProof"
              />
              <label htmlFor="paymentProof" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {uploadedFiles.paymentProof ?
                    `${uploadedFiles.paymentProof.name} (${(uploadedFiles.paymentProof.size / 1024 / 1024).toFixed(2)} MB)`
                    : 'Click to upload payment proof (Max 10MB)'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, PDF
                </p>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowForm(null);
              setEditingItem(null);
              resetShareCapitalForm();
              setExistingShareCapital(null);
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => isEditMode ? handleUpdateShareCapital() : handleSubmitShareCapital()}
            disabled={isLoading}
            className="px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                {isEditMode ? 'Updating...' : 'Recording...'}
              </>
            ) : (
              isEditMode ? 'Update Contribution' : (existingShareCapital ? 'Add Contribution' : 'Record Contribution')
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderBorrowingForm = () => {

    const isEditMode = !!editingBorrowing;
    const formTitle = isEditMode ? "Edit Borrowing" : "Record Borrowing";
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{formTitle}</h3>
          {isEditMode && (
            <button
              onClick={() => {
                setEditingBorrowing(null);
                resetBorrowingForm();
              }}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New Borrowing
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lender Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Type *
            </label>
            <select
              value={borrowingForm.lenderType}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, lenderType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select lender type</option>
              <option value="bank">Bank</option>
              <option value="financial_institution">Financial Institution</option>
              <option value="microfinance">Microfinance</option>
              <option value="private_lender">Private Lender</option>
              <option value="government">Government</option>
              <option value="international_organization">International Organization</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Lender Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Name *
            </label>
            <input
              type="text"
              value={borrowingForm.lenderName}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, lenderName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lender name"
            />
          </div>

          {/* Lender Address - Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={borrowingForm.lenderAddress.country}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                lenderAddress: { ...prev.lenderAddress, country: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter country"
            />
          </div>

          {/* Lender Address - Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province *
            </label>
            <select
              value={borrowingForm.lenderAddress.province}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                lenderAddress: { ...prev.lenderAddress, province: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* Lender Address - District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District *
            </label>
            <select
              value={borrowingForm.lenderAddress.district}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                lenderAddress: { ...prev.lenderAddress, district: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!borrowingForm.lenderAddress.province}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Lender Address - Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector
            </label>
            <select
              value={borrowingForm.lenderAddress.sector || ''}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                lenderAddress: { ...prev.lenderAddress, sector: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!borrowingForm.lenderAddress.district}
            >
              <option value="">Select Sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Lender Address - Cell */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cell
            </label>
            <select
              value={borrowingForm.lenderAddress.cell || ''}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                lenderAddress: { ...prev.lenderAddress, cell: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!borrowingForm.lenderAddress.sector}
            >
              <option value="">Select Cell</option>
              {cells.map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>

          {/* Lender Address - Village */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Village
            </label>
            <select
              value={borrowingForm.lenderAddress.village || ''}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                lenderAddress: { ...prev.lenderAddress, village: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!borrowingForm.lenderAddress.cell}
            >
              <option value="">Select Village</option>
              {villages.map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          {/* Lender Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Phone
            </label>
            <input
              type="tel"
              value={borrowingForm.lenderPhone || ''}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, lenderPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lender phone number"
            />
          </div>

          {/* Lender Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Email
            </label>
            <input
              type="email"
              value={borrowingForm.lenderEmail || ''}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, lenderEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lender email"
            />
          </div>

          {/* Amount Borrowed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Borrowed (RWF) *
            </label>
            <input
              type="number"
              value={borrowingForm.amountBorrowed}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, amountBorrowed: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Amount Borrowed"
              min="0"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%) *
            </label>
            <input
              type="number"
              step="0.01"
              value={borrowingForm.interestRate}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.01"

            />
          </div>

          {/* Tenure Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenure (Months) *
            </label>
            <input
              type="number"
              value={borrowingForm.tenureMonths}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, tenureMonths: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter  Tenure Months"
              min="1"
            />
          </div>

          {/* Payment Schedule Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Period *
            </label>
            <select
              value={borrowingForm.paymentSchedule?.period || ''}
              onChange={(e) => setBorrowingForm(prev => ({
                ...prev,
                paymentSchedule: { ...prev.paymentSchedule, period: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Payment Period</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi_annual">Semi-Annual</option>
              <option value="annual">Annual</option>
              <option value="bullet">Bullet Payment</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Borrowing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Borrowing Date *
            </label>
            <input
              type="date"
              value={borrowingForm.borrowingDate}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, borrowingDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Maturity Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maturity Date *
            </label>
            <input
              type="date"
              value={borrowingForm.maturityDate}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, maturityDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Collateral Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collateral Description
            </label>
            <textarea
              value={borrowingForm.collateralDescription || ''}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, collateralDescription: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the collateral provided"
            />
          </div>

          {/* Collateral Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collateral Value (RWF)
            </label>
            <input
              type="number"
              value={borrowingForm.collateralValue || 0}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, collateralValue: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Collateral Value"
              min="0"
            />
          </div>

          {/* Purpose */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              value={borrowingForm.purpose || ''}
              onChange={(e) => setBorrowingForm(prev => ({ ...prev, purpose: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Purpose of borrowing"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowForm(null);
              setEditingBorrowing(null);
              resetBorrowingForm();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={isEditMode ? handleUpdateBorrowing : handleSubmitBorrowing}
            disabled={isLoading}
            className="px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                {isEditMode ? 'Updating...' : 'Recording...'}
              </>
            ) : (
              isEditMode ? 'Update Borrowing' : 'Record Borrowing'
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderGrantForm = () => {
    const isEditMode = !!editingGrant;
    const formTitle = isEditMode ? "Edit Grant" : "Record Granted Funds";
    const isRwanda = grantForm.grantorAddress?.country === 'Rwanda';
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{formTitle}</h3>
          {isEditMode && (
            <button
              onClick={() => {
                setEditingGrant(null);
                resetGrantForm();
              }}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New Grant
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grantor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grantor Name *
            </label>
            <input
              type="text"
              value={grantForm.grantorName}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantorName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter grantor name"
            />
          </div>

          {/* Grantor Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grantor Phone
            </label>
            <input
              type="tel"
              value={grantForm.grantorPhone || ''}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantorPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter grantor phone number"
            />
          </div>

          {/* Grantor Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grantor Email
            </label>
            <input
              type="email"
              value={grantForm.grantorEmail || ''}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantorEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter grantor email"
            />
          </div>

          {/* Grantor Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grantor Website
            </label>
            <input
              type="url"
              value={grantForm.grantorWebsite || ''}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantorWebsite: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter grantor website URL"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              value={grantForm.grantorAddress?.country || 'Rwanda'}
              onChange={(e) => setGrantForm(prev => ({
                ...prev,
                grantorAddress: {
                  ...prev.grantorAddress,
                  country: e.target.value,
                  // Reset address fields when country changes
                  province: e.target.value === 'Rwanda' ? prev.grantorAddress?.province || '' : '',
                  district: e.target.value === 'Rwanda' ? prev.grantorAddress?.district || '' : '',
                  sector: '',
                  cell: '',
                  village: '',
                  street: '',
                  houseNumber: '',
                  poBox: ''
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Rwanda">Rwanda</option>
              <option value="Other">Other Country</option>
            </select>
          </div>

          {/* Address fields - Conditional based on country */}
          {isRwanda ? (
            <>
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  value={grantForm.grantorAddress?.province || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, province: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Province</option>
                  {grantProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  value={grantForm.grantorAddress?.district || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, district: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!grantForm.grantorAddress?.province}
                >
                  <option value="">Select District</option>
                  {grantDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={grantForm.grantorAddress?.sector || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, sector: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!grantForm.grantorAddress?.district}
                >
                  <option value="">Select Sector</option>
                  {grantSectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cell */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cell
                </label>
                <select
                  value={grantForm.grantorAddress?.cell || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, cell: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!grantForm.grantorAddress?.sector}
                >
                  <option value="">Select Cell</option>
                  {grantCells.map((cell) => (
                    <option key={cell} value={cell}>
                      {cell}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village
                </label>
                <select
                  value={grantForm.grantorAddress?.village || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, village: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!grantForm.grantorAddress?.cell}
                >
                  <option value="">Select Village</option>
                  {grantVillages.map((village) => (
                    <option key={village} value={village}>
                      {village}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Full address input for non-Rwanda countries */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  value={grantForm.grantorAddress?.street || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, street: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full grantor address"
                />
              </div>

              {/* House Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House Number
                </label>
                <input
                  type="text"
                  value={grantForm.grantorAddress?.houseNumber || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, houseNumber: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter house number"
                />
              </div>

              {/* P.O. Box */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  P.O. Box
                </label>
                <input
                  type="text"
                  value={grantForm.grantorAddress?.poBox || ''}
                  onChange={(e) => setGrantForm(prev => ({
                    ...prev,
                    grantorAddress: { ...prev.grantorAddress, poBox: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter P.O. Box"
                />
              </div>
            </>
          )}

          {/* Amount Granted */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Granted (RWF) *
            </label>
            <input
              type="number"
              value={grantForm.amountGranted}
              onChange={(e) => setGrantForm(prev => ({ ...prev, amountGranted: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Amount Granted"
              min="0"
            />
          </div>

          {/* Grant Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grant Type *
            </label>
            <select
              value={grantForm.grantType}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="development">Development</option>
              <option value="emergency">Emergency</option>
              <option value="capacity_building">Capacity Building</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="research">Research</option>
              <option value="educational">Educational</option>
              <option value="healthcare">Healthcare</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Grant Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grant Date *
            </label>
            <input
              type="date"
              value={grantForm.grantDate}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Disbursement Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disbursement Date
            </label>
            <input
              type="date"
              value={grantForm.disbursementDate || ''}
              onChange={(e) => setGrantForm(prev => ({ ...prev, disbursementDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Project Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Start Date *
            </label>
            <input
              type="date"
              value={grantForm.projectStartDate}
              onChange={(e) => setGrantForm(prev => ({ ...prev, projectStartDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Project End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project End Date *
            </label>
            <input
              type="date"
              value={grantForm.projectEndDate}
              onChange={(e) => setGrantForm(prev => ({ ...prev, projectEndDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={grantForm.status}
              onChange={(e) => setGrantForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Requires Reporting */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresReporting"
              checked={grantForm.requiresReporting}
              onChange={(e) => setGrantForm(prev => ({ ...prev, requiresReporting: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiresReporting" className="ml-2 block text-sm text-gray-700">
              Requires Reporting
            </label>
          </div>

          {/* Reporting Frequency (conditional) */}
          {grantForm.requiresReporting && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Frequency
              </label>
              <select
                value={grantForm.reportingFrequency || ''}
                onChange={(e) => setGrantForm(prev => ({ ...prev, reportingFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          )}


          {grantForm.requiresReporting && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Report Due Date
              </label>
              <input
                type="date"
                value={grantForm.nextReportDue || ''}
                onChange={(e) => setGrantForm(prev => ({ ...prev, nextReportDue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Grant Purpose */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grant Purpose *
            </label>
            <textarea
              value={grantForm.grantPurpose}
              onChange={(e) => setGrantForm(prev => ({ ...prev, grantPurpose: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the purpose of the grant"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={grantForm.notes || ''}
              onChange={(e) => setGrantForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this grant"
            />
          </div>

          {/* Grant Conditions */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grant Conditions
            </label>
            <div className="space-y-3">
              {grantForm.grantConditions.map((condition, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <input
                        type="text"
                        value={condition.condition}
                        onChange={(e) => {
                          const newConditions = [...grantForm.grantConditions];
                          newConditions[index].condition = e.target.value;
                          setGrantForm(prev => ({ ...prev, grantConditions: newConditions }));
                        }}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Condition title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={condition.dueDate || ''}
                        onChange={(e) => {
                          const newConditions = [...grantForm.grantConditions];
                          newConditions[index].dueDate = e.target.value;
                          setGrantForm(prev => ({ ...prev, grantConditions: newConditions }));
                        }}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={condition.description}
                      onChange={(e) => {
                        const newConditions = [...grantForm.grantConditions];
                        newConditions[index].description = e.target.value;
                        setGrantForm(prev => ({ ...prev, grantConditions: newConditions }));
                      }}
                      rows={2}
                      className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Condition description"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newConditions = grantForm.grantConditions.filter((_, i) => i !== index);
                      setGrantForm(prev => ({ ...prev, grantConditions: newConditions }));
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Condition
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setGrantForm(prev => ({
                    ...prev,
                    grantConditions: [
                      ...prev.grantConditions,
                      { condition: '', description: '', isCompleted: false }
                    ]
                  }));
                }}
                className="flex items-center text-blue-600 text-sm hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Condition
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowForm(null);
              setEditingGrant(null);
              resetGrantForm();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={isEditMode ? handleUpdateGrant : handleSubmitGrant}
            disabled={isLoading}
            className="px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                {isEditMode ? 'Updating...' : 'Recording...'}
              </>
            ) : (
              isEditMode ? 'Update Grant' : 'Record Grant'
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderOperationalForm = () => {
    const isEditMode = !!editingOperational;
    const formTitle = isEditMode ? "Edit Operational Funds" : "Record Operational Funds";
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{formTitle}</h3>
          {isEditMode && (
            <button
              onClick={() => {
                setEditingOperational(null);
                resetOperationalForm();
              }}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New Operational Funds
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fund Source *
            </label>
            <select
              value={operationalForm.fundSource}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, fundSource: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select fund source</option>
              <option value="retained_earnings">Retained Earnings</option>
              <option value="capital_injection">Capital Injection</option>
              <option value="revenue">Revenue</option>
              <option value="investment">Investment</option>
              <option value="loan_proceeds">Loan Proceeds</option>
              <option value="grant">Grant</option>
              <option value="government_support">Government Support</option>
              <option value="donor_funding">Donor Funding</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fund Source Description
            </label>
            <input
              type="text"
              value={operationalForm.fundSourceDescription || ''}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, fundSourceDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the fund source (if other)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Committed (RWF) *
            </label>
            <input
              type="number"
              value={operationalForm.amountCommitted}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, amountCommitted: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Amount Committed"
              min="1"

            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commitment Date *
            </label>
            <input
              type="date"
              value={operationalForm.commitmentDate}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, commitmentDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Date
            </label>
            <input
              type="date"
              value={operationalForm.availabilityDate || ''}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, availabilityDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              value={operationalForm.expirationDate || ''}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, expirationDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              value={operationalForm.purpose || ''}
              onChange={(e) => setOperationalForm(prev => ({ ...prev, purpose: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Purpose of operational funds"
            />
          </div>

          {/* Utilization Plans Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Utilization Plans</h4>
              <button
                type="button"
                onClick={addUtilizationPlan}
                className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Plan
              </button>
            </div>

            <div className="space-y-4">
              {utilizationPlans.map((plan, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900">Utilization Plan #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeUtilizationPlan(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={plan.category}
                        onChange={(e) => updateUtilizationPlan(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Operations, Marketing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Amount (RWF) *
                      </label>
                      <input
                        type="number"
                        value={plan.allocatedAmount}
                        onChange={(e) => updateUtilizationPlan(index, 'allocatedAmount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Enter Allocated Amount"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={plan.description}
                        onChange={(e) => updateUtilizationPlan(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe how these funds will be utilized"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={plan.utilizationPeriod.startDate}
                        onChange={(e) => updateUtilizationPlan(index, 'utilizationPeriod.startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={plan.utilizationPeriod.endDate}
                        onChange={(e) => updateUtilizationPlan(index, 'utilizationPeriod.endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={plan.priority}
                        onChange={(e) => updateUtilizationPlan(index, 'priority', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>High</option>
                        <option value={4}>Critical</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`completed-${index}`}
                        checked={plan.isCompleted}
                        onChange={(e) => updateUtilizationPlan(index, 'isCompleted', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`completed-${index}`} className="ml-2 block text-sm text-gray-900">
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Allocations Section (Optional) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Budget Allocations (Optional)</h4>
              <button
                type="button"
                onClick={addBudgetAllocation}
                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Allocation
              </button>
            </div>

            <div className="space-y-4">
              {budgetAllocations.map((allocation, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900">Budget Allocation #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeBudgetAllocation(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <input
                        type="text"
                        value={allocation.department}
                        onChange={(e) => updateBudgetAllocation(index, 'department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Finance, Marketing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allocated Amount (RWF) *
                      </label>
                      <input
                        type="number"
                        value={allocation.allocatedAmount}
                        onChange={(e) => updateBudgetAllocation(index, 'allocatedAmount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Enter Allocated Amount"

                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approved By *
                      </label>
                      <input
                        type="text"
                        value={allocation.approvedBy}
                        onChange={(e) => updateBudgetAllocation(index, 'approvedBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Name of approver"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approval Date *
                      </label>
                      <input
                        type="date"
                        value={allocation.approvalDate}
                        onChange={(e) => updateBudgetAllocation(index, 'approvalDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Utilization Deadline *
                      </label>
                      <input
                        type="date"
                        value={allocation.utilizationDeadline}
                        onChange={(e) => updateBudgetAllocation(index, 'utilizationDeadline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Spent (RWF)
                      </label>
                      <input
                        type="number"
                        value={allocation.actualSpent}
                        onChange={(e) => updateBudgetAllocation(index, 'actualSpent', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Enter Actual Spent"


                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowForm(null);
              setEditingOperational(null);
              resetOperationalForm();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={isEditMode ? handleUpdateOperational : handleSubmitOperational}
            disabled={isLoading}
            className="px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                {isEditMode ? 'Updating...' : 'Recording...'}
              </>
            ) : (
              isEditMode ? 'Update Operational Funds' : 'Record Operational Funds'
            )}
          </button>
        </div>
      </motion.div>
    );
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'shareCapital':
        return showForm === 'shareCapital' ? renderShareCapitalForm() : renderShareCapitalList();
      case 'borrowing':
        return showForm === 'borrowing' ? renderBorrowingForm() : renderBorrowingList();
      case 'grants':
        return showForm === 'grant' ? renderGrantForm() : renderGrantsList();
      case 'operational':
        return showForm === 'operational' ? renderOperationalForm() : renderOperationalList();
      default:
        return renderOverview();
    }
  };

  const renderShareCapitalList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Share Capital Contributions</h3>
        <button
          onClick={() => setShowForm('shareCapital')}
          className="flex items-center px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contribution
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Total: {formatCurrency(totals.shareCapital)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Shareholder
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Share Type
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Value
                  </th>
                  {/* NEW COLUMNS */}
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contributions
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    First Contribution
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Contribution
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fundingStructure?.shareCapitals?.map((sc, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {getShareholderName(sc.shareholderId, sc.shareholderType)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{sc.shareholderType}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {sc.typeOfShare.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sc.numberOfShares.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">@ {formatCurrency(sc.valuePerShare)}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(sc.totalContributedCapitalValue)}
                      </span>
                    </td>
                    {/* NEW COLUMNS DATA */}
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${(sc.contributionCount || 1) > 1
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {sc.contributionCount || 1}
                        </span>
                        {(sc.contributionCount || 1) > 1 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-gray-400 ml-1 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Aggregated from multiple contributions</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(sc.firstContributionDate || sc.dateOfContribution).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {sc.lastContributionDate
                          ? new Date(sc.lastContributionDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleViewShareCapital(sc)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleEditShareCapital(sc)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDeleteShareCapital(sc)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
  const renderBorrowingList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Borrowings</h3>
        <button
          onClick={() => setShowForm('borrowing')}
          className="flex items-center px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Borrowing
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-4 font-medium">
            Total Borrowed: {formatCurrency(totals.borrowings)}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-red-50 to-pink-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Lender</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Interest</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tenure</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Maturity</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fundingStructure?.borrowings?.map((borrowing, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-red-600">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{borrowing.lenderName}</p>
                        <p className="text-xs text-gray-500 capitalize">{borrowing.lenderType}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full capitalize">
                        {borrowing.lenderType}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(borrowing.amountBorrowed)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-900">{borrowing.interestRate}%</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-900">{borrowing.tenureMonths} months</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(borrowing.maturityDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleViewBorrowing(borrowing)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleEditBorrowing(borrowing)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDeleteBorrowing(borrowing)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderGrantsList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Granted Funds</h3>
        <button
          onClick={() => setShowForm('grant')}
          className="flex items-center px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Grant
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-4 font-medium">
            Total Grants: {formatCurrency(totals.grants)}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grantor</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grant Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project Period</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fundingStructure?.grants?.map((grant, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{grant.grantorName}</p>
                        <p className="text-xs text-gray-500">{grant.grantType}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
                        {grant.grantType}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(grant.amountGranted)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${grant.status === 'approved' ? 'bg-green-100 text-green-800' :
                        grant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          grant.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {grant.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(grant.grantDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-gray-500">
                        {new Date(grant.projectStartDate).toLocaleDateString()} - {new Date(grant.projectEndDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleViewGrant(grant)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleEditGrant(grant)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDeleteGrant(grant)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOperationalList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Operational Funds</h3>
        <button
          onClick={() => setShowForm('operational')}
          className="flex items-center px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Operational Funds
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-4 font-medium">
            Total Operational Funds: {formatCurrency(totals.operational)}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-50 to-violet-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fund Source</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Commitment Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Utilization</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fundingStructure?.operational?.map((fund, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        {/* <p className="text-sm font-semibold text-gray-900">{fund.fundSource}</p> */}
                        <p className="text-xs text-gray-500">{fund.fundSourceDescription}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(fund.amountCommitted)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${fund.status === 'available' ? 'bg-green-100 text-green-800' :
                        fund.status === 'committed' ? 'bg-blue-100 text-blue-800' :
                          fund.status === 'partially_utilized' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {fund.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(fund.commitmentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#5B7FA2] h-2 rounded-full"
                          style={{ width: `${(fund.amountUtilized / fund.amountCommitted) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(fund.amountUtilized)} / {formatCurrency(fund.amountCommitted)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleViewOperational(fund)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleEditOperational(fund)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          onClick={() => handleDeleteOperational(fund)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
  const renderDeleteModal = () => (
    <AnimatePresence>
      {deleteModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !actionLoading && setDeleteModal({ isOpen: false, shareCapitalId: null, shareholderName: '' })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Delete Share Capital Contribution
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!actionLoading && (
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, shareCapitalId: null, shareholderName: '' })}
                    className="text-red-100 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete the share capital contribution for
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  "{deleteModal.shareholderName}"?
                </p>

                {/* NEW: Show contribution count warning */}
                {fundingStructure?.shareCapitals?.find(sc => sc.id === deleteModal.shareCapitalId)?.contributionCount > 1 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This will delete all {fundingStructure.shareCapitals.find(sc => sc.id === deleteModal.shareCapitalId)?.contributionCount} contributions for this shareholder.
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  This will permanently remove this contribution and all associated data.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => !actionLoading && setDeleteModal({ isOpen: false, shareCapitalId: null, shareholderName: '' })}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const renderDeleteBorrowingModal = () => (
    <AnimatePresence>
      {deleteBorrowingModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !actionLoading && setDeleteBorrowingModal({ isOpen: false, borrowingId: null, lenderName: '' })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Delete Borrowing Record
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!actionLoading && (
                  <button
                    onClick={() => setDeleteBorrowingModal({ isOpen: false, borrowingId: null, lenderName: '' })}
                    className="text-red-100 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete the borrowing record for
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  "{deleteBorrowingModal.lenderName}"?
                </p>
                <p className="text-sm text-gray-500">
                  This will permanently remove this borrowing record and all associated data.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => !actionLoading && setDeleteBorrowingModal({ isOpen: false, borrowingId: null, lenderName: '' })}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBorrowingConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const renderDeleteGrantModal = () => (
    <AnimatePresence>
      {deleteGrantModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !actionLoading && setDeleteGrantModal({ isOpen: false, grantId: null, grantorName: '' })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Delete Grant Record
                    </h3>
                    <p className="text-green-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!actionLoading && (
                  <button
                    onClick={() => setDeleteGrantModal({ isOpen: false, grantId: null, grantorName: '' })}
                    className="text-green-100 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete the grant record for
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  "{deleteGrantModal.grantorName}"?
                </p>
                <p className="text-sm text-gray-500">
                  This will permanently remove this grant record and all associated data.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => !actionLoading && setDeleteGrantModal({ isOpen: false, grantId: null, grantorName: '' })}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGrantConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDeleteOperationalModal = () => (
    <AnimatePresence>
      {deleteOperationalModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !actionLoading && setDeleteOperationalModal({ isOpen: false, operationalId: null, fundSource: '' })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Delete Operational Funds Record
                    </h3>
                    <p className="text-purple-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!actionLoading && (
                  <button
                    onClick={() => setDeleteOperationalModal({ isOpen: false, operationalId: null, fundSource: '' })}
                    className="text-purple-100 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete the operational funds record for
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-4">
                  "{deleteOperationalModal.fundSource}"?
                </p>
                <p className="text-sm text-gray-500">
                  This will permanently remove this operational funds record and all associated data.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => !actionLoading && setDeleteOperationalModal({ isOpen: false, operationalId: null, fundSource: '' })}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOperationalConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const renderBorrowingModal = () => (
    <AnimatePresence>
      {viewModalOpen && selectedBorrowing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Borrowing Details</h2>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lender Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <Building2 className="w-5 h-5 mr-2 text-red-600" />
                    Lender Information
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900 text-right">
                        {selectedBorrowing.lenderName}
                      </span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {selectedBorrowing.lenderType}
                      </span>
                    </div>

                    {selectedBorrowing.lenderPhone && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <span className="text-sm text-gray-900">
                          {selectedBorrowing.lenderPhone}
                        </span>
                      </div>
                    )}

                    {selectedBorrowing.lenderEmail && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="text-sm text-gray-900">
                          {selectedBorrowing.lenderEmail}
                        </span>
                      </div>
                    )}

                    {selectedBorrowing.lenderAddress && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Address:</h4>
                        <p className="text-sm text-gray-600">
                          {[
                            selectedBorrowing.lenderAddress.village,
                            selectedBorrowing.lenderAddress.cell,
                            selectedBorrowing.lenderAddress.sector,
                            selectedBorrowing.lenderAddress.district,
                            selectedBorrowing.lenderAddress.province,
                            selectedBorrowing.lenderAddress.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loan Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Loan Details
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                      <span className="text-sm font-semibold text-green-700">
                        {formatCurrency(selectedBorrowing.amountBorrowed)}
                      </span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium text-gray-600">Interest Rate:</span>
                      <span className="text-sm text-gray-900">
                        {selectedBorrowing.interestRate}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tenure:</span>
                      <span className="text-sm text-gray-900">
                        {selectedBorrowing.tenureMonths} months
                      </span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium text-gray-600">Borrowing Date:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedBorrowing.borrowingDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Maturity Date:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedBorrowing.maturityDate).toLocaleDateString()}
                      </span>
                    </div>

                    {selectedBorrowing.paymentSchedule && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Payment Schedule:</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {selectedBorrowing.paymentSchedule.period}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collateral Information */}
                {selectedBorrowing.collateralDescription && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                      Collateral Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedBorrowing.collateralDescription}
                        </p>
                      </div>

                      {selectedBorrowing.collateralValue && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Value:</span>
                          <span className="text-sm font-semibold text-gray-900 ml-2">
                            {formatCurrency(selectedBorrowing.collateralValue)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Purpose */}
                {selectedBorrowing.purpose && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Purpose
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedBorrowing.purpose}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {new Date(selectedBorrowing.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleEditBorrowing(selectedBorrowing);
                    setViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>

                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const renderShareCapitalModal = () => (
    <AnimatePresence>
      {viewModalOpen && selectedShareCapital && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setViewModalOpen(false);
            setPreviewUrl(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#5B7FA2] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Share Capital Details</h2>
              </div>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setPreviewUrl(null);
                }}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Main Details */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shareholder Information */}
                  <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Shareholder Information
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <span className="text-sm text-gray-900 text-right">
                          {getShareholderName(
                            selectedShareCapital.shareholderId,
                            selectedShareCapital.shareholderType
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Type:</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {selectedShareCapital.shareholderType}
                        </span>
                      </div>

                      {selectedShareCapital.individualShareholder && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Occupation:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.individualShareholder.occupation}
                            </span>
                          </div>

                          <div className="flex justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium text-gray-600">Nationality:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.individualShareholder.nationality}
                            </span>
                          </div>
                        </>
                      )}

                      {selectedShareCapital.institutionShareholder && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Institution Type:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.institutionShareholder.institutionType}
                            </span>
                          </div>

                          <div className="flex justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium text-gray-600">Registration:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.institutionShareholder.registrationNumber}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contribution Details */}
                  <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Contribution Details
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedShareCapital.dateOfContribution).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Share Type:</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {selectedShareCapital.typeOfShare.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Number of Shares:</span>
                        <span className="text-sm text-gray-900">
                          {selectedShareCapital.numberOfShares.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Value per Share:</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(selectedShareCapital.valuePerShare)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Value:</span>
                        <span className="text-sm font-semibold text-green-700">
                          {formatCurrency(selectedShareCapital.totalContributedCapitalValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {selectedShareCapital.paymentDetails && (
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                        <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                        Payment Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedShareCapital.paymentDetails.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Method:</span>
                            <span className="text-sm text-gray-900 capitalize">
                              {selectedShareCapital.paymentDetails.paymentMethod.replace('_', ' ') || 'N/A'}
                            </span>
                          </div>
                        )}

                        {selectedShareCapital.paymentDetails.paymentDate && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Date:</span>
                            <span className="text-sm text-gray-900">
                              {new Date(selectedShareCapital.paymentDetails.paymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {selectedShareCapital.paymentDetails.paymentReference && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Reference:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.paymentDetails.paymentReference}
                            </span>
                          </div>
                        )}

                        {selectedShareCapital.paymentDetails.bankName && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Bank:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.paymentDetails.bankName}
                            </span>
                          </div>
                        )}

                        {selectedShareCapital.paymentDetails.accountNumber && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Account:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.paymentDetails.accountNumber}
                            </span>
                          </div>
                        )}

                        {selectedShareCapital.paymentDetails.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                            <span className="text-sm text-gray-900">
                              {selectedShareCapital.paymentDetails.transactionId}
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedShareCapital.paymentDetails?.paymentProofUrl && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setPreviewUrl(selectedShareCapital.paymentDetails.paymentProofUrl);
                              setPreviewType('paymentProof');
                            }}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">Payment Proof Document</span>
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Document Links */}
                  {selectedShareCapital.individualShareholder && (
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                        <FileText className="w-5 h-5 mr-2 text-orange-600" />
                        Verification Documents
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedShareCapital.individualShareholder.idProofDocumentUrl && (
                          <button
                            onClick={() => handleDocumentPreview(
                              selectedShareCapital.individualShareholder.idProofDocumentUrl,
                              'idProof'
                            )}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">ID Proof</span>
                          </button>
                        )}

                        {selectedShareCapital.individualShareholder.passportPhotoUrl && (
                          <button
                            onClick={() => handleDocumentPreview(
                              selectedShareCapital.individualShareholder.passportPhotoUrl,
                              'passport'
                            )}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">Passport Photo</span>
                          </button>
                        )}

                        {selectedShareCapital.individualShareholder.proofOfResidenceUrl && (
                          <button
                            onClick={() => handleDocumentPreview(
                              selectedShareCapital.individualShareholder.proofOfResidenceUrl,
                              'residence'
                            )}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">Proof of Residence</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedShareCapital.notes && (
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                        <FileText className="w-5 h-5 mr-2 text-gray-600" />
                        Additional Notes
                      </h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedShareCapital.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Preview Panel */}
              {previewUrl && (
                <div className="w-1/2 border-l border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {previewType === 'idProof' && 'ID Proof Document'}
                      {previewType === 'passport' && 'Passport Photo'}
                      {previewType === 'residence' && 'Proof of Residence'}
                      {previewType === 'paymentProof' && 'Payment Proof Document'}
                    </h3>
                    <button
                      onClick={() => setPreviewUrl(null)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
                    {previewType === 'passport' ? (
                      // Image preview
                      <img
                        src={previewUrl}
                        alt="Document preview"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                      />
                    ) : (
                      // PDF/document preview using reactjs-file-preview
                      <div className="w-full h-full">
                        <FilePreview
                          preview={previewUrl}
                          errorImage="https://placehold.co/600x400/fff/FF0000?text=Error+Loading+Document"
                          placeHolderImage="https://placehold.co/600x400/fff/000?text=Loading+Document..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-white">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Document
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4 md:col-span-2">
              <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Contribution Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-700">Total Contributions</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {selectedShareCapital.contributionCount || 1}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-700">First Contribution</p>
                  <p className="text-lg font-bold text-green-900">
                    {new Date(selectedShareCapital.firstContributionDate || selectedShareCapital.dateOfContribution).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-purple-700">Latest Contribution</p>
                  <p className="text-lg font-bold text-purple-900">
                    {selectedShareCapital.lastContributionDate
                      ? new Date(selectedShareCapital.lastContributionDate).toLocaleDateString()
                      : new Date(selectedShareCapital.dateOfContribution).toLocaleDateString()
                    }
                  </p>
                </div>
              </div>

              {(selectedShareCapital.contributionCount || 1) > 1 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Info className="w-4 h-4 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      This record represents {selectedShareCapital.contributionCount} contributions aggregated into a single total.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {new Date(selectedShareCapital.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleEditShareCapital(selectedShareCapital);
                    setViewModalOpen(false);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>

                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const renderGrantModal = () => (
    <AnimatePresence>
      {viewModalOpen && selectedGrant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Grant Details</h2>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grantor Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <Building2 className="w-5 h-5 mr-2 text-green-600" />
                    Grantor Information
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900 text-right">
                        {selectedGrant.grantorName}
                      </span>
                    </div>

                    {selectedGrant.grantorPhone && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <span className="text-sm text-gray-900">
                          {selectedGrant.grantorPhone}
                        </span>
                      </div>
                    )}

                    {selectedGrant.grantorEmail && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="text-sm text-gray-900">
                          {selectedGrant.grantorEmail}
                        </span>
                      </div>
                    )}

                    {selectedGrant.grantorWebsite && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Website:</span>
                        <span className="text-sm text-gray-900">
                          {selectedGrant.grantorWebsite}
                        </span>
                      </div>
                    )}

                    {selectedGrant.grantorAddress && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Address:</h4>
                        <p className="text-sm text-gray-600">
                          {[
                            selectedGrant.grantorAddress.village,
                            selectedGrant.grantorAddress.cell,
                            selectedGrant.grantorAddress.sector,
                            selectedGrant.grantorAddress.district,
                            selectedGrant.grantorAddress.province,
                            selectedGrant.grantorAddress.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grant Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                    Grant Details
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                      <span className="text-sm font-semibold text-green-700">
                        {formatCurrency(selectedGrant.amountGranted)}
                      </span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {selectedGrant.grantType}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedGrant.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedGrant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedGrant.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedGrant.status}
                      </span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium text-gray-600">Grant Date:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedGrant.grantDate).toLocaleDateString()}
                      </span>
                    </div>

                    {selectedGrant.disbursementDate && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Disbursement Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedGrant.disbursementDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {selectedGrant.requiresReporting && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Reporting Frequency:</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {selectedGrant.reportingFrequency}
                        </span>
                      </div>
                    )}

                    {selectedGrant.nextReportDue && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Next Report Due:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedGrant.nextReportDue).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Project Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Start Date:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {new Date(selectedGrant.projectStartDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-600">End Date:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {new Date(selectedGrant.projectEndDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Purpose:</span>
                      <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">
                        {selectedGrant.grantPurpose}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Financial Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-sm font-medium text-blue-700">Amount Granted</p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(selectedGrant.amountGranted)}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <p className="text-sm font-medium text-yellow-700">Amount Disbursed</p>
                      <p className="text-lg font-bold text-yellow-900">
                        {formatCurrency(selectedGrant.amountDisbursed || 0)}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-sm font-medium text-green-700">Amount Utilized</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(selectedGrant.amountUtilized || 0)}
                      </p>
                    </div>

                    <div className="md:col-span-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#5B7FA2] h-2 rounded-full"
                          style={{ width: `${((selectedGrant.amountUtilized || 0) / selectedGrant.amountGranted) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Utilization: {((selectedGrant.amountUtilized || 0) / selectedGrant.amountGranted * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grant Conditions */}
                {selectedGrant.grantConditions && selectedGrant.grantConditions.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <FileText className="w-5 h-5 mr-2 text-orange-600" />
                      Grant Conditions
                    </h3>

                    <div className="space-y-3">
                      {selectedGrant.grantConditions.map((condition: any, index: number) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{condition.condition}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${condition.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {condition.isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{condition.description}</p>
                          {condition.dueDate && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Due: {new Date(condition.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedGrant.notes && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      Additional Notes
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedGrant.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {new Date(selectedGrant.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleEditGrant(selectedGrant);
                    setViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>

                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const renderOperationalModal = () => (
    <AnimatePresence>
      {viewModalOpen && selectedOperational && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Operational Funds Details</h2>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fund Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <Banknote className="w-5 h-5 mr-2 text-purple-600" />
                    Fund Information
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Source:</span>
                      <span className="text-sm text-gray-900 text-right">
                        {selectedOperational.fundSource}
                      </span>
                    </div>

                    {selectedOperational.fundSourceDescription && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Description:</span>
                        <span className="text-sm text-gray-900">
                          {selectedOperational.fundSourceDescription}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                      <span className="text-sm font-semibold text-purple-700">
                        {formatCurrency(selectedOperational.amountCommitted)}
                      </span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${selectedOperational.status === 'available' ? 'bg-green-100 text-green-800' :
                        selectedOperational.status === 'committed' ? 'bg-blue-100 text-blue-800' :
                          selectedOperational.status === 'partially_utilized' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedOperational.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Timeline
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Commitment Date:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedOperational.commitmentDate).toLocaleDateString()}
                      </span>
                    </div>

                    {selectedOperational.availabilityDate && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-600">Availability Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedOperational.availabilityDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {selectedOperational.expirationDate && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Expiration Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedOperational.expirationDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Utilization Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Utilization Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-sm font-medium text-purple-700">Amount Committed</p>
                      <p className="text-lg font-bold text-purple-900">
                        {formatCurrency(selectedOperational.amountCommitted)}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-sm font-medium text-green-700">Amount Utilized</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(selectedOperational.amountUtilized || 0)}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#5B7FA2] h-2 rounded-full"
                          style={{ width: `${((selectedOperational.amountUtilized || 0) / selectedOperational.amountCommitted) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Utilization: {((selectedOperational.amountUtilized || 0) / selectedOperational.amountCommitted * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                {selectedOperational.purpose && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Purpose
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedOperational.purpose}
                    </p>
                  </div>
                )}

                {/* Utilization Plans */}
                {selectedOperational.utilizationPlan && selectedOperational.utilizationPlan.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                      Utilization Plans
                    </h3>

                    <div className="space-y-3">
                      {selectedOperational.utilizationPlan.map((plan: any, index: number) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{plan.category}</h4>
                            <span className="text-sm font-semibold text-purple-700">
                              {formatCurrency(plan.allocatedAmount)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {new Date(plan.utilizationPeriod.startDate).toLocaleDateString()} - {new Date(plan.utilizationPeriod.endDate).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${plan.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {plan.isCompleted ? 'Completed' : `Priority: ${plan.priority}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Allocations */}
                {selectedOperational.budgetAllocations && selectedOperational.budgetAllocations.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800 border-b pb-2">
                      <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                      Budget Allocations
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOperational.budgetAllocations.map((allocation: any, index: number) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm text-gray-900">{allocation.department}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(allocation.allocatedAmount)}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(allocation.actualSpent || 0)}</td>
                              <td className="px-3 py-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#5B7FA2] h-2 rounded-full"
                                    style={{ width: `${allocation.utilizationPercentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{allocation.utilizationPercentage}%</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {new Date(selectedOperational.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleEditOperational(selectedOperational);
                    setViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>

                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Funding Structured</h1>
          <p className="text-gray-600 mt-2">
            Manage your organization's funding sources, including share capital, borrowings, grants, and operational funds.
          </p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">
                {typeof error === 'object' && error.message ? error.message : String(error)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {['overview', 'shareCapital', 'borrowing', 'grants', 'operational'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowForm(null);
                }}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'shareCapital' && 'Share Capital'}
                {tab === 'borrowing' && 'Borrowing'}
                {tab === 'grants' && 'Grants'}
                {tab === 'operational' && 'Operational'}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
            {renderShareCapitalModal()}
            {renderBorrowingModal()}
            {renderGrantModal()}
            {renderOperationalModal()}
            {renderDeleteModal()}
            {renderDeleteBorrowingModal()}
            {renderDeleteGrantModal()}
            {renderDeleteOperationalModal()}
          </div>
        </div>
      </div>
    </div>
  );

}

export default FundingStructure

