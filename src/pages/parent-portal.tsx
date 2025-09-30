import { AppShell, Section } from "../components/app-shell"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Separator } from "../components/ui/separator"
import { useRBAC } from "../contexts/rbac"
import {
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Camera,
  FileText,
  Star,
  Phone,
  User,
  Activity,
  BookOpen,
  Utensils,
  Moon,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react"

export default function ParentPortal() {
  const { can } = useRBAC()

  if (!can("view:parent-portal")) {
    return (
      <AppShell title="Parent Portal">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500">You don't have permission to view the parent portal.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Parent Portal">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Animated decorative elements */}
          <div className="absolute top-6 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-xl animate-bounce" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-lg animate-pulse delay-1000" />

          <div className="relative z-10 p-8 md:p-12 text-white">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-20 w-20 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-bounce">
                <Heart className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                  Welcome back, Michael!
                </h1>
                <p className="mt-3 text-xl text-emerald-50/90 font-medium">Here's what's happening with Emma today</p>
                <div className="flex items-center gap-6 mt-4 text-emerald-100/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium">Great Day!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium">4 Activities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-300" />
                    <span className="text-sm font-medium">Excellent Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10"></div>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Check-in Time</p>
                <p className="text-lg font-bold text-emerald-600">8:15 AM</p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-10"></div>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 p-3 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Activities</p>
                <p className="text-lg font-bold text-teal-600">4 completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-10"></div>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-3 shadow-lg">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Meals</p>
                <p className="text-lg font-bold text-amber-600">Lunch eaten</p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Nap Time</p>
                <p className="text-lg font-bold text-indigo-600">1.5 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Report */}
            <Section title="Today's Report" description="Emma's daily activities and progress">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      EB
                    </div>
                    <div>
                      <h3 className="font-semibold">Emma Brown</h3>
                      <p className="text-sm text-neutral-500">Room: Sunshine Class</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  >
                    ⭐ Great Day!
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:shadow-md transition-all duration-200">
                    <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-2 mt-0.5 shadow-lg">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Learning Activities</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        Emma participated in story time and practiced writing letters. She showed great focus during art
                        class.
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 font-medium">10:30 AM</span>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-md transition-all duration-200">
                    <div className="rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 p-2 mt-0.5 shadow-lg">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Lunch Time</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        Ate most of her sandwich and all of her fruit. Tried new vegetables today!
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 font-medium">12:00 PM</span>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-md transition-all duration-200">
                    <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2 mt-0.5 shadow-lg">
                      <Moon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Rest Time</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        Had a peaceful nap for 1.5 hours. Woke up refreshed and ready to play.
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 font-medium">1:00 PM</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Photos & Memories */}
            <Section title="Today's Photos" description="Special moments captured throughout the day">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="relative group cursor-pointer">
                    <img
                      src={`/galerie.jpg`}
                      alt={`Activity photo ${i}`}
                      className="aspect-square rounded-xl object-cover transition-transform group-hover:scale-105 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                    <Camera className="absolute top-2 right-2 h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent border-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
              >
                <Camera className="mr-2 h-4 w-4" />
                View All Photos
              </Button>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Section title="Quick Actions">
              <div className="space-y-3">
                <Button
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                  variant="default"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Teacher
                </Button>
                <Button
                  className="w-full justify-start bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                  variant="default"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  variant="default"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button
                  className="w-full justify-start bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                  variant="default"
                >
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </div>
            </Section>

            {/* Upcoming Events */}
            <Section title="Upcoming Events">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:shadow-md transition-all duration-200">
                  <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-2 mt-0.5 shadow-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Parent-Teacher Conference</p>
                    <p className="text-xs text-neutral-600 mt-1">Tomorrow, 3:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-md transition-all duration-200">
                  <div className="rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 p-2 mt-0.5 shadow-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Spring Festival</p>
                    <p className="text-xs text-neutral-600 mt-1">Friday, 10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-md transition-all duration-200">
                  <div className="rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-2 mt-0.5 shadow-lg">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Picture Day</p>
                    <p className="text-xs text-neutral-600 mt-1">Next Monday</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Teacher Contact */}
            <Section title="Emma's Teacher">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ms. Sarah Johnson</p>
                    <p className="text-sm text-neutral-500">Lead Teacher</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                  >
                    <MessageCircle className="mr-2 h-3 w-3" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent border-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
                  >
                    <Phone className="mr-2 h-3 w-3" />
                    Call Teacher
                  </Button>
                </div>
              </div>
            </Section>

            {/* Development Progress */}
            <Section title="Development Progress">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span>Social Skills</span>
                    <span className="text-emerald-600">85%</span>
                  </div>
                  <Progress value={85} className="h-3 bg-gray-200" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span>Language Development</span>
                    <span className="text-blue-600">78%</span>
                  </div>
                  <Progress value={78} className="h-3 bg-gray-200" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span>Motor Skills</span>
                    <span className="text-purple-600">92%</span>
                  </div>
                  <Progress value={92} className="h-3 bg-gray-200" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span>Creative Expression</span>
                    <span className="text-pink-600">88%</span>
                  </div>
                  <Progress value={88} className="h-3 bg-gray-200" />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
