export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}
export function addDays(d: Date, days: number) {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}
export function getDay(d: Date) {
  return d.getDay()
}
export function pad(n: number) {
  return n.toString().padStart(2, "0")
}
export function format(d: Date, fmt: string) {
  // naive formatter for yyyy-MM-dd and MMMM yyyy
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  if (fmt === "yyyy-MM-dd") {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
  if (fmt === "MMMM yyyy") {
    return `${months[d.getMonth()]} ${d.getFullYear()}`
  }
  if (fmt === "yyyy-MM") {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  }
  return d.toISOString()
}
