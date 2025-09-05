// @ts-nocheck

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
    Plus
} from 'lucide-react';

import {
    getIndividualShareholders,
    getInstitutionShareholders,
    updateIndividualShareholder,
    updateInstitutionShareholder,
    deleteIndividualShareholder,
    deleteInstitutionShareholder,
    clearError
} from '@/lib/features/auth/shareholderSlice';
import { AppDispatch, RootState } from '@/lib/store';
import toast from 'react-hot-toast';
import rwandaData from '../../../../../data.json';
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
                                            <Loader2 className="w-8 h-8 animate-spin text-[#5B7FA2] mb-3" />
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
                                                <span className="text-xs font-semibold text-[#5B7FA2]">
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
                                                    onClick={() => handleUpdateClick(shareholder, 'individual')}
                                                    className="p-1.5 text-[#5B7FA2] hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
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
                                                    onClick={() => handleUpdateClick(institution, 'institution')}
                                                    className="p-1.5 text-[#5B7FA2] hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
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
                                ? 'bg-[#5B7FA2]'
                                : 'bg-[#5B7FA2]'
                                } px-6 py-4 sticky top-0 z-10`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`${updateModal.data.type === 'individual'
                                            ? 'bg-blue-100'
                                            : 'bg-green-100'
                                            } p-2 rounded-full`}>
                                            {updateModal.data.type === 'individual' ? (
                                                <User className={`w-6 h-6 ${updateModal.data.type === 'individual'
                                                    ? 'text-[#5B7FA2]'
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
                                                <User className="w-5 h-5 mr-2 text-[#5B7FA2]" />
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
                                                <MapPin className="w-5 h-5 mr-2 text-[#5B7FA2]" />
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
                                            ? ' bg-[#5B7FA2] hover:bg-[#5B7FA2]'
                                            : 'bg-[#5B7FA2] hover:bg-[#5B7FA2]'
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
                                                ? 'z-10 bg-blue-50 border-blue-500 text-[#5B7FA2]'
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
                                <Users className="w-7 h-7 mr-3 text-[#5B7FA2]" />
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
                                        ? 'bg-white text-[#5B7FA2] shadow-sm'
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

                {/* Modals */}
                {renderDeleteModal()}
                {renderUpdateModal()}
            </div>
        </div>
    );
};

export default ShareholderManagement;