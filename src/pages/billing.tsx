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
  CheckCircle,
  Clock,
  Zap,
  Shield,
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
  const [tapSessionActive, setTapSessionActive] = useState(false)
  const [sendingReminders, setSendingReminders] = useState(false)
  const [remindersSent, setRemindersSent] = useState(false)

  const [tapPaymentDialogOpen, setTapPaymentDialogOpen] = useState(false)
  const [cardPaymentDialogOpen, setCardPaymentDialogOpen] = useState(false)
  const [achPaymentDialogOpen, setAchPaymentDialogOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)

  // invoice details popup state
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false)
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState<Invoice | null>(null)

  // delete confirmation + notification state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

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

  // Delete invoice (API + state update, no UI here)
  const deleteInvoice = async (id: string) => {
    try {
      await fetch(`http://localhost:8080/billing/${id}`, { method: "DELETE" })
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch (err) {
      console.error("Error deleting invoice:", err)
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return
    setDeletingInvoice(true)
    try {
      await deleteInvoice(invoiceToDelete.id)
      setDeleteDialogOpen(false)
      setInvoiceToDelete(null)
      setDeleteSuccess(true)
      setTimeout(() => setDeleteSuccess(false), 4000)
    } catch {
      alert("Failed to delete invoice. Please try again.")
    } finally {
      setDeletingInvoice(false)
    }
  }

  // Mark invoice as paid (manual)
  const markAsPaid = async (id: string) => {
    try {
      await fetch(`http://localhost:8080/billing/${id}/paid`, { method: "POST" })
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv)))
    } catch (err) {
      console.error("Error marking invoice as paid:", err)
    }
  }

  const handleTapPayment = async () => {
    if (!selectedInvoiceId) return

    setTapSessionActive(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const res = await fetch(`http://localhost:8080/billing/${selectedInvoiceId}/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: selectedInvoiceId, method: "tap" }),
      })

      if (!res.ok) throw new Error("Payment failed")

      const updated = await fetch("http://localhost:8080/billing")
      setInvoices(await updated.json())
      setTapPaymentDialogOpen(false)
      setSelectedInvoiceId("")
    } catch (err) {
      console.error(err)
      alert("❌ Payment error")
    } finally {
      setTapSessionActive(false)
    }
  }

  const handleCardPayment = async () => {
    if (!selectedInvoiceId) return

    try {
      const res = await fetch(`http://localhost:8080/billing/${selectedInvoiceId}/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: selectedInvoiceId, method: "card" }),
      })
      if (!res.ok) throw new Error("Payment failed")

      const updated = await fetch("http://localhost:8080/billing")
      setInvoices(await updated.json())
      setCardPaymentDialogOpen(false)
      setSelectedInvoiceId("")
    } catch (err) {
      console.error(err)
      alert("❌ Payment error")
    }
  }

  const handleAchPayment = async () => {
    if (!selectedInvoiceId) return

    try {
      const res = await fetch(`http://localhost:8080/billing/${selectedInvoiceId}/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: selectedInvoiceId, method: "ach" }),
      })
      if (!res.ok) throw new Error("Payment failed")

      const updated = await fetch(`http://localhost:8080/billing`)
      setInvoices(await updated.json())
      setAchPaymentDialogOpen(false)
      setSelectedInvoiceId("")
    } catch (err) {
      console.error(err)
      alert("❌ Payment error")
    }
  }

  // STRIPE: call your PaymentController (billing/pay/checkout/:invoiceId)
  const handleStripePayment = async () => {
    if (!selectedInvoiceId) return

    try {
      const res = await fetch(
        `http://localhost:8080/billing/pay/checkout/${selectedInvoiceId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      )

      if (!res.ok) throw new Error("Failed to create Stripe session")

      const data: { sessionId?: string; url?: string } = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.sessionId) {
        window.location.href = `/billing/redirect?session_id=${data.sessionId}`
      } else {
        alert("Stripe session created but no redirect URL returned.")
      }
    } catch (err) {
      console.error("Stripe payment error:", err)
      alert("❌ Stripe payment error")
    }
  }

  const handleSendReminders = async () => {
    setSendingReminders(true)
    setRemindersSent(false)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await fetch("http://localhost:8080/billing/remind/overdue", { method: "POST" })

      setRemindersSent(true)
      setReminderDialogOpen(false)
      setTimeout(() => setRemindersSent(false), 5000)
    } catch (err) {
      console.error("Error sending reminders:", err)
      alert("Failed to send reminders. Please try again.")
    } finally {
      setSendingReminders(false)
    }
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)

  return (
    <AppShell title="Invoicing & Payments">
      {/* Delete success notification toast */}
      {deleteSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 shadow-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-green-800">Invoice deleted</p>
              <p className="text-xs text-green-700">The selected invoice has been removed successfully.</p>
            </div>
          </div>
        </div>
      )}

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
        {/* Billing Section */}
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

                      <div className="space-y-4">
                        {formData.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-4 items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all duration-300"
                          >
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

            <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={sendingReminders}
                  className={`border-2 transition-all duration-300 ${
                    remindersSent
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-blue-200 hover:bg-blue-50 hover:border-blue-300 bg-transparent"
                  }`}
                >
                  {sendingReminders ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent mr-2" />
                      Sending Reminders...
                    </>
                  ) : remindersSent ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Reminders Sent!
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2 text-pink-600" />
                      Send Overdue Reminders
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-orange-50/30">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    Send Overdue Reminders
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 mt-2">
                    This will send automated email reminders to all families with overdue invoices.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📧</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-800 mb-2">Reminder Details:</h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Professional email template</li>
                          <li>• Payment instructions included</li>
                          <li>• Friendly tone with clear due dates</li>
                          <li>• Sent to all overdue accounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </DialogBody>
                <DialogFooter className="gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReminderDialogOpen(false)}
                    className="border-2 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendReminders}
                    disabled={sendingReminders}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-xl"
                  >
                    {sendingReminders ? "Sending..." : "✉️ Send Reminders"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Invoice Table */}
          <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 text-white border-0 shadow-lg h-12">
                  <TableHead className="text-white font-semibold text-base">Family</TableHead>
                  <TableHead className="text-white font-semibold text-base">Amount</TableHead>
                  <TableHead className="text-white font-semibold text-base">Due Date</TableHead>
                  <TableHead className="text-white font-semibold text-base">Status</TableHead>
                  <TableHead className="text-white font-semibold text-base">Actions</TableHead>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedInvoiceDetails(inv)
                            setInvoiceDetailsOpen(true)
                          }}
                          className="hover:bg-blue-100 text-black-600 hover:text-black-700 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => alert(`Send invoice ${inv.id} to ${inv.family}`)}
                          className="hover:bg-blue-100 text-black-600 hover:text-black-700 transition-colors"
                        >
                          <Send className="h-4 w-4 mr-1" /> Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-pink-600 hover:bg-red-100 hover:text-pink-700 transition-colors"
                          onClick={() => {
                            setInvoiceToDelete(inv)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* INVOICE DETAILS POPUP (DESIGNED) */}
          <Dialog
            open={invoiceDetailsOpen}
            onOpenChange={(open) => {
              setInvoiceDetailsOpen(open)
              if (!open) setSelectedInvoiceDetails(null)
            }}
          >
            <DialogContent className="max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/40">
              {selectedInvoiceDetails && (
                <>
                  <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center justify-between gap-3 text-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg">
                          <Receipt className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-wide text-gray-500">Invoice</p>
                          <p className="font-semibold text-gray-900">
                            {selectedInvoiceDetails.family}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ID: <span className="font-mono">{selectedInvoiceDetails.id}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {selectedInvoiceDetails.status === "paid" && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Paid
                          </Badge>
                        )}
                        {selectedInvoiceDetails.status === "due" && (
                          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-md flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due
                          </Badge>
                        )}
                        {selectedInvoiceDetails.status === "overdue" && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Overdue
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          Due date:{" "}
                          <span className="font-medium text-gray-800">
                            {selectedInvoiceDetails.dueDate}
                          </span>
                        </span>
                      </div>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-2">
                      Detailed breakdown of this invoice, including all billed items and totals.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogBody className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Total Amount
                          </span>
                          <DollarSign className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="text-2xl font-bold text-pink-600 font-mono">
                          ${Number(selectedInvoiceDetails.amount ?? 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Including all invoice items.</p>
                      </div>

                      <div className="col-span-1 bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Status
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedInvoiceDetails.status === "paid" && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">Paid</span>
                            </>
                          )}
                          {selectedInvoiceDetails.status === "due" && (
                            <>
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">Due</span>
                            </>
                          )}
                          {selectedInvoiceDetails.status === "overdue" && (
                            <>
                              <Clock className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-700">Overdue</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Keep your billing up to date for a smooth experience.
                        </p>
                      </div>

                      <div className="col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-pink-100 p-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Due Date
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          {selectedInvoiceDetails.dueDate}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Please ensure payment is processed before this date.
                        </p>
                      </div>
                    </div>

                    {/* Line items */}
                    <div className="rounded-2xl border border-blue-100 bg-white overflow-hidden shadow-sm">
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Invoice Items</span>
                        <Calculator className="h-4 w-4 text-blue-600" />
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs uppercase tracking-wide text-gray-500">
                              #
                            </TableHead>
                            <TableHead className="text-xs uppercase tracking-wide text-gray-500">
                              Description
                            </TableHead>
                            <TableHead className="text-xs uppercase tracking-wide text-gray-500 text-right">
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoiceDetails.items && selectedInvoiceDetails.items.length > 0 ? (
                            selectedInvoiceDetails.items.map((item, idx) => (
                              <TableRow key={idx} className="hover:bg-blue-50/60">
                                <TableCell className="text-xs text-gray-500 font-mono">
                                  {idx + 1}
                                </TableCell>
                                <TableCell className="text-sm text-gray-800">
                                  {item.description || "—"}
                                </TableCell>
                                <TableCell className="text-sm text-right font-mono text-gray-900">
                                  ${Number(item.amount || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-sm text-gray-500 py-6">
                                No items found for this invoice.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100 bg-blue-50/60">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Total
                        </span>
                        <span className="text-lg font-bold text-pink-600 font-mono">
                          ${Number(selectedInvoiceDetails.amount ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </DialogBody>

                  <DialogFooter className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      <span>Securely generated by your billing system.</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInvoiceDetailsOpen(false)}
                      className="border-2 border-gray-300 hover:bg-gray-50"
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* DELETE CONFIRMATION POPUP (DESIGNED) */}
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setInvoiceToDelete(null)
            }}
          >
            <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/40">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                  Delete Invoice
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-2">
                  This action cannot be undone. The invoice will be permanently removed from your billing records.
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-4">
                {invoiceToDelete && (
                  <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">
                      You are deleting
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {invoiceToDelete.family}
                        </p>
                        <p className="text-xs text-gray-600">
                          Invoice ID: <span className="font-mono">{invoiceToDelete.id}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Due Date:{" "}
                          <span className="font-medium text-gray-800">
                            {invoiceToDelete.dueDate}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-lg font-bold text-red-600 font-mono">
                          ${Number(invoiceToDelete.amount ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                  <Shield className="h-3 w-3 mt-0.5" />
                  <p>
                    For security and audit reasons, this action should only be performed if you are sure this
                    invoice was created in error.
                  </p>
                </div>
              </DialogBody>
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="border-2 border-gray-300 hover:bg-gray-50"
                  disabled={deletingInvoice}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={!invoiceToDelete || deletingInvoice}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-xl"
                >
                  {deletingInvoice ? "Deleting..." : "🗑️ Delete Invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Collect Payments Section */}
        <Section
          title="Collect Payments"
          description="Multiple secure payment options including Tap to Pay, Credit Card, ACH transfers and Stripe Checkout."
        >
          <Tabs defaultValue="tap" value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-2">
              <TabsTrigger value="tap">
                <Smartphone className="h-5 w-5" />
                <span className="font-semibold ml-2">Tap to Pay</span>
              </TabsTrigger>
              <TabsTrigger value="card">
                <CreditCard className="h-5 w-5" />
                <span className="font-semibold ml-2">Credit Card</span>
              </TabsTrigger>
              <TabsTrigger value="ach">
                <Banknote className="h-5 w-5" />
                <span className="font-semibold ml-2">ACH Transfer</span>
              </TabsTrigger>
              {/* Stripe tab */}
              <TabsTrigger value="stripe">
                <Zap className="h-5 w-5" />
                <span className="font-semibold ml-2">Fast Pay</span>
              </TabsTrigger>
            </TabsList>

            {/* Tap to Pay */}
            <TabsContent value="tap" className="mt-0">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-pink-50 via-pink-50 to-purple-50 overflow-hidden">
                <CardHeader className="text-center pb-6 bg-gradient-to-r from-pink-500/10 to-indigo-500/10">
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                    <Smartphone className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-600 bg-clip-text text-transparent">
                    Ready for Tap Payment
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 mt-2">
                    Use your NFC-enabled device to accept contactless payments instantly and securely
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <br />
                  <div className="text-center space-y-6">
                    <Dialog open={tapPaymentDialogOpen} onOpenChange={setTapPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-pink-500 via-pink-500 to-purple-500 hover:from-pink-600 hover:via-pink-600 hover:to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-12 py-4 text-lg font-semibold"
                        >
                          <Zap className="h-6 w-6 mr-2" />Start Tap Session
                        </Button>
                      </DialogTrigger>
                      <br />
                      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-500 rounded-xl shadow-lg">
                              <Smartphone className="h-6 w-6 text-white" />
                            </div>
                            Tap to Pay
                          </DialogTitle>
                          <DialogDescription className="text-base text-gray-600 mt-2">
                            Enter the invoice ID to process payment via contactless tap.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogBody className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tap-invoice-id" className="text-base font-semibold text-gray-700">
                              Invoice ID *
                            </Label>
                            <Input
                              id="tap-invoice-id"
                              value={selectedInvoiceId}
                              onChange={(e) => setSelectedInvoiceId(e.target.value)}
                              placeholder="Enter invoice ID..."
                              className="h-12 text-lg border-2 border-pink-200 focus:border-pink-400 bg-white"
                            />
                          </div>
                          {tapSessionActive && (
                            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-600 border-t-transparent" />
                                <div className="text-sm text-pink-700 font-medium">
                                  Processing payment... Please hold device near reader.
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogBody>
                        <DialogFooter className="gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setTapPaymentDialogOpen(false)
                              setSelectedInvoiceId("")
                            }}
                            className="border-2 border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleTapPayment}
                            disabled={!selectedInvoiceId || tapSessionActive}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-xl"
                          >
                            {tapSessionActive ? "Processing..." : "💳 Process Payment"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                      <div className="p-4 bg-white/60 rounded-xl">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="font-semibold">Instant</div>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl">
                        <div className="text-2xl mb-2">🔒</div>
                        <div className="font-semibold">Secure</div>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl">
                        <div className="text-2xl mb-2">📱</div>
                        <div className="font-semibold">Contactless</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credit Card */}
            <TabsContent value="card" className="mt-0">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    Credit Card Payment
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Enter card details for secure payment processing with industry-standard encryption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 max-w-lg mx-auto">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="4242 4242 4242 4242"
                          className="h-14 text-lg tracking-wider font-mono border-2 border-green-200 focus:border-green-400 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base font-semibold text-gray-700">Expiry</Label>
                          <Input
                            id="exp"
                            placeholder="MM/YY"
                            className="h-14 text-lg font-mono border-2 border-green-200 focus:border-green-400 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-semibold text-gray-700">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            className="h-14 text-lg font-mono border-2 border-green-200 focus:border-green-400 bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">ZIP Code</Label>
                        <Input
                          id="zip"
                          placeholder="12345"
                          className="h-14 text-lg font-mono border-2 border-green-200 focus:border-green-400 bg-white"
                        />
                      </div>
                    </div>
                    <Dialog open={cardPaymentDialogOpen} onOpenChange={setCardPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-14 text-lg font-semibold"
                        >
                          <Shield className="h-5 w-5 mr-2" />💳 Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-green-50/30">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                              <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            Credit Card Payment
                          </DialogTitle>
                          <DialogDescription className="text-base text-gray-600 mt-2">
                            Enter the invoice ID to process credit card payment.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogBody className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="card-invoice-id" className="text-base font-semibold text-gray-700">
                              Invoice ID *
                            </Label>
                            <Input
                              id="card-invoice-id"
                              value={selectedInvoiceId}
                              onChange={(e) => setSelectedInvoiceId(e.target.value)}
                              placeholder="Enter invoice ID..."
                              className="h-12 text-lg border-2 border-green-200 focus:border-green-400 bg-white"
                            />
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-green-700">
                              <Shield className="h-5 w-5" />
                              <div className="text-sm font-medium">
                                Your payment is secured with industry-standard encryption
                              </div>
                            </div>
                          </div>
                        </DialogBody>
                        <DialogFooter className="gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setCardPaymentDialogOpen(false)
                              setSelectedInvoiceId("")
                            }}
                            className="border-2 border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCardPayment}
                            disabled={!selectedInvoiceId}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-xl"
                          >
                            💳 Process Payment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACH */}
            <TabsContent value="ach" className="mt-0">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg">
                      <Banknote className="h-6 w-6 text-white" />
                    </div>
                    ACH Bank Transfer
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Connect your bank account for secure direct transfer payments with lower processing fees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-w-lg mx-auto">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-700">Routing Number</Label>
                      <Input
                        id="routing"
                        placeholder="110000000"
                        className="h-14 text-lg font-mono tracking-wider border-2 border-orange-200 focus:border-orange-400 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-700">Account Number</Label>
                      <Input
                        id="account"
                        placeholder="000123456789"
                        className="h-14 text-lg font-mono tracking-wider border-2 border-orange-200 focus:border-orange-400 bg-white"
                      />
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-orange-700">
                        <div className="text-lg">🏦</div>
                        <div className="text-sm font-medium">
                          ACH transfers typically take 1-3 business days to process and have lower fees than card
                          payments.
                        </div>
                      </div>
                    </div>
                    <Dialog open={achPaymentDialogOpen} onOpenChange={setAchPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-14 text-lg font-semibold w-full"
                        >
                          <Clock className="h-5 w-5 mr-2" />🏦 Authorize ACH Debit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-orange-50/30">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg">
                              <Banknote className="h-6 w-6 text-white" />
                            </div>
                            ACH Bank Transfer
                          </DialogTitle>
                          <DialogDescription className="text-base text-gray-600 mt-2">
                            Enter the invoice ID to process ACH bank transfer payment.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogBody className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="ach-invoice-id" className="text-base font-semibold text-gray-700">
                              Invoice ID *
                            </Label>
                            <Input
                              id="ach-invoice-id"
                              value={selectedInvoiceId}
                              onChange={(e) => setSelectedInvoiceId(e.target.value)}
                              placeholder="Enter invoice ID..."
                              className="h-12 text-lg border-2 border-orange-200 focus:border-orange-400 bg-white"
                            />
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div className="text-sm text-orange-700">
                                <p className="font-semibold mb-1">Processing Time:</p>
                                <p>ACH transfers take 1-3 business days to complete. Lower fees apply.</p>
                              </div>
                            </div>
                          </div>
                        </DialogBody>
                        <DialogFooter className="gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setAchPaymentDialogOpen(false)
                              setSelectedInvoiceId("")
                            }}
                            className="border-2 border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAchPayment}
                            disabled={!selectedInvoiceId}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-xl"
                          >
                            🏦 Authorize Payment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stripe Checkout */}
            <TabsContent value="stripe" className="mt-0">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    Stripe Checkout
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Redirect families to a secure Stripe Checkout page for fast, trusted online payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-w-lg mx-auto">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-700">
                        Select Invoice
                      </Label>
                      <Select
                        value={selectedInvoiceId || undefined}
                        onValueChange={(val) => {
                          console.log("Selected invoice:", val)
                          setSelectedInvoiceId(val)
                        }}
                      >
                        <SelectTrigger className="h-12 border-2 border-indigo-200 focus:border-indigo-400 bg-white">
                          <SelectValue placeholder="Choose invoice to pay with Stripe" />
                        </SelectTrigger>
                        <SelectContent>
                          {invoices.length === 0 && (
                            <SelectItem value="__none" disabled>
                              No invoices found
                            </SelectItem>
                          )}
                          {invoices.map((inv) => (
                            <SelectItem
                              key={inv.id}
                              value={inv.id}
                              disabled={inv.status === "paid"}
                            >
                              {inv.family} — ${inv.amount} ({inv.status}
                              {inv.status === "paid" ? " – already paid" : ""})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Paid invoices are disabled. Select a due/overdue invoice to pay via Stripe Checkout.
                      </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
                      <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="text-sm text-indigo-700">
                        <p className="font-semibold mb-1">Secure by Stripe</p>
                        <p>
                          Card details are never stored on your servers. All payments are handled
                          directly by Stripe with full PCI compliance.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleStripePayment}
                      disabled={
                        !selectedInvoiceId ||
                        selectedInvoiceId === "__none" ||
                        invoices.find((i) => i.id === selectedInvoiceId)?.status === "paid"
                      }
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Fast Pay 
                    </Button>
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
