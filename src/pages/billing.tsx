"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"

type Invoice = {
  id: string
  family: string
  amount: number
  status: "paid" | "due" | "overdue"
  dueDate: string
}

export default function Billing() {
  const invoices: Invoice[] = [
    { id: "INV-1023", family: "Johnson", amount: 850, status: "paid", dueDate: "2025-08-01" },
    { id: "INV-1024", family: "Garcia", amount: 950, status: "due", dueDate: "2025-08-15" },
    { id: "INV-1025", family: "Chen", amount: 800, status: "overdue", dueDate: "2025-07-30" },
  ]
  const [tab, setTab] = React.useState("tap")

  return (
    <AppShell title="Invoicing & Payments">
      <div className="space-y-6">
        <Section title="Automated Billing" description="Tuition and fee schedules with reminders for overdue balances.">
          <div className="flex gap-2">
            <Button size="sm">Create Invoice</Button>
            <Button size="sm" variant="outline">
              Send Overdue Reminders
            </Button>
          </div>
          <div className="mt-4 rounded-xl border bg-white/70 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.family}</TableCell>
                    <TableCell>${inv.amount.toFixed(2)}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell>
                      {inv.status === "paid" && <Badge variant="secondary">Paid</Badge>}
                      {inv.status === "due" && <Badge variant="outline">Due</Badge>}
                      {inv.status === "overdue" && <Badge variant="destructive">Overdue</Badge>}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm">View</Button>
                      {inv.status !== "paid" && (
                        <Button size="sm" variant="outline">
                          Remind
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        <Section title="Collect Payments" description="Tap to Pay, Credit Card, and ACH options.">
          <Tabs defaultValue="tap" value={tab} onValueChange={setTab} className="w-full">
            <TabsList>
              <TabsTrigger value="tap">Tap to Pay</TabsTrigger>
              <TabsTrigger value="card">Credit Card</TabsTrigger>
              <TabsTrigger value="ach">ACH</TabsTrigger>
            </TabsList>
            <TabsContent value="tap" className="mt-3">
              <div className="text-sm text-neutral-500">
                Use your NFC-enabled device to accept a contactless payment. This is a demo UI.
              </div>
              <div className="mt-3">
                <Button>Start Tap Session</Button>
              </div>
            </TabsContent>
            <TabsContent value="card" className="mt-3">
              <div className="grid gap-3 max-w-md">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div>
                    <Label htmlFor="exp">Exp</Label>
                    <Input id="exp" placeholder="MM/YY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="CVC" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" placeholder="ZIP" />
                  </div>
                </div>
                <Button>Pay Now</Button>
              </div>
            </TabsContent>
            <TabsContent value="ach" className="mt-3">
              <div className="grid gap-3 max-w-md">
                <div>
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input id="routing" placeholder="110000000" />
                </div>
                <div>
                  <Label htmlFor="account">Account Number</Label>
                  <Input id="account" placeholder="000123456789" />
                </div>
                <Button>Authorize ACH Debit</Button>
              </div>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </AppShell>
  )
}
