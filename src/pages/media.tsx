import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"

export default function Media() {
  return (
    <AppShell title="Media Sharing">
      <Section title="Photos & Videos" description="Share moments securely with parents.">
        <div className="flex gap-2 mb-3">
          <Button size="sm">Upload</Button>
          <Button size="sm" variant="outline">
            Create Album
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border bg-white/70",
                i % 7 === 0 || i % 7 === 3 ? "md:col-span-2" : "",
              )}
            >
              <img
                src="/garderie.jpg"
                alt={`Classroom moment ${i + 1}`}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </Section>
    </AppShell>
  )
}
