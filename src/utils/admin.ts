export const STUDIO_ADMIN_EMAILS = [
  'seelamvamsisivaganesh@gmail.com',
  'seelamharshi27@gmail.com',
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return STUDIO_ADMIN_EMAILS.some((adminEmail) => adminEmail === normalized);
}
