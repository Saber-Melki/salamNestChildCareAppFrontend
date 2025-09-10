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
  const [invoices, setInvoices] = React.useState<Invoice[]>([])

  const [formData, setFormData] = React.useState({
    family: "",
    dueDate: "",
    items: [{ description: "Monthly Tuition", amount: "" }],
    notes: "",
  })

  // 🟢 Ajouter un item dans le formulaire
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

  // 🟢 Fonction pour créer un invoice via le microservice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      family: formData.family,
      dueDate: formData.dueDate,
      items: formData.items.map((item) => ({
        description: item.description,
        amount: parseFloat(item.amount || "0"),
      })),
      notes: formData.notes,
    }

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to create invoice")
      const newInvoice = await res.json()

      setInvoices((prev) => [...prev, newInvoice])
      setFormData({ family: "", dueDate: "", items: [{ description: "Monthly Tuition", amount: "" }], notes: "" })
      setInvoiceDialogOpen(false)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la création de l'invoice")
    }
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0)

  React.useEffect(() => {
    // 🟢 Charger la liste des invoices depuis le microservice
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/billing")
        const data = await res.json()
        setInvoices(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchInvoices()
  }, [])

  return (
    <AppShell title="Invoicing & Payments">
      <div className="space-y-6">
        <Section title="Automated Billing" description="Tuition and fee schedules with reminders for overdue balances.">
          <div className="flex gap-2">
            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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
                          <SelectTrigger className="mt-1">{formData.family || "Select family"}</SelectTrigger>
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

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                // envoyer rappel pour invoices overdue
                await fetch("/api/billing/remind/overdue", { method: "POST" })
                alert("Overdue reminders sent!")
              }}
            >
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
                  const res = await fetch(`/api/billing/pay`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId, method: "tap" }),
                  })
                  if (!res.ok) throw new Error("Payment failed")
                  alert("Payment successful!")
                  // refresh invoices
                  const updated = await fetch("/api/billing")
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
                  const res = await fetch(`/api/billing/pay`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId, method: "card" }),
                  })
                  if (!res.ok) throw new Error("Payment failed")
                  alert("Credit Card payment successful!")
                  const updated = await fetch("/api/billing")
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
                const res = await fetch(`/api/billing/pay`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ invoiceId, method: "ach" }),
                })
                if (!res.ok) throw new Error("Payment failed")
                alert("ACH payment successful!")
                const updated = await fetch("/api/billing")
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
