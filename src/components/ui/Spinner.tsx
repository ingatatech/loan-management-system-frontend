import React from "react"

function Spinner({ size = "md", color = "green" }: { size?: "sm" | "md" | "lg"; color?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-4",
    lg: "h-8 w-8 border-4",
  }

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-${color} ${sizeClasses[size]} border-solid`}
      role="status"
      aria-label="Loading"
    ></div>
  )
}

export default Spinner