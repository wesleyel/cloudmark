import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BookmarksData } from "~/types"
import { defaultCategory } from "~/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl(): string {
  const config = useRuntimeConfig()
  return config.public.baseUrl || 'http://localhost:3000'
}

export function getCategories(bookmarksData: BookmarksData | null): string[] {
  if (!bookmarksData || !bookmarksData.bookmarks) {
    return [defaultCategory]
  }
  
  const uniqueCategories = [
    ...new Set(bookmarksData.bookmarks.map((bookmark) => bookmark.category))
  ]

  if (!uniqueCategories.includes(defaultCategory)) {
    return [defaultCategory, ...uniqueCategories]
  }

  return [
    defaultCategory,
    ...uniqueCategories.filter((category) => category !== defaultCategory)
  ]
}

export function getDomain(url: string): string {
  return new URL(url).hostname.replace("www.", "")
}

export function generateRandomMark(): string {
  const adjectives = [
    "vacuous",
    "tearful", 
    "faint",
    "jumbled",
    "wandering",
    "mature",
    "savory",
    "mighty",
    "disgusted",
    "abstracted",
    "telling",
  ]
  const nouns = [
    "person",
    "inspector",
    "significance", 
    "chapter",
    "reputation",
    "outcome",
    "association",
    "failure",
    "population",
    "wealth",
    "bird",
  ]
  const randomNum = Math.floor(Math.random() * 10000)
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}-${randomNum}`
}