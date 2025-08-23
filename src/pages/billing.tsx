"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { Plus, Receipt, CreditCard, Banknote, Smartphone, Zap, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

type Invoice = {
  id: string
  family: string
  amount: number
  status: "paid" | "due" | "overdue"
  dueDate: string
  items: { description: string; amount: number }[]
}

export default function Billing() {
  const [tab, setTab] = React.useState("tap")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false)
  const [invoices, setInvoices] = React.useState<Invoice[]>([
    {
      id: "INV-1023",
      family: "Said",
      amount: 850,
      status: "paid",
      dueDate: "2025-08-01",
      items: [
        { description: "Monthly Tuition", amount: 800 },
        { description: "Lunch Program", amount: 50 },
      ],
    },
    {
      id: "INV-1024",
      family: "Ouni",
      amount: 950,
      status: "due",
      dueDate: "2025-08-15",
      items: [
        { description: "Monthly Tuition", amount: 800 },
        { description: "Extended Care", amount: 150 },
      ],
    },
    {
      id: "INV-1025",
      family: "Zaim",
      amount: 800,
      status: "overdue",
      dueDate: "2025-07-30",
      items: [{ description: "Monthly Tuition", amount: 800 }],
    },
  ])

  const [formData, setFormData] = React.useState({
    family: "",
    dueDate: "",
    items: [{ description: "Monthly Tuition", amount: "" }],
    notes: "",
  })

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: "" }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: "description" | "amount", value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totalAmount = formData.items.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      family: formData.family,
      amount: totalAmount,
      status: "due",
      dueDate: formData.dueDate,
      items: formData.items.map((item) => ({
        description: item.description,
        amount: Number.parseFloat(item.amount || "0"),
      })),
    }

    setInvoices((prev) => [...prev, newInvoice])
    setFormData({
      family: "",
      dueDate: "",
      items: [{ description: "Monthly Tuition", amount: "" }],
      notes: "",
    })
    setInvoiceDialogOpen(false)
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)

  return (
    <AppShell title="Invoicing & Payments">
      <div className="space-y-6">
        <Section title="Automated Billing" description="Tuition and fee schedules with reminders for overdue balances.">
          <div className="flex gap-2">
            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-purple-600" />
                    Create New Invoice
                  </DialogTitle>
                  <DialogDescription>Generate an invoice for tuition, fees, and additional services.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <DialogBody className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="family">Family *</Label>
                        <Select
                          value={formData.family}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, family: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            {formData.family || "Select family"}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Johnson">Johnson Family</SelectItem>
                            <SelectItem value="Garcia">Garcia Family</SelectItem>
                            <SelectItem value="Chen">Chen Family</SelectItem>
                            <SelectItem value="Smith">Smith Family</SelectItem>
                            <SelectItem value="Williams">Williams Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Invoice Items</Label>
                        <Button type="button" onClick={addItem} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>

                      {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <Label htmlFor={`desc-${index}`}>Description</Label>
                            <Input
                              id={`desc-${index}`}
                              value={item.description}
                              onChange={(e) => updateItem(index, "description", e.target.value)}
                              placeholder="e.g., Monthly Tuition"
                              required
                              className="mt-1"
                            />
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`amount-${index}`}>Amount</Label>
                            <Input
                              id={`amount-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.amount}
                              onChange={(e) => updateItem(index, "amount", e.target.value)}
                              placeholder="0.00"
                              required
                              className="mt-1"
                            />
                          </div>
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Total Amount:</span>
                          <span>${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes for this invoice..."
                        className="mt-1"
                      />
                    </div>
                  </DialogBody>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0">
                      Create Invoice
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

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

        {/* Collect Payments */}
        <Section title="Collect Payments" description="Tap to Pay, Credit Card, and ACH options.">
          <Tabs defaultValue="tap" value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tap">
                <Smartphone className="h-4 w-4 mr-2" />
                <span>Tap to Pay</span>
              </TabsTrigger>
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Credit Card</span>
              </TabsTrigger>
              <TabsTrigger value="ach">
                <Banknote className="h-4 w-4 mr-2" />
                <span>ACH</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tap" className="mt-0">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Smartphone className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Ready for Tap Payment</CardTitle>
                  <CardDescription className="text-base">
                    Use your NFC-enabled device to accept contactless payments instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Instant</p>
                        <p className="text-xs text-muted-foreground">Real-time processing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg">
                      <Shield className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Secure</p>
                        <p className="text-xs text-muted-foreground">Bank-level encryption</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">Quick</p>
                        <p className="text-xs text-muted-foreground">Under 3 seconds</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Hold customer's device near your phone</p>
                    <Button
                      // size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border-0 shadow-lg"
                    >
                      Start Tap Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card" className="mt-0">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credit Card Payment
                  </CardTitle>
                  <CardDescription>Enter your card details for secure payment processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 max-w-md mx-auto">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="card-number" className="text-sm font-medium">
                          Card Number
                        </Label>
                        <Input
                          id="card-number"
                          placeholder="4242 4242 4242 4242"
                          className="mt-1 h-12 text-lg tracking-wider"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="exp" className="text-sm font-medium">
                            Expiry Date
                          </Label>
                          <Input id="exp" placeholder="MM/YY" className="mt-1 h-12" />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-sm font-medium">
                            CVC
                          </Label>
                          <Input id="cvc" placeholder="123" className="mt-1 h-12" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-sm font-medium">
                          ZIP Code
                        </Label>
                        <Input id="zip" placeholder="12345" className="mt-1 h-12" />
                      </div>
                    </div>
                    <Button
                      // size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border-0 shadow-lg h-12"
                    >
                      Pay Now
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      Secured by 256-bit SSL encryption
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ach" className="mt-0">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    ACH Bank Transfer
                  </CardTitle>
                  <CardDescription>Connect your bank account for direct transfer payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 max-w-md mx-auto">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="routing" className="text-sm font-medium">
                          Routing Number
                        </Label>
                        <Input id="routing" placeholder="110000000" className="mt-1 h-12 font-mono tracking-wider" />
                        <p className="text-xs text-muted-foreground mt-1">9-digit number found on your check</p>
                      </div>
                      <div>
                        <Label htmlFor="account" className="text-sm font-medium">
                          Account Number
                        </Label>
                        <Input id="account" placeholder="000123456789" className="mt-1 h-12 font-mono tracking-wider" />
                        <p className="text-xs text-muted-foreground mt-1">Your bank account number</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">Processing Time</p>
                          <p className="text-amber-700">ACH transfers typically take 1-3 business days to complete</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      // size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border-0 shadow-lg h-12"
                    >
                      Authorize ACH Debit
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      Bank-grade security and encryption
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>



      </div>
    </AppShell>
  )
}