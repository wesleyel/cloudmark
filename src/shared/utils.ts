import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateSecureMark } from "./security";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** @deprecated Prefer generateSecureMark from security */
export const generateRandomMark = () => generateSecureMark();

export const getBaseUrl = () => {
  const loc = (globalThis as unknown as { location?: { origin?: string } })
    .location;
  if (loc?.origin) {
    return loc.origin;
  }
  return "http://localhost:3000";
};

export { getCategories } from "./categories";

export const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
