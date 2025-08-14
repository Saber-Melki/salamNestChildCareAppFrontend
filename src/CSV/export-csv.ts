export function exportCsv(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) =>
    row
      .map((v) => {
        const cell = String(v ?? "")
        if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      })
      .join(",")

  const csvContent = rows.map(processRow).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
