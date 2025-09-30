import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface HealthNote {
  id: string
  noteType: string
  description: string
  date: string
  followUp?: string
  priority?: "low" | "medium" | "high"
  status?: "active" | "resolved" | "pending"
}

interface HealthRecord {
  id: string
  child: string
  childId: string
  allergies: string
  immunizations: string
  emergency: string
  notes: HealthNote[]
  bloodType?: string
  medications?: string[]
  lastCheckup?: string
}

class HealthPDFService {
  private brandColor = [16, 185, 129] // Emerald-500
  private accentColor = [20, 184, 166] // Teal-500
  private darkColor = [31, 41, 55] // Gray-800

  generateHealthRecordsPDF(records: HealthRecord[], centerName = "Salam Nest"): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Header with branding
    this.addHeader(doc, centerName, pageWidth)
    yPosition = 50

    // Title
    doc.setFontSize(22)
    doc.setTextColor(...this.darkColor)
    doc.setFont("helvetica", "bold")
    doc.text("Health Records Summary", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 10

    // Generation date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      pageWidth / 2,
      yPosition,
      { align: "center" },
    )
    yPosition += 15

    // Summary statistics
    const totalChildren = records.length
    const totalNotes = records.reduce((sum, r) => sum + r.notes.length, 0)
    const highPriorityCount = records.reduce((sum, r) => sum + r.notes.filter((n) => n.priority === "high").length, 0)
    const allergiesCount = records.filter((r) => r.allergies !== "None").length

    this.addSummaryBox(doc, yPosition, {
      totalChildren,
      totalNotes,
      highPriorityCount,
      allergiesCount,
    })
    yPosition += 35

    // Individual health records
    records.forEach((record, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      // Child header
      doc.setFillColor(...this.brandColor)
      doc.rect(14, yPosition, pageWidth - 28, 12, "F")
      doc.setFontSize(14)
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.text(record.child, 18, yPosition + 8)
      yPosition += 18

      // Basic health info
      const healthInfo = [
        ["Allergies", record.allergies || "None"],
        ["Immunizations", record.immunizations || "Up to date"],
        ["Emergency Contact", record.emergency || "Not provided"],
        ["Blood Type", record.bloodType || "Not specified"],
        ["Total Health Notes", record.notes.length.toString()],
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [["Category", "Information"]],
        body: healthInfo,
        theme: "striped",
        headStyles: {
          fillColor: this.accentColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: this.darkColor,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10

      // Recent health notes
      if (record.notes.length > 0) {
        const recentNotes = record.notes
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        doc.setFontSize(11)
        doc.setTextColor(...this.darkColor)
        doc.setFont("helvetica", "bold")
        doc.text("Recent Health Notes", 14, yPosition)
        yPosition += 6

        const notesData = recentNotes.map((note) => [
          note.date,
          note.noteType,
          note.priority?.toUpperCase() || "MEDIUM",
          note.status?.toUpperCase() || "ACTIVE",
          note.description.substring(0, 60) + (note.description.length > 60 ? "..." : ""),
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Date", "Type", "Priority", "Status", "Description"]],
          body: notesData,
          theme: "grid",
          headStyles: {
            fillColor: [209, 250, 229], // Emerald-100
            textColor: this.darkColor,
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
            textColor: this.darkColor,
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: "auto" },
          },
          didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 2) {
              // Color code priority
              const priority = data.cell.text[0]
              if (priority === "HIGH") {
                data.cell.styles.fillColor = [254, 226, 226] // Red-100
                data.cell.styles.textColor = [153, 27, 27] // Red-900
              } else if (priority === "MEDIUM") {
                data.cell.styles.fillColor = [254, 249, 195] // Yellow-100
                data.cell.styles.textColor = [133, 77, 14] // Yellow-900
              } else {
                data.cell.styles.fillColor = [220, 252, 231] // Green-100
                data.cell.styles.textColor = [20, 83, 45] // Green-900
              }
            }
          },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      } else {
        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)
        doc.setFont("helvetica", "italic")
        doc.text("No health notes recorded", 14, yPosition)
        yPosition += 15
      }
    })

    // Footer on last page
    this.addFooter(doc, centerName, pageHeight)

    // Save the PDF
    const fileName = `health-records-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

  private addHeader(doc: jsPDF, centerName: string, pageWidth: number): void {
    // Brand bar
    doc.setFillColor(...this.brandColor)
    doc.rect(0, 0, pageWidth, 35, "F")

    // Center name
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text(centerName, pageWidth / 2, 15, { align: "center" })

    // Subtitle
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Childcare Management System", pageWidth / 2, 25, { align: "center" })
  }

  private addSummaryBox(
    doc: jsPDF,
    yPosition: number,
    stats: {
      totalChildren: number
      totalNotes: number
      highPriorityCount: number
      allergiesCount: number
    },
  ): void {
    const boxWidth = 180
    const boxHeight = 25
    const startX = 15

    // Background
    doc.setFillColor(240, 253, 244) // Green-50
    doc.setDrawColor(...this.brandColor)
    doc.setLineWidth(0.5)
    doc.rect(startX, yPosition, boxWidth, boxHeight, "FD")

    // Title
    doc.setFontSize(11)
    doc.setTextColor(...this.darkColor)
    doc.setFont("helvetica", "bold")
    doc.text("Overview", startX + 5, yPosition + 7)

    // Stats
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const statY = yPosition + 15
    const colWidth = boxWidth / 4

    doc.text(`Children: ${stats.totalChildren}`, startX + 5, statY)
    doc.text(`Total Notes: ${stats.totalNotes}`, startX + colWidth + 5, statY)
    doc.text(`High Priority: ${stats.highPriorityCount}`, startX + colWidth * 2 + 5, statY)
    doc.text(`With Allergies: ${stats.allergiesCount}`, startX + colWidth * 3 + 5, statY)
  }

  private addFooter(doc: jsPDF, centerName: string, pageHeight: number): void {
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont("helvetica", "italic")
    doc.text(
      `© ${new Date().getFullYear()} ${centerName} - Confidential Health Records`,
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 10,
      { align: "center" },
    )
  }
}

export const healthPDFService = new HealthPDFService()
