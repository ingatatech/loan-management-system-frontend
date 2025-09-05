"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, FileText, BarChart3, Calculator, Users, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Portfolio overview and analytics",
  },
  {
    name: "Applications",
    href: "/applications",
    icon: FileText,
    description: "Loan applications management",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: BarChart3,
    description: "Portfolio dashboard and reports",
  },
  {
    name: "Calculator",
    href: "/calculator",
    icon: Calculator,
    description: "Loan calculator and schedules",
  },
  {
    name: "Loans",
    href: "/loans",
    icon: Users,
    description: "Active loans management",
  },
]

interface NavigationProps {
  className?: string
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const router = useRouter()
  const pathname = usePathname()

  const NavigationContent = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
            onClick={() => router.push(item.href)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop Navigation */}
      <div className={cn("hidden md:block", className)}>
        <div className="space-y-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Loan Management</h2>
            <NavigationContent />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="space-y-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Loan Management</h2>
                <NavigationContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

export default Navigation
