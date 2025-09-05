// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
    fetchUsers,
    clearError,
    clearSuccessFlags,
} from "@/lib/features/users/userSlice";
import {
    Users,
    UserPlus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    UserX,
    Key,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    XCircle,
    Loader2,
    Building2,
    AlertCircle,
    Clock,
    SlidersHorizontal,
    X,
    RefreshCw,
    Shield,
} from "lucide-react";
import CreateUserModal from "@/components/users/CreateUserModal";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import EditUserModal from "@/components/users/EditUserModal";
import DeactivateUserModal from "@/components/users/DeactivateUserModal";
import toast from "react-hot-toast";
import Link from "next/link";

export default function UsersManagementPage() {
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const { users, isLoading, error, createSuccess } = useAppSelector((state) => state.user);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<"active" | "all">("active");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Fetch users only once on component mount
    useEffect(() => {
        if (currentUser?.organizationId) {
            dispatch(
                fetchUsers({
                    organizationId: currentUser.organizationId,
                    filters: {}, // Fetch all users without filters
                })
            );
        }
    }, [dispatch, currentUser?.organizationId]);

    useEffect(() => {
        if (createSuccess) {
            setShowCreateModal(false);
            dispatch(clearSuccessFlags());
            toast.success("User created successfully!");
        }
    }, [createSuccess, dispatch]);

    const loadUsers = () => {
        if (currentUser?.organizationId) {
            dispatch(
                fetchUsers({
                    organizationId: currentUser.organizationId,
                    filters: {},
                })
            );
            setCurrentPage(1);
            setSearchQuery("");
            setRoleFilter("all");
            setStatusFilter("all");
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleRoleFilter = (role: string) => {
        setRoleFilter(role);
        setCurrentPage(1);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "loan_officer":
                return "bg-blue-100 text-blue-700";
            case "board_director":
            case "senior_manager":
            case "managing_director":
                return "bg-purple-100 text-purple-700";
            case "client":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "loan_officer":
                return "Loan Officer";
            case "board_director":
                return "Board Director";
            case "senior_manager":
                return "Senior Manager";
            case "managing_director":
                return "Managing Director";
            case "client":
                return "Client";
            default:
                return role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    // Client-side filtering - All filtering happens here
    const getFilteredUsers = () => {
        let filtered = [...users]; // Create a copy to avoid mutation

        // Apply tab filter (active/all)
        if (activeTab === "active") {
            filtered = filtered.filter((u: any) => u.isActive === true);
        }

        // Apply role filter (independent of tab filter)
        if (roleFilter && roleFilter !== "all") {
            filtered = filtered.filter((u: any) => u.role === roleFilter);
        }

        // Apply status filter (independent of tab filter)
        if (statusFilter && statusFilter !== "all") {
            if (statusFilter === "active") {
                filtered = filtered.filter((u: any) => u.isActive === true);
            } else if (statusFilter === "inactive") {
                filtered = filtered.filter((u: any) => u.isActive === false);
            }
        }

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((user: any) => {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
                const email = user.email?.toLowerCase() || "";
                const username = user.username?.toLowerCase() || "";
                const phone = user.phone?.toLowerCase() || "";
                const role = user.role?.toLowerCase() || "";

                return (
                    fullName.includes(query) ||
                    email.includes(query) ||
                    username.includes(query) ||
                    phone.includes(query) ||
                    role.includes(query)
                );
            });
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, statusFilter, activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#5B7FA2] rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    User Management
                                </h1>
                                <p className="text-xs text-gray-500">{totalItems} total users</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${showFilters
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-1" />
                                Filters
                            </button>
                            <button
                                onClick={loadUsers}
                                disabled={isLoading}
                                className="flex items-center px-3 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
                                />
                                Refresh
                            </button>
                            <Link
                                href="/dashboard/client/users/create"
                                className="flex items-center px-3 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Add User
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 mb-3">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "active"
                                ? "bg-[#5B7FA2] text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Active ({users.filter((u: any) => u.isActive).length})
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "all"
                                ? "bg-[#5B7FA2] text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            All Users ({users.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by name, email, username, or phone..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
                            >
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleRoleFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="loan_officer">Loan Officers</option>
                                    <option value="board_director">Board Directors</option>
                                    <option value="senior_manager">Senior Managers</option>
                                    <option value="managing_director">Managing Directors</option>
                                    <option value="client">Clients</option>
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center"
                    >
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-800">{error}</span>
                        <button
                            onClick={() => dispatch(clearError())}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* Users Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : currentPageUsers.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
                    >
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Users {searchQuery ? "Found" : ""}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery
                                ? "Try adjusting your search"
                                : "Get started by creating your first user"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Create First User
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#5B7FA2] text-white">
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            #
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            User
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            Contact
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            Role
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            Assigned Loans
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            Status
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-bold uppercase">
                                            Created
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-bold uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentPageUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-blue-50 transition-colors group"
                                        >
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="w-7 h-7 bg-[#5B7FA2] rounded-lg flex items-center justify-center shadow-sm">
                                                    <span className="text-xs font-bold text-white">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            {user.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    {user.phone && (
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                        user.role
                                                    )}`}
                                                >
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {user.assignedLoansCount || 0} loans
                                                </span>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        <XCircle className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center text-xs text-gray-600">
                                                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors group-hover:scale-110"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors group-hover:scale-110"
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    {user.isActive && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowDeactivateModal(true);
                                                            }}
                                                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110"
                                                            title="Deactivate"
                                                        >
                                                            <UserX className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
                                        to{" "}
                                        <span className="font-semibold">
                                            {Math.min(endIndex, totalItems)}
                                        </span>{" "}
                                        of <span className="font-semibold">{totalItems}</span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
                                                            ? "bg-[#5B7FA2] text-white shadow-sm"
                                                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {showDetailsModal && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}
            {showEditModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}
            {showDeactivateModal && selectedUser && (
                <DeactivateUserModal
                    user={selectedUser}
                    onClose={() => {
                        setShowDeactivateModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </div>
    );
}