// @ts-nocheck

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Shield,
  Database,
  TrendingUp,
  FileText,
  Activity
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/system-owner",
    icon: BarChart3,
  },
  {
    title: "Organizations",
    icon: Building2,
    subItems: [
      { title: "All Organizations", href: "/dashboard/system-owner/organizations" },
      { title: "Create Organization", href: "/dashboard/system-owner/organizations/create" },
      { title: "Organization Analytics", href: "/dashboard/system-owner/organizations/analytics" },
    ]
  },
  {
    title: "System Analytics",
    icon: TrendingUp,
    subItems: [
      { title: "Usage Statistics", href: "/dashboard/system-owner/analytics/usage" },
      { title: "Performance Reports", href: "/dashboard/system-owner/analytics/performance" },
      { title: "System Health", href: "/dashboard/system-owner/analytics/health" },
    ]
  },
  {
    title: "Data Management",
    icon: Database,
    subItems: [
      { title: "Data Overview", href: "/dashboard/system-owner/data" },
      { title: "Backup & Recovery", href: "/dashboard/system-owner/data/backup" },
      { title: "Data Migration", href: "/dashboard/system-owner/data/migration" },
    ]
  },
  {
    title: "Security Center",
    icon: Shield,
    subItems: [
      { title: "Security Overview", href: "/dashboard/system-owner/security" },
      { title: "Audit Logs", href: "/system-owner/security/logs" },
      { title: "Compliance Reports", href: "/dashboard/system-owner/security/compliance" },
    ]
  },
  {
    title: "Reports",
    icon: FileText,
    subItems: [
      { title: "System Reports", href: "/dashboard/system-owner/reports" },
      { title: "Organization Reports", href: "/dashboard/system-owner/reports/organizations" },
      { title: "Custom Reports", href: "/dashboard/system-owner/reports/custom" },
    ]
  },
  {
    title: "Settings",
    href: "/dashboard/system-owner/settings",
    icon: Settings,
  },
]

export default function SystemOwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

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

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "system_owner") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

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

const [hydrated, setHydrated] = useState(false)

useEffect(() => {
  setHydrated(true)
}, [])

if (!hydrated) {
  return null // Render nothing until client hydration finishes
}

if (!isAuthenticated || user?.role !== "system_owner") {
  router.push("/login")
  return null
}
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-blue-200/30 dark:border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hover:bg-blue-100 dark:hover:bg-gray-800 shadow-sm"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-300 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                System Owner Dashboard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Master Control Panel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-blue-100 dark:hover:bg-gray-700"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">5</span>
              </div>
            </Button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-gray-700"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium">{user?.name || 'System Owner'}</span>
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
                <div className="py-2">
                  <Link href="/system-owner/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
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
          className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-blue-200/30 dark:border-gray-700/50 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-blue-200/30 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                  LoanTech Pro
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">System Administration</p>
              </div>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="hover:bg-blue-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
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
                      <div className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 cursor-pointer">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                          <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="group w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                            <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <div className={`transition-transform duration-200 ${expandedItem === item.title ? 'rotate-90' : ''}`}>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </button>
                      {expandedItem === item.title && item.subItems && (
                        <div className="ml-10 space-y-1 animate-slide-in-up">
                          {item.subItems.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href} onClick={closeSidebar}>
                              <div className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-25 hover:to-blue-50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 group-hover:scale-125 transition-transform" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {subItem.title}
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
          </nav>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/70 via-blue-50/50 to-blue-100/30 dark:from-gray-900/70 dark:via-gray-800/50 dark:to-gray-900/30">
          <div className="p-6 animate-fade-in-scale">
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
          background: rgba(59, 130, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
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