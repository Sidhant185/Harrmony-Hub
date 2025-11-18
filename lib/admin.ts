/**
 * Admin utility functions
 */

export const ADMIN_EMAIL = "Sidhantpande222@gmail.com"

/**
 * Check if a user is an admin based on their email
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

/**
 * Server-side admin check
 */
export async function requireAdmin(session: { user?: { email?: string | null } } | null) {
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized: Admin access required")
  }
  return true
}

