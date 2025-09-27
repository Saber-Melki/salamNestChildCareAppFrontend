"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent } from "../components/ui/card"
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { exportCsv } from "../CSV/export-csv"

export default function Reports() {
  const [tab, setTab] = React.useState("attendance")

  const attendance = [
    ["Date", "Child", "Status", "Check-in", "Check-out"],
    ["2025-08-01", "Inyaz Zaiem", "Present", "08:12", "16:01"],
    ["2025-08-01", "Haroun Said", "Away", "09:01", "11:05"],
    ["2025-08-02", "Inyaz Zaiem", "Present", "08:05", "16:15"],
    ["2025-08-02", "Haroun Said", "Present", "08:30", "15:45"],
    ["2025-08-03", "Inyaz Zaiem", "Present", "08:20", "16:00"],
  ]

  const revenue = [
    ["Month", "Collected", "Outstanding"],
    ["2025-07", "25,100", "1,250"],
    ["2025-08", "28,450", "1,980"],
    ["2025-09", "30,200", "850"],
    ["2025-10", "27,800", "2,100"],
  ]

  const milestones = [
    ["Child", "Milestone", "Date", "Notes"],
    ["Inyaz Zaiem", "Language - New words", "2025-08-01", "Said 'butterfly'"],
    ["Haroun Said", "Motor - Balance", "2025-07-29", "Balances on one foot"],
    ["Inyaz Zaiem", "Social - Sharing", "2025-08-05", "Shared toys with friends"],
    ["Haroun Said", "Cognitive - Counting", "2025-08-10", "Counts to 20"],
  ]

  // PDF generation function
  const generatePDF = (data: (string | number)[][], title: string) => {
    // Create a simple HTML structure for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              margin: 20px auto;
              max-width: 1000px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #667eea;
            }
            .header h1 {
              color: #667eea;
              font-size: 28px;
              margin: 0;
              font-weight: bold;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 16px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            th { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            td { 
              padding: 12px 15px;
              border-bottom: 1px solid #eee;
              font-size: 13px;
            }
            tr:nth-child(even) { 
              background-color: #f8f9ff; 
            }
            tr:hover {
              background-color: #e8f0fe;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin: 20px 0;
              gap: 20px;
            }
            .stat-card {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              flex: 1;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 12px;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title} Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            
            ${
              title === "Attendance"
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">${data.length - 1}</div>
                  <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.slice(1).filter((row) => row[2] === "Present").length}</div>
                  <div class="stat-label">Present</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.slice(1).filter((row) => row[2] === "Away").length}</div>
                  <div class="stat-label">Away</div>
                </div>
              </div>
            `
                : ""
            }
            
            ${
              title === "Revenue"
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">$${data
                    .slice(1)
                    .reduce((sum, row) => sum + Number.parseFloat(String(row[1]).replace(",", "")), 0)
                    .toLocaleString()}</div>
                  <div class="stat-label">Total Collected</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">$${data
                    .slice(1)
                    .reduce((sum, row) => sum + Number.parseFloat(String(row[2]).replace(",", "")), 0)
                    .toLocaleString()}</div>
                  <div class="stat-label">Outstanding</div>
                </div>
              </div>
            `
                : ""
            }
            
            <table>
              <thead>
                <tr>
                  ${data[0].map((header) => `<th>${header}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${data
                  .slice(1)
                  .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              <p>This report was automatically generated by the SalamNest System</p>
              <p>© 2025 SalamNest - All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Create a new window and write the HTML content
    const printWindow = window.open("")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }
    }
  }

  // Calculate summary stats
  const attendanceStats = {
    totalRecords: attendance.length - 1,
    presentCount: attendance.slice(1).filter((row) => row[2] === "Present").length,
    awayCount: attendance.slice(1).filter((row) => row[2] === "Away").length,
    attendanceRate:
      attendance.length > 1
        ? ((attendance.slice(1).filter((row) => row[2] === "Present").length / (attendance.length - 1)) * 100).toFixed(
            1,
          )
        : "0",
  }

  const revenueStats = {
    totalCollected: revenue.slice(1).reduce((sum, row) => sum + Number.parseFloat(String(row[1]).replace(",", "")), 0),
    totalOutstanding: revenue
      .slice(1)
      .reduce((sum, row) => sum + Number.parseFloat(String(row[2]).replace(",", "")), 0),
  }

  const developmentStats = {
    totalMilestones: milestones.length - 1,
    uniqueChildren: new Set(milestones.slice(1).map((row) => row[0])).size,
  }

  return (
    <AppShell title="Reports & Analytics">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border shadow-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/5 rounded-full animate-bounce" />
          <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-300" />
        </div>
        <div className="relative p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Reports & Analytics</h1>
              <p className="text-white/90 text-lg">
                Comprehensive insights and data visualization for informed decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-700">{attendanceStats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue Collected</p>
                <p className="text-2xl font-bold text-green-700">${revenueStats.totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Development Records</p>
                <p className="text-2xl font-bold text-purple-700">{developmentStats.totalMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-violet-100 to-purple-100 p-1 rounded-xl">
          <TabsTrigger
            value="attendance"
            // className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Activity className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            // className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="development"
            // className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Development
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4 space-y-6">
          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-100">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{attendanceStats.totalRecords}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{attendanceStats.presentCount}</p>
                <p className="text-sm text-gray-600">Present</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-pink-100">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{attendanceStats.awayCount}</p>
                <p className="text-sm text-gray-600">Away</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-100">
              <CardContent className="p-4 text-center">
                <PieChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">{attendanceStats.attendanceRate}%</p>
                <p className="text-sm text-gray-600">Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCsv("attendance.csv", attendance)}
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => generatePDF(attendance, "Attendance")}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Section title="Attendance Logs" description="Detailed attendance tracking and analysis">
            <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50">
                    {attendance[0].map((h) => (
                      <TableHead key={String(h)} className="font-semibold text-gray-800">
                        {String(h)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.slice(1).map((row, i) => (
                    <TableRow
                      key={i}
                      className={`hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {row.map((c, j) => (
                        <TableCell
                          key={j}
                          className={
                            j === 2
                              ? c === "Present"
                                ? "text-green-700 font-medium"
                                : "text-red-600 font-medium"
                              : "text-gray-800"
                          }
                        >
                          {String(c)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4 space-y-6">
          {/* Revenue Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">${revenueStats.totalCollected.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Collected</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-red-100">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">${revenueStats.totalOutstanding.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Outstanding</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-100">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {(
                    (revenueStats.totalCollected / (revenueStats.totalCollected + revenueStats.totalOutstanding)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-gray-600">Collection Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCsv("revenue.csv", revenue)}
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => generatePDF(revenue, "Revenue")}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Section title="Revenue Insights" description="Financial performance and collection tracking">
            <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50">
                    {revenue[0].map((h) => (
                      <TableHead key={String(h)} className="font-semibold text-gray-800">
                        {String(h)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.slice(1).map((row, i) => (
                    <TableRow
                      key={i}
                      className={`hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {row.map((c, j) => (
                        <TableCell
                          key={j}
                          className={
                            j === 1
                              ? "text-green-700 font-medium"
                              : j === 2
                                ? "text-orange-600 font-medium"
                                : "text-gray-800"
                          }
                        >
                          {j > 0 ? `$${String(c)}` : String(c)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="development" className="mt-4 space-y-6">
          {/* Development Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-100">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">{developmentStats.totalMilestones}</p>
                <p className="text-sm text-gray-600">Total Milestones</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-100">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{developmentStats.uniqueChildren}</p>
                <p className="text-sm text-gray-600">Children Tracked</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {(developmentStats.totalMilestones / developmentStats.uniqueChildren).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg per Child</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportCsv("development.csv", milestones)}
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => generatePDF(milestones, "Development")}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Section title="Developmental Tracking" description="Child development milestones and progress monitoring">
            <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50">
                    {milestones[0].map((h) => (
                      <TableHead key={String(h)} className="font-semibold text-gray-800">
                        {String(h)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.slice(1).map((row, i) => (
                    <TableRow
                      key={i}
                      className={`hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {row.map((c, j) => (
                        <TableCell key={j} className={j === 1 ? "text-purple-700 font-medium" : "text-gray-800"}>
                          {String(c)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}
