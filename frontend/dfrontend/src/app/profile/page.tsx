import { ProfileHeader } from "../Components/profile-header"
import { ProfileSettings } from "../Components/profile-settings"
import { AccountSettings } from "../Components/account-settings"
import { ActivityFeed } from "../Components/activity-feed"
import { ProfileStats } from "../Components/profile-stats"
import { QuickActions } from "../Components/quick-actions"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="grid gap-8">
          <ProfileHeader />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ProfileSettings />
              <AccountSettings />
            </div>

            <div className="space-y-8">
              <ActivityFeed />
              <ProfileStats />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
