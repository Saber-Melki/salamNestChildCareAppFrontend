import { clsx } from "clsx"

export function cn(...inputs: any[]) {
  return clsx(inputs)
}
export function getAccentTheme(accent: string) {
  switch (accent) {
    case "blue":
      return "bg-blue-500 text-white"
    case "green":
      return "bg-green-500 text-white"
    case "red":
      return "bg-red-500 text-white"
    case "yellow":
      return "bg-yellow-500 text-black"
    default:
      return "bg-gray-500 text-white"
  }
}