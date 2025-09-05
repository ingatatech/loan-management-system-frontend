"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { login } from "@/lib/features/auth/user-slice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error
  } else if (typeof error === 'object' && error !== null) {
    return error.message || error.error || JSON.stringify(error)
  }
  return "An unexpected error occurred"
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, requiresPasswordReset, resetEmail } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const resultAction = await dispatch(login({ email, password }))
      
      if (login.fulfilled.match(resultAction)) {
        const userData = resultAction.payload
        
        if (userData.requiresPasswordReset) {
          toast.info("First login detected. Please reset your password.")
          router.push("/reset-password")
          return
        }
        
        if (userData.success && userData.token && userData.data) {
          toast.success("Login successful!")
          
          // ✅ FIXED: Navigate based on user role with correct role values
          const userRole = userData.data.user.role
          
          if (userRole === "system_owner") {
            router.push("/dashboard/system-owner")
          } else if (userRole === "client") {
            router.push("/dashboard/client")
          } else if (
            userRole === "board_director" || 
            userRole === "senior_manager" || 
            userRole === "managing_director"
          ) {
            // Board Directors, Senior Managers, and Managing Directors go to client dashboard
            router.push("/dashboard/client")
          } else if (userRole === "loan_officer") {
            // Loan Officers (previously staff) go to client dashboard
            router.push("/dashboard/client")
          } else {
            // Fallback for any other roles
            router.push("/dashboard")
          }
        }
      } else if (login.rejected.match(resultAction)) {
        let errorMessage = "Login failed"
        if (typeof resultAction.payload === 'string') {
          errorMessage = resultAction.payload
        } else if (typeof resultAction.payload === 'object' && resultAction.payload !== null) {
          const errorObj = resultAction.payload as any
          errorMessage = errorObj.message || errorObj.error || JSON.stringify(errorObj)
        }
        toast.error(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4">
      <div className="w-full max-w-xlg space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              LoanTech Pro
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Multi-Tenant Loan Management System
            </p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-600"></div>
          
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to access your loan management dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{getErrorMessage(error)}</p>
                </div>
              )}

              {requiresPasswordReset && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">
                    First login detected. Please check your email at {resetEmail} to reset your password.
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}