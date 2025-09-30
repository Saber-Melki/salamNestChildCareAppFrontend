import jsPDF from "jspdf"
import "jspdf-autotable"

interface ReportData {
  totalChildren: number
  presentToday: number
  absentToday: number
  totalAttendanceRecords: number
  totalRevenue: number
  outstandingInvoices: number
  totalStaff: number
  highPriorityAlerts: number
  medicationsDue: number
  upcomingEvents: number
  todayEventsCount: number
  upcomingTours: number
}

class PDFReportService {
  generateDailyReport(data: ReportData, brandName = "Salam Nest"): jsPDF {
    try {
      console.log("[v0] Starting PDF generation with data:", data)

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header with gradient effect (simulated with rectangles)
      doc.setFillColor(99, 102, 241) // Indigo
      doc.rect(0, 0, pageWidth, 45, "F")

      doc.setFillColor(139, 92, 246) // Purple overlay
      doc.rect(0, 0, pageWidth, 45, "F")

      // Brand name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.setFont("helvetica", "bold")
      doc.text(brandName, pageWidth / 2, 20, { align: "center" })

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.text("Daily Comprehensive Report", pageWidth / 2, 30, { align: "center" })

      // Date
      doc.setFontSize(10)
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      doc.text(today, pageWidth / 2, 38, { align: "center" })

      // Reset text color for body
      doc.setTextColor(0, 0, 0)
      let yPos = 55

      // Overall Summary Section
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(99, 102, 241)
      doc.text("📊 Overall Summary", 15, yPos)
      yPos += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(60, 60, 60)

      const attendanceRate =
        data.totalAttendanceRecords > 0 ? Math.round((data.presentToday / data.totalAttendanceRecords) * 100) : 0

      const summaryData = [
        ["Total Children Enrolled", data.totalChildren.toString()],
        ["Present Today", `${data.presentToday} / ${data.totalAttendanceRecords}`],
        ["Attendance Rate", `${attendanceRate}%`],
        ["Total Staff Members", data.totalStaff.toString()],
        ["Monthly Revenue", `$${data.totalRevenue.toLocaleString()}`],
        ["Outstanding Invoices", data.outstandingInvoices.toString()],
      ]
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 15, right: 15 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15

      // Attendance Section
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(99, 102, 241)
      doc.text("📅 Today's Attendance", 15, yPos)
      yPos += 10

      const presentPercent =
        data.totalAttendanceRecords > 0 ? Math.round((data.presentToday / data.totalAttendanceRecords) * 100) : 0
      const absentPercent =
        data.totalAttendanceRecords > 0 ? Math.round((data.absentToday / data.totalAttendanceRecords) * 100) : 0

      const attendanceData = [
        ["Present", data.presentToday.toString(), `${presentPercent}%`],
        ["Absent", data.absentToday.toString(), `${absentPercent}%`],
        ["Total Records", data.totalAttendanceRecords.toString(), "100%"],
      ]
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Status", "Count", "Percentage"]],
        body: attendanceData,
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        margin: { left: 15, right: 15 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15

      // Health & Safety Section
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(239, 68, 68) // Red for health alerts
      doc.text("❤️ Health & Safety", 15, yPos)
      yPos += 10

      const healthData = [
        ["High-Priority Alerts", data.highPriorityAlerts.toString()],
        ["Medications Due Today", data.medicationsDue.toString()],
      ]
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Category", "Count"]],
        body: healthData,
        theme: "plain",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        margin: { left: 15, right: 15 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15

      // Financial Overview
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(34, 197, 94) // Green for financial
      doc.text("💰 Financial Overview", 15, yPos)
      yPos += 10

      const totalExpected = data.totalRevenue + data.outstandingInvoices * 850
      const collectionRate = totalExpected > 0 ? Math.round((data.totalRevenue / totalExpected) * 100) : 0

      const financialData = [
        ["Total Revenue", `$${data.totalRevenue.toLocaleString()}`],
        ["Outstanding Invoices", data.outstandingInvoices.toString()],
        ["Collection Rate", `${collectionRate}%`],
      ]
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Metric", "Value"]],
        body: financialData,
        theme: "striped",
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: 15, right: 15 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15

      // Schedule Section
      if (yPos > pageHeight - 60) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(99, 102, 241)
      doc.text("🗓️ Schedule Overview", 15, yPos)
      yPos += 10

      const scheduleData = [
        ["Today's Events", data.todayEventsCount.toString()],
        ["Upcoming Events", data.upcomingEvents.toString()],
        ["Upcoming Tours", data.upcomingTours.toString()],
      ]
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Category", "Count"]],
        body: scheduleData,
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        margin: { left: 15, right: 15 },
      })

      // Footer
      const footerY = pageHeight - 20
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.setFont("helvetica", "italic")
      doc.text(
        `Generated by ${brandName} Management System on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        footerY,
        {
          align: "center",
        },
      )

      // Page border
      doc.setDrawColor(99, 102, 241)
      doc.setLineWidth(0.5)
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10)

      console.log("[v0] PDF generation completed successfully")
      return doc
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  downloadReport(data: ReportData, brandName = "Salam Nest"): void {
    try {
      console.log("[v0] Attempting to download PDF report")
      const doc = this.generateDailyReport(data, brandName)
      const fileName = `${brandName.replace(/\s+/g, "_")}_Daily_Report_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
      console.log("[v0] PDF downloaded successfully:", fileName)
    } catch (error) {
      console.error("[v0] Error downloading PDF:", error)
      throw error
    }
  }

  previewReport(data: ReportData, brandName = "Salam Nest"): string {
    try {
      const doc = this.generateDailyReport(data, brandName)
      return doc.output("dataurlstring")
    } catch (error) {
      console.error("[v0] Error previewing PDF:", error)
      throw error
    }
  }
}

export const pdfReportService = new PDFReportService()
