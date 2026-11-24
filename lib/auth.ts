import { timingSafeEqual } from 'node:crypto';

export function isValidAdminPassword(value: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !value) return false;
  const providedBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}
