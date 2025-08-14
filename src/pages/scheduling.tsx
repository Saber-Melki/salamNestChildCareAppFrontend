"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"

type Shift = { staff: string; day: string; start: string; end: string }

export default function Scheduling() {
  const [shifts, setShifts] = React.useState<Shift[]>([
    { staff: "Ms. Taylor", day: "Mon", start: "08:00", end: "16:00" },
    { staff: "Mr. Lee", day: "Mon", start: "09:00", end: "17:00" },
  ])
  const [newShift, setNewShift] = React.useState<Shift>({ staff: "", day: "Mon", start: "08:00", end: "16:00" })

  const add = () => {
    if (!newShift.staff) return
    setShifts((p) => [...p, newShift])
    setNewShift({ staff: "", day: "Mon", start: "08:00", end: "16:00" })
  }

  return (
    <AppShell title="Staff Scheduling">
      <div className="space-y-6">
        <Section title="Shift Planner" description="Manage availability and coverage.">
          <div className="grid md:grid-cols-5 gap-3 max-w-3xl">
            <div className="md:col-span-2">
              <Label htmlFor="staff">Staff</Label>
              <Input
                id="staff"
                value={newShift.staff}
                onChange={(e) => setNewShift({ ...newShift, staff: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div>
              <Label htmlFor="day">Day</Label>
              <select
                id="day"
                value={newShift.day}
                onChange={(e) => setNewShift({ ...newShift, day: e.target.value })}
                className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                value={newShift.start}
                onChange={(e) => setNewShift({ ...newShift, start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                value={newShift.end}
                onChange={(e) => setNewShift({ ...newShift, end: e.target.value })}
              />
            </div>
            <div className="md:col-span-5">
              <Button onClick={add}>Add Shift</Button>
            </div>
          </div>

          <div className="mt-4 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((s, i) => (
                  <TableRow key={`${s.staff}-${i}`}>
                    <TableCell className="font-medium">{s.staff}</TableCell>
                    <TableCell>{s.day}</TableCell>
                    <TableCell>{s.start}</TableCell>
                    <TableCell>{s.end}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
