import jsPDF from "jspdf"
import "jspdf-autotable"

interface ReportOptions {
  title: string
  subtitle?: string
  entity: string
  generatedBy?: string
}

interface BrandingConfig {
  brandName: string
  contact?: {
    name: string
    role: string
    email: string
    phone: string
  }
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

class UniversalPDFService {
  private addHeader(doc: jsPDF, title: string, subtitle: string, brandName: string) {
    // Gradient background effect (simulated with rectangles)
    doc.setFillColor(79, 70, 229) // Indigo
    doc.rect(0, 0, 220, 45, "F")
    doc.setFillColor(147, 51, 234) // Purple
    doc.rect(0, 0, 220, 35, "F")
    doc.setFillColor(59, 130, 246) // Blue
    doc.triangle(180, 0, 220, 0, 220, 40, "F")

    // White text on gradient
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text(title, 15, 20)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(subtitle, 15, 30)

    // Brand name in top right
    doc.setFontSize(10)
    doc.text(brandName, 200, 15, { align: "right" })

    // Reset text color
    doc.setTextColor(0, 0, 0)
  }

  private addFooter(doc: jsPDF, pageNumber: number, totalPages: number, contact?: BrandingConfig["contact"]) {
    const pageHeight = doc.internal.pageSize.height

    // Footer background
    doc.setFillColor(249, 250, 251)
    doc.rect(0, pageHeight - 25, 220, 25, "F")

    // Contact info
    if (contact) {
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(`${contact.name} | ${contact.role}`, 15, pageHeight - 15)
      doc.text(`${contact.email} | ${contact.phone}`, 15, pageHeight - 10)
    }

    // Page number
    doc.setTextColor(107, 114, 128)
    doc.text(`Page ${pageNumber} of ${totalPages}`, 200, pageHeight - 12, { align: "right" })

    // Generation timestamp
    doc.setFontSize(7)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, pageHeight - 8, { align: "center" })
  }

  private addSummaryCards(doc: jsPDF, summary: any, yPos: number) {
    const cardWidth = 45
    const cardHeight = 25
    const gap = 5
    let xPos = 15

    const cards = Object.entries(summary).slice(0, 4)

    cards.forEach(([key, value], index) => {
      // Card background with gradient effect
      const colors = [
        [59, 130, 246], // Blue
        [147, 51, 234], // Purple
        [236, 72, 153], // Pink
        [34, 197, 94], // Green
      ]

      doc.setFillColor(...colors[index % 4])
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "F")

      // White text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const label = key.replace(/([A-Z])/g, " $1").trim()
      doc.text(label.charAt(0).toUpperCase() + label.slice(1), xPos + cardWidth / 2, yPos + 10, { align: "center" })

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      const displayValue = typeof value === "number" ? value.toLocaleString() : String(value).slice(0, 10)
      doc.text(displayValue, xPos + cardWidth / 2, yPos + 20, { align: "center" })

      xPos += cardWidth + gap

      // Reset for next card
      doc.setTextColor(0, 0, 0)
    })

    return yPos + cardHeight + 15
  }

  downloadReport(data: any[], options: ReportOptions, branding: BrandingConfig) {
    try {
      console.log("Starting PDF generation with data:", data)
      console.log("Options:", options)

      const doc = new jsPDF()

      // Add header
      this.addHeader(
        doc,
        options.title,
        options.subtitle || `Comprehensive ${options.entity} report`,
        branding.brandName,
      )

      let currentY = 50

      // Handle different entity types
      switch (options.entity) {
        case "children":
          currentY = this.generateChildrenReport(doc, data, currentY)
          break
        case "attendance":
          currentY = this.generateAttendanceReport(doc, data, currentY)
          break
        case "billing":
          currentY = this.generateBillingReport(doc, data, currentY)
          break
        case "health":
          currentY = this.generateHealthReport(doc, data, currentY)
          break
        case "staff":
          currentY = this.generateStaffReport(doc, data, currentY)
          break
        case "shift":
          currentY = this.generateShiftReport(doc, data, currentY)
          break
        case "event":
          currentY = this.generateEventReport(doc, data, currentY)
          break
        case "booking":
          currentY = this.generateBookingReport(doc, data, currentY)
          break
        case "media":
          currentY = this.generateMediaReport(doc, data, currentY)
          break
        case "report":
          currentY = this.generateComprehensiveReport(doc, data, currentY)
          break
        default:
          currentY = this.generateGenericReport(doc, data, currentY)
      }

      // Add footer
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        this.addFooter(doc, i, totalPages, branding.contact)
      }

      // Download
      const filename = `${options.entity}-report-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(filename)

      console.log("PDF generated successfully:", filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw error
    }
  }

  private generateChildrenReport(doc: jsPDF, data: any[], startY: number): number {
    // Summary section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(79, 70, 229)
    doc.text("Children Overview", 15, startY)

    const summary = {
      total: data.length,
      active: data.filter((c: any) => c.status === "active").length,
      avgAge:
        data.length > 0 ? Math.round(data.reduce((sum: number, c: any) => sum + (c.age || 0), 0) / data.length) : 0,
    }

    const currentY = this.addSummaryCards(doc, summary, startY + 5)

    // Detailed table
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Detailed Children List", 15, currentY)

    const tableData = data.map((child: any) => [
      child.firstName + " " + child.lastName,
      child.age || "N/A",
      child.classroom || "Unassigned",
      child.family || "N/A",
      child.status || "active",
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Name", "Age", "Classroom", "Family", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateAttendanceReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(147, 51, 234)
    doc.text("Attendance Report", 15, startY)

    const summary = {
      totalRecords: data.length,
      present: data.filter((a: any) => a.status === "present").length,
      absent: data.filter((a: any) => a.status === "absent").length,
      late: data.filter((a: any) => a.status === "late").length,
    }

    const currentY = this.addSummaryCards(doc, summary, startY + 5)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Attendance Details", 15, currentY)

    const tableData = data.map((record: any) => [
      record.childName || "Unknown",
      record.date || new Date().toISOString().split("T")[0],
      record.status || "N/A",
      record.checkInTime || "-",
      record.checkOutTime || "-",
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Child Name", "Date", "Status", "Check In", "Check Out"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateBillingReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(34, 197, 94)
    doc.text("Billing & Payments Report", 15, startY)

    const totalRevenue = data.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
    const paidAmount = data
      .filter((b: any) => b.status === "paid")
      .reduce((sum: number, b: any) => sum + (b.amount || 0), 0)

    const summary = {
      totalInvoices: data.length,
      totalRevenue: `$${totalRevenue.toFixed(2)}`,
      paid: `$${paidAmount.toFixed(2)}`,
      outstanding: data.filter((b: any) => b.status !== "paid").length,
    }

    const currentY = this.addSummaryCards(doc, summary, startY + 5)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Invoice Details", 15, currentY)

    const tableData = data.map((invoice: any) => [
      invoice.family || "N/A",
      `$${(invoice.amount || 0).toFixed(2)}`,
      invoice.dueDate || "N/A",
      invoice.status || "pending",
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Family", "Amount", "Due Date", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateHealthReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(239, 68, 68)
    doc.text("Health Records Report", 15, startY)

    const summary = {
      totalRecords: data.length,
      allergies: data.filter((h: any) => h.type === "allergy").length,
      medications: data.filter((h: any) => h.type === "medication").length,
      highPriority: data.filter((h: any) => h.severity === "high" || h.priority === "high").length,
    }

    const currentY = this.addSummaryCards(doc, summary, startY + 5)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Health Record Details", 15, currentY)

    const tableData = data.map((record: any) => [
      record.childName || "Unknown",
      record.type || "N/A",
      record.description || "No description",
      record.severity || record.priority || "medium",
      record.date || new Date().toISOString().split("T")[0],
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Child Name", "Type", "Description", "Priority", "Date"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateStaffReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(168, 85, 247)
    doc.text("Staff Report", 15, startY)

    const summary = {
      totalStaff: data.length,
      active: data.filter((s: any) => s.status === "active").length,
      teachers: data.filter((s: any) => s.role === "teacher").length,
      onDuty: data.filter((s: any) => s.onShift).length,
    }

    const currentY = this.addSummaryCards(doc, summary, startY + 5)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Staff Details", 15, currentY)

    const tableData = data.map((staff: any) => [
      `${staff.firstName} ${staff.lastName}`,
      staff.role || "N/A",
      staff.email || "N/A",
      staff.phone || "N/A",
      staff.status || "active",
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Name", "Role", "Email", "Phone", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [168, 85, 247],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateShiftReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(59, 130, 246)
    doc.text("Staff Schedule Report", 15, startY)

    const tableData = data.map((shift: any) => [
      `${shift.firstName} ${shift.lastName}`,
      shift.role || "N/A",
      shift.date || "N/A",
      `${shift.startTime} - ${shift.endTime}`,
      shift.onShift ? "Yes" : "No",
    ])

    doc.autoTable({
      startY: startY + 10,
      head: [["Staff Name", "Role", "Date", "Shift Time", "On Duty"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateEventReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(236, 72, 153)
    doc.text("Events & Calendar Report", 15, startY)

    const tableData = data.map((event: any) => [
      event.title || event.name || "Untitled",
      event.type || "N/A",
      event.date || event.time || "N/A",
      event.location || "N/A",
      event.attendees?.length || "-",
    ])

    doc.autoTable({
      startY: startY + 10,
      head: [["Event Name", "Type", "Date/Time", "Location", "Attendees"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [236, 72, 153],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateBookingReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(249, 115, 22)
    doc.text("Bookings & Meetings Report", 15, startY)

    const tableData = data.map((booking: any) => [
      booking.parentName || "N/A",
      booking.childName || "N/A",
      booking.date || "N/A",
      booking.time || "N/A",
      booking.status || "pending",
    ])

    doc.autoTable({
      startY: startY + 10,
      head: [["Parent", "Child", "Date", "Time", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateMediaReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(20, 184, 166)
    doc.text("Media & Gallery Report", 15, startY)

    const summary = {
      totalItems: data.length,
      photos: data.filter((m: any) => m.type === "photo").length,
      videos: data.filter((m: any) => m.type === "video").length,
    }

    const currentY = this.addSummaryCards(doc, summary, startY + 5)

    const tableData = data.map((media: any) => [
      media.title || media.name || "Untitled",
      media.type || "N/A",
      media.uploadedBy || "Unknown",
      media.timestamp || media.createdAt || "N/A",
      media.tags?.join(", ") || "None",
    ])

    doc.autoTable({
      startY: currentY + 5,
      head: [["Title", "Type", "Uploaded By", "Date", "Tags"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }

  private generateComprehensiveReport(doc: jsPDF, data: any, startY: number): number {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(79, 70, 229)
    doc.text("Comprehensive Daily Report", 15, startY)

    // Main summary
    let currentY = startY + 10

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)

    // Children section
    doc.setFont("helvetica", "bold")
    doc.text("Children Overview", 15, currentY)
    currentY += 7

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Total Enrolled: ${data.totalChildren || 0}`, 20, currentY)
    currentY += 6
    doc.text(`Present Today: ${data.presentToday || 0}`, 20, currentY)
    currentY += 6
    doc.text(`Absent Today: ${data.absentToday || 0}`, 20, currentY)
    currentY += 12

    // Billing section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Financial Summary", 15, currentY)
    currentY += 7

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Total Revenue: $${(data.totalRevenue || 0).toFixed(2)}`, 20, currentY)
    currentY += 6
    doc.text(`Outstanding Invoices: ${data.outstandingInvoices || 0}`, 20, currentY)
    currentY += 12

    // Staff section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Staff Information", 15, currentY)
    currentY += 7

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Total Staff: ${data.totalStaff || 0}`, 20, currentY)
    currentY += 12

    // Health section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Health & Safety", 15, currentY)
    currentY += 7

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`High Priority Alerts: ${data.highPriorityAlerts || 0}`, 20, currentY)
    currentY += 6
    doc.text(`Medications Due: ${data.medicationsDue || 0}`, 20, currentY)
    currentY += 12

    // Events section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Upcoming Events", 15, currentY)
    currentY += 7

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Events Today: ${data.todayEventsCount || 0}`, 20, currentY)
    currentY += 6
    doc.text(`Upcoming Tours: ${data.upcomingTours || 0}`, 20, currentY)

    return currentY + 15
  }

  private generateGenericReport(doc: jsPDF, data: any[], startY: number): number {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Data Report", 15, startY)

    const tableData = data.map((item: any) => {
      const values = Object.values(item).slice(0, 5)
      return values.map((v) => String(v).slice(0, 30))
    })

    const headers = Object.keys(data[0] || {}).slice(0, 5)

    doc.autoTable({
      startY: startY + 10,
      head: [headers],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    })

    return doc.lastAutoTable.finalY + 10
  }
}

export const universalPDFService = new UniversalPDFService()
