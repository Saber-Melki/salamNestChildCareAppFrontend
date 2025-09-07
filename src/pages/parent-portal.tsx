import { AppShell, Section } from "../components/app-shell"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
// Update the import path below if the Avatar component is located elsewhere
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
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 p-6 text-white">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-balance">Welcome back, Michael!</h1>
            <p className="mt-2 text-white/90">Here's what's happening with Emma today</p>
          </div>
          <div className="absolute right-4 top-4 opacity-20">
            <Heart className="h-16 w-16" />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-emerald-100 p-2">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Check-in Time</p>
                <p className="text-xs text-neutral-500">8:15 AM</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-teal-100 p-2">
                <Activity className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Activities</p>
                <p className="text-xs text-neutral-500">4 completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-amber-100 p-2">
                <Utensils className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Meals</p>
                <p className="text-xs text-neutral-500">Lunch eaten</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-indigo-100 p-2">
                <Moon className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Nap Time</p>
                <p className="text-xs text-neutral-500">1.5 hours</p>
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
                    {/* <Avatar className="h-12 w-12">
                      <AvatarImage src="/happy-child.png" />
                      <AvatarFallback>EB</AvatarFallback>
                    </Avatar> */}
                    <div>
                      <h3 className="font-semibold">Emma Brown</h3>
                      <p className="text-sm text-neutral-500">Room: Sunshine Class</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Great Day!
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                      <BookOpen className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Learning Activities</p>
                      <p className="text-xs text-neutral-500">
                        Emma participated in story time and practiced writing letters. She showed great focus during art
                        class.
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500">10:30 AM</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-teal-100 p-1.5 mt-0.5">
                      <Utensils className="h-3 w-3 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lunch Time</p>
                      <p className="text-xs text-neutral-500">
                        Ate most of her sandwich and all of her fruit. Tried new vegetables today!
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500">12:00 PM</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-indigo-100 p-1.5 mt-0.5">
                      <Moon className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Rest Time</p>
                      <p className="text-xs text-neutral-500">
                        Had a peaceful nap for 1.5 hours. Woke up refreshed and ready to play.
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500">1:00 PM</span>
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
                      className="aspect-square rounded-lg object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                    <Camera className="absolute top-2 right-2 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
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
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Teacher
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </div>
            </Section>

            {/* Upcoming Events */}
            <Section title="Upcoming Events">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50">
                  <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                    <Calendar className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Parent-Teacher Conference</p>
                    <p className="text-xs text-neutral-500">Tomorrow, 3:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50">
                  <div className="rounded-full bg-teal-100 p-1.5 mt-0.5">
                    <Star className="h-3 w-3 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Spring Festival</p>
                    <p className="text-xs text-neutral-500">Friday, 10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50">
                  <div className="rounded-full bg-amber-100 p-1.5 mt-0.5">
                    <Camera className="h-3 w-3 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Picture Day</p>
                    <p className="text-xs text-neutral-500">Next Monday</p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Teacher Contact */}
            <Section title="Emma's Teacher">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {/* <Avatar>
                    <AvatarImage src="/teacher-woman.png" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar> */}
                  <div>
                    <p className="font-medium">Ms. Sarah Johnson</p>
                    <p className="text-sm text-neutral-500">Lead Teacher</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <MessageCircle className="mr-2 h-3 w-3" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
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
                  <div className="flex justify-between text-sm mb-2">
                    <span>Social Skills</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Language Development</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Motor Skills</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Creative Expression</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
