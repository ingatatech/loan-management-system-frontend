"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import {
  Building2,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText,
  TrendingUp,
  CreditCard,
  UserCheck,
  UserCog,
  Shield,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const getSidebarItems = (userRole: string) => {
  const allSidebarItems = [
    // Dashboard - All roles
    {
      title: "Dashboard",
      href: "/dashboard/client",
      icon: BarChart3,
      roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"],
    },

    // Organization Profile - CLIENT only
    {
      title: "Organization Profile",
      icon: Building2,
      roles: ["client"],
      subItems: [
        { 
          title: "Organization Info", 
          href: "/dashboard/client/organization/profile",
          roles: ["client"]
        },
      ]
    },

    // User Management - CLIENT only
    {
      title: "User Management",
      icon: UserCog,
      roles: ["client"],
      subItems: [

        { 
          title: "Create User", 
          href: "/dashboard/client/users/create",
          roles: ["client"]
        },
        { 
          title: "All Users", 
          href: "/dashboard/client/users",
          roles: ["client"]
        }
      ]
    },

    // Shareholders - CLIENT and Management
    {
      title: "Shareholders",
      icon: Users,
      roles: ["client", "board_director", "senior_manager", "managing_director"],
      subItems: [

        { 
          title: "Create Shareholder", 
          href: "/dashboard/client/shareholders/create",
          roles: ["client"]
        },
        { 
          title: "Manage Shareholders", 
          href: "/dashboard/client/shareholders",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
      ]
    },

    // Funding Structure - All roles with different access
    {
      title: "Funding Structure",
      icon: DollarSign,
      roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"],
      subItems: [
        { 
          title: "Funding Overview", 
          href: "/dashboard/client/funding",
          roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"]
        }
      ]
    },

    // Management Team - CLIENT and Management
    {
      title: "Management Team",
      icon: UserCheck,
      roles: ["client", "board_director", "senior_manager", "managing_director"],
      subItems: [
        { 
          title: "Create Board Director", 
          href: "/dashboard/client/management/board-directors/create",
          roles: ["client"]
        },
        { 
          title: "Board Directors", 
          href: "/dashboard/client/management/board-directors",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
        { 
          title: "Create Senior Management", 
          href: "/dashboard/client/management/senior-management/create",
          roles: ["client"]
        },
        { 
          title: "Senior Management", 
          href: "/dashboard/client/management/senior-management",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
      ]
    },

    // Loan Applications - All roles with different permissions
    {
      title: "Loan Applications",
      icon: CreditCard,
      roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"],
      subItems: [
        { 
          title: "Create Loan Application", 
          href: "/dashboard/client/loanapplication/create",
          roles: ["client", "loan_officer"]
        },
        { 
          title: "Loan Applications Pending Review", 
          href: "/dashboard/client/loanmanagement/pendingLoan",
          roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"]
        },
        { 
          title: "My Assigned Loans", 
          href: "/dashboard/client/loanmanagement/my-assigned",
          roles: ["board_director", "senior_manager", "managing_director", "loan_officer"]
        },
        { 
          title: "All Loan Applications", 
          href: "/dashboard/client/loanmanagement",
          roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"]
        },
      ]
    },

    // Loan Management - All roles with different access
    {
      title: "Loan Management",
      icon: ClipboardList,
      roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"],
      subItems: [
        { 
          title: "Loan Payment", 
          href: "/dashboard/client/loanmanagement",
          roles: ["client"]
        },
        { 
          title: "Report & Analytics", 
          href: "/dashboard/client/loanmanagement/report",
          roles: ["client", "board_director", "senior_manager", "managing_director", "loan_officer"]
        }
      ]
    },

    // Borrower Management - CLIENT and Loan Officers
    {
      title: "Borrower",
      icon: Users,
      roles: ["client", "loan_officer"],
      subItems: [
        { 
          title: "New Borrower", 
          href: "/dashboard/client/borrower/create",
          roles: ["client", "loan_officer"]
        },
        { 
          title: "Manage Borrowers", 
          href: "/dashboard/client/borrower",
          roles: ["client", "loan_officer"]
        },
        { 
          title: "Borrower Analytics", 
          href: "/dashboard/client/borrower/analytics",
          roles: ["client"]
        },
      ]
    },

    // // Documents - CLIENT only
    // {
    //   title: "Documents",
    //   icon: FileText,
    //   roles: ["client"],
    //   subItems: [
    //     { 
    //       title: "Legal Documents", 
    //       href: "/dashboard/client/documents/legal",
    //       roles: ["client"]
    //     },
    //     { 
    //       title: "Financial Records", 
    //       href: "/dashboard/client/documents/financial",
    //       roles: ["client"]
    //     },
    //     { 
    //       title: "Compliance Files", 
    //       href: "/dashboard/client/documents/compliance",
    //       roles: ["client"]
    //     },
    //     { 
    //       title: "Upload Center", 
    //       href: "/dashboard/client/documents/upload",
    //       roles: ["client"]
    //     },
    //   ]
    // },

    // // Reports & Analytics - CLIENT and Management
    // {
    //   title: "Reports & Analytics",
    //   icon: TrendingUp,
    //   roles: ["client", "board_director", "senior_manager", "managing_director"],
    //   subItems: [
    //     { 
    //       title: "Portfolio Summary", 
    //       href: "/dashboard/client/reports/portfolio",
    //       roles: ["client", "board_director", "senior_manager", "managing_director"]
    //     },
    //     { 
    //       title: "Loan Statistics", 
    //       href: "/dashboard/client/reports/statistics",
    //       roles: ["client", "board_director", "senior_manager", "managing_director"]
    //     },
    //     { 
    //       title: "User Performance", 
    //       href: "/dashboard/client/reports/users",
    //       roles: ["client"]
    //     },
    //     { 
    //       title: "Risk Assessment", 
    //       href: "/dashboard/client/reports/risk",
    //       roles: ["client", "board_director", "senior_manager", "managing_director"]
    //     },
    //   ]
    // },

        {
      title: "CRB",
      icon: TrendingUp,
      roles: ["client", "board_director", "senior_manager", "managing_director"],
      subItems: [
        { 
          title: "ShareHolder Information", 
          href: "/dashboard/client/shareholder",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
        { 
          title: "Customer Information", 
          href: "/dashboard/client/customer",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
        { 
          title: "Board of Directors", 
          href: "/dashboard/client/boarddirector",
          roles: ["client", "board_director", "senior_manager", "managing_director"]

        },
        { 
          title: "Guarantor information ", 
          href: "/dashboard/client/guarantor ",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
          { 
          title: "Loan Collaterals", 
          href: "/dashboard/client/collaterals ",
          roles: ["client", "board_director", "senior_manager", "managing_director"]
        },
        {
          title: "bounced Cheque",
          href :"/dashboard/client/bouncedCheque",
          roles: ["client", "board_director", "senior_manager", "managing_director"]


        }
      ]
    },
    // // Settings - CLIENT only
    // {
    //   title: "Settings",
    //   href: "/dashboard/client/settings",
    //   icon: Settings,
    //   roles: ["client"],
    // },
  ]

  // Enhanced filtering with nested subitem validation and role-based access
  return allSidebarItems
    .filter(item => item.roles.includes(userRole))
    .map(item => {
      if (item.subItems) {
        // Filter subItems based on user role
        const filteredSubItems = item.subItems.filter(subItem => 
          subItem.roles.includes(userRole)
        )
        
        // Return item with filtered subItems
        return {
          ...item,
          subItems: filteredSubItems
        }
      }
      return item
    })
    // Remove top-level items that have no visible subItems
    .filter(item => !item.subItems || item.subItems.length > 0)
}

// Enhanced role validation hook
const useRoleValidation = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  
  // ✅ FIXED: Use correct role values
  const isClient = user?.role === "client"
  const isBoardDirector = user?.role === "board_director"
  const isSeniorManager = user?.role === "senior_manager"
  const isManagingDirector = user?.role === "managing_director"
  const isLoanOfficer = user?.role === "loan_officer"
  
  // Group management roles for easier checking
  const isManager = isBoardDirector || isSeniorManager || isManagingDirector
  const hasValidRole = isClient || isManager || isLoanOfficer
  
  // Enhanced permission checking
  const canAccess = (requiredRole: string | string[]) => {
    if (!user) return false
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }
    return user.role === requiredRole
  }

  // Role-based permissions
  const permissions = {
    canManageUsers: isClient,
    canManageOrganization: isClient,
    canReviewLoans: isClient || isManager,
    canCreateLoans: isClient || isLoanOfficer,
    canViewReports: isClient || isManager,
    canManageBorrowers: isClient || isLoanOfficer,
    canAccessDocuments: isClient,
    canChangeSettings: isClient,
  }

  return {
    user,
    isAuthenticated,
    isClient,
    isBoardDirector,
    isSeniorManager,
    isManagingDirector,
    isLoanOfficer,
    isManager,
    hasValidRole,
    canAccess,
    permissions
  }
}

// ✅ FIXED: Get role-specific display information
const getRoleDisplayInfo = (user: any) => {
  if (!user) return { label: "User", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
  
  switch (user.role) {
    case "client":
      return { label: "Client", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
    case "board_director":
      return { label: "Board Director", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
    case "senior_manager":
      return { label: "Senior Manager", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
    case "managing_director":
      return { label: "Managing Director", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
    case "loan_officer":
      return { label: "Loan Officer", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
    default:
      return { label: "User", color: "bg-[#5B7FA2]", badgeColor: "bg-white text-gray-700" }
  }
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [hydrated, setHydrated] = useState(false)
  // ✅ FIXED: Removed isStaff from destructuring
  const { user, isAuthenticated, isClient, isBoardDirector, isSeniorManager, isManagingDirector, isLoanOfficer, isManager, hasValidRole, canAccess, permissions } = useRoleValidation()
  const { currentOrganization } = useAppSelector((state) => state.organizations)
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Get role-based sidebar items with proper filtering
  const sidebarItems = user ? getSidebarItems(user.role) : []

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Enhanced authentication and role validation
  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      
      if (!hasValidRole) {
        router.push("/unauthorized")
        return
      }
    }
  }, [isAuthenticated, hasValidRole, hydrated, router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    }
    router.push("/login")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleExpanded = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  // ✅ FIXED: Pass user to the function
  const roleInfo = getRoleDisplayInfo(user)
  const displayName = user?.username || user?.email?.split('@')[0] || 'User'

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B7FA2]"></div>
      </div>
    )
  }

  if (!isAuthenticated || !hasValidRole) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hover:bg-[#5B7FA2]/10"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-700">
                {currentOrganization?.name || 'Organization'} Portal
              </h2>
              <p className="text-sm text-gray-600">
                {roleInfo.label} Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-[#5B7FA2]/10"
            >
              <Bell className="h-4 w-4 text-gray-700" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5B7FA2] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </div>
            </Button>

            {/* Role Badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 ${roleInfo.badgeColor} rounded-full border border-gray-300`}>
              <Shield className="w-3 h-3 text-gray-700" />
              <span className="text-xs font-medium">{roleInfo.label}</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 hover:bg-[#5B7FA2]/10"
              >
                <div className={`w-8 h-8 ${roleInfo.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-sm font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-sm font-medium block text-gray-700">{displayName}</span>
                  <span className="text-xs text-gray-600">{roleInfo.label}</span>
                </div>
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-gray-600 border-b border-gray-100">
                    Signed in as <span className="font-medium">{displayName}</span>
                  </div>
                  
                  <Link 
                    href="/dashboard/client/profile" 
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#5B7FA2]/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-700" />
                    Profile Settings
                  </Link>
                  
                  {permissions.canManageOrganization && (
                    <Link 
                      href="/dashboard/client/organization/profile" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#5B7FA2]/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-gray-700" />
                      Organization
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <aside
          className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-[#5B7FA2]/10 to-[#5B7FA2]/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 ${roleInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-700">
                  LoanTech Pro
                </h1>
                <p className="text-xs text-gray-600">
                  {roleInfo.label} Portal
                  {!isClient && " (Restricted Access)"}
                </p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="hover:bg-[#5B7FA2]/10"
              >
                <X className="h-4 w-4 text-gray-700" />
              </Button>
            )}
          </div>

          {/* Scrollable Sidebar Content */}
          <nav className="h-[calc(100%-5rem)] overflow-y-auto custom-scrollbar pb-10">
            <div className="p-3 space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="space-y-1">
                  {item.href ? (
                    <Link href={item.href} onClick={closeSidebar}>
                      <div className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#5B7FA2]/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-[#5B7FA2]/20">
                        <div className={`p-2 rounded-lg bg-[#5B7FA2]/10 group-hover:bg-[#5B7FA2]/20 transition-all duration-200`}>
                          <item.icon className={`h-5 w-5 text-gray-700`} />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="group w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#5B7FA2]/10 transition-all duration-200 border border-transparent hover:border-[#5B7FA2]/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-[#5B7FA2]/10 group-hover:bg-[#5B7FA2]/20 transition-all duration-200`}>
                            <item.icon className={`h-5 w-5 text-gray-700`} />
                          </div>
                          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <div className={`transition-transform duration-200 ${expandedItem === item.title ? 'rotate-90' : ''}`}>
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        </div>
                      </button>
                      {expandedItem === item.title && item.subItems && (
                        <div className="ml-10 space-y-1 animate-slide-in-up">
                          {item.subItems.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href} onClick={closeSidebar}>
                              <div className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#5B7FA2]/10 transition-all duration-200 cursor-pointer">
                                <div className={`w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:scale-125 transition-transform`} />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                                  {subItem.title}
                                  {!isClient && subItem.roles.length === 1 && !subItem.roles.includes("client") && (
                                    <span className="ml-1 text-xs text-gray-500">(View)</span>
                                  )}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Role Information Footer */}
            <div className="p-4 border-t border-gray-200 mt-4">
              <div className="bg-gradient-to-r from-[#5B7FA2]/10 to-[#5B7FA2]/5 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Role Permissions</span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  {isClient && (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Full System Access</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>User Management</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Organization Settings</span>
                      </div>
                    </>
                  )}
                  {isManager && (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Loan Review & Approval</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Team Management</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Reports & Analytics</span>
                      </div>
                    </>
                  )}
                  {/* ✅ FIXED: Use isLoanOfficer instead of isStaff */}
                  {isLoanOfficer && (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Loan Processing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Borrower Management</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Initial Loan Review</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 animate-fade-in-scale">
            {/* Role-based welcome message */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-700">
                Welcome back, {displayName}!
              </h1>
              <p className="text-gray-600 mt-1">
                {isClient && "You have full administrative access to manage your organization."}
                {isManager && "You can review loans, manage your team, and access reports."}
                {/* ✅ FIXED: Use isLoanOfficer instead of isStaff */}
                {isLoanOfficer && "You can process loans, manage borrowers, and perform initial reviews."}
              </p>
            </div>
            
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(91, 127, 162, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(91, 127, 162, 0.5);
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}