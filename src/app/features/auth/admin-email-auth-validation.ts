export function normalizeAdminEmail(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}
