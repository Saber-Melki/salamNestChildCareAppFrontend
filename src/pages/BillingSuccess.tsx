// src/pages/billing-success.tsx
"use client"

import React from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, ArrowLeft, Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"

export default function BillingSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = params.get("session_id")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Card className="max-w-xl w-full mx-4 shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Payment Successful 🎉
          </CardTitle>
          <CardDescription className="mt-2 text-base text-gray-600">
            Thank you! Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center pt-4 pb-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 justify-center">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-800">
              The invoice status will be updated automatically once the Stripe webhook is received.
            </p>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-400 mt-2">
              Stripe session:&nbsp;
              <span className="font-mono break-all">{sessionId}</span>
            </p>
          )}

          <div className="flex justify-center mt-4">
            <Button
              onClick={() => navigate("/billing")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
