declare module "jspdf-autotable" {
  import type { jsPDF } from "jspdf"

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
    theme?: "striped" | "grid" | "plain"
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    alternateRowStyles?: any
    columnStyles?: any
    styles?: any
    showHead?: "everyPage" | "firstPage" | "never"
    showFoot?: "everyPage" | "lastPage" | "never"
    tableWidth?: "auto" | "wrap" | number
    cellWidth?: "auto" | "wrap" | number
    tableLineColor?: number | number[]
    tableLineWidth?: number
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}
