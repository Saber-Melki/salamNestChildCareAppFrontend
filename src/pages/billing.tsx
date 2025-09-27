"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import {
  Plus,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Trash2,
  Eye,
  Send,
  DollarSign,
  Calculator,
  Wallet,
  Paperclip,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { type ChildRow, fetchChildren } from "../services/child.service"

type Invoice = {
  id: string
  family: string
  amount: number
  status: "paid" | "due" | "overdue"
  dueDate: string
  items: { description: string; amount: number }[]
}

export default function Billing() {
  const [tab, setTab] = useState("tap")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [families, setFamilies] = useState<string[]>([])

  const [formData, setFormData] = useState({
    family: "",
    dueDate: "",
    items: [{ description: "Monthly Tuition", amount: "" }],
    notes: "",
  })

  // Load invoices and families
  const loadInvoices = async () => {
    try {
      const res = await fetch("http://localhost:8080/billing")
      if (!res.ok) throw new Error("Failed to fetch invoices")
      setInvoices(await res.json())
    } catch (err) {
      console.error("Error loading invoices:", err)
    }
  }

  const loadFamilies = async () => {
    try {
      const children: ChildRow[] = await fetchChildren()
      const uniqueFamilies = Array.from(new Set(children.map((c) => c.family)))
      setFamilies(uniqueFamilies)
    } catch (err) {
      console.error("Failed to load families", err)
    }
  }

  useEffect(() => {
    loadInvoices()
    loadFamilies()
  }, [])

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

  // Create invoice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8080/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const newInvoice = await res.json()
      setInvoices((prev) => [...prev, newInvoice])
      setFormData({ family: "", dueDate: "", items: [{ description: "Monthly Tuition", amount: "" }], notes: "" })
      setInvoiceDialogOpen(false)
    } catch (err) {
      console.error("Error creating invoice:", err)
    } finally {
      setLoading(false)
    }
  }

  // Mark invoice as paid
  const markAsPaid = async (id: string) => {
    try {
      await fetch(`http://localhost:8080/billing/${id}/paid`, { method: "POST" })
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv)))
    } catch (err) {
      console.error("Error marking invoice as paid:", err)
    }
  }

  // Delete invoice
  const deleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      await fetch(`http://localhost:8080/billing/${id}`, { method: "DELETE" })
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch (err) {
      console.error("Error deleting invoice:", err)
    }
  }

  // Send reminders
  const sendReminders = async () => {
    try {
      await fetch("http://localhost:8080/billing/remind/overdue", { method: "POST" })
      alert("Overdue reminders sent ✅")
    } catch (err) {
      console.error("Error sending reminders:", err)
    }
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)

  return (
    <AppShell title="Invoicing & Payments">
      <div className="relative overflow-hidden rounded-3xl border shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Floating decorative elements */}
        <div className="absolute top-6 right-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-md animate-pulse delay-1000" />

        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-bounce">
              <DollarSign className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                Invoicing & Payments
              </h1>
              <p className="mt-3 text-xl text-blue-50/90 font-medium">
                Streamlined billing with automated reminders and secure payment processing
              </p>
              <div className="flex items-center gap-6 mt-4 text-blue-100/80">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  <span className="text-sm font-medium">Smart Invoicing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <span className="text-sm font-medium">Auto Calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <span className="text-sm font-medium">Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Enhanced Billing Section */}
        <Section
          title="Automated Billing"
          description="Smart tuition and fee schedules with intelligent reminders for overdue balances."
        >
          <div className="flex gap-3 mb-6">
            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-pink-500 via-pink-500 to-purple-500 hover:from-pink-600 hover:via-pink-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
                <DialogHeader className="pb-6">
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl shadow-lg">
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                    Create New Invoice
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 mt-2">
                    Generate professional invoices for tuition, fees, and additional services with automated
                    calculations.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <DialogBody className="space-y-6">
                    {/* Family + Due Date */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">Family *</Label>
                        <Select
                          value={formData.family}
                          onValueChange={(val) => setFormData((prev) => ({ ...prev, family: val }))}
                        >
                          <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-400 bg-white">
                            <SelectValue placeholder="Select family" />
                          </SelectTrigger>
                          <SelectContent>
                            {families.map((fam) => (
                              <SelectItem key={fam} value={fam} className="hover:bg-blue-50">
                                {fam}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-base font-semibold text-gray-700">
                          Due Date *
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                          required
                          className="h-12 border-2 border-blue-200 focus:border-blue-400 bg-white"
                        />
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-bold text-gray-800">Invoice Items</Label>
                        <Button
                          type="button"
                          onClick={addItem}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent"
                        >
                          <Plus className="h-4 w-4" /> Add Item
                        </Button>
                      </div>

                      {/* Items List */}
                      <div className="space-y-4">
                        {formData.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-4 items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all duration-300"
                          >
                            {/* Description */}
                            <div className="flex-1">
                              <Label
                                htmlFor={`desc-${index}`}
                                className="text-sm font-semibold text-gray-600 mb-2 block"
                              >
                                Description
                              </Label>
                              <Input
                                id={`desc-${index}`}
                                value={item.description}
                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                placeholder="Enter item description..."
                                className="h-12 text-base px-4 border-2 border-blue-200 focus:border-blue-400 bg-white"
                              />
                            </div>

                            {/* Amount */}
                            <div className="w-40">
                              <Label
                                htmlFor={`amt-${index}`}
                                className="text-sm font-semibold text-gray-600 mb-2 block"
                              >
                                Amount
                              </Label>
                              <Input
                                id={`amt-${index}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.amount}
                                onChange={(e) => updateItem(index, "amount", e.target.value)}
                                placeholder="0.00"
                                className="h-12 text-base px-4 text-right border-2 border-blue-200 focus:border-blue-400 bg-white font-mono"
                              />
                            </div>

                            {/* Remove Button */}
                            {formData.items.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeItem(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Total Display */}
                      <div className="flex justify-between items-center font-bold border-t-2 border-blue-200 pt-6 text-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                        <span className="text-gray-800">Total Amount</span>
                        <span className="text-pink-600 text-2xl font-mono">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-700">Additional Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any special instructions or notes for this invoice..."
                        className="min-h-[100px] border-2 border-blue-200 focus:border-blue-400 bg-white resize-none"
                      />
                    </div>
                  </DialogBody>

                  <DialogFooter className="pt-6 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInvoiceDialogOpen(false)}
                      className="border-2 border-gray-300 hover:bg-gray-50 px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
                    >
                      {loading ? "Creating..." : "Create Invoice"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={sendReminders}
              className="border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent"
            >
              <Send className="h-5 w-5 mr-2 text-pink-600" />
              Send Overdue Reminders
            </Button>
          </div>

          {/* Enhanced Invoice Table */}
          <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-rabsolute inset-0 bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 opacity-95 text-white border-0 shadow-lg h-12 mt-4">
                  <TableHead className="text-white font-semibold text-base">Family</TableHead>
                  <TableHead className="text-white font-semibold text-base">Amount</TableHead>
                  <TableHead className="text-white font-semibold text-base">Due Date</TableHead>
                  <TableHead className="text-white font-semibold text-base">Status</TableHead>
                  <TableHead className="text-white font-semibold text-base">Actions</TableHead>
                  <TableHead className="text-white font-semibold text-base">Details</TableHead>
                  <TableHead className="text-white font-semibold text-base">Reminders</TableHead>
                  <TableHead className="text-white font-semibold text-base">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv, index) => (
                  <TableRow
                    key={inv.id}
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-blue-25"
                    }`}
                  >
                    <TableCell className="font-semibold text-gray-800">{inv.family}</TableCell>
                    <TableCell className="font-mono text-lg font-bold text-black-600">${inv.amount}</TableCell>
                    <TableCell className="text-gray-700">{inv.dueDate}</TableCell>
                    <TableCell>
                      {inv.status === "paid" && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                          Paid
                        </Badge>
                      )}
                      {inv.status === "due" && (
                        <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg">
                          Due
                        </Badge>
                      )}
                      {inv.status === "overdue" && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                          Overdue
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {inv.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPaid(inv.id)}
                            className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => alert(`Invoice Details:\n\n${JSON.stringify(inv, null, 2)}`)}
                          className="hover:bg-blue-100 text-black-600 hover:text-black-700 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                    </TableCell>
                    <TableCell className="text-gray-700">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => alert(`Send invoice ${inv.id} to ${inv.family}`)}
                          className="hover:bg-blue-100 text-black-600 hover:text-black-700 transition-colors"
                        >
                          <Send className="h-4 w-4 mr-1" /> Send
                        </Button>
                    </TableCell>
                    <TableCell className="text-gray-700">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-pink-600 hover:bg-red-100 hover:text-pink-700 transition-colors"
                          onClick={() => deleteInvoice(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        <Section title="Collect Payments" description="Tap to Pay, Credit Card, and ACH options.">
          <Tabs defaultValue="tap" value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tap">
                <center><Smartphone className="h-4 w-4 mr-2" /></center>
                <span>Tap to Pay</span>
              </TabsTrigger>
              <TabsTrigger value="card">
                <center><CreditCard className="h-4 w-4 mr-2" /></center>
                <span>Credit Card</span>
              </TabsTrigger>
              <TabsTrigger value="ach">
                <center><Banknote className="h-4 w-4 mr-2" /></center>
                <span>ACH</span>
              </TabsTrigger>
            </TabsList>

            {/* ---------- Tap to Pay ---------- */}
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
                  <div className="text-center">
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border-0 shadow-lg"
                      onClick={async () => {
                        try {
                          const invoiceId = prompt("Enter Invoice ID to pay via Tap:")
                          if (!invoiceId) return
                          const res = await fetch(`http://localhost:8080/billing/${invoiceId}/paid`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ invoiceId, method: "tap" }),
                          })
                          if (!res.ok) throw new Error("Payment failed")
                          alert("Payment successful!")
                          // refresh invoices
                          const updated = await fetch("http://localhost:8080/billing")
                          setInvoices(await updated.json())
                        } catch (err) {
                          console.error(err)
                          alert("Payment error")
                        }
                      }}
                    >
                      Start Tap Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- Credit Card ---------- */}
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
                      <Input id="card-number" placeholder="4242 4242 4242 4242" className="mt-1 h-12 text-lg tracking-wider" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input id="exp" placeholder="MM/YY" className="mt-1 h-12" />
                        <Input id="cvc" placeholder="123" className="mt-1 h-12" />
                      </div>
                      <Input id="zip" placeholder="12345" className="mt-1 h-12" />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border-0 shadow-lg h-12"
                      onClick={async () => {
                        try {
                          const invoiceId = prompt("Enter Invoice ID to pay by Credit Card:")
                          if (!invoiceId) return
                          const res = await fetch(`http://localhost:8080/billing/${invoiceId}/paid`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ invoiceId, method: "card" }),
                          })
                          if (!res.ok) throw new Error("Payment failed")
                          alert("Credit Card payment successful!")
                          const updated = await fetch("http://localhost:8080/billing")
                          setInvoices(await updated.json())
                        } catch (err) {
                          console.error(err)
                          alert("Payment error")
                        }
                      }}
                    >
                      Pay Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- ACH ---------- */}
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
                  <div className="space-y-4 max-w-md mx-auto">
                    <Input id="routing" placeholder="110000000" className="mt-1 h-12 font-mono tracking-wider" />
                    <Input id="account" placeholder="000123456789" className="mt-1 h-12 font-mono tracking-wider" />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border-0 shadow-lg h-12 mt-4"
                    onClick={async () => {
                      try {
                        const invoiceId = prompt("Enter Invoice ID to pay via ACH:")
                        if (!invoiceId) return
                        const res = await fetch(`http://localhost:8080/billing/${invoiceId}/paid`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ invoiceId, method: "ach" }),
                        })
                        if (!res.ok) throw new Error("Payment failed")
                        alert("ACH payment successful!")
                        const updated = await fetch(`http://localhost:8080/billing`)
                        setInvoices(await updated.json())
                      } catch (err) {
                        console.error(err)
                        alert("Payment error")
                      }
                    }}
                  >
                    Authorize ACH Debit
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </AppShell>
  )
}
