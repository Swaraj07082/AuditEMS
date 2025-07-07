import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Calendar, Mail } from "lucide-react";

export function ProfileHeader() {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative">
            {/* Profile Image Placeholder */}
            <div className="h-24 w-24 border-4 border-white/20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
              <img
                src="/placeholder.svg?height=96&width=96"
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  const initials = document.createElement('div');
                  initials.className = "text-lg bg-white/20 text-white flex items-center justify-center h-full w-full";
                  initials.innerText = "JD";
                  e.currentTarget.parentNode?.appendChild(initials);
                }}
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="text-white/80">PDF Dashboard Administrator</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                john.doe@example.com
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined March 2024
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300">Pro Plan</Badge>
              <Badge className="bg-green-400 text-green-900 hover:bg-green-300">Verified</Badge>
              <Badge className="bg-blue-400 text-blue-900 hover:bg-blue-300">2FA Enabled</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
