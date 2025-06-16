import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the display name for a user.
 * Falls back to email if name is not available.
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "User";

  if (user.name) {
    return user.name;
  }

  // Extract name from email as fallback
  const emailName = user.email.split("@")[0];
  return emailName.charAt(0).toUpperCase() + emailName.slice(1);
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: User | null): string {
  if (!user) return "U";

  if (user.name) {
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  }

  // Use email as fallback
  return user.email[0].toUpperCase();
}
