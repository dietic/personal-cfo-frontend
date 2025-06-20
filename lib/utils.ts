import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the display name for a user.
 * Prefers first_name + last_name, then falls back to email.
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "User";

  // Check if we have first_name or last_name
  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  if (lastName) {
    return lastName;
  }

  // Check for legacy name field (for backward compatibility)
  if ('name' in user && typeof user.name === 'string' && user.name) {
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

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }
  
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  
  if (lastName) {
    return lastName[0].toUpperCase();
  }

  // Check for legacy name field (for backward compatibility)
  if ('name' in user && typeof user.name === 'string' && user.name) {
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  }

  // Use email as fallback
  return user.email[0].toUpperCase();
}
