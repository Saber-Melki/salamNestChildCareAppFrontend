"use client"

import React, { useEffect, useState } from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { CheckSquare } from "lucide-react"

type RecordT = {
  id: string
  name: string
  group: string
  status: "present" | "away"
  checkIn?: string
  checkOut?: string
}

export default function Attendance() {
  const [rows, setRows] = useState<RecordT[]>([])
  const [filter, setFilter] = useState("")

  // === Fetch all attendances from gateway ===
  const fetchAttendances = async () => {
    try {
      const res = await fetch("http://localhost:8080/attendance") // API Gateway
      const data = await res.json()
      setRows(data)
    } catch (err) {
      console.error("Failed to fetch attendance", err)
    }
  }

  useEffect(() => {
    fetchAttendances()
  }, [])

  // === Handle check-in/out ===
  const onCheck = async (id: string, type: "in" | "out") => {
    try {
      const now = new Date()
      const time = now.toTimeString().slice(0, 5)

      const updated = {
        status: type === "in" ? "present" : "away",
        checkIn: type === "in" ? time : undefined,
        checkOut: type === "out" ? time : undefined,
      }

      await fetch(`http://localhost:8080/attendance/${id}`, {
        method: "POST", // correspond à update_attendance dans gateway
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })

      // recharger les données
      fetchAttendances()
    } catch (err) {
      console.error("Failed to update attendance", err)
    }
  }

  const visible = rows.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <AppShell title="Attendance Tracking">
      <div className="relative overflow-hidden rounded-2xl border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-400 opacity-90" />
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center bg-white/20 backdrop-blur-md rounded-lg shadow-md">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                Attendance Tracking
              </h1>
              <p className="mt-1 text-white/90">
                Track children's attendance with ease.
                <br />
                Quickly check children in and out with precise timestamps.
              </p>
            </div>
          </div>
        </div>
      </div>

      <br />

      <div className="space-y-6">
        <Section
          title="Check-in / Check-out"
          description="Record attendance for children with precise timestamps."
        >
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCheck(r.id, "in")}
                      >
                        Check-in
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onCheck(r.id, "out")}
                      >
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
