"use client"

import { useState } from "react"
import Image from "next/image"
import { AppShell, Section } from "../components/app-shell"
import { Require } from "../components/rbac"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { PageHero, StatCard } from "../components/ui-extras"
import { Users, Camera, MessageSquare, HeartPulse, CheckSquare, CalendarDays, Clock, AlertTriangle } from "lucide-react"

type ChildData = {
  id: string
  name: string
  age: number
  group: string
  avatar: string
  status: "present" | "away"
  checkIn?: string
  checkOut?: string
  allergies?: string[]
  nextEvent?: string
}

type Message = {
  id: string
  from: "teacher" | "parent"
  text: string
  time: string
  read: boolean
}

type Photo = {
  id: string
  url: string
  caption: string
  date: string
}

export default function Page() {
  // Mock data for parent's children
  const [children] = useState<ChildData[]>([
    {
      id: "1",
      name: "Ava Johnson",
      age: 4,
      group: "Sunflowers",
      avatar: "/non-photorealistic-child-avatar.png",
      status: "present",
      checkIn: "08:12",
      allergies: ["Peanuts"],
      nextEvent: "Art Class at 2:00 PM",
    },
  ])

  const [messages] = useState<Message[]>([
    {
      id: "1",
      from: "teacher",
      text: "Ava had a wonderful day today! She participated actively in story time.",
      time: "3:45 PM",
      read: false,
    },
    { id: "2", from: "teacher", text: "Reminder: Tomorrow is show and tell day.", time: "Yesterday", read: true },
    { id: "3", from: "parent", text: "Thank you for the update!", time: "Yesterday", read: true },
  ])

  const [photos] = useState<Photo[]>([
    {
      id: "1",
      url: "/classroom-moment.png?height=300&width=300&query=child%20painting",
      caption: "Art time with watercolors",
      date: "Today",
    },
    {
      id: "2",
      url: "/classroom-moment.png?height=300&width=300&query=child%20reading",
      caption: "Story time favorites",
      date: "Yesterday",
    },
    {
      id: "3",
      url: "/classroom-moment.png?height=300&width=300&query=child%20playing",
      caption: "Playground adventures",
      date: "2 days ago",
    },
    {
      id: "4",
      url: "/classroom-moment.png?height=300&width=300&query=child%20learning",
      caption: "Learning shapes and colors",
      date: "3 days ago",
    },
  ])

  const child = children[0] // For demo, showing single child
  const unreadMessages = messages.filter((m) => !m.read).length

  return (
    <AppShell title="Parent Portal">
      <PageHero
        title="Parent Portal"
        subtitle={`Welcome! Here's what's happening with ${child.name} today.`}
        icon={Users}
      />

      <Require permission="view:parent-portal">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Status Today"
              value={child.status === "present" ? "Present" : "Away"}
              icon={CheckSquare}
              hint={child.checkIn ? `Checked in at ${child.checkIn}` : "Not checked in"}
            />
            <StatCard title="Unread Messages" value={unreadMessages} icon={MessageSquare} hint="From teachers" />
            <StatCard title="New Photos" value="4" icon={Camera} hint="This week" />
            <StatCard title="Next Activity" value="Art Class" icon={Clock} hint="2:00 PM today" />
          </div>

          {/* Child Profile Card */}
          <Section title="My Child" description="Current status and important information">
            <div className="flex items-start gap-4">
              <Image
                src={child.avatar || "/placeholder.svg"}
                alt={`${child.name} avatar`}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{child.name}</h3>
                  <Badge variant={child.status === "present" ? "secondary" : "destructive"}>
                    {child.status === "present" ? "Present" : "Away"}
                  </Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age:</span> {child.age} years old
                  </div>
                  <div>
                    <span className="text-muted-foreground">Group:</span> {child.group}
                  </div>
                  {child.checkIn && (
                    <div>
                      <span className="text-muted-foreground">Checked in:</span> {child.checkIn}
                    </div>
                  )}
                  {child.nextEvent && (
                    <div>
                      <span className="text-muted-foreground">Next:</span> {child.nextEvent}
                    </div>
                  )}
                </div>
                {child.allergies && child.allergies.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Allergies:</span>
                    {child.allergies.map((allergy) => (
                      <Badge key={allergy} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Tabbed Content */}
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              <Section title="Daily Report" description="How your child's day is going">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Activities Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Morning Circle</span>
                            <Badge variant="secondary">Done</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Snack Time</span>
                            <Badge variant="secondary">Done</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Art Class</span>
                            <Badge variant="outline">In Progress</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Meals & Snacks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Morning Snack</span>
                            <span className="text-emerald-600">Ate well</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Lunch</span>
                            <span className="text-muted-foreground">Upcoming</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Teacher Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        "Ava was very engaged during story time today and helped clean up after art activities. She's
                        showing great progress with sharing and taking turns with friends."
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </Section>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Section title="Messages" description="Communication with teachers">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${
                        !message.read
                          ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.from === "teacher" ? "Teacher" : "You"}</span>
                          {!message.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  ))}
                  <Button className="w-full">Send New Message</Button>
                </div>
              </Section>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <Section title="Recent Photos" description="Moments from your child's day">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="relative aspect-square overflow-hidden rounded-lg border">
                        <Image
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.caption}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">{photo.caption}</p>
                        <p className="text-xs text-muted-foreground">{photo.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Section title="This Week's Schedule" description="Upcoming activities and events">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <CalendarDays className="h-5 w-5 text-emerald-500" />
                    <div className="flex-1">
                      <div className="font-medium">Show and Tell</div>
                      <div className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Camera className="h-5 w-5 text-emerald-500" />
                    <div className="flex-1">
                      <div className="font-medium">Picture Day</div>
                      <div className="text-sm text-muted-foreground">Friday, 9:00 AM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <HeartPulse className="h-5 w-5 text-emerald-500" />
                    <div className="flex-1">
                      <div className="font-medium">Health Check</div>
                      <div className="text-sm text-muted-foreground">Next Monday, 11:00 AM</div>
                    </div>
                  </div>
                </div>
              </Section>
            </TabsContent>
          </Tabs>
        </div>
      </Require>
    </AppShell>
  )
}
