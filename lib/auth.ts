import { timingSafeEqual } from 'node:crypto';
export function isValidAdminPassword(value: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !value) return false;
  const a = Buffer.from(value), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
