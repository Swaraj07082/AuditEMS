"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, UserIcon } from "lucide-react";

export default function LoggedIn() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            You are logged in!
          </CardTitle>
          <CardDescription>Welcome back to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <UserIcon className="w-3 h-3 mr-1" />
              Authenticated
            </Badge>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => router.push("/dashboard")}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() =>
              signOut({
                callbackUrl: "/login", // Redirect after signout
              })
            }
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}