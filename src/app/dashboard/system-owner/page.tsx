// @ts-nocheck

"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchOrganizations, clearError } from "@/lib/features/organizations/organizations-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Users,
  Activity,
  Shield,
  Database,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Plus,
  BarChart3,
  CheckCircle,
  Zap,
  Globe,
  Server,
  UserCheck,
  Eye
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SystemOwnerDashboard() {
  const dispatch = useAppDispatch()
  const { organizations, isLoading, error } = useAppSelector((state) => state.organizations)

  useEffect(() => {
    dispatch(fetchOrganizations({ page: 1, limit: 50 }))
  }, [dispatch])

  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Calculate statistics
  // const activeOrganizations = organizations.filter((org) => org.isActive)
  // const recentOrganizations = organizations
  //   .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  //   .slice(0, 5)

  const stats = [
    {
      title: "Total Organizations",
      value: organizations.length,
      icon: Building2,
      change: "+12%",
      changeType: "positive",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      href: "/system-owner/organizations",
    },
    {
      title: "Active Organizations",
      // value: activeOrganizations.length,
      icon: Activity,
      change: "+8%",
      changeType: "positive",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
      href: "/system-owner/organizations",
    },
    {
      title: "System Health",
      value: "99.9%",
      icon: Shield,
      change: "Excellent",
      changeType: "positive",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      href: "/system-owner/analytics/health",
    },
    {
      title: "Data Storage",
      value: "2.4TB",
      icon: Database,
      change: "+15%",
      changeType: "neutral",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      href: "/system-owner/data",
    },
  ]

  const quickActions = [
    {
      title: "Create Organization",
      description: "Set up a new organization with admin user",
      icon: Building2,
      href: "/system-owner/organizations/create",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      title: "View All Organizations",
      description: "Manage all registered organizations",
      icon: Users,
      href: "/system-owner/organizations",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
    },
    {
      title: "System Analytics",
      description: "View comprehensive system reports",
      icon: BarChart3,
      href: "/system-owner/analytics",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
    {
      title: "Security Center",
      description: "Monitor security and compliance",
      icon: Shield,
      href: "/system-owner/security",
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
    },
  ]

  const systemMetrics = [
    { label: "CPU Usage", value: "45%", status: "good", icon: Server },
    { label: "Memory Usage", value: "62%", status: "good", icon: Database },
    { label: "Network I/O", value: "1.2GB/s", status: "excellent", icon: Globe },
    { label: "Active Sessions", value: "1,247", status: "good", icon: UserCheck },
  ]


  if (isLoading && organizations.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-80" />
          <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-scale">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-900 dark:from-white dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent">
            System Overview
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Multi-tenant platform administration and monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            Live Monitor
          </Button>
          <Link href="/system-owner/organizations/create">
            <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgColor} dark:from-gray-800 dark:to-gray-700 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          stat.changeType === 'positive' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                            : stat.changeType === 'negative'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        } border-0`}
                      >
                        {stat.changeType === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Arrow icon for navigation hint */}
                <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:text-gray-600" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className={`group relative p-6 rounded-xl bg-gradient-to-br ${action.bgColor} dark:from-gray-700 dark:to-gray-600 border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden`}>
                      <div className="flex items-start gap-4 z-10 relative">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-md group-hover:shadow-lg transition-all duration-300`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                        </div>
                      </div>
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Corner arrow */}
                      <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics - Takes 1 column */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
              <Server className="h-5 w-5 text-green-500" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      metric.status === 'excellent' 
                        ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30'
                        : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30'
                    }`}>
                      <metric.icon className={`h-4 w-4 ${
                        metric.status === 'excellent' 
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      metric.status === 'excellent' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    } border-0 font-semibold`}
                  >
                    {metric.value}
                  </Badge>
                </div>
              ))}
              
              {/* Overall Status */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">All Systems Operational</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Last updated: 2 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


        {/* Recent Organizations */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
              <Building2 className="h-5 w-5 text-blue-500" />
              Recent Organizations
            </CardTitle>
            <Link href="/system-owner/organizations">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* {recentOrganizations.length > 0 ? (
                recentOrganizations.map((org) => (
                  <div 
                    key={org.id} 
                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {org.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{org.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {org.selectedCategories?.join(', ') || 'No categories'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          org.isActive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        } border-0`}
                      >
                        {org.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:text-gray-600" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No organizations found</p>
                  <Link href="/system-owner/organizations/create">
                    <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                      Create First Organization
                    </Button>
                  </Link>
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>

</div>
  )
}
          