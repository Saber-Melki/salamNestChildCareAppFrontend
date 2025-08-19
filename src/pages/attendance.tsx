"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"

type RecordT = {
  id: string
  name: string
  group: string
  status: "present" | "away"
  checkIn?: string
  checkOut?: string
}

export default function Attendance() {
  const [rows, setRows] = React.useState<RecordT[]>([
    { id: "1", name: "Inyaz Zaiem", group: "Sunflowers", status: "present", checkIn: "08:12" },
    { id: "2", name: "Haroun Said", group: "Sunflowers", status: "away", checkIn: "09:01", checkOut: "11:05" },
    { id: "3", name: "Maya Ouni", group: "Butterflies", status: "present", checkIn: "08:43" },
    { id: "4", name: "Joud Limem", group: "Butterflies", status: "away", checkIn: "08:30", checkOut: "10:15" },
    
  ])
  const [filter, setFilter] = React.useState("")

  const onCheck = (id: string, type: "in" | "out") => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const now = new Date()
        const time = now.toTimeString().slice(0, 5)
        return type === "in"
          ? { ...r, status: "present", checkIn: time, checkOut: undefined }
          : { ...r, status: "away", checkOut: time }
      }),
    )
  }

  const visible = rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <AppShell title="Attendance Tracking">
      <div className="space-y-6">
        <Section title="Check-in / Check-out" description="Record attendance for children with precise timestamps.">
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search children..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Button className="ml-auto">Print Daily Roster</Button>
          </div>
          <div className="mt-4 rounded-xl border bg-white/70 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.group}</TableCell>
                    <TableCell>
                      {r.status === "present" ? (
                        <Badge variant="secondary">Present</Badge>
                      ) : (
                        <Badge variant="destructive">Away</Badge>
                      )}
                    </TableCell>
                    <TableCell>{r.checkIn || "-"}</TableCell>
                    <TableCell>{r.checkOut || "-"}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onCheck(r.id, "in")}>
                        Check-in
                      </Button>
                      <Button size="sm" onClick={() => onCheck(r.id, "out")}>
                        Check-out
                      </Button>
                    </TableCell>
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
