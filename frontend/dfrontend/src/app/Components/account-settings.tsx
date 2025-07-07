import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Shield, Key } from "lucide-react"

export function AccountSettings() {
  return (
    <Card className="border-l-4 border-l-orange-500 shadow-lg">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account security and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </h4>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
          </div>

          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            Update Password
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4" />
            Two-Factor Authentication
          </h4>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-sm">2FA is enabled</p>
              <p className="text-sm text-muted-foreground">Your account is protected with two-factor authentication</p>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
