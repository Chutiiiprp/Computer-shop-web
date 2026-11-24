import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/auth';
export const runtime = 'nodejs';
const MAX = 5 * 1024 * 1024;
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export async function POST(request: Request) {
  if (!isValidAdminPassword(request.headers.get('x-admin-password'))) return NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ' }, { status: 401 });
  const token = process.env.GITHUB_TOKEN, owner = process.env.GITHUB_OWNER, repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return NextResponse.json({ error: 'กรุณาตั้งค่า GITHUB_TOKEN, GITHUB_OWNER และ GITHUB_REPO' }, { status: 500 });
  try {
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'กรุณาเลือกไฟล์รูปภาพ' }, { status: 400 });
    const ext = EXT[file.type]; if (!ext) return NextResponse.json({ error: 'รองรับเฉพาะ JPEG, PNG, WebP และ GIF' }, { status: 415 });
    if (!file.size || file.size > MAX) return NextResponse.json({ error: 'ขนาดไฟล์ต้องไม่เกิน 5 MB' }, { status: 413 });
    const filename = `${randomUUID()}.${ext}`, path = `public/uploads/${filename}`;
    const content = Buffer.from(await file.arrayBuffer()).toString('base64');
    const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Upload product image ${filename}`, content }),
    });
    if (!r.ok) { console.error(await r.text()); return NextResponse.json({ error: 'อัปโหลดรูปไป GitHub ไม่สำเร็จ ตรวจสอบสิทธิ์ Contents: write' }, { status: 502 }); }
    return NextResponse.json({ url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`, filename });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'เกิดข้อผิดพลาดระหว่างอัปโหลดรูปภาพ' }, { status: 500 }); }
}
