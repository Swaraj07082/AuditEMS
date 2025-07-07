"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-lg">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="John" disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="Doe" disabled={!isEditing} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue="john.doe@example.com" disabled={!isEditing} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            defaultValue="Experienced PDF dashboard administrator with a passion for document management and data visualization."
            disabled={!isEditing}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your documents</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Documents</Label>
                <p className="text-sm text-muted-foreground">Automatically save changes to your PDFs</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsEditing(false)}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
