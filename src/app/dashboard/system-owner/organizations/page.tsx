// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Building2,
    Search,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    X,
    AlertTriangle,
    Info,
    Globe,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Hash,
    Users
} from 'lucide-react';
import { AppDispatch, RootState } from '@/lib/store';
import {
    getAllOrganizations,
    activateOrganization,
    deactivateOrganization,
    deleteOrganization,
    clearError
} from '@/lib/features/auth/organization-slice';
import toast from 'react-hot-toast';

interface OrganizationFilters {
    status: 'all' | 'active' | 'inactive';
    search: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: 'activate' | 'deactivate';
    organizationName: string;
    isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    organizationName,
    isLoading
}) => {
    if (!isOpen) return null;

    const isActivate = type === 'activate';
    const action = isActivate ? 'activate' : 'deactivate';
    const actionCapitalized = isActivate ? 'Activate' : 'Deactivate';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${isActivate ? 'bg-green-100' : 'bg-red-100'}`}>
                        <AlertTriangle className={`w-5 h-5 ${isActivate ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {actionCapitalized} Organization
                    </h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to {action} <strong>"{organizationName}"</strong>?
                    </p>
                    <div className={`p-3 rounded-lg ${isActivate ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm ${isActivate ? 'text-green-700' : 'text-red-700'}`}>
                            <Info className="w-4 h-4 inline mr-1" />
                            This action cannot be undone and will {isActivate ? 'enable' : 'disable'} all organization services.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${isActivate
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isActivate ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                        {actionCapitalized}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const OrganizationManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { organizations, isLoading, error } = useSelector((state: RootState) => state.organizations);

    const [filters, setFilters] = useState<OrganizationFilters>({
        status: 'all',
        search: ''
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'name',
        direction: 'asc'
    });
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'activate' | 'deactivate';
        organizationId: number;
        organizationName: string;
    }>({
        isOpen: false,
        type: 'activate',
        organizationId: 0,
        organizationName: ''
    });

    useEffect(() => {
        dispatch(clearError());
        dispatch(getAllOrganizations({ page: 1, limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleRefresh = () => {
        dispatch(getAllOrganizations({ page: 1, limit: 100 }));
        toast.success('Organizations refreshed');
    };

    const openConfirmModal = (type: 'activate' | 'deactivate', orgId: number, orgName: string) => {
        setConfirmModal({
            isOpen: true,
            type,
            organizationId: orgId,
            organizationName: orgName
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            type: 'activate',
            organizationId: 0,
            organizationName: ''
        });
    };

    const handleConfirmAction = async () => {
        const { type, organizationId } = confirmModal;
        setActionLoading(organizationId);

        try {
            if (type === 'activate') {
                await dispatch(activateOrganization(organizationId)).unwrap();
                toast.success('Organization activated successfully');
            } else {
                await dispatch(deactivateOrganization(organizationId)).unwrap();
                toast.success('Organization deactivated successfully');
            }
        } catch (error) {
            console.error(`Failed to ${type} organization:`, error);
            toast.error(`Failed to ${type} organization`);
        } finally {
            setActionLoading(null);
            closeConfirmModal();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
            return;
        }

        setActionLoading(id);
        try {
            await dispatch(deleteOrganization(id)).unwrap();
            toast.success('Organization deleted successfully');
        } catch (error) {
            console.error('Failed to delete organization:', error);
            toast.error('Failed to delete organization');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredOrganizations = Array.isArray(organizations) ? organizations.filter(org => {
        const matchesStatus = filters.status === 'all' ||
            (filters.status === 'active' && org.isActive) ||
            (filters.status === 'inactive' && !org.isActive);

        const matchesSearch = org.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            org.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            org.registrationNumber?.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesSearch;
    }) : [];

    const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === 'status') {
            return sortConfig.direction === 'asc'
                ? (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1)
                : (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1);
        }
        if (sortConfig.key === 'createdAt' && a.createdAt && b.createdAt) {
            return sortConfig.direction === 'asc'
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
    });

    const SortIndicator: React.FC<{ columnKey: string }> = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            Organization Management
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Manage all organizations in the system</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
                        >
                            <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Search Organizations</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or registration..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status Filter</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'active' | 'inactive' }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="all">All Organizations</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Results Count</label>
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm">
                                {filteredOrganizations.length} organization(s) found
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">Total Organizations</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {Array.isArray(organizations) ? organizations.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">Active Organizations</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {Array.isArray(organizations) ? organizations.filter(org => org.isActive).length : 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">Inactive Organizations</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {Array.isArray(organizations) ? organizations.filter(org => !org.isActive).length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th
                                        className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Organization
                                            <SortIndicator columnKey="name" />
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Registration
                                    </th>
                                    <th
                                        className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            <SortIndicator columnKey="status" />
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Admin Info
                                    </th>
                                    <th
                                        className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Created
                                            <SortIndicator columnKey="createdAt" />
                                        </div>
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center">
                                            <div className="flex flex-col justify-center items-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                                                <span className="text-gray-600 text-sm">Loading organizations...</span>
                                                <p className="text-xs text-gray-500 mt-1">Please wait while we fetch your data</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !organizations || organizations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-6 text-center">
                                            <div className="text-gray-500 text-sm">
                                                No organizations found in the system
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedOrganizations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-6 text-center">
                                            <div className="text-gray-500 text-sm">
                                                {filters.search || filters.status !== 'all'
                                                    ? 'No organizations match your filters'
                                                    : 'No organizations found'}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedOrganizations.map((org, index) => (
                                        <React.Fragment key={org.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                {/* Index Column */}
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-blue-600">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Organization Column */}
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                            <Building2 className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="ml-3 min-w-0">
                                                            <div className="text-sm font-semibold text-gray-900 truncate">
                                                                {org.name}
                                                            </div>
                                                      
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact & Details Column */}
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                        
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                            <span className="truncate">{org.phone || 'No phone'}</span>
                                                        </div>
                                           
                                                    </div>
                                                </td>

                                                {/* Registration Column */}
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                                           
                                                        <div className="text-xs text-gray-500 truncate">
                                                            TIN: {org.tinNumber || 'Not available'}
                                                        </div>
             
                                                    </div>
                                                </td>

                                                {/* Status Column */}
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${org.isActive
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                        {org.isActive ? (
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                        )}
                                                        {org.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>

                                                {/* Admin Info Column */}
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                                                        {org.adminUser ? (
                                                            <>
                                                                <div className="flex items-center text-xs text-gray-600">
                                                                    <Users className="w-3 h-3 mr-1 text-gray-400" />
                                                                    <span className="font-medium truncate">
                                                                        {org.adminUser.username}
                                                                    </span>
                                                                </div>

                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">No admin assigned</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Created Column */}
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'Unknown'}
                                                    </div>
                                                </td>

                                                {/* Actions Column */}
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setExpandedRow(expandedRow === org.id ? null : org.id)}
                                                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                        </button>

                                                        {org.isActive ? (
                                                            <button
                                                                onClick={() => openConfirmModal('deactivate', org.id, org.name)}
                                                                disabled={actionLoading === org.id}
                                                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                                title="Deactivate"
                                                            >
                                                                {actionLoading === org.id ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <XCircle className="w-3 h-3" />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openConfirmModal('activate', org.id, org.name)}
                                                                disabled={actionLoading === org.id}
                                                                className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                                                title="Activate"
                                                            >
                                                                {actionLoading === org.id ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="w-3 h-3" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Details Row */}
                                            {expandedRow === org.id && (
                                                <tr>
                                                    <td colSpan={8} className="px-3 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-400">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-white rounded-lg p-4 shadow-sm"
                                                        >
                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                {/* Organization Details */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                                        <h4 className="font-semibold text-gray-900">Organization Details</h4>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <Info className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                            <div>
                                                                                <span className="text-xs font-medium text-gray-500">Description:</span>
                                                                                <p className="text-sm text-gray-900 mt-0.5">
                                                                                    {org.description || 'No description available'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <Hash className="w-3 h-3 text-gray-400" />
                                                                            <span className="text-xs font-medium text-gray-500">Business Sector:</span>
                                                                            <span className="text-sm text-gray-900">
                                                                                {org.businessSector || 'Not specified'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="w-3 h-3 text-gray-400" />
                                                                            <span className="text-xs font-medium text-gray-500">Registration Date:</span>
                                                                            <span className="text-sm text-gray-900">
                                                                                {org.registrationDate
                                                                                    ? new Date(org.registrationDate).toLocaleDateString()
                                                                                    : 'Not specified'}
                                                                            </span>
                                                                        </div>

                                                                        {org.selectedCategories && org.selectedCategories.length > 0 && (
                                                                            <div>
                                                                                <span className="text-xs font-medium text-gray-500 block mb-1">Categories:</span>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {org.selectedCategories.map((category, idx) => (
                                                                                        <span
                                                                                            key={idx}
                                                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                                                                                        >
                                                                                            {category}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Address Information */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <MapPin className="w-4 h-4 text-green-600" />
                                                                        <h4 className="font-semibold text-gray-900">Address Information</h4>
                                                                    </div>

                                                                    {org.address ? (
                                                                        <div className="space-y-2">
                                                                            {org.address.country && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">Country:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.country}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.province && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">Province:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.province}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.district && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">District:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.district}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.sector && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">Sector:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.sector}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.cell && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">Cell:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.cell}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.village && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">Village:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.village}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.street && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">Street:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.street}</span>
                                                                                </div>
                                                                            )}
                                                                            {org.address.poBox && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-medium text-gray-500 w-16">P.O. Box:</span>
                                                                                    <span className="text-sm text-gray-900">{org.address.poBox}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 italic">No address information available</p>
                                                                    )}
                                                                </div>

                                                                {/* Admin & Users Information */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <Users className="w-4 h-4 text-purple-600" />
                                                                        <h4 className="font-semibold text-gray-900">Admin & Users</h4>
                                                                    </div>

                                                                    {org.adminUser ? (
                                                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                                                                    <span className="text-xs font-bold text-white">A</span>
                                                                                </div>
                                                                                <span className="text-sm font-semibold text-gray-900">
                                                                                    Primary Admin
                                                                                </span>
                                                                            </div>

                                                                            <div className="space-y-1 text-sm">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-gray-600">{org.adminUser.username}</span>
                                                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${org.adminUser.isActive
                                                                                        ? 'bg-green-100 text-green-700'
                                                                                        : 'bg-red-100 text-red-700'
                                                                                        }`}>
                                                                                        {org.adminUser.isActive ? 'Active' : 'Inactive'}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex items-center gap-1 text-gray-600">
                                                                                    <Mail className="w-3 h-3" />
                                                                                    {org.adminUser.email}
                                                                                </div>

                                                                                {org.adminUser.phone && (
                                                                                    <div className="flex items-center gap-1 text-gray-600">
                                                                                        <Phone className="w-3 h-3" />
                                                                                        {org.adminUser.phone}
                                                                                    </div>
                                                                                )}

                                                                                <div className="text-xs text-gray-500 mt-2">
                                                                                    Last Login: {org.adminUser.lastLoginAt
                                                                                        ? new Date(org.adminUser.lastLoginAt).toLocaleString()
                                                                                        : 'Never logged in'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                            <p className="text-sm text-gray-500 italic">No admin user assigned</p>
                                                                        </div>
                                                                    )}

                                                                    {org.users && org.users.length > 1 && (
                                                                        <div className="mt-3">
                                                                            <span className="text-xs font-medium text-gray-500 block mb-2">
                                                                                Other Users ({org.users.length - 1})
                                                                            </span>
                                                                            <div className="space-y-2">
                                                                                {org.users.filter(user => user.id !== org.adminUser?.id).slice(0, 3).map((user) => (
                                                                                    <div key={user.id} className="flex items-center gap-2 text-sm">
                                                                                        <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                                                                            <span className="text-xs font-bold text-white">U</span>
                                                                                        </div>
                                                                                        <span className="text-gray-700 truncate">{user.username}</span>
                                                                                        <span className={`px-1.5 py-0.5 rounded text-xs ${user.isActive
                                                                                            ? 'bg-green-100 text-green-700'
                                                                                            : 'bg-red-100 text-red-700'
                                                                                            }`}>
                                                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                                {org.users.length > 4 && (
                                                                                    <div className="text-xs text-gray-500">
                                                                                        +{org.users.length - 4} more users
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Quick Actions */}
                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                        <Calendar className="w-3 h-3" />
                                                                        Created: {new Date(org.createdAt).toLocaleString()}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                        <Calendar className="w-3 h-3" />
                                                                        Updated: {new Date(org.updatedAt).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                type={confirmModal.type}
                organizationName={confirmModal.organizationName}
                isLoading={actionLoading === confirmModal.organizationId}
            />
        </div>
    );
};

export default OrganizationManagement;