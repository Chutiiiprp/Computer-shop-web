import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/auth';
export async function POST(request: Request) {
  let body: { password?: string }; try { body = await request.json(); } catch { return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 }); }
  return isValidAdminPassword(body.password ?? null) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
}
