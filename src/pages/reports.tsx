"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { exportCsv } from "../CSV/export-csv"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

export default function Reports() {
  const [tab, setTab] = React.useState("attendance")

  const attendance = [
    ["Date", "Child", "Status", "Check-in", "Check-out"],
    ["2025-08-01", "Ava Johnson", "Present", "08:12", "16:01"],
    ["2025-08-01", "Liam Garcia", "Away", "09:01", "11:05"],
  ]
  const revenue = [
    ["Month", "Collected", "Outstanding"],
    ["2025-07", "25,100", "1,250"],
    ["2025-08", "28,450", "1,980"],
  ]
  const milestones = [
    ["Child", "Milestone", "Date", "Notes"],
    ["Ava Johnson", "Language - New words", "2025-08-01", "Said 'butterfly'"],
    ["Mia Chen", "Motor - Balance", "2025-07-29", "Balances on one foot"],
  ]

  return (
    <AppShell title="Reports">
      <Tabs defaultValue="attendance" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCsv("attendance.csv", attendance)}>
              Export CSV
            </Button>
            <Button size="sm">Download PDF</Button>
          </div>
          <Section title="Attendance Logs">
            <div className="rounded-xl border bg-white/70 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {attendance[0].map((h) => (
                      <TableHead key={String(h)}>{String(h)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.slice(1).map((row, i) => (
                    <TableRow key={i}>
                      {row.map((c, j) => (
                        <TableCell key={j}>{String(c)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCsv("revenue.csv", revenue)}>
              Export CSV
            </Button>
            <Button size="sm">Download PDF</Button>
          </div>
          <Section title="Revenue Insights">
            <div className="rounded-xl border bg-white/70 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {revenue[0].map((h) => (
                      <TableHead key={String(h)}>{String(h)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.slice(1).map((row, i) => (
                    <TableRow key={i}>
                      {row.map((c, j) => (
                        <TableCell key={j}>{String(c)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="development" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCsv("development.csv", milestones)}>
              Export CSV
            </Button>
            <Button size="sm">Download PDF</Button>
          </div>
          <Section title="Developmental Tracking">
            <div className="rounded-xl border bg-white/70 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {milestones[0].map((h) => (
                      <TableHead key={String(h)}>{String(h)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.slice(1).map((row, i) => (
                    <TableRow key={i}>
                      {row.map((c, j) => (
                        <TableCell key={j}>{String(c)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}
