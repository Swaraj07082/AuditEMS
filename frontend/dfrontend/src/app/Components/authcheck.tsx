"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, Clock, UserIcon } from "lucide-react";

export default function AuthCheck() {
  // const [user, setUser] = useState<User | null>(null)
  // const [loading, setLoading] = useState(true)
  const router = useRouter();

  // useEffect(() => {
  //   checkAuthStatus()
  // }, [])

  // const checkAuthStatus = () => {
  //   try {
  //     // Check if user is logged in (this would typically be a real auth check)
  //     const userData = localStorage.getItem("user")
  //     if (userData) {
  //       const parsedUser = JSON.parse(userData)
  //       setUser(parsedUser)
  //     }
  //   } catch (error) {
  //     console.error("Error checking auth status:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const handleLogout = () => {
  //   localStorage.removeItem("user")
  //   setUser(null)
  //   router.push("/login")
  // }

  // const goToLogin = () => {
  //   router.push("/login")
  // }

  // const goToSignup = () => {
  //   router.push("/signup")
  // }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Not logged in
          </CardTitle>
          <CardDescription>
            Please sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              <UserIcon className="w-3 h-3 mr-1" />
              Not Authenticated
            </Badge>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => {
                router.push("/login");
              }}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                router.push("/signup");
              }}
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
