import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/auth';
import { toProduct } from '@/lib/products';
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.GOOGLE_SHEET_URL;
  if (!url) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า GOOGLE_SHEET_URL' }, { status: 500 });
  try {
    const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error(`Google Apps Script ${r.status}`);
    const data: unknown = await r.json();
    const rows = Array.isArray(data) ? data : (data as { products?: unknown[] }).products ?? (data as { data?: unknown[] }).data ?? [];
    return NextResponse.json(rows.map((row, i) => toProduct((row ?? {}) as Record<string, unknown>, i)));
  } catch (error) { console.error(error); return NextResponse.json({ error: 'ไม่สามารถโหลดข้อมูลสินค้าได้' }, { status: 502 }); }
}

export async function POST(request: Request) {
  if (!isValidAdminPassword(request.headers.get('x-admin-password'))) return NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ' }, { status: 401 });
  const url = process.env.GOOGLE_SHEET_URL; if (!url) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า GOOGLE_SHEET_URL' }, { status: 500 });
  try {
    const payload = await request.json();
    if (!['add', 'update', 'delete'].includes(payload?.action)) return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 });
    const r = await fetch(url, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await r.text(); if (!r.ok) throw new Error(`Google Apps Script ${r.status}: ${text.slice(0, 300)}`);
    let result: unknown; try { result = JSON.parse(text); } catch { result = { message: text }; }
    return NextResponse.json(result);
  } catch (error) { console.error(error); return NextResponse.json({ error: 'บันทึกข้อมูลสินค้าไม่สำเร็จ' }, { status: 502 }); }
}
