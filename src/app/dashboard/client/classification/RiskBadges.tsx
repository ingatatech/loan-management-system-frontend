"use client"

import type React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, TrendingDown, Eye, XCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoanStatus } from "@/lib/features/repayment/loanClassificationSlice"

interface RiskBadgesProps {
  status: LoanStatus
  daysInArrears?: number
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  animated?: boolean
  className?: string
}

const RiskBadges: React.FC<RiskBadgesProps> = ({
  status,
  daysInArrears = 0,
  size = "md",
  showIcon = true,
  animated = false,
  className = "",
}) => {
  const getStatusConfig = (status: LoanStatus) => {
    const configs = {
      [LoanStatus.PERFORMING]: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
        label: "Performing",
        description: "Payments are current",
        gradient: "from-green-50 to-green-100",
      },
      [LoanStatus.WATCH]: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Eye,
        label: "Watch",
        description: "Requires monitoring",
        gradient: "from-yellow-50 to-yellow-100",
      },
      [LoanStatus.SUBSTANDARD]: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertTriangle,
        label: "Substandard",
        description: "Payment difficulties",
        gradient: "from-orange-50 to-orange-100",
      },
      [LoanStatus.DOUBTFUL]: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: TrendingDown,
        label: "Doubtful",
        description: "High risk of loss",
        gradient: "from-red-50 to-red-100",
      },
      [LoanStatus.LOSS]: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
        label: "Loss",
        description: "Uncollectible",
        gradient: "from-gray-50 to-gray-100",
      },
    }

    return configs[status]
  }

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: "text-xs px-2 py-1",
      md: "text-sm px-3 py-1.5",
      lg: "text-base px-4 py-2",
    }
    return sizes[size as keyof typeof sizes]
  }

  const getIconSize = (size: string) => {
    const sizes = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    }
    return sizes[size as keyof typeof sizes]
  }

  const config = getStatusConfig(status)
  const IconComponent = config.icon
  const sizeClasses = getSizeClasses(size)
  const iconSize = getIconSize(size)

  const BadgeContent = (
    <Badge className={`${config.color} border flex items-center space-x-1 ${sizeClasses} ${className}`}>
      {showIcon && <IconComponent className={iconSize} />}
      <span className="font-medium">{config.label}</span>
      {daysInArrears > 0 && size !== "sm" && <span className="ml-1 text-xs opacity-75">({daysInArrears}d)</span>}
    </Badge>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {BadgeContent}
      </motion.div>
    )
  }

  return BadgeContent
}

export default RiskBadges
