import React from "react";
import { HTMLAttributes, ReactNode } from "react"

interface BaseProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export function Card({ className = "", ...props }: BaseProps) {
    return (
      <div 
        className={`rounded-lg border shadow-sm ${className}`}
        {...props} 
      />
    )
  }
  
  export function CardHeader({ className = "", ...props }: BaseProps) {
    return (
      <div 
        className={`p-6 pb-4 ${className}`}
        {...props}
      />
    )
  }
  
  export function CardTitle({ className = "", ...props }: BaseProps) {
    return (
      <h3 
        className={`text-lg font-semibold ${className}`}
        {...props}
      />
    )
  }
  
  export function CardContent({ className = "", ...props }: BaseProps) {
    return (
      <div 
        className={`p-6 pt-0 ${className}`}
        {...props}
      />
    )
  }

  export function CardDescription({ className = "", ...props }: BaseProps) {
    return (
      <div 
        className={`p-6 pt-0 ${className}`}
        {...props}
      />
    )
  }
  export function CardFooter({ className = "", ...props }: BaseProps) {
    return (
      <div 
        className={`p-6 pt-0 ${className}`}
        {...props}
      />
    )
  }