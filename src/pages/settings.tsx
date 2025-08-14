"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { useBranding } from "../contexts/branding"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"

export default function Settings() {
  const { name, setName, logoUrl, setLogoUrl, accent, setAccent } = useBranding()
  const [gdpr, setGdpr] = React.useState(true)
  const [hipaa, setHipaa] = React.useState(true)
  const [audit, setAudit] = React.useState<string>("")

  return (
    <AppShell title="Security & Compliance">
      <div className="grid gap-6">
        <Section title="Branding" description="White-label settings per tenant.">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Name</Label>
              <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Accent</Label>
              <div className="flex gap-2">
                {["emerald", "violet", "amber", "rose", "cyan", "lime"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className={`h-6 w-6 rounded-full border ${accent === c ? "ring-2 ring-offset-2 ring-emerald-500/40" : ""} ${
                      c === "emerald"
                        ? "bg-emerald-500"
                        : c === "violet"
                          ? "bg-violet-500"
                          : c === "amber"
                            ? "bg-amber-500"
                            : c === "rose"
                              ? "bg-rose-500"
                              : c === "cyan"
                                ? "bg-cyan-500"
                                : "bg-lime-500"
                    }`}
                    aria-label={`Set accent ${c}`}
                  />
                ))}
              </div>
              <Button>Preview</Button>
            </div>
          </div>
        </Section>

        <Section title="Compliance" description="GDPR / HIPAA and parental consent controls.">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="gdpr" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} />
              <Label htmlFor="gdpr">GDPR Mode</Label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="hipaa" checked={hipaa} onChange={(e) => setHipaa(e.target.checked)} />
              <Label htmlFor="hipaa">HIPAA Mode</Label>
            </div>
            <Button variant="outline">Download DPA</Button>
          </div>
        </Section>

        <Section title="Audit Logs" description="Track system usage and changes.">
          <div className="space-y-2">
            <Textarea
              value={audit}
              onChange={(e) => setAudit(e.target.value)}
              placeholder="This demo collects no real logs. Append notes here..."
            />
            <div className="text-xs text-neutral-500">Logs should be immutable and retained per compliance policy.</div>
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
