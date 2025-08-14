import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"

export default function Health() {
  const rows = [
    { child: "Ava Johnson", allergies: "Peanuts", immunizations: "Up to date", emergency: "EpiPen in office" },
    { child: "Mia Chen", allergies: "Dairy", immunizations: "Missing Flu", emergency: "N/A" },
    { child: "Noah Smith", allergies: "None", immunizations: "Up to date", emergency: "N/A" },
  ]
  return (
    <AppShell title="Health Records">
      <Section title="Medical Records" description="Allergies, immunizations, and emergency information.">
        <div className="flex gap-2 mb-3">
          <Button size="sm">New Health Note</Button>
          <Button variant="outline" size="sm">
            Download Summary PDF
          </Button>
        </div>
        <div className="rounded-xl border bg-white/70 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Immunizations</TableHead>
                <TableHead>Emergency Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.child}>
                  <TableCell className="font-medium">{r.child}</TableCell>
                  <TableCell>
                    {r.allergies === "None" ? <span className="text-neutral-500">None</span> : r.allergies}
                  </TableCell>
                  <TableCell>{r.immunizations}</TableCell>
                  <TableCell>{r.emergency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
    </AppShell>
  )
}
