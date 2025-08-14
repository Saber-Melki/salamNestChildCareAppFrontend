"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"

type ChildRow = {
  id: string
  firstName: string
  lastName: string
  family: string
  authorizedPickups: number
  allergies?: string
}

export default function Children() {
  const [q, setQ] = React.useState("")
  const rows: ChildRow[] = [
    { id: "1", firstName: "Ava", lastName: "Johnson", family: "Johnson", authorizedPickups: 3, allergies: "Peanuts" },
    { id: "2", firstName: "Liam", lastName: "Garcia", family: "Garcia", authorizedPickups: 2 },
    { id: "3", firstName: "Mia", lastName: "Chen", family: "Chen", authorizedPickups: 1, allergies: "Dairy" },
    { id: "4", firstName: "Noah", lastName: "Smith", family: "Smith", authorizedPickups: 2 },
  ]
  const filtered = rows.filter((r) => `${r.firstName} ${r.lastName}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <AppShell title="Child Profiles">
      <Section title="Profiles" description="Family details, authorized pickups, and medical notes.">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search children..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search children"
            />
          </div>
          <Button>Add Child</Button>
        </div>
        <div className="mt-4 rounded-xl border bg-white/70 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Authorized Pickups</TableHead>
                <TableHead>Allergies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="flex items-center gap-3">
                    <img
                      src="/child.jpg"
                      alt={`${r.firstName} ${r.lastName} avatar`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-xs text-neutral-500">Medical history on file</div>
                    </div>
                  </TableCell>
                  <TableCell>{r.family}</TableCell>
                  <TableCell>{r.authorizedPickups}</TableCell>
                  <TableCell>{r.allergies ?? <span className="text-neutral-500">None</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
    </AppShell>
  )
}
