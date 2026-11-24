import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/auth';

export async function POST(request: Request) {
  let body: { password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 }); }
  if (!isValidAdminPassword(body.password ?? null)) {
    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
