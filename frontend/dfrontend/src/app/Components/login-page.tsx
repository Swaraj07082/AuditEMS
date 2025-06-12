"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"


export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false) // toggle between sign in and sign up

  // Shared form data state for both forms
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleRememberMeChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  // Validation for Sign In
  const validateSignIn = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validation for Sign Up
  const validateSignUp = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Sign In submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateSignIn()) return

  setIsLoading(true)
  const res = await signIn("credentials", {
    redirect: false,
    email: formData.email,
    password: formData.password,
  })
  setIsLoading(false)

  if (res?.error) {
    setErrors({ password: "Invalid email or password" })
  } else {
    router.push("/auditVerify")
  }
}


  // Handle Sign Up submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSignUp()) return

    setIsLoading(true)
    // Simulate sign up API call
    setTimeout(() => {
      setIsLoading(false)
      // After sign up, redirect or switch to sign in
      setIsSignUp(false)
      alert("Account created successfully! Please sign in.")
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Link */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="flex items-center text-sm text-muted-foreground hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Audit Management System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-muted-foreground">
            {isSignUp
              ? "Sign up to create a new account"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant={isSignUp ? "ghost" : "default"}
            onClick={() => {
              setIsSignUp(false)
              setErrors({})
              setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
            }}
          >
            Sign In
          </Button>
          <Button
            variant={isSignUp ? "default" : "ghost"}
            onClick={() => {
              setIsSignUp(true)
              setErrors({})
              setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
            }}
          >
            Sign Up
          </Button>
        </div>

        {/* Card with Sign In or Sign Up Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp
                ? "Create your account to access the audit management dashboard"
                : "Enter your credentials to access your audit management dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSignUp ? (
              // Sign In Form
              <form onSubmit={handleSignInSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={formData.rememberMe} onCheckedChange={handleRememberMeChange} />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                  <Link href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              // Sign Up Form
              <form onSubmit={handleSignUpSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            )}

            {/* Separator and social buttons remain the same */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                {/* Google SVG icon */}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  {/* SVG paths */}
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                {/* Microsoft SVG icon */}
                <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.160 1.219-5.160s-.312-.219-.312-.219c0-1.188.687-2.077 1.542-2.077.728 0 1.080.219 1.080 1.188 0 .728-.219 1.542-.219 2.286-.219.937.219 1.542 1.188 1.542 1.417 0 2.286-1.542 2.286-3.439 0-1.417-1.080-2.286-2.286-2.286-1.542 0-2.286 1.080-2.286 2.286 0 .219 0 .437.219.656-.219.219-.437.219-.656.219-.219 0-.437-.219-.437-.437 0-.219 0-.437.219-.656-.437-.219-.656-.656-.656-1.188 0-1.417 1.080-2.286 2.286-2.286 1.542 0 2.286 1.080 2.286 2.286 0 1.417-.656 2.286-1.542 2.286-.437 0-.656-.219-.656-.656 0-.219.219-.437.219-.656 0-.219-.219-.437-.437-.437-.219 0-.437.219-.437.437 0 .656.437 1.188 1.080 1.188.656 0 1.188-.437 1.188-1.188 0-1.417-1.080-2.286-2.286-2.286z" />
                </svg>
                Microsoft
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Up / Sign In footer link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setErrors({})
                    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true)
                    setErrors({})
                    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up for free
                </button>
              </>
            )}
          </p>
        </div>

        {/* Demo Credentials */}
        
        <Card className="border-dashed border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-blue-800">Demo Credentials</p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>Email: demo@auditmanagement.com</p>
                <p>Password: demo123</p>
              </div>
              <p className="text-xs text-blue-500">Use these credentials to try the demo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
