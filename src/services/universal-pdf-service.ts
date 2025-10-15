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
    try {
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
    } catch (error) {
      console.error("Error adding header:", error)
      // Continue with basic header
      doc.setFontSize(18)
      doc.text(title, 15, 20)
    }
  }

  private addFooter(doc: jsPDF, pageNumber: number, totalPages: number, contact?: BrandingConfig["contact"]) {
    try {
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
    } catch (error) {
      console.error("Error adding footer:", error)
    }
  }

  private addSummaryCards(doc: jsPDF, summary: any, yPos: number) {
    try {
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

        doc.setFillColor(...(colors[index % 4] as [number, number, number]))
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
    } catch (error) {
      console.error("Error adding summary cards:", error)
      return yPos + 10
    }
  }

  private addSectionHeader(doc: jsPDF, title: string, yPos: number, color: [number, number, number]) {
    doc.setFillColor(...color)
    doc.rect(15, yPos - 5, 180, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(title, 20, yPos + 3)
    doc.setTextColor(0, 0, 0)
    return yPos + 15
  }

  private checkPageBreak(doc: jsPDF, currentY: number, spaceNeeded = 30): number {
    const pageHeight = doc.internal.pageSize.height
    if (currentY + spaceNeeded > pageHeight - 30) {
      doc.addPage()
      return 20 // Reset to top of new page
    }
    return currentY
  }

  private normalizeData(data: any): any[] {
    // Handle various data formats and normalize to array
    if (!data) {
      console.warn("No data provided")
      return []
    }

    // Already an array
    if (Array.isArray(data)) {
      return data
    }

    // Object with data property
    if (typeof data === "object" && data.data) {
      if (Array.isArray(data.data)) {
        return data.data
      }
      return [data.data]
    }

    // Single object - wrap in array
    if (typeof data === "object") {
      return [data]
    }

    // Primitive - wrap in array
    return [{ value: data }]
  }

  downloadReport(rawData: any, options: ReportOptions, branding: BrandingConfig) {
    try {
      console.log("🔷 Starting PDF generation")
      console.log("📊 Raw data received:", rawData)
      console.log("⚙�� Options:", options)

      // Normalize data to array format
      const data = this.normalizeData(rawData)
      console.log("✅ Normalized data:", data)

      if (!data || data.length === 0) {
        console.warn("⚠️ No data to generate PDF")
        alert("No data available to generate PDF. Please try a different query.")
        return
      }

      const doc = new jsPDF()

      // Add header
      this.addHeader(
        doc,
        options.title,
        options.subtitle || `Comprehensive ${options.entity} report`,
        branding.brandName,
      )

      let currentY = 50

      // Handle different entity types with error handling
      try {
        switch (options.entity) {
          case "children":
            currentY = this.generateChildrenReport(doc, data, currentY)
            break
          case "attendance":
            currentY = this.generateAttendanceReport(doc, data, currentY)
            break
          case "billing":
          case "invoice":
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
            currentY = this.generateComprehensiveReport(doc, data[0] || {}, currentY)
            break
          default:
            console.log("Using generic report for entity:", options.entity)
            currentY = this.generateGenericReport(doc, data, currentY)
        }
      } catch (entityError) {
        console.error("Error generating specific report, falling back to generic:", entityError)
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

      console.log("✅ PDF generated successfully:", filename)
    } catch (error) {
      console.error("❌ Fatal error generating PDF:", error)
      alert(
        `Error generating PDF: ${error instanceof Error ? error.message : "Unknown error"}. Please try again or contact support.`,
      )
      throw error
    }
  }

  private generateChildrenReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      // Executive Summary
      currentY = this.addSectionHeader(doc, "📊 EXECUTIVE SUMMARY", currentY, [79, 70, 229])

      const totalChildren = data.length
      const ages = data.map((c: any) => c.age || 0).filter((age) => age > 0)
      const avgAge = ages.length > 0 ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1) : "N/A"
      const minAge = ages.length > 0 ? Math.min(...ages) : 0
      const maxAge = ages.length > 0 ? Math.max(...ages) : 0

      // Age distribution
      const infants = data.filter((c: any) => (c.age || 0) < 2).length
      const toddlers = data.filter((c: any) => (c.age || 0) >= 2 && (c.age || 0) < 4).length
      const preschool = data.filter((c: any) => (c.age || 0) >= 4 && (c.age || 0) < 6).length
      const schoolAge = data.filter((c: any) => (c.age || 0) >= 6).length

      // Group distribution
      const groups = Array.from(new Set(data.map((c: any) => c.group).filter(Boolean)))
      const childrenWithAllergies = data.filter((c: any) => c.allergies && c.allergies !== "None").length

      const summary = {
        total: totalChildren,
        groups: groups.length,
        allergies: childrenWithAllergies,
        avgAge: avgAge,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Detailed Statistics
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Age Distribution:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(
        `• Infants (0-2 years): ${infants} children (${((infants / totalChildren) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 5
      doc.text(
        `• Toddlers (2-4 years): ${toddlers} children (${((toddlers / totalChildren) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 5
      doc.text(
        `• Preschool (4-6 years): ${preschool} children (${((preschool / totalChildren) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 5
      doc.text(
        `• School Age (6+ years): ${schoolAge} children (${((schoolAge / totalChildren) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 10

      doc.setFont("helvetica", "bold")
      doc.text("Age Range:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(`• Youngest: ${minAge} years`, 20, currentY)
      currentY += 5
      doc.text(`• Oldest: ${maxAge} years`, 20, currentY)
      currentY += 5
      doc.text(`• Average Age: ${avgAge} years`, 20, currentY)
      currentY += 15

      currentY = this.checkPageBreak(doc, currentY, 40)

      // Group Distribution
      currentY = this.addSectionHeader(doc, "🏫 GROUP DISTRIBUTION", currentY, [147, 51, 234])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      groups.forEach((group) => {
        const count = data.filter((c: any) => c.group === group).length
        doc.text(`• ${group}: ${count} children (${((count / totalChildren) * 100).toFixed(1)}%)`, 20, currentY)
        currentY += 6
      })

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Family Distribution
      currentY = this.addSectionHeader(doc, "👨‍👩‍👧 FAMILY OVERVIEW", currentY, [34, 197, 94])

      const families = Array.from(new Set(data.map((c: any) => c.family).filter(Boolean)))
      doc.setFontSize(10)
      doc.text(`Total Families Enrolled: ${families.length}`, 20, currentY)
      currentY += 6
      doc.text(`Average Children per Family: ${(totalChildren / families.length).toFixed(2)}`, 20, currentY)
      currentY += 6

      // Multi-child families
      const familyCounts: { [key: string]: number } = {}
      data.forEach((child: any) => {
        if (child.family) {
          familyCounts[child.family] = (familyCounts[child.family] || 0) + 1
        }
      })

      const multiChildFamilies = Object.entries(familyCounts).filter(([_, count]) => count > 1)
      doc.text(`Families with Multiple Children: ${multiChildFamilies.length}`, 20, currentY)
      currentY += 10

      // Allergy Information
      if (childrenWithAllergies > 0) {
        currentY = this.checkPageBreak(doc, currentY, 40)
        currentY = this.addSectionHeader(doc, "⚠️ ALLERGY ALERTS", currentY, [239, 68, 68])

        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Children with Allergies: ${childrenWithAllergies}`, 20, currentY)
        currentY += 8
        doc.setFont("helvetica", "normal")

        data
          .filter((c: any) => c.allergies && c.allergies !== "None")
          .forEach((child: any) => {
            const name = `${child.firstName} ${child.lastName}`
            doc.text(`• ${name}: ${child.allergies}`, 25, currentY)
            currentY += 5
          })

        currentY += 10
      }

      currentY = this.checkPageBreak(doc, currentY, 60)

      // Authorized Pickups Summary
      currentY = this.addSectionHeader(doc, "🔐 AUTHORIZED PICKUPS", currentY, [168, 85, 247])

      const totalAuthorized = data.reduce((sum: number, c: any) => sum + (c.authorizedPickups || 1), 0)
      const avgAuthorized = (totalAuthorized / totalChildren).toFixed(1)

      doc.setFontSize(10)
      doc.text(`Total Authorized Pickups: ${totalAuthorized}`, 20, currentY)
      currentY += 6
      doc.text(`Average per Child: ${avgAuthorized}`, 20, currentY)
      currentY += 10

      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Children Roster
      currentY = this.addSectionHeader(doc, "📋 COMPLETE CHILDREN ROSTER", currentY, [236, 72, 153])

      const tableData = data.map((child: any, index: number) => [
        (index + 1).toString(),
        `${child.firstName || ""} ${child.lastName || ""}`.trim() || "Unknown",
        child.age?.toString() || "N/A",
        child.group || "Unassigned",
        child.family || "N/A",
        child.allergies || "None",
        (child.authorizedPickups || 1).toString(),
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Name", "Age", "Group", "Family", "Allergies", "Auth Pickups"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [236, 72, 153],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 15 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 40 },
          6: { cellWidth: 20 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Emergency Contact Information
      currentY = this.checkPageBreak(doc, currentY, 60)
      currentY = this.addSectionHeader(doc, "🚨 EMERGENCY CONTACTS", currentY, [239, 68, 68])

      const emergencyTableData = data.map((child: any, index: number) => [
        (index + 1).toString(),
        `${child.firstName} ${child.lastName}`,
        child.emergencyContact || "N/A",
        child.emergencyPhone || "N/A",
        child.parentEmail || "N/A",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Child Name", "Emergency Contact", "Phone", "Parent Email"]],
        body: emergencyTableData,
        theme: "grid",
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 RECOMMENDATIONS & INSIGHTS", currentY, [59, 130, 246])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      if (infants > totalChildren * 0.3) {
        doc.text("• High percentage of infants - ensure adequate infant care staff and resources", 20, currentY)
        currentY += 6
      }

      if (childrenWithAllergies > totalChildren * 0.2) {
        doc.text("• Significant number of children with allergies - review allergy protocols", 20, currentY)
        currentY += 6
      }

      if (multiChildFamilies.length > families.length * 0.5) {
        doc.text("• Many multi-child families - consider sibling discount programs", 20, currentY)
        currentY += 6
      }

      const largestGroup = groups.reduce((max, group) => {
        const count = data.filter((c: any) => c.group === group).length
        return count > (max.count || 0) ? { name: group, count } : max
      }, {} as any)

      if (largestGroup.count > totalChildren * 0.4) {
        doc.text(`• ${largestGroup.name} has high enrollment - monitor group ratios`, 20, currentY)
        currentY += 6
      }

      doc.text("• Maintain current enrollment records and update contact information quarterly", 20, currentY)
      currentY += 6
      doc.text("• Review age-appropriate programs and activities regularly", 20, currentY)
      currentY += 6
      doc.text("• Verify emergency contact information and authorized pickups monthly", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateChildrenReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateAttendanceReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      // Executive Summary
      currentY = this.addSectionHeader(doc, "📊 ATTENDANCE EXECUTIVE SUMMARY", currentY, [147, 51, 234])

      const totalRecords = data.length
      const presentCount = data.filter((a: any) => a.status === "present").length
      const awayCount = data.filter((a: any) => a.status === "away").length

      const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : "0"
      const absenceRate = totalRecords > 0 ? ((awayCount / totalRecords) * 100).toFixed(1) : "0"

      const summary = {
        totalRecords,
        present: presentCount,
        away: awayCount,
        rate: `${attendanceRate}%`,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Detailed Statistics
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Attendance Metrics:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(`• Overall Attendance Rate: ${attendanceRate}%`, 20, currentY)
      currentY += 5
      doc.text(`• Absence Rate: ${absenceRate}%`, 20, currentY)
      currentY += 5
      doc.text(`• Total Days Recorded: ${totalRecords}`, 20, currentY)
      currentY += 10

      // Check-in/Check-out Analysis
      currentY = this.checkPageBreak(doc, currentY, 40)
      doc.setFont("helvetica", "bold")
      doc.text("Time Analysis:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")

      const checkIns = data.filter((a: any) => a.checkIn).map((a: any) => a.checkIn)
      if (checkIns.length > 0) {
        doc.text(`• Total Check-ins Recorded: ${checkIns.length}`, 20, currentY)
        currentY += 5
        doc.text(`• Average Check-in Time: ${this.calculateAverageTime(checkIns)}`, 20, currentY)
        currentY += 5
        doc.text(`• Earliest Check-in: ${this.getEarliestTime(checkIns)}`, 20, currentY)
        currentY += 5
        doc.text(`• Latest Check-in: ${this.getLatestTime(checkIns)}`, 20, currentY)
        currentY += 5
      }

      const checkOuts = data.filter((a: any) => a.checkOut).map((a: any) => a.checkOut)
      if (checkOuts.length > 0) {
        doc.text(`• Total Check-outs Recorded: ${checkOuts.length}`, 20, currentY)
        currentY += 5
        doc.text(`• Average Check-out Time: ${this.calculateAverageTime(checkOuts)}`, 20, currentY)
        currentY += 5
        doc.text(`• Earliest Check-out: ${this.getEarliestTime(checkOuts)}`, 20, currentY)
        currentY += 5
        doc.text(`• Latest Check-out: ${this.getLatestTime(checkOuts)}`, 20, currentY)
        currentY += 5
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Child-Specific Analysis
      currentY = this.addSectionHeader(doc, "👶 INDIVIDUAL ATTENDANCE PATTERNS", currentY, [236, 72, 153])

      const childAttendance: { [key: string]: { present: number; away: number; total: number } } = {}

      data.forEach((record: any) => {
        const childId = record.childId || "Unknown"
        if (!childAttendance[childId]) {
          childAttendance[childId] = { present: 0, away: 0, total: 0 }
        }
        childAttendance[childId].total++
        if (record.status === "present") childAttendance[childId].present++
        if (record.status === "away") childAttendance[childId].away++
      })

      // Perfect attendance
      const perfectAttendance = Object.entries(childAttendance).filter(([_, stats]) => stats.away === 0)

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Perfect Attendance (${perfectAttendance.length} children):`, 20, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")

      perfectAttendance.slice(0, 10).forEach(([childId, stats]) => {
        doc.text(`• Child ID ${childId}: ${stats.present} days present`, 25, currentY)
        currentY += 5
      })

      if (perfectAttendance.length > 10) {
        doc.text(`... and ${perfectAttendance.length - 10} more`, 25, currentY)
        currentY += 5
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Frequent absences
      const frequentAbsences = Object.entries(childAttendance)
        .filter(([_, stats]) => stats.away > 0)
        .sort((a, b) => b[1].away - a[1].away)
        .slice(0, 10)

      if (frequentAbsences.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("Frequent Absences (Top 10):", 20, currentY)
        currentY += 6
        doc.setFont("helvetica", "normal")

        frequentAbsences.forEach(([childId, stats]) => {
          const rate = ((stats.away / stats.total) * 100).toFixed(1)
          doc.text(`• Child ID ${childId}: ${stats.away} days away (${rate}%)`, 25, currentY)
          currentY += 5
        })
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Date Range Analysis
      currentY = this.addSectionHeader(doc, "📅 DATE RANGE ANALYSIS", currentY, [34, 197, 94])

      const dates = data
        .map((a: any) => a.date)
        .filter(Boolean)
        .sort()
      if (dates.length > 0) {
        doc.setFontSize(10)
        doc.text(`Earliest Date: ${dates[0]}`, 20, currentY)
        currentY += 6
        doc.text(`Latest Date: ${dates[dates.length - 1]}`, 20, currentY)
        currentY += 6
        doc.text(`Date Range: ${dates.length} unique days`, 20, currentY)
        currentY += 10
      }

      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Attendance Records
      currentY = this.addSectionHeader(doc, "📋 COMPLETE ATTENDANCE RECORDS", currentY, [59, 130, 246])

      const tableData = data.map((record: any, index: number) => [
        (index + 1).toString(),
        record.childId || "Unknown",
        record.date || "N/A",
        record.status === "present" ? "✓ Present" : "✗ Away",
        record.checkIn || "-",
        record.checkOut || "-",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Child ID", "Date", "Status", "Check In", "Check Out"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 RECOMMENDATIONS & ACTION ITEMS", currentY, [168, 85, 247])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      if (Number.parseFloat(absenceRate) > 15) {
        doc.text("• High absence rate detected - consider parent communication campaign", 20, currentY)
        currentY += 6
      }

      if (frequentAbsences.length > 0) {
        doc.text(
          `• Follow up with families of ${frequentAbsences.length} children with frequent absences`,
          20,
          currentY,
        )
        currentY += 6
      }

      if (perfectAttendance.length > 0) {
        doc.text(`• Recognize ${perfectAttendance.length} children with perfect attendance`, 20, currentY)
        currentY += 6
      }

      doc.text("• Monitor attendance trends weekly for early intervention", 20, currentY)
      currentY += 6
      doc.text("• Ensure all check-in/check-out times are properly recorded", 20, currentY)
      currentY += 6
      doc.text("• Review attendance policies with families quarterly", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateAttendanceReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateBillingReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      // Executive Summary
      currentY = this.addSectionHeader(doc, "💰 FINANCIAL EXECUTIVE SUMMARY", currentY, [34, 197, 94])

      const totalInvoices = data.length
      const totalRevenue = data.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0)
      const paidInvoices = data.filter((b: any) => b.status === "paid")
      const paidAmount = paidInvoices.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0)
      const dueInvoices = data.filter((b: any) => b.status === "due")
      const dueAmount = dueInvoices.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0)
      const overdueInvoices = data.filter((b: any) => b.status === "overdue")
      const overdueAmount = overdueInvoices.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0)

      const collectionRate = totalRevenue > 0 ? ((paidAmount / totalRevenue) * 100).toFixed(1) : "0"
      const averageInvoice = totalInvoices > 0 ? (totalRevenue / totalInvoices).toFixed(2) : "0"

      const summary = {
        totalInvoices,
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        paid: `$${paidAmount.toLocaleString()}`,
        outstanding: dueInvoices.length + overdueInvoices.length,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Detailed Financial Metrics
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Revenue Analysis:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(`• Total Revenue: $${totalRevenue.toLocaleString()}`, 20, currentY)
      currentY += 5
      doc.text(`• Collected: $${paidAmount.toLocaleString()} (${collectionRate}%)`, 20, currentY)
      currentY += 5
      doc.text(`• Due: $${dueAmount.toLocaleString()}`, 20, currentY)
      currentY += 5
      doc.text(`• Overdue: $${overdueAmount.toLocaleString()}`, 20, currentY)
      currentY += 5
      doc.text(`• Average Invoice: $${averageInvoice}`, 20, currentY)
      currentY += 10

      // Invoice Status Breakdown
      doc.setFont("helvetica", "bold")
      doc.text("Invoice Status Distribution:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(
        `• Paid: ${paidInvoices.length} invoices (${((paidInvoices.length / totalInvoices) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 5
      doc.text(
        `• Due: ${dueInvoices.length} invoices (${((dueInvoices.length / totalInvoices) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 5
      doc.text(
        `• Overdue: ${overdueInvoices.length} invoices (${((overdueInvoices.length / totalInvoices) * 100).toFixed(1)}%)`,
        20,
        currentY,
      )
      currentY += 10

      currentY = this.checkPageBreak(doc, currentY, 40)

      // Payment Timeline Analysis
      currentY = this.addSectionHeader(doc, "📅 PAYMENT TIMELINE ANALYSIS", currentY, [147, 51, 234])

      const upcomingDue = data.filter((b: any) => {
        if (!b.dueDate) return false
        const dueDate = new Date(b.dueDate)
        const today = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDue > 0 && daysUntilDue <= 7 && b.status !== "paid"
      })

      const upcomingDueAmount = upcomingDue.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0)

      doc.setFontSize(10)
      doc.text(`Invoices Due Within 7 Days: ${upcomingDue.length}`, 20, currentY)
      currentY += 6
      doc.text(`Total Amount: $${upcomingDueAmount.toLocaleString()}`, 20, currentY)
      currentY += 10

      if (overdueInvoices.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setTextColor(239, 68, 68)
        doc.text("⚠️ OVERDUE INVOICES REQUIRING IMMEDIATE ATTENTION:", 20, currentY)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        currentY += 8

        overdueInvoices.slice(0, 10).forEach((invoice: any) => {
          const family = invoice.family || "N/A"
          const amount = `$${Number(invoice.amount || 0).toFixed(2)}`
          const dueDate = invoice.dueDate || "N/A"
          doc.text(`• ${family}: ${amount} (Due: ${dueDate})`, 25, currentY)
          currentY += 5
        })

        if (overdueInvoices.length > 10) {
          doc.text(`... and ${overdueInvoices.length - 10} more overdue invoices`, 25, currentY)
          currentY += 5
        }
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Family Spending Analysis
      currentY = this.addSectionHeader(doc, "👨‍👩‍👧 FAMILY SPENDING ANALYSIS", currentY, [236, 72, 153])

      const familySpending: { [key: string]: number } = {}
      data.forEach((invoice: any) => {
        const family = invoice.family || "Unknown"
        familySpending[family] = (familySpending[family] || 0) + Number(invoice.amount || 0)
      })

      const topFamilies = Object.entries(familySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Top 10 Families by Total Billing:", 20, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")

      topFamilies.forEach(([family, amount], index) => {
        doc.text(`${index + 1}. ${family}: $${amount.toLocaleString()}`, 25, currentY)
        currentY += 5
      })

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Invoice Items Analysis
      const invoicesWithItems = data.filter((i: any) => i.items && i.items.length > 0)
      if (invoicesWithItems.length > 0) {
        currentY = this.addSectionHeader(doc, "📦 ITEMIZED SERVICES", currentY, [168, 85, 247])

        doc.setFontSize(10)
        doc.text(`Invoices with Itemized Services: ${invoicesWithItems.length}`, 20, currentY)
        currentY += 10
      }

      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Invoice Register
      currentY = this.addSectionHeader(doc, "📋 COMPLETE INVOICE REGISTER", currentY, [59, 130, 246])

      const tableData = data.map((invoice: any, index: number) => [
        (index + 1).toString(),
        invoice.id?.substring(0, 8) || "N/A",
        invoice.family || "N/A",
        `$${Number(invoice.amount || 0).toFixed(2)}`,
        invoice.dueDate || "N/A",
        invoice.status || "due",
        invoice.notes?.substring(0, 20) || "-",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Invoice ID", "Family", "Amount", "Due Date", "Status", "Notes"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25, halign: "right" },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 30 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Financial Health Indicators
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "📊 FINANCIAL HEALTH INDICATORS", currentY, [168, 85, 247])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const collectionHealth =
        Number.parseFloat(collectionRate) >= 90
          ? "✅ Excellent"
          : Number.parseFloat(collectionRate) >= 75
            ? "⚠️ Good"
            : "❌ Needs Improvement"
      doc.text(`Collection Rate Health: ${collectionHealth} (${collectionRate}%)`, 20, currentY)
      currentY += 6

      const overdueHealth =
        overdueInvoices.length === 0
          ? "✅ Excellent"
          : overdueInvoices.length <= totalInvoices * 0.1
            ? "⚠️ Acceptable"
            : "❌ Critical"
      doc.text(`Overdue Management: ${overdueHealth}`, 20, currentY)
      currentY += 6

      const cashFlowHealth = dueAmount < totalRevenue * 0.3 ? "✅ Healthy" : "⚠️ Monitor Closely"
      doc.text(`Cash Flow Status: ${cashFlowHealth}`, 20, currentY)
      currentY += 10

      // Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 FINANCIAL RECOMMENDATIONS", currentY, [34, 197, 94])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      if (overdueInvoices.length > 0) {
        doc.text(
          `• Priority: Contact ${overdueInvoices.length} families with overdue invoices immediately`,
          20,
          currentY,
        )
        currentY += 6
      }

      if (Number.parseFloat(collectionRate) < 85) {
        doc.text("• Implement automated payment reminders 7 days before due date", 20, currentY)
        currentY += 6
      }

      if (upcomingDue.length > 0) {
        doc.text(`• Send payment reminders for ${upcomingDue.length} invoices due within 7 days`, 20, currentY)
        currentY += 6
      }

      doc.text("• Consider offering early payment discounts to improve cash flow", 20, currentY)
      currentY += 6
      doc.text("• Review payment plans for families with consistent late payments", 20, currentY)
      currentY += 6
      doc.text("• Maintain detailed billing records for tax and audit purposes", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateBillingReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateHealthReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      // Executive Summary
      currentY = this.addSectionHeader(doc, "🏥 HEALTH & SAFETY EXECUTIVE SUMMARY", currentY, [239, 68, 68])

      const totalRecords = data.length
      const childrenWithAllergies = data.filter((h: any) => h.allergies && h.allergies !== "None").length
      const childrenWithImmunizations = data.filter((h: any) => h.immunizations).length
      const emergencyContactsComplete = data.filter((h: any) => h.emergency).length

      const summary = {
        totalRecords,
        allergies: childrenWithAllergies,
        immunizations: childrenWithImmunizations,
        emergencyInfo: emergencyContactsComplete,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Allergy Analysis
      currentY = this.addSectionHeader(doc, "🥜 ALLERGY INFORMATION", currentY, [245, 158, 11])

      if (childrenWithAllergies > 0) {
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Children with Documented Allergies: ${childrenWithAllergies}`, 20, currentY)
        currentY += 8

        doc.setFont("helvetica", "normal")
        doc.text("Allergy Details:", 20, currentY)
        currentY += 6

        data
          .filter((h: any) => h.allergies && h.allergies !== "None")
          .forEach((record: any) => {
            const child = record.child || "Unknown"
            const allergies = record.allergies || "N/A"
            doc.text(`• Child: ${child}`, 25, currentY)
            currentY += 5
            doc.text(`  Allergies: ${allergies}`, 27, currentY)
            currentY += 6
          })

        currentY += 8
      } else {
        doc.setFontSize(10)
        doc.text("No allergy records found", 20, currentY)
        currentY += 5
      }

      currentY = this.checkPageBreak(doc, currentY, 40)

      // Immunization Tracking
      currentY = this.addSectionHeader(doc, "💉 IMMUNIZATION RECORDS", currentY, [99, 102, 241])

      if (childrenWithImmunizations > 0) {
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Children with Immunization Records: ${childrenWithImmunizations}`, 20, currentY)
        currentY += 8

        doc.setFont("helvetica", "normal")
        doc.text("Immunization Status:", 20, currentY)
        currentY += 6

        data
          .filter((h: any) => h.immunizations)
          .forEach((record: any) => {
            const child = record.child || "Unknown"
            const immunizations = record.immunizations || "N/A"
            doc.text(`• Child: ${child}`, 25, currentY)
            currentY += 5
            doc.text(`  Status: ${immunizations}`, 27, currentY)
            currentY += 6
          })
      } else {
        doc.setFontSize(10)
        doc.text("No immunization records found", 20, currentY)
        currentY += 5
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Emergency Contact Information
      currentY = this.addSectionHeader(doc, "🚨 EMERGENCY INFORMATION", currentY, [239, 68, 68])

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Records with Emergency Information: ${emergencyContactsComplete}`, 20, currentY)
      currentY += 8

      if (emergencyContactsComplete > 0) {
        doc.setFont("helvetica", "normal")
        data
          .filter((h: any) => h.emergency)
          .forEach((record: any) => {
            const child = record.child || "Unknown"
            const emergency = record.emergency || "N/A"
            doc.text(`• Child: ${child}`, 25, currentY)
            currentY += 5
            doc.text(`  Emergency Info: ${emergency}`, 27, currentY)
            currentY += 6
          })
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Health Records Table
      currentY = this.addSectionHeader(doc, "📋 COMPLETE HEALTH RECORDS", currentY, [20, 184, 166])

      const tableData = data.map((record: any, index: number) => [
        (index + 1).toString(),
        record.child || "Unknown",
        record.allergies || "None",
        record.immunizations || "N/A",
        record.emergency?.substring(0, 30) || "N/A",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Child", "Allergies", "Immunizations", "Emergency Info"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 40 },
          4: { cellWidth: 45 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Safety Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 HEALTH & SAFETY RECOMMENDATIONS", currentY, [239, 68, 68])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const missingInfo = totalRecords - emergencyContactsComplete
      if (missingInfo > 0) {
        doc.text(`• CRITICAL: ${missingInfo} records missing emergency contact information`, 20, currentY)
        currentY += 6
      }

      if (childrenWithAllergies > 0) {
        doc.text("• Post allergy alerts in classrooms and food preparation areas", 20, currentY)
        currentY += 6
        doc.text("• Train all staff on allergy recognition and emergency response", 20, currentY)
        currentY += 6
        doc.text("• Maintain epinephrine auto-injectors and ensure staff certification", 20, currentY)
        currentY += 6
      }

      if (childrenWithImmunizations < totalRecords) {
        doc.text("• Follow up with families to complete immunization records", 20, currentY)
        currentY += 6
      }

      doc.text("• Review health records quarterly and update as needed", 20, currentY)
      currentY += 6
      doc.text("• Conduct health and safety training for all staff annually", 20, currentY)
      currentY += 6
      doc.text("• Maintain confidential health records in compliance with HIPAA", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateHealthReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateStaffReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      // Executive Summary
      currentY = this.addSectionHeader(doc, "👥 STAFF MANAGEMENT EXECUTIVE SUMMARY", currentY, [168, 85, 247])

      const totalStaff = data.length
      const activeStaff = data.filter((s: any) => s.status === "active").length
      const inactiveStaff = data.filter((s: any) => s.status === "inactive").length
      const onLeave = data.filter((s: any) => s.status === "on_leave").length

      // Role distribution
      const teachers = data.filter((s: any) => (s.role || "").toLowerCase().includes("teacher")).length
      const assistants = data.filter((s: any) => (s.role || "").toLowerCase().includes("assistant")).length
      const admins = data.filter((s: any) => (s.role || "").toLowerCase().includes("admin")).length

      const summary = {
        totalStaff,
        active: activeStaff,
        teachers,
        inactive: inactiveStaff,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Staff Metrics
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Staffing Metrics:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(`• Active Staff: ${activeStaff} (${((activeStaff / totalStaff) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 5
      doc.text(`• Inactive Staff: ${inactiveStaff}`, 20, currentY)
      currentY += 5
      doc.text(`• On Leave: ${onLeave}`, 20, currentY)
      currentY += 10

      // Role Distribution
      doc.setFont("helvetica", "bold")
      doc.text("Role Distribution:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(`• Teachers: ${teachers} (${((teachers / totalStaff) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 5
      doc.text(`• Assistants: ${assistants} (${((assistants / totalStaff) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 5
      doc.text(`• Administrators: ${admins} (${((admins / totalStaff) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 10

      currentY = this.checkPageBreak(doc, currentY, 40)

      // Compensation Analysis
      currentY = this.addSectionHeader(doc, "💰 COMPENSATION OVERVIEW", currentY, [34, 197, 94])

      const hourlyRates = data.map((s: any) => Number(s.hourlyRate || 0)).filter((rate) => rate > 0)
      const avgHourlyRate =
        hourlyRates.length > 0
          ? (hourlyRates.reduce((sum, rate) => sum + rate, 0) / hourlyRates.length).toFixed(2)
          : "0"
      const totalWeeklyHours = data.reduce((sum: number, s: any) => sum + Number(s.weeklyHours || 0), 0)

      doc.setFontSize(10)
      doc.text(`Average Hourly Rate: $${avgHourlyRate}`, 20, currentY)
      currentY += 6
      doc.text(`Total Weekly Hours: ${totalWeeklyHours} hours`, 20, currentY)
      currentY += 6
      doc.text(
        `Estimated Weekly Payroll: $${(Number(avgHourlyRate) * totalWeeklyHours).toLocaleString()}`,
        20,
        currentY,
      )
      currentY += 10

      currentY = this.checkPageBreak(doc, currentY, 40)

      // Certifications & Qualifications
      currentY = this.addSectionHeader(doc, "🎓 CERTIFICATIONS", currentY, [59, 130, 246])

      const staffWithCertifications = data.filter((s: any) => s.certifications && s.certifications.length > 0)

      doc.setFontSize(10)
      doc.text(`Staff with Certifications: ${staffWithCertifications.length}`, 20, currentY)
      currentY += 8

      if (staffWithCertifications.length > 0) {
        const allCertifications = new Set<string>()
        staffWithCertifications.forEach((s: any) => {
          if (Array.isArray(s.certifications)) {
            s.certifications.forEach((cert: string) => allCertifications.add(cert))
          }
        })

        doc.text("Certification Types:", 20, currentY)
        currentY += 6
        Array.from(allCertifications).forEach((cert) => {
          doc.text(`• ${cert}`, 25, currentY)
          currentY += 5
        })
      }

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Emergency Contacts
      currentY = this.addSectionHeader(doc, "🚨 EMERGENCY CONTACTS", currentY, [239, 68, 68])

      const staffWithEmergencyContacts = data.filter((s: any) => s.emergencyContact).length

      doc.setFontSize(10)
      doc.text(`Staff with Emergency Contacts: ${staffWithEmergencyContacts}`, 20, currentY)
      currentY += 10

      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Staff Directory
      currentY = this.addSectionHeader(doc, "📋 COMPLETE STAFF DIRECTORY", currentY, [168, 85, 247])

      const tableData = data.map((staff: any, index: number) => [
        (index + 1).toString(),
        `${staff.firstName || ""} ${staff.lastName || ""}`.trim() || "Unknown",
        staff.role || "N/A",
        staff.email || "N/A",
        staff.phone || "N/A",
        `$${Number(staff.hourlyRate || 0).toFixed(2)}`,
        staff.status || "active",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Name", "Role", "Email", "Phone", "Rate/Hr", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [168, 85, 247],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Hire Date Analysis
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "📅 TENURE ANALYSIS", currentY, [236, 72, 153])

      const staffWithHireDates = data.filter((s: any) => s.hireDate)
      if (staffWithHireDates.length > 0) {
        const today = new Date()
        const tenures = staffWithHireDates.map((s: any) => {
          const hireDate = new Date(s.hireDate)
          const years = (today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
          return years
        })

        const avgTenure = (tenures.reduce((sum, years) => sum + years, 0) / tenures.length).toFixed(1)
        const newHires = tenures.filter((years) => years < 1).length
        const experienced = tenures.filter((years) => years >= 3).length

        doc.setFontSize(10)
        doc.text(`Average Tenure: ${avgTenure} years`, 20, currentY)
        currentY += 6
        doc.text(`New Hires (< 1 year): ${newHires}`, 20, currentY)
        currentY += 6
        doc.text(`Experienced Staff (3+ years): ${experienced}`, 20, currentY)
        currentY += 10
      }

      // Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 HR RECOMMENDATIONS", currentY, [34, 197, 94])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const missingEmergencyContacts = totalStaff - staffWithEmergencyContacts
      if (missingEmergencyContacts > 0) {
        doc.text(
          `• CRITICAL: Collect emergency contact information for ${missingEmergencyContacts} staff members`,
          20,
          currentY,
        )
        currentY += 6
      }

      if (teachers < totalStaff * 0.4) {
        doc.text("• Consider hiring additional certified teachers to meet educational standards", 20, currentY)
        currentY += 6
      }

      if (staffWithCertifications.length < totalStaff * 0.7) {
        doc.text("• Schedule group training sessions for certification and professional development", 20, currentY)
        currentY += 6
      }

      doc.text("• Conduct regular staff meetings to maintain communication and team cohesion", 20, currentY)
      currentY += 6
      doc.text("• Implement employee recognition programs to boost morale and retention", 20, currentY)
      currentY += 6
      doc.text("• Maintain up-to-date background checks and certifications for all staff", 20, currentY)
      currentY += 6
      doc.text("• Review compensation packages annually to remain competitive in the market", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateStaffReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateShiftReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      currentY = this.addSectionHeader(doc, "📅 STAFF SCHEDULE REPORT", currentY, [59, 130, 246])

      const totalShifts = data.length
      const uniqueStaff = new Set(data.map((s: any) => s.staff).filter(Boolean)).size
      const uniqueDays = new Set(data.map((s: any) => s.day).filter(Boolean)).size

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Total Scheduled Shifts: ${totalShifts}`, 20, currentY)
      currentY += 6
      doc.text(`Staff Members Scheduled: ${uniqueStaff}`, 20, currentY)
      currentY += 6
      doc.text(`Days Covered: ${uniqueDays}`, 20, currentY)
      currentY += 15

      // Day Distribution
      const dayDistribution: { [key: string]: number } = {}
      data.forEach((shift: any) => {
        const day = shift.day || "Unknown"
        dayDistribution[day] = (dayDistribution[day] || 0) + 1
      })

      doc.setFont("helvetica", "bold")
      doc.text("Shifts by Day:", 20, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")

      Object.entries(dayDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([day, count]) => {
          doc.text(`• ${day}: ${count} shifts`, 25, currentY)
          currentY += 5
        })

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Role Distribution
      currentY = this.addSectionHeader(doc, "👔 ROLE COVERAGE", currentY, [147, 51, 234])

      const roleDistribution: { [key: string]: number } = {}
      data.forEach((shift: any) => {
        const role = shift.role || "Unknown"
        roleDistribution[role] = (roleDistribution[role] || 0) + 1
      })

      doc.setFontSize(10)
      Object.entries(roleDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([role, count]) => {
          doc.text(`• ${role}: ${count} shifts (${((count / totalShifts) * 100).toFixed(1)}%)`, 20, currentY)
          currentY += 6
        })

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Schedule Table
      currentY = this.addSectionHeader(doc, "📋 COMPLETE SHIFT SCHEDULE", currentY, [34, 197, 94])

      const tableData = data.map((shift: any, index: number) => [
        (index + 1).toString(),
        shift.staff || "Unknown",
        shift.day || "N/A",
        shift.start && shift.end ? `${shift.start} - ${shift.end}` : "N/A",
        shift.role || "N/A",
        shift.notes?.substring(0, 25) || "-",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Staff", "Day", "Time", "Role", "Notes"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 SCHEDULING RECOMMENDATIONS", currentY, [168, 85, 247])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      doc.text("• Review schedule coverage to ensure adequate staffing during peak hours", 20, currentY)
      currentY += 6
      doc.text("• Balance workload distribution across all staff members", 20, currentY)
      currentY += 6
      doc.text("• Maintain backup staff availability for unexpected absences", 20, currentY)
      currentY += 6
      doc.text("• Schedule regular breaks and consider staff preferences when possible", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateShiftReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateEventReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      currentY = this.addSectionHeader(doc, "🎉 EVENTS & ACTIVITIES REPORT", currentY, [236, 72, 153])

      const totalEvents = data.length
      const upcomingEvents = data.filter((e: any) => {
        if (!e.date) return false
        return new Date(e.date) > new Date()
      }).length
      const pastEvents = totalEvents - upcomingEvents

      // Event type distribution
      const eventTypes: { [key: string]: number } = {}
      data.forEach((event: any) => {
        const type = event.type || "Unknown"
        eventTypes[type] = (eventTypes[type] || 0) + 1
      })

      const allDayEvents = data.filter((e: any) => e.allDay).length

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Total Events: ${totalEvents}`, 20, currentY)
      currentY += 6
      doc.text(`Upcoming: ${upcomingEvents}`, 20, currentY)
      currentY += 6
      doc.text(`Past: ${pastEvents}`, 20, currentY)
      currentY += 6
      doc.text(`All-Day Events: ${allDayEvents}`, 20, currentY)
      currentY += 15

      // Event Type Breakdown
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "📊 EVENT TYPE BREAKDOWN", currentY, [147, 51, 234])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      Object.entries(eventTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          doc.text(`• ${type}: ${count} events (${((count / totalEvents) * 100).toFixed(1)}%)`, 20, currentY)
          currentY += 6
        })

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Events Table
      currentY = this.addSectionHeader(doc, "📋 COMPLETE EVENT CALENDAR", currentY, [34, 197, 94])

      const tableData = data.map((event: any, index: number) => [
        (index + 1).toString(),
        event.title || "Untitled",
        event.type || "N/A",
        event.date || "N/A",
        event.time || (event.allDay ? "All Day" : "N/A"),
        event.location || "N/A",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Event Title", "Type", "Date", "Time", "Location"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 35 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Event Descriptions
      if (data.some((e: any) => e.description)) {
        currentY = this.checkPageBreak(doc, currentY, 40)
        currentY = this.addSectionHeader(doc, "📝 EVENT DETAILS", currentY, [168, 85, 247])

        doc.setFontSize(9)
        data
          .filter((e: any) => e.description)
          .slice(0, 5)
          .forEach((event: any) => {
            doc.setFont("helvetica", "bold")
            doc.text(`${event.title}:`, 20, currentY)
            currentY += 5
            doc.setFont("helvetica", "normal")
            doc.text(event.description.substring(0, 80), 25, currentY)
            currentY += 7
          })
      }

      currentY += 5
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Recommendations
      currentY = this.addSectionHeader(doc, "💡 EVENT PLANNING RECOMMENDATIONS", currentY, [236, 72, 153])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      if (upcomingEvents > 0) {
        doc.text(`• Prepare for ${upcomingEvents} upcoming events - review logistics and staffing`, 20, currentY)
        currentY += 6
      }

      doc.text("• Send event reminders to families 1 week and 1 day in advance", 20, currentY)
      currentY += 6
      doc.text("• Coordinate with staff to ensure adequate event coverage", 20, currentY)
      currentY += 6
      doc.text("• Gather feedback after events to improve future planning", 20, currentY)
      currentY += 6
      doc.text("• Maintain a balanced calendar with diverse event types throughout the year", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateEventReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateBookingReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      currentY = this.addSectionHeader(doc, "📅 BOOKINGS & APPOINTMENTS REPORT", currentY, [249, 115, 22])

      const totalBookings = data.length
      const confirmed = data.filter((b: any) => b.status === "confirmed").length
      const pending = data.filter((b: any) => b.status === "pending").length
      const cancelled = data.filter((b: any) => b.status === "cancelled").length

      // Contact method analysis
      const contactMethods: { [key: string]: number } = {}
      data.forEach((booking: any) => {
        const method = booking.contactMethod || "in-person"
        contactMethods[method] = (contactMethods[method] || 0) + 1
      })

      const summary = {
        totalBookings,
        confirmed,
        pending,
        cancelled,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY = this.checkPageBreak(doc, currentY, 60)

      // Status Breakdown
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Booking Status:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")
      doc.text(`• Confirmed: ${confirmed} (${((confirmed / totalBookings) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 5
      doc.text(`• Pending: ${pending} (${((pending / totalBookings) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 5
      doc.text(`• Cancelled: ${cancelled} (${((cancelled / totalBookings) * 100).toFixed(1)}%)`, 20, currentY)
      currentY += 10

      // Contact Method Analysis
      doc.setFont("helvetica", "bold")
      doc.text("Preferred Contact Methods:", 15, currentY)
      currentY += 6
      doc.setFont("helvetica", "normal")

      Object.entries(contactMethods)
        .sort((a, b) => b[1] - a[1])
        .forEach(([method, count]) => {
          doc.text(`• ${method}: ${count} (${((count / totalBookings) * 100).toFixed(1)}%)`, 20, currentY)
          currentY += 5
        })

      currentY += 10
      currentY = this.checkPageBreak(doc, currentY, 40)

      // Duration Analysis
      currentY = this.addSectionHeader(doc, "⏱️ APPOINTMENT DURATION", currentY, [168, 85, 247])

      const durations = data.map((b: any) => Number(b.duration || 30))
      const totalMinutes = durations.reduce((sum, dur) => sum + dur, 0)
      const avgDuration = totalBookings > 0 ? (totalMinutes / totalBookings).toFixed(0) : "0"

      doc.setFontSize(10)
      doc.text(`Average Duration: ${avgDuration} minutes`, 20, currentY)
      currentY += 6
      doc.text(
        `Total Appointment Time: ${totalMinutes} minutes (${(totalMinutes / 60).toFixed(1)} hours)`,
        20,
        currentY,
      )
      currentY += 10

      currentY = this.checkPageBreak(doc, currentY, 60)

      // Complete Bookings Table
      currentY = this.addSectionHeader(doc, "📋 COMPLETE BOOKING REGISTER", currentY, [34, 197, 94])

      const tableData = data.map((booking: any, index: number) => [
        (index + 1).toString(),
        booking.parentName || "N/A",
        booking.childName || "N/A",
        booking.date || "N/A",
        booking.time || "N/A",
        `${booking.duration || 30} min`,
        booking.contactMethod || "in-person",
        booking.status || "pending",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Parent", "Child", "Date", "Time", "Duration", "Method", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 22 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 25 },
          7: { cellWidth: 22 },
        },
      })

      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : currentY + 50

      // Purpose Analysis
      if (data.some((b: any) => b.purpose)) {
        currentY = this.checkPageBreak(doc, currentY, 40)
        currentY = this.addSectionHeader(doc, "🎯 BOOKING PURPOSES", currentY, [147, 51, 234])

        const purposes: { [key: string]: number } = {}
        data.forEach((booking: any) => {
          if (booking.purpose) {
            purposes[booking.purpose] = (purposes[booking.purpose] || 0) + 1
          }
        })

        doc.setFontSize(10)
        Object.entries(purposes)
          .sort((a, b) => b[1] - a[1])
          .forEach(([purpose, count]) => {
            doc.text(`• ${purpose}: ${count}`, 20, currentY)
            currentY += 5
          })

        currentY += 10
      }

      // Recommendations
      currentY = this.checkPageBreak(doc, currentY, 40)
      currentY = this.addSectionHeader(doc, "💡 BOOKING MANAGEMENT RECOMMENDATIONS", currentY, [236, 72, 153])

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      if (pending > confirmed) {
        doc.text("• High number of pending bookings - send confirmation reminders", 20, currentY)
        currentY += 6
      }

      if (cancelled > totalBookings * 0.15) {
        doc.text("• High cancellation rate - consider implementing flexible rescheduling", 20, currentY)
        currentY += 6
      }

      doc.text("• Send appointment reminders 24 hours in advance", 20, currentY)
      currentY += 6
      doc.text("• Follow up with pending bookings within 48 hours", 20, currentY)
      currentY += 6
      doc.text("• Offer multiple contact method options to accommodate family preferences", 20, currentY)
      currentY += 6
      doc.text("• Maintain detailed notes for each booking for better family service", 20, currentY)

      return currentY + 10
    } catch (error) {
      console.error("Error in generateBookingReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateMediaReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      let currentY = startY

      currentY = this.addSectionHeader(doc, "📸 MEDIA & GALLERY REPORT", currentY, [20, 184, 166])

      const totalItems = data.length
      const photos = data.filter((m: any) => m.type === "photo")
      const videos = data.filter((m: any) => m.type === "video")

      const summary = {
        totalItems,
        photos: photos.length,
        videos: videos.length,
      }

      currentY = this.addSummaryCards(doc, summary, currentY)
      currentY += 10

      const tableData = data.map((media: any, index: number) => [
        (index + 1).toString(),
        media.title || media.name || "Untitled",
        media.type || "N/A",
        media.uploadedBy || "Unknown",
        media.timestamp || media.createdAt || "N/A",
        media.tags?.join(", ").substring(0, 30) || "None",
      ])

      doc.autoTable({
        startY: currentY,
        head: [["#", "Title", "Type", "Uploaded By", "Date", "Tags"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
      })

      return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : currentY + 50
    } catch (error) {
      console.error("Error in generateMediaReport:", error)
      return this.generateGenericReport(doc, data, startY)
    }
  }

  private generateComprehensiveReport(doc: jsPDF, data: any, startY: number): number {
    try {
      let currentY = startY

      currentY = this.addSectionHeader(doc, "📊 COMPREHENSIVE DAILY REPORT", currentY, [79, 70, 229])

      // Children Overview
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Children Overview", 15, currentY)
      currentY += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Total Enrolled: ${data.totalChildren || 0}`, 20, currentY)
      currentY += 6
      doc.text(`Present Today: ${data.presentToday || 0}`, 20, currentY)
      currentY += 6
      doc.text(`Absent Today: ${data.absentToday || 0}`, 20, currentY)
      currentY += 12

      // Financial Summary
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Financial Summary", 15, currentY)
      currentY += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Total Revenue: $${(data.totalRevenue || 0).toFixed(2)}`, 20, currentY)
      currentY += 6
      doc.text(`Outstanding Invoices: ${data.outstandingInvoices || 0}`, 20, currentY)
      currentY += 12

      // Staff Information
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Staff Information", 15, currentY)
      currentY += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Total Staff: ${data.totalStaff || 0}`, 20, currentY)
      currentY += 6
      doc.text(`On Duty Today: ${data.staffOnDuty || 0}`, 20, currentY)
      currentY += 12

      // Health & Safety
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Health & Safety", 15, currentY)
      currentY += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`High Priority Alerts: ${data.highPriorityAlerts || 0}`, 20, currentY)
      currentY += 6
      doc.text(`Medications Due: ${data.medicationsDue || 0}`, 20, currentY)
      currentY += 12

      // Events
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Upcoming Events", 15, currentY)
      currentY += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Events Today: ${data.todayEventsCount || 0}`, 20, currentY)
      currentY += 6
      doc.text(`Upcoming Tours: ${data.upcomingTours || 0}`, 20, currentY)

      return currentY + 15
    } catch (error) {
      console.error("Error in generateComprehensiveReport:", error)
      return startY + 50
    }
  }

  private generateGenericReport(doc: jsPDF, data: any[], startY: number): number {
    try {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(79, 70, 229)
      // doc.text("Data Report", 15, startY)

      if (!data || data.length === 0) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.text("No data available for this report.", 15, startY + 20)
        return startY + 40
      }

      const firstItem = data[0]
      const keys = Object.keys(firstItem).slice(0, 6)

      const tableData = data.map((item: any) => {
        return keys.map((key) => {
          const value = item[key]
          if (value === null || value === undefined) return "N/A"
          if (typeof value === "object") return JSON.stringify(value).substring(0, 30)
          return String(value).substring(0, 30)
        })
      })

      doc.autoTable({
        startY: startY + 10,
        head: [keys],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      })

      return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : startY + 50
    } catch (error) {
      console.error("Error in generateGenericReport:", error)
      doc.setFontSize(12)
      // doc.text("Error generating report table", 15, startY + 20)
      return startY + 40
    }
  }

  // Helper methods for time calculations
  private calculateAverageTime(times: string[]): string {
    try {
      const validTimes = times.filter((t) => t && t.includes(":"))
      if (validTimes.length === 0) return "N/A"

      const totalMinutes = validTimes.reduce((sum, time) => {
        const [hours, minutes] = time.split(":").map(Number)
        return sum + hours * 60 + minutes
      }, 0)

      const avgMinutes = Math.round(totalMinutes / validTimes.length)
      const hours = Math.floor(avgMinutes / 60)
      const minutes = avgMinutes % 60
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    } catch {
      return "N/A"
    }
  }

  private getEarliestTime(times: string[]): string {
    try {
      const validTimes = times.filter((t) => t && t.includes(":"))
      if (validTimes.length === 0) return "N/A"
      return validTimes.sort()[0]
    } catch {
      return "N/A"
    }
  }

  private getLatestTime(times: string[]): string {
    try {
      const validTimes = times.filter((t) => t && t.includes(":"))
      if (validTimes.length === 0) return "N/A"
      return validTimes.sort().reverse()[0]
    } catch {
      return "N/A"
    }
  }
}

export const universalPDFService = new UniversalPDFService()
