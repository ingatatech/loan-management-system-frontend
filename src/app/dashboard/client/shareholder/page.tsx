
"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Building2,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    Filter,
    MoreVertical,
    Users,
    Briefcase,
    Globe,
    FileText,
    AlertTriangle,
    X,
    Save,
    UserCheck,
    Building,
    Minus,
    Plus,
    UserPlus,
    DollarSign, TrendingUp, Activity, Clock,
    AlertCircle, CreditCard,
    Shield
} from 'lucide-react';

import {
    getIndividualShareholders,
    getInstitutionShareholders,
    updateIndividualShareholder,
    updateInstitutionShareholder,
    deleteIndividualShareholder,
    deleteInstitutionShareholder,
    clearError,
    extendIndividualShareholder,
    extendInstitutionShareholder
} from '@/lib/features/auth/shareholderSlice';
import { AppDispatch, RootState } from '@/lib/store';
import toast from 'react-hot-toast';
import rwandaData from '../../../../../data.json';



interface Address {
    cell?: string;
    poBox?: string;
    sector?: string;
    street?: string;
    country?: string;
    village?: string;
    district?: string;
    province?: string;
    houseNumber?: string;
}

interface KeyRepresentative {
    name: string;
    email: string;
    phone: string;
    position: string;
    idPassport: string;
    nationality: string;
    isAuthorizedSignatory: boolean;
}

interface ShareCapital {
    id: number;
    typeOfShare: string;
    numberOfShares: number;
    valuePerShare: string;
    totalContributedCapitalValue: string;
    dateOfContribution: string;
    paymentDetails?: any;
    notes?: string;
}

interface IndividualShareholder {
    id: number;
    firstname: string;
    lastname: string;
    idPassport: string;
    occupation?: string;
    phone?: string;
    email?: string;
    physicalAddress?: Address;
    residentAddress?: Address;
    nationality?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    isActive: boolean;
    isVerified: boolean;
    accountNumber?: string;
    forename2?: string;
    forename3?: string;
    passportNo?: string;
    placeOfBirth?: string;
    postalAddressLine1?: string;
    postalAddressLine2?: string;
    town?: string;
    country?: string;
    createdAt: string;
    updatedAt: string;
    shareCapitals?: ShareCapital[];
}

interface InstitutionShareholder {
    id: number;
    institutionName: string;
    tradingLicenseNumber: string;
    businessActivity?: string;
    keyRepresentatives: KeyRepresentative[];
    fullAddress?: Address;
    institutionType?: string;
    incorporationDate?: string;
    registrationNumber?: string;
    tinNumber?: string;
    phone?: string;
    email?: string;
    website?: string;
    isActive: boolean;
    isVerified: boolean;
    isGovernmentEntity?: boolean;
    isNonProfit?: boolean;
    accountNumber?: string;
    tradingName?: string;
    companyRegNo?: string;
    postalAddressLine1?: string;
    postalAddressLine2?: string;
    town?: string;
    country?: string;
    createdAt: string;
    updatedAt: string;
    shareCapitals?: ShareCapital[];
}


type ShareholderType = 'individual' | 'institution';

interface UpdateModalData {
    id: number;
    type: ShareholderType;
    data: any;
}

const ShareholderManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        individualShareholders,
        institutionShareholders,
        isLoading,
        error,
        pagination
    } = useSelector((state: RootState) => state.shareholders);
    const { user } = useSelector((state: RootState) => state.auth);

    const [activeView, setActiveView] = useState<ShareholderType>('individual');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    // Add these state declarations for address dropdowns
    const [provinces, setProvinces] = useState<string[]>([]);
    const [physicalDistricts, setPhysicalDistricts] = useState<string[]>([]);
    const [physicalSectors, setPhysicalSectors] = useState<string[]>([]);
    const [physicalCells, setPhysicalCells] = useState<string[]>([]);
    const [physicalVillages, setPhysicalVillages] = useState<string[]>([]);
    const [institutionDistricts, setInstitutionDistricts] = useState<string[]>([]);
    const [institutionSectors, setInstitutionSectors] = useState<string[]>([]);
    const [institutionCells, setInstitutionCells] = useState<string[]>([]);
    const [institutionVillages, setInstitutionVillages] = useState<string[]>([]);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedShareholder, setSelectedShareholder] = useState(null);
    const [shareholderType, setShareholderType] = useState(null);
    // Extend Modal State
    const [extendModal, setExtendModal] = useState({
        isOpen: false,
        type: null as ShareholderType | null,
        shareholderId: null as number | null,
        shareholderName: ''
    });

    // Extend Form Data States
    const [individualExtendData, setIndividualExtendData] = useState({
        accountNumber: '',
        forename2: '',
        forename3: '',
        passportNo: '',
        placeOfBirth: '',
        postalAddressLine1: '',
        postalAddressLine2: '',
        town: '',
        country: 'Rwanda'
    });

    const [institutionExtendData, setInstitutionExtendData] = useState({
        accountNumber: '',
        tradingName: '',
        companyRegNo: '',
        postalAddressLine1: '',
        postalAddressLine2: '',
        town: '',
        country: 'Rwanda'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadProvinces = () => {
            const provinceList = Object.keys(rwandaData);
            setProvinces(provinceList);
        };

        loadProvinces();
    }, []);

    const updateAddressDropdowns = (
        addressType: 'physical' | 'institution',
        province: string,
        district: string,
        sector: string,
        cell: string
    ) => {
        // Reset all dropdowns if province is empty
        if (!province) {
            if (addressType === 'physical') {
                setPhysicalDistricts([]);
                setPhysicalSectors([]);
                setPhysicalCells([]);
                setPhysicalVillages([]);
            } else {
                setInstitutionDistricts([]);
                setInstitutionSectors([]);
                setInstitutionCells([]);
                setInstitutionVillages([]);
            }
            return;
        }

        // Check if province exists in rwandaData
        if (province && rwandaData[province as keyof typeof rwandaData]) {
            const provinceData = rwandaData[province as keyof typeof rwandaData];
            const districtList = Object.keys(provinceData);

            if (addressType === 'physical') {
                setPhysicalDistricts(districtList);
            } else {
                setInstitutionDistricts(districtList);
            }
        }

        // Check if district exists in province data
        if (province && district && rwandaData[province as keyof typeof rwandaData]) {
            const provinceData = rwandaData[province as keyof typeof rwandaData];
            if (provinceData[district as keyof typeof provinceData]) {
                const districtData = provinceData[district as keyof typeof provinceData];
                const sectorList = Object.keys(districtData);

                if (addressType === 'physical') {
                    setPhysicalSectors(sectorList);
                } else {
                    setInstitutionSectors(sectorList);
                }
            }
        }

        // Check if sector exists in district data
        if (province && district && sector && rwandaData[province as keyof typeof rwandaData]) {
            const provinceData = rwandaData[province as keyof typeof rwandaData];
            if (provinceData[district as keyof typeof provinceData]) {
                const districtData = provinceData[district as keyof typeof provinceData];
                if (districtData[sector as keyof typeof districtData]) {
                    const sectorData = districtData[sector as keyof typeof districtData];
                    const cellList = Object.keys(sectorData);

                    if (addressType === 'physical') {
                        setPhysicalCells(cellList);
                    } else {
                        setInstitutionCells(cellList);
                    }
                }
            }
        }

        // Check if cell exists in sector data
        if (province && district && sector && cell && rwandaData[province as keyof typeof rwandaData]) {
            const provinceData = rwandaData[province as keyof typeof rwandaData];
            if (provinceData[district as keyof typeof provinceData]) {
                const districtData = provinceData[district as keyof typeof provinceData];
                if (districtData[sector as keyof typeof districtData]) {
                    const sectorData = districtData[sector as keyof typeof districtData];
                    const cellData = sectorData[cell as keyof typeof sectorData];

                    if (Array.isArray(cellData)) {
                        if (addressType === 'physical') {
                            setPhysicalVillages(cellData);
                        } else {
                            setInstitutionVillages(cellData);
                        }
                    }
                }
            }
        }
    };
    // Track which data has been loaded
    const [loadedData, setLoadedData] = useState({
        individual: false,
        institution: false
    });

    // Modal states
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        shareholderId: number | null;
        shareholderName: string;
        type: ShareholderType | null;
    }>({
        isOpen: false,
        shareholderId: null,
        shareholderName: '',
        type: null
    });

    const [updateModal, setUpdateModal] = useState<{
        isOpen: boolean;
        data: UpdateModalData | null;
    }>({
        isOpen: false,
        data: null
    });

    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        if (user?.organizationId) {
            // Fetch both types of shareholders when component mounts
            fetchAllShareholders();
        }
    }, [user?.organizationId]);

    useEffect(() => {
        // When filters or pagination changes, fetch data for the current view
        if (user?.organizationId) {
            fetchCurrentViewShareholders();
        }
    }, [currentPage, statusFilter, searchTerm, activeView]);

    const fetchAllShareholders = async () => {
        if (!user?.organizationId) return;

        const params = {
            organizationId: user.organizationId,
            page: 1,
            limit: itemsPerPage,
            search: '',
            isActive: undefined,
            includeShareCapital: true
        };

        try {
            // Fetch both types of shareholders
            await Promise.all([
                dispatch(getIndividualShareholders(params)),
                dispatch(getInstitutionShareholders(params))
            ]);

            setLoadedData({
                individual: true,
                institution: true
            });
        } catch (error) {
            console.error('Failed to fetch shareholders:', error);
        }
    };

    const fetchCurrentViewShareholders = async () => {
        if (!user?.organizationId) return;

        const params = {
            organizationId: user.organizationId,
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm || undefined,
            isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            includeShareCapital: true
        };

        try {
            if (activeView === 'individual') {
                await dispatch(getIndividualShareholders(params)).unwrap();
                setLoadedData(prev => ({ ...prev, individual: true }));
            } else {
                await dispatch(getInstitutionShareholders(params)).unwrap();
                setLoadedData(prev => ({ ...prev, institution: true }));
            }
        } catch (error) {
            console.error('Failed to fetch shareholders:', error);
        }
    };

    const handleViewSwitch = (type: ShareholderType) => {
        setActiveView(type);
        setCurrentPage(1);
        setSearchTerm('');
        setStatusFilter('all');

        // If we haven't loaded this type of data yet, fetch it
        if ((type === 'individual' && !loadedData.individual) ||
            (type === 'institution' && !loadedData.institution)) {
            fetchCurrentViewShareholders();
        }
    };

    const handleDeleteClick = (id: number, name: string, type: ShareholderType) => {
        setDeleteModal({
            isOpen: true,
            shareholderId: id,
            shareholderName: name,
            type
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.shareholderId || !deleteModal.type || !user?.organizationId) return;

        setActionLoading(deleteModal.shareholderId);

        try {
            if (deleteModal.type === 'individual') {
                await dispatch(deleteIndividualShareholder({
                    organizationId: user.organizationId,
                    shareholderId: deleteModal.shareholderId
                })).unwrap();
                toast.success('Individual shareholder deleted successfully');
            } else {
                await dispatch(deleteInstitutionShareholder({
                    organizationId: user.organizationId,
                    shareholderId: deleteModal.shareholderId
                })).unwrap();
                toast.success('Institution shareholder deleted successfully');
            }

            setDeleteModal({ isOpen: false, shareholderId: null, shareholderName: '', type: null });
            // Refresh the current view data
            fetchCurrentViewShareholders();
        } catch (error) {
            toast.error('Failed to delete shareholder');
            console.error('Delete error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateClick = (shareholder: any, type: ShareholderType) => {
        setUpdateModal({
            isOpen: true,
            data: {
                id: shareholder.id,
                type,
                data: shareholder
            }
        });
    };

    const handleUpdateSubmit = async (updatedData: any) => {
        if (!updateModal.data || !user?.organizationId) return;

        const { id, type } = updateModal.data;
        setActionLoading(id);

        try {
            if (type === 'individual') {
                await dispatch(updateIndividualShareholder({
                    organizationId: user.organizationId,
                    shareholderId: id,
                    shareholderData: updatedData
                })).unwrap();
                toast.success('Individual shareholder updated successfully');
            } else {
                await dispatch(updateInstitutionShareholder({
                    organizationId: user.organizationId,
                    shareholderId: id,
                    shareholderData: updatedData
                })).unwrap();
                toast.success('Institution shareholder updated successfully');
            }

            setUpdateModal({ isOpen: false, data: null });
            // Refresh the current view data
            fetchCurrentViewShareholders();
        } catch (error) {
            toast.error('Failed to update shareholder');
            console.error('Update error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Extend functionality handlers
    const handleExtendClick = (shareholderId: number, shareholderName: string, type: ShareholderType) => {
        setExtendModal({
            isOpen: true,
            type,
            shareholderId,
            shareholderName
        });

        // Reset forms
        if (type === 'individual') {
            setIndividualExtendData({
                accountNumber: '',
                forename2: '',
                forename3: '',
                passportNo: '',
                placeOfBirth: '',
                postalAddressLine1: '',
                postalAddressLine2: '',
                town: '',
                country: 'Rwanda'
            });
        } else {
            setInstitutionExtendData({
                accountNumber: '',
                tradingName: '',
                companyRegNo: '',
                postalAddressLine1: '',
                postalAddressLine2: '',
                town: '',
                country: 'Rwanda'
            });
        }
    };

    const handleCloseExtendModal = () => {
        if (!isSubmitting) {
            setExtendModal({
                isOpen: false,
                type: null,
                shareholderId: null,
                shareholderName: ''
            });
        }
    };

    const handleIndividualExtendSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.organizationId || !extendModal.shareholderId) return;

        setIsSubmitting(true);

        try {
            await dispatch(extendIndividualShareholder({
                organizationId: user.organizationId,
                shareholderId: extendModal.shareholderId,
                extendedData: individualExtendData
            })).unwrap();

            toast.success('Individual shareholder information extended successfully');
            handleCloseExtendModal();
            // Refresh the current view data
            fetchCurrentViewShareholders();
        } catch (error) {
            toast.error('Failed to extend shareholder information');
            console.error('Extend error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInstitutionExtendSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.organizationId || !extendModal.shareholderId) return;

        setIsSubmitting(true);

        try {
            await dispatch(extendInstitutionShareholder({
                organizationId: user.organizationId,
                shareholderId: extendModal.shareholderId,
                extendedData: institutionExtendData
            })).unwrap();

            toast.success('Institution shareholder information extended successfully');
            handleCloseExtendModal();
            // Refresh the current view data
            fetchCurrentViewShareholders();
        } catch (error) {
            toast.error('Failed to extend shareholder information');
            console.error('Extend error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter shareholders based on search term and status filter
    const filterShareholders = (shareholders: any[]) => {
        return shareholders.filter(shareholder => {
            // Filter by status
            const statusMatch = statusFilter === 'all' ||
                (statusFilter === 'active' && shareholder.isActive) ||
                (statusFilter === 'inactive' && !shareholder.isActive);

            if (!statusMatch) return false;

            // Filter by search term
            if (!searchTerm) return true;

            const searchLower = searchTerm.toLowerCase();

            if (activeView === 'individual') {
                return (
                    shareholder.firstname.toLowerCase().includes(searchLower) ||
                    shareholder.lastname.toLowerCase().includes(searchLower) ||
                    shareholder.email?.toLowerCase().includes(searchLower) ||
                    shareholder.phone?.toLowerCase().includes(searchLower) ||
                    shareholder.idPassport.toLowerCase().includes(searchLower)
                );
            } else {
                return (
                    shareholder.institutionName.toLowerCase().includes(searchLower) ||
                    shareholder.tradingLicenseNumber.toLowerCase().includes(searchLower) ||
                    shareholder.email?.toLowerCase().includes(searchLower) ||
                    shareholder.phone?.toLowerCase().includes(searchLower) ||
                    shareholder.registrationNumber?.toLowerCase().includes(searchLower)
                );
            }
        });
    };

    const renderIndividualTable = () => {
        const filteredShareholders = filterShareholders(individualShareholders);

        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                                    Contact Info
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Occupation
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading && !loadedData.individual ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <div className="flex flex-col justify-center items-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                                            <span className="text-gray-600 text-sm">Loading individual shareholders...</span>
                                            <p className="text-xs text-gray-500 mt-1">Please wait while we fetch your data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredShareholders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <div className="text-gray-500 text-sm">
                                            {searchTerm || statusFilter !== 'all'
                                                ? 'No individual shareholders match your search criteria'
                                                : 'No individual shareholders found'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredShareholders.map((shareholder, index) => (
                                    <tr key={shareholder.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-blue-600">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center">

                                                <div className="ml-3 min-w-0">
                                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                                        {shareholder.firstname} {shareholder.lastname}
                                                    </div>

                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">

                                                {shareholder.phone && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                        <span className="truncate">{shareholder.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">
                                                {shareholder.occupation && (
                                                    <div className="text-xs text-gray-600">
                                                        {shareholder.occupation}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${shareholder.isActive
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                    {shareholder.isActive ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {shareholder.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {shareholder.isVerified && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        <UserCheck className="w-3 h-3 mr-1" />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {new Date(shareholder.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedShareholder(shareholder);
                                                        setShareholderType('individual'); // or 'institution'
                                                        setViewModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleExtendClick(shareholder.id, `${shareholder.firstname} ${shareholder.lastname}`, 'individual')}
                                                    className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                                                    title="Extend shareholder"
                                                    disabled={actionLoading === shareholder.id}
                                                >
                                                    {actionLoading === shareholder.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateClick(shareholder, 'individual')}
                                                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit shareholder"
                                                    disabled={actionLoading === shareholder.id}
                                                >
                                                    {actionLoading === shareholder.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Edit className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(
                                                        shareholder.id,
                                                        `${shareholder.firstname} ${shareholder.lastname}`,
                                                        'individual'
                                                    )}
                                                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete shareholder"
                                                    disabled={actionLoading === shareholder.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderInstitutionTable = () => {
        const filteredShareholders = filterShareholders(institutionShareholders);

        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-100">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Institution
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Representatives
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading && !loadedData.institution ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center">
                                        <div className="flex flex-col justify-center items-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
                                            <span className="text-gray-600 text-sm">Loading institution shareholders...</span>
                                            <p className="text-xs text-gray-500 mt-1">Please wait while we fetch your data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredShareholders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center">
                                        <div className="text-gray-500 text-sm">
                                            {searchTerm || statusFilter !== 'all'
                                                ? 'No institution shareholders match your search criteria'
                                                : 'No institution shareholders found'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredShareholders.map((institution, index) => (
                                    <tr key={institution.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-green-600">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center">

                                                <div className="ml-3 min-w-0">
                                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                                        {institution.institutionName}
                                                    </div>

                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">

                                                {institution.phone && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                        <span className="truncate">{institution.phone}</span>
                                                    </div>
                                                )}

                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">
                                                {institution.institutionType && (
                                                    <div className="text-xs text-gray-600">
                                                        {institution.institutionType}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="space-y-1">
                                                {institution.keyRepresentatives?.[0] && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {institution.keyRepresentatives[0].name}
                                                        <span className="text-xs text-gray-400 ml-1">
                                                            ({institution.keyRepresentatives[0].position})
                                                        </span>
                                                    </div>
                                                )}
                                                {institution.keyRepresentatives?.length > 1 && (
                                                    <div className="text-xs text-gray-400">
                                                        +{institution.keyRepresentatives.length - 1} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${institution.isActive
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                    {institution.isActive ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {institution.isActive ? 'Active' : 'Inactive'}
                                                </span>

                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {new Date(institution.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedShareholder(institution);
                                                        setShareholderType('institution'); // or 'institution'
                                                        setViewModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleExtendClick(institution.id, institution.institutionName, 'institution')}
                                                    className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                                                    title="Extend institution"
                                                    disabled={actionLoading === institution.id}
                                                >
                                                    {actionLoading === institution.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateClick(institution, 'institution')}
                                                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit institution"
                                                    disabled={actionLoading === institution.id}
                                                >
                                                    {actionLoading === institution.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Edit className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(
                                                        institution.id,
                                                        institution.institutionName,
                                                        'institution'
                                                    )}
                                                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete institution"
                                                    disabled={actionLoading === institution.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };


    const renderDeleteModal = () => (
        <AnimatePresence>
            {deleteModal.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => !actionLoading && setDeleteModal({ isOpen: false, shareholderId: null, shareholderName: '', type: null })}
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
                                            Delete Shareholder
                                        </h3>
                                        <p className="text-red-100 text-sm">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </div>
                                {!actionLoading && (
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, shareholderId: null, shareholderName: '', type: null })}
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
                                    Are you sure you want to delete
                                </p>
                                <p className="text-lg font-semibold text-gray-900 mb-4">
                                    "{deleteModal.shareholderName}"?
                                </p>
                                <p className="text-sm text-gray-500">
                                    This will permanently remove the {deleteModal.type} shareholder and all associated data.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => !actionLoading && setDeleteModal({ isOpen: false, shareholderId: null, shareholderName: '', type: null })}
                                disabled={actionLoading}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
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

    const renderUpdateModal = () => {
        // Initialize form data with the shareholder data when modal opens
        const [formData, setFormData] = useState(
            updateModal.data?.data || (updateModal.data?.type === 'individual'
                ? {
                    firstname: '',
                    lastname: '',
                    idPassport: '',
                    occupation: '',
                    phone: '',
                    email: '',
                    nationality: 'Rwandan',
                    dateOfBirth: '',
                    gender: '',
                    maritalStatus: ''
                }
                : {
                    institutionName: '',
                    tradingLicenseNumber: '',
                    businessActivity: '',
                    institutionType: '',
                    phone: '',
                    email: '',
                    website: '',
                    keyRepresentatives: [{
                        name: '',
                        position: '',
                        idPassport: '',
                        phone: '',
                        email: '',
                        nationality: 'Rwandan',
                        isAuthorizedSignatory: true
                    }],
                    fullAddress: {
                        country: 'Rwanda',
                        province: '',
                        district: '',
                        sector: '',
                        cell: '',
                        village: '',
                        street: '',
                        houseNumber: '',
                        poBox: ''
                    }
                }
            )
        );
        useEffect(() => {
            if (updateModal.data?.type === 'individual') {
                const addressType = 'physical' as const;
                const address = formData.physicalAddress || {};
                updateAddressDropdowns(
                    addressType,
                    address.province || '',
                    address.district || '',
                    address.sector || '',
                    address.cell || ''
                );
            } else if (updateModal.data?.type === 'institution') {
                const addressType = 'institution' as const;
                const address = formData.fullAddress || {};
                updateAddressDropdowns(
                    addressType,
                    address.province || '',
                    address.district || '',
                    address.sector || '',
                    address.cell || ''
                );
            }
        }, [formData.physicalAddress, formData.fullAddress, updateModal.data?.type]);
        useEffect(() => {
            if (updateModal.data?.data) {
                setFormData(updateModal.data.data);
            }
        }, [updateModal.data]);

        const handleInputChange = (field: string, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        // Also update the address change handlers to reset dependent fields
        const handleAddressChange = (addressType: string, field: string, value: any) => {
            setFormData(prev => {
                const currentAddress = prev[addressType] || {};

                // Reset dependent fields when higher-level field changes
                if (field === 'province') {
                    return {
                        ...prev,
                        [addressType]: {
                            ...currentAddress,
                            province: value,
                            district: '',
                            sector: '',
                            cell: '',
                            village: ''
                        }
                    };
                } else if (field === 'district') {
                    return {
                        ...prev,
                        [addressType]: {
                            ...currentAddress,
                            district: value,
                            sector: '',
                            cell: '',
                            village: ''
                        }
                    };
                } else if (field === 'sector') {
                    return {
                        ...prev,
                        [addressType]: {
                            ...currentAddress,
                            sector: value,
                            cell: '',
                            village: ''
                        }
                    };
                } else if (field === 'cell') {
                    return {
                        ...prev,
                        [addressType]: {
                            ...currentAddress,
                            cell: value,
                            village: ''
                        }
                    };
                } else {
                    return {
                        ...prev,
                        [addressType]: {
                            ...currentAddress,
                            [field]: value
                        }
                    };
                }
            });
        };

        const handleKeyRepresentativeChange = (index: number, field: string, value: any) => {
            setFormData(prev => ({
                ...prev,
                keyRepresentatives: prev.keyRepresentatives.map((rep, i) =>
                    i === index ? { ...rep, [field]: value } : rep
                )
            }));
        };

        const addKeyRepresentative = () => {
            setFormData(prev => ({
                ...prev,
                keyRepresentatives: [
                    ...prev.keyRepresentatives,
                    {
                        name: '',
                        position: '',
                        idPassport: '',
                        phone: '',
                        email: '',
                        nationality: 'Rwandan',
                        isAuthorizedSignatory: false
                    }
                ]
            }));
        };

        const removeKeyRepresentative = (index: number) => {
            if (formData.keyRepresentatives.length > 1) {
                setFormData(prev => ({
                    ...prev,
                    keyRepresentatives: prev.keyRepresentatives.filter((_, i) => i !== index)
                }));
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleUpdateSubmit(formData);
        };

        return (
            <AnimatePresence>
                {updateModal.isOpen && updateModal.data && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => !actionLoading && setUpdateModal({ isOpen: false, data: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`bg-gradient-to-r ${updateModal.data.type === 'individual'
                                ? 'from-blue-500 to-blue-600'
                                : 'from-green-500 to-green-600'
                                } px-6 py-4 sticky top-0 z-10`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`${updateModal.data.type === 'individual'
                                            ? 'bg-blue-100'
                                            : 'bg-green-100'
                                            } p-2 rounded-full`}>
                                            {updateModal.data.type === 'individual' ? (
                                                <User className={`w-6 h-6 ${updateModal.data.type === 'individual'
                                                    ? 'text-blue-600'
                                                    : 'text-green-600'
                                                    }`} />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-green-600" />
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-white">
                                                Update {updateModal.data.type === 'individual' ? 'Individual' : 'Institution'} Shareholder
                                            </h3>
                                            <p className={`${updateModal.data.type === 'individual'
                                                ? 'text-blue-100'
                                                : 'text-green-100'
                                                } text-sm`}>
                                                Edit shareholder information
                                            </p>
                                        </div>
                                    </div>
                                    {!actionLoading && (
                                        <button
                                            onClick={() => setUpdateModal({ isOpen: false, data: null })}
                                            className="text-white hover:text-gray-200 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {updateModal.data.type === 'individual' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <h4 className="text-md font-semibold mb-4 flex items-center">
                                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                                Personal Information
                                            </h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.firstname || ''}
                                                onChange={(e) => handleInputChange('firstname', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lastname || ''}
                                                onChange={(e) => handleInputChange('lastname', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ID/Passport Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.idPassport || ''}
                                                onChange={(e) => handleInputChange('idPassport', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Occupation
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.occupation || ''}
                                                onChange={(e) => handleInputChange('occupation', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+250 XXX XXX XXX"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email || ''}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nationality
                                            </label>
                                            <select
                                                value={formData.nationality || 'Rwandan'}
                                                onChange={(e) => handleInputChange('nationality', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Rwandan">Rwandan</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth || ''}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Gender
                                            </label>
                                            <select
                                                value={formData.gender || ''}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Marital Status
                                            </label>
                                            <select
                                                value={formData.maritalStatus || ''}
                                                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select status</option>
                                                <option value="single">Single</option>
                                                <option value="married">Married</option>
                                                <option value="divorced">Divorced</option>
                                                <option value="widowed">Widowed</option>
                                            </select>
                                        </div>

                                        {/* Physical Address Section for Individual Shareholder */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-md font-semibold mb-4 flex items-center">
                                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                                Physical Address
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                    <input
                                                        type="text"
                                                        value={formData.physicalAddress?.country || 'Rwanda'}
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                                    <select
                                                        value={formData.physicalAddress?.province || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'province', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select province</option>
                                                        {provinces.map((province) => (
                                                            <option key={province} value={province}>{province}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                                    <select
                                                        value={formData.physicalAddress?.district || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'district', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.province || physicalDistricts.length === 0}
                                                    >
                                                        <option value="">Select district</option>
                                                        {physicalDistricts.map((district) => (
                                                            <option key={district} value={district}>{district}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                                                    <select
                                                        value={formData.physicalAddress?.sector || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'sector', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.district || physicalSectors.length === 0}
                                                    >
                                                        <option value="">Select sector</option>
                                                        {physicalSectors.map((sector) => (
                                                            <option key={sector} value={sector}>{sector}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
                                                    <select
                                                        value={formData.physicalAddress?.cell || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'cell', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.sector || physicalCells.length === 0}
                                                    >
                                                        <option value="">Select cell</option>
                                                        {physicalCells.map((cell) => (
                                                            <option key={cell} value={cell}>{cell}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                                                    <select
                                                        value={formData.physicalAddress?.village || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'village', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.cell || physicalVillages.length === 0}
                                                    >
                                                        <option value="">Select village</option>
                                                        {physicalVillages.map((village) => (
                                                            <option key={village} value={village}>{village}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                                    <input
                                                        type="text"
                                                        value={formData.physicalAddress?.street || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'street', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                                                    <input
                                                        type="text"
                                                        value={formData.physicalAddress?.houseNumber || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'houseNumber', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                                                    <input
                                                        type="text"
                                                        value={formData.physicalAddress?.poBox || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'poBox', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <h4 className="text-md font-semibold mb-4 flex items-center">
                                                    <Building2 className="w-5 h-5 mr-2 text-green-600" />
                                                    Institution Information
                                                </h4>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Institution Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.institutionName || ''}
                                                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Trading License Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.tradingLicenseNumber || ''}
                                                    onChange={(e) => handleInputChange('tradingLicenseNumber', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Institution Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.institutionType || ''}
                                                    onChange={(e) => handleInputChange('institutionType', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="e.g., Bank, Cooperative, NGO"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Registration Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.registrationNumber || ''}
                                                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    TIN Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.tinNumber || ''}
                                                    onChange={(e) => handleInputChange('tinNumber', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone || ''}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="+250 XXX XXX XXX"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email || ''}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.website || ''}
                                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="https://example.com"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Business Activity
                                                </label>
                                                <textarea
                                                    value={formData.businessActivity || ''}
                                                    onChange={(e) => handleInputChange('businessActivity', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="Describe the main business activities"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isGovernmentEntity || false}
                                                    onChange={(e) => handleInputChange('isGovernmentEntity', e.target.checked)}
                                                    className="mr-2 h-4 w-4 text-green-600 rounded border-gray-300"
                                                />
                                                <label className="text-sm font-medium text-gray-700">
                                                    Government Entity
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isNonProfit || false}
                                                    onChange={(e) => handleInputChange('isNonProfit', e.target.checked)}
                                                    className="mr-2 h-4 w-4 text-green-600 rounded border-gray-300"
                                                />
                                                <label className="text-sm font-medium text-gray-700">
                                                    Non-Profit Organization
                                                </label>
                                            </div>
                                        </div>

                                        {/* Key Representatives Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-md font-semibold flex items-center">
                                                    <Users className="w-5 h-5 mr-2 text-green-600" />
                                                    Key Representatives
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={addKeyRepresentative}
                                                    className="flex items-center text-sm text-green-600 hover:text-green-700"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Add Representative
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.keyRepresentatives?.map((rep, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h5 className="font-medium text-gray-700">Representative #{index + 1}</h5>
                                                            {formData.keyRepresentatives.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeKeyRepresentative(index)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Name *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={rep.name}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Position *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={rep.position}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'position', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    ID/Passport Number *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={rep.idPassport}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'idPassport', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Phone Number
                                                                </label>
                                                                <input
                                                                    type="tel"
                                                                    value={rep.phone || ''}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'phone', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Email Address
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    value={rep.email || ''}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'email', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Nationality
                                                                </label>
                                                                <select
                                                                    value={rep.nationality || 'Rwandan'}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'nationality', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                >
                                                                    <option value="Rwandan">Rwandan</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                            </div>

                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rep.isAuthorizedSignatory || false}
                                                                    onChange={(e) => handleKeyRepresentativeChange(index, 'isAuthorizedSignatory', e.target.checked)}
                                                                    className="mr-2 h-4 w-4 text-green-600 rounded border-gray-300"
                                                                />
                                                                <label className="text-sm font-medium text-gray-700">
                                                                    Authorized Signatory
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Address Section */}
                                        <div>
                                            <h4 className="text-md font-semibold mb-4 flex items-center">
                                                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                                Address Information
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                    <input
                                                        type="text"
                                                        value={formData.fullAddress?.country || 'Rwanda'}
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                    />
                                                </div>

                                                {/* Physical Address Dropdowns */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                                    <select
                                                        value={formData.physicalAddress?.province || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'province', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select province</option>
                                                        {provinces.map((province) => (
                                                            <option key={province} value={province}>{province}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                                    <select
                                                        value={formData.physicalAddress?.district || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'district', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.province || physicalDistricts.length === 0}
                                                    >
                                                        <option value="">Select district</option>
                                                        {physicalDistricts.map((district) => (
                                                            <option key={district} value={district}>{district}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                                                    <select
                                                        value={formData.physicalAddress?.sector || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'sector', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.district || physicalSectors.length === 0}
                                                    >
                                                        <option value="">Select sector</option>
                                                        {physicalSectors.map((sector) => (
                                                            <option key={sector} value={sector}>{sector}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
                                                    <select
                                                        value={formData.physicalAddress?.cell || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'cell', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.sector || physicalCells.length === 0}
                                                    >
                                                        <option value="">Select cell</option>
                                                        {physicalCells.map((cell) => (
                                                            <option key={cell} value={cell}>{cell}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                                                    <select
                                                        value={formData.physicalAddress?.village || ''}
                                                        onChange={(e) => handleAddressChange('physicalAddress', 'village', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        disabled={!formData.physicalAddress?.cell || physicalVillages.length === 0}
                                                    >
                                                        <option value="">Select village</option>
                                                        {physicalVillages.map((village) => (
                                                            <option key={village} value={village}>{village}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                                    <input
                                                        type="text"
                                                        value={formData.fullAddress?.street || ''}
                                                        onChange={(e) => handleAddressChange('fullAddress', 'street', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                                                    <input
                                                        type="text"
                                                        value={formData.fullAddress?.houseNumber || ''}
                                                        onChange={(e) => handleAddressChange('fullAddress', 'houseNumber', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                                                    <input
                                                        type="text"
                                                        value={formData.fullAddress?.poBox || ''}
                                                        onChange={(e) => handleAddressChange('fullAddress', 'poBox', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => !actionLoading && setUpdateModal({ isOpen: false, data: null })}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={`px-4 py-2 ${updateModal.data.type === 'individual'
                                            ? 'bg-[#5B7FA2] hover:bg-blue-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                            } text-white rounded-lg transition-colors disabled:opacity-50 flex items-center`}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Shareholder
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };


    const IndividualShareholderModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        shareholder: IndividualShareholder | null;
    }> = ({ isOpen, onClose, shareholder }) => {
        if (!isOpen || !shareholder) return null;

        const formatDate = (dateString?: string) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-RW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const formatCurrency = (amount: string | number) => {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            return new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0,
            }).format(numAmount);
        };

        const formatAddress = (address?: Address) => {
            if (!address) return 'N/A';
            const parts = [
                address.village,
                address.cell,
                address.sector,
                address.district,
                address.province,
                address.country
            ].filter(Boolean);
            return parts.join(', ') || 'N/A';
        };

        const totalShareValue = shareholder.shareCapitals?.reduce(
            (sum, share) => sum + parseFloat(share.totalContributedCapitalValue || '0'),
            0
        ) || 0;

        const totalShares = shareholder.shareCapitals?.reduce(
            (sum, share) => sum + share.numberOfShares,
            0
        ) || 0;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                    {/* Header */}
                    <div className="bg-[#5B7FA2] px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {shareholder.firstname} {shareholder.forename2 && `${shareholder.forename2} `}
                                        {shareholder.forename3 && `${shareholder.forename3} `}{shareholder.lastname}
                                    </h3>
                                    <p className="text-blue-100 text-sm">Individual Shareholder Details</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${shareholder.isActive
                                        ? 'bg-green-400/20 text-green-100 border border-green-300'
                                        : 'bg-red-400/20 text-red-100 border border-red-300'
                                    }`}>
                                    {shareholder.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {shareholder.isVerified && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/20 text-purple-100 border border-purple-300">
                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                        Verified
                                    </span>
                                )}
                                <button
                                    onClick={onClose}
                                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-600">ID/Passport</span>
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-sm font-bold text-blue-900">{shareholder.idPassport}</p>
                                {shareholder.passportNo && (
                                    <p className="text-xs text-blue-700 mt-1">Passport: {shareholder.passportNo}</p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-green-600">Total Shares</span>
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                                <p className="text-lg font-bold text-green-900">{totalShares.toLocaleString()}</p>
                                <p className="text-xs text-green-700 mt-1">{shareholder.shareCapitals?.length || 0} Contribution(s)</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-purple-600">Total Value</span>
                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                </div>
                                <p className="text-sm font-bold text-purple-900">{formatCurrency(totalShareValue)}</p>
                                <p className="text-xs text-purple-700 mt-1">Share Capital</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-orange-600">Member Since</span>
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                </div>
                                <p className="text-sm font-bold text-orange-900">{formatDate(shareholder.createdAt)}</p>
                                {shareholder.accountNumber && (
                                    <p className="text-xs text-orange-700 mt-1">{shareholder.accountNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Main Information */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    Personal Information
                                </h4>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow label="First Name" value={shareholder.firstname} />
                                    <InfoRow label="Last Name" value={shareholder.lastname} />
                                    {shareholder.forename2 && <InfoRow label="Fore Name 2" value={shareholder.forename2} />}
                                    {shareholder.forename3 && <InfoRow label="Fore Name 3" value={shareholder.forename3} />}
                                    <InfoRow label="Gender" value={shareholder.gender} capitalize />
                                    <InfoRow label="Date of Birth" value={formatDate(shareholder.dateOfBirth)} />
                                    <InfoRow label="Nationality" value={shareholder.nationality} />
                                    <InfoRow label="Marital Status" value={shareholder.maritalStatus} capitalize />
                                    {shareholder.placeOfBirth && <InfoRow label="Place of Birth" value={shareholder.placeOfBirth} />}
                                    {shareholder.occupation && <InfoRow label="Occupation" value={shareholder.occupation} />}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contact Information
                                </h4>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {shareholder.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{shareholder.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {shareholder.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{shareholder.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Physical Address */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Physical Address
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <AddressDisplay address={shareholder.physicalAddress} />
                                </div>
                            </div>

                            {/* Postal Address */}
                            {(shareholder.postalAddressLine1 || shareholder.town) && (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Postal Address
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-2">

                                    {shareholder.postalAddressLine1 && <InfoRow label="Postal Address Line 1" value={shareholder.postalAddressLine1} />}


                                    {shareholder.postalAddressLine2 && <InfoRow label="Postal Address Line 2" value={shareholder.postalAddressLine2} />}

             
                                    {shareholder.town && <InfoRow label="Town" value={shareholder.town} />}

                                    {shareholder.country && <InfoRow label="Country" value={shareholder.country} />}

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Share Capital Details */}
                        {shareholder.shareCapitals && shareholder.shareCapitals.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Share Capital Contributions
                                    </h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Shares</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Value/Share</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {shareholder.shareCapitals.map((share) => (
                                                <tr key={share.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-900">{formatDate(share.dateOfContribution)}</td>
                                                    <td className="px-4 py-3 text-gray-900 capitalize">{share.typeOfShare.replace(/_/g, ' ')}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{share.numberOfShares.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(share.valuePerShare)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                        {formatCurrency(share.totalContributedCapitalValue)}
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
            </div>
        );
    };

    // ============================================================================
    // INSTITUTION SHAREHOLDER DETAIL MODAL
    // ============================================================================

    const InstitutionShareholderModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        shareholder: InstitutionShareholder | null;
    }> = ({ isOpen, onClose, shareholder }) => {
        if (!isOpen || !shareholder) return null;

        const formatDate = (dateString?: string) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-RW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const formatCurrency = (amount: string | number) => {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            return new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                minimumFractionDigits: 0,
            }).format(numAmount);
        };

        const totalShareValue = shareholder.shareCapitals?.reduce(
            (sum, share) => sum + parseFloat(share.totalContributedCapitalValue || '0'),
            0
        ) || 0;

        const totalShares = shareholder.shareCapitals?.reduce(
            (sum, share) => sum + share.numberOfShares,
            0
        ) || 0;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                    {/* Header */}
                    <div className="bg-[#5B7FA2] px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{shareholder.institutionName}</h3>
                                    <p className="text-green-100 text-sm">
                                        {shareholder.tradingName ? `Trading as: ${shareholder.tradingName}` : 'Institution Shareholder Details'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {shareholder.isGovernmentEntity && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-100 border border-blue-300">
                                        <Shield className="w-3 h-3 inline mr-1" />
                                        Government
                                    </span>
                                )}
                                {shareholder.isNonProfit && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/20 text-purple-100 border border-purple-300">
                                        Non-Profit
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${shareholder.isActive
                                        ? 'bg-green-400/20 text-green-100 border border-green-300'
                                        : 'bg-red-400/20 text-red-100 border border-red-300'
                                    }`}>
                                    {shareholder.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-green-600">License</span>
                                    <FileText className="w-4 h-4 text-green-600" />
                                </div>
                                <p className="text-sm font-bold text-green-900">{shareholder.tradingLicenseNumber}</p>
                                {shareholder.registrationNumber && (
                                    <p className="text-xs text-green-700 mt-1">Reg: {shareholder.registrationNumber}</p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-600">Total Shares</span>
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-lg font-bold text-blue-900">{totalShares.toLocaleString()}</p>
                                <p className="text-xs text-blue-700 mt-1">{shareholder.shareCapitals?.length || 0} Contribution(s)</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-purple-600">Total Value</span>
                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                </div>
                                <p className="text-sm font-bold text-purple-900">{formatCurrency(totalShareValue)}</p>
                                <p className="text-xs text-purple-700 mt-1">Share Capital</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-orange-600">Representatives</span>
                                    <Users className="w-4 h-4 text-orange-600" />
                                </div>
                                <p className="text-lg font-bold text-orange-900">{shareholder.keyRepresentatives.length}</p>
                                {shareholder.accountNumber && (
                                    <p className="text-xs text-orange-700 mt-1">{shareholder.accountNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Institution Information */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Institution Information
                                </h4>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow label="Institution Name" value={shareholder.institutionName} />
                                    <InfoRow label="Institution Type" value={shareholder.institutionType} capitalize />
                                    {shareholder.tradingName && <InfoRow label="Trading Name" value={shareholder.tradingName} />}
                                    {shareholder.companyRegNo && <InfoRow label="Company Reg No" value={shareholder.companyRegNo} />}
                                    <InfoRow label="Trading License" value={shareholder.tradingLicenseNumber} />
                                    {shareholder.registrationNumber && <InfoRow label="Registration No" value={shareholder.registrationNumber} />}
                                    {shareholder.tinNumber && <InfoRow label="TIN Number" value={shareholder.tinNumber} />}
                                    {shareholder.incorporationDate && <InfoRow label="Incorporation Date" value={formatDate(shareholder.incorporationDate)} />}
                                    {shareholder.businessActivity && (
                                        <div className="md:col-span-2">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Business Activity</p>
                                            <p className="text-sm text-gray-900">{shareholder.businessActivity}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contact Information
                                </h4>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {shareholder.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{shareholder.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {shareholder.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{shareholder.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {shareholder.website && (
                                        <div className="flex items-center space-x-2">
                                            <Globe className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">Website</p>
                                                <a
                                                    href={shareholder.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-blue-600 hover:underline"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Key Representatives */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    Key Representatives
                                </h4>
                            </div>
                            <div className="p-4 space-y-4">
                                {shareholder.keyRepresentatives.map((rep, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-900">{rep.name}</h5>
                                                <p className="text-xs text-gray-600">{rep.position}</p>
                                            </div>
                                            {rep.isAuthorizedSignatory && (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    <CheckCircle className="w-3 h-3 inline mr-1" />
                                                    Authorized Signatory
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">ID/Passport</p>
                                                    <p className="text-sm text-gray-900">{rep.idPassport}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="text-sm text-gray-900">{rep.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="text-sm text-gray-900">{rep.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Nationality</p>
                                                    <p className="text-sm text-gray-900">{rep.nationality}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Full Address */}
                            {shareholder.fullAddress && (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Physical Address
                                        </h4>
                                    </div>
                                    <div className="p-4">
                                        <AddressDisplay address={shareholder.fullAddress} />
                                    </div>
                                </div>
                            )}

                            {/* Postal Address */}
                            {(shareholder.postalAddressLine1 || shareholder.town) && (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Postal Address
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {shareholder.postalAddressLine1 && (
                                            <p className="text-sm text-gray-700">{shareholder.postalAddressLine1}</p>
                                        )}
                                        {shareholder.postalAddressLine2 && (
                                            <p className="text-sm text-gray-700">{shareholder.postalAddressLine2}</p>
                                        )}
                                        {shareholder.town && (
                                            <p className="text-sm text-gray-700">{shareholder.town}</p>
                                        )}
                                        {shareholder.country && (
                                            <p className="text-sm font-medium text-gray-900">{shareholder.country}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Share Capital Details */}
                        {shareholder.shareCapitals && shareholder.shareCapitals.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Share Capital Contributions
                                    </h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Shares</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Value/Share</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {shareholder.shareCapitals.map((share) => (
                                                <tr key={share.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-900">{formatDate(share.dateOfContribution)}</td>
                                                    <td className="px-4 py-3 text-gray-900 capitalize">{share.typeOfShare.replace(/_/g, ' ')}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{share.numberOfShares.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(share.valuePerShare)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                        {formatCurrency(share.totalContributedCapitalValue)}
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
            </div>
        );
    };

    // ============================================================================
    // HELPER COMPONENTS
    // ============================================================================

    const InfoRow: React.FC<{
        label: string;
        value?: string | number;
        capitalize?: boolean;
    }> = ({ label, value, capitalize }) => (
        <div>
            <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
            <p className={`text-sm text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
                {value || 'N/A'}
            </p>
        </div>
    );

    const AddressDisplay: React.FC<{ address?: Address }> = ({ address }) => {
        if (!address) return <p className="text-sm text-gray-500">No address provided</p>;

        return (
            <div className="space-y-2">
                {address.country && (
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{address.country}</span>
                    </div>
                )}
                {address.province && (
                    <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            {[address.village, address.cell, address.sector, address.district, address.province]
                                .filter(Boolean)
                                .join(', ')}
                        </div>
                    </div>
                )}
                {address.street && (
                    <div className="text-sm text-gray-700">
                        <span className="font-medium">Street:</span> {address.street}
                    </div>
                )}
                {address.houseNumber && (
                    <div className="text-sm text-gray-700">
                        <span className="font-medium">House:</span> {address.houseNumber}
                    </div>
                )}
                {address.poBox && (
                    <div className="text-sm text-gray-700">
                        <span className="font-medium">P.O. Box:</span> {address.poBox}
                    </div>
                )}
            </div>
        );
    };


    const renderExtendModal = () => {
        if (!extendModal.isOpen || !extendModal.type) return null;

        return (
            <AnimatePresence>
                {extendModal.isOpen && extendModal.type && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={handleCloseExtendModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`bg-[#5B7FA2] ${extendModal.type === 'individual'
                                ? 'bg-[#5B7FA2]'
                                : 'bg-[#5B7FA2]'
                                } px-6 py-4 sticky top-0 z-10`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-white p-2 rounded-full">
                                            <UserPlus className={`w-6 h-6 ${extendModal.type === 'individual'
                                                ? 'text-purple-600'
                                                : 'text-purple-600'
                                                }`} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-white">
                                                Complete {extendModal.type === 'individual' ? 'Individual' : 'Institution'} Shareholder
                                            </h3>
                                            <p className="text-purple-100 text-sm">
                                                {extendModal.shareholderName}
                                            </p>
                                        </div>
                                    </div>
                                    {!isSubmitting && (
                                        <button
                                            onClick={handleCloseExtendModal}
                                            className="text-white hover:text-gray-200 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {extendModal.type === 'individual' ? (
                                <form onSubmit={handleIndividualExtendSubmit} className="p-6 space-y-6">
                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                            Account Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.accountNumber}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, accountNumber: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter unique account number"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                            Additional Names
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Forename or Initial 2
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.forename2}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, forename2: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Second forename or initial"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Forename or Initial 3
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.forename3}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, forename3: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Third forename or initial"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                            Identification Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Passport Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.passportNo}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, passportNo: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter passport number"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Place of Birth
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.placeOfBirth}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, placeOfBirth: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter place of birth"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                                            Postal Address
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Postal Address Line 1 (Number)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.postalAddressLine1}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, postalAddressLine1: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Street number and name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Postal Address Line 2 (Postal Code)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.postalAddressLine2}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, postalAddressLine2: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Postal code"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Town
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.town}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, town: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter town/city"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Country
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualExtendData.country}
                                                    onChange={(e) => setIndividualExtendData({ ...individualExtendData, country: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleCloseExtendModal}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Complete Information
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleInstitutionExtendSubmit} className="p-6 space-y-6">
                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                            Account Information
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.accountNumber}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, accountNumber: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter unique account number"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                            Institution Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Trading Name (Alternative Name)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.tradingName}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, tradingName: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter trading name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Company Registration Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.companyRegNo}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, companyRegNo: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter company reg number"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold mb-4 flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                                            Postal Address
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Postal Address Line 1 (Number)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.postalAddressLine1}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, postalAddressLine1: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Street number and name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Postal Address Line 2 (Postal Code)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.postalAddressLine2}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, postalAddressLine2: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Postal code"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Town
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.town}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, town: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter town/city"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Country
                                                </label>
                                                <input
                                                    type="text"
                                                    value={institutionExtendData.country}
                                                    onChange={(e) => setInstitutionExtendData({ ...institutionExtendData, country: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleCloseExtendModal}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Complete Information
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        return (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {(currentPage - 1) * itemsPerPage + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, pagination.totalItems)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{pagination.totalItems}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(page =>
                                    page === 1 ||
                                    page === pagination.totalPages ||
                                    Math.abs(page - currentPage) <= 2
                                )
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                ...
                                            </span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                disabled={currentPage === pagination.totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Users className="w-7 h-7 mr-3 text-blue-600" />
                                Shareholder Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage individual and institutional shareholders
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    </motion.div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        {/* View Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => handleViewSwitch('individual')}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'individual'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Individual Shareholders

                                </button>
                                <button
                                    onClick={() => handleViewSwitch('institution')}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'institution'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Institution Shareholders

                                </button>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeView} shareholders...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeView === 'individual' ? renderIndividualTable() : renderInstitutionTable()}
                </motion.div>

                {/* Pagination */}
                {renderPagination()}
                {shareholderType === 'individual' ? (
                    <IndividualShareholderModal
                        isOpen={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                        shareholder={selectedShareholder}
                    />
                ) : (
                    <InstitutionShareholderModal
                        isOpen={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                        shareholder={selectedShareholder}
                    />
                )}
                {/* Modals */}
                {renderDeleteModal()}
                {renderUpdateModal()}
                {renderExtendModal()}
            </div>
        </div>
    );
};

export default ShareholderManagement;