import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Star } from "lucide-react"

export function ProfileStats() {
  return (
    <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">24</div>
            <div className="text-sm opacity-90">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">1.2k</div>
            <div className="text-sm opacity-90">Views</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Storage Used</span>
              <span>2.4GB / 5GB</span>
            </div>
            <Progress value={48} className="bg-white/20" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Uploads</span>
              <span>18 / 25</span>
            </div>
            <Progress value={72} className="bg-white/20" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/20">
          <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
          <span className="text-sm">Pro Member since March 2024</span>
        </div>
      </CardContent>
    </Card>
  )
}
