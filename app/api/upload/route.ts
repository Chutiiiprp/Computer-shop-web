import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};

export async function POST(request: Request) {
  if (!isValidAdminPassword(request.headers.get('x-admin-password'))) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ' }, { status: 401 });
  }
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return NextResponse.json({ error: 'กรุณาตั้งค่า GITHUB_TOKEN, GITHUB_OWNER และ GITHUB_REPO' }, { status: 500 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'กรุณาเลือกไฟล์รูปภาพ' }, { status: 400 });
    const extension = MIME_EXTENSIONS[file.type];
    if (!extension) return NextResponse.json({ error: 'รองรับเฉพาะ JPEG, PNG, WebP และ GIF' }, { status: 415 });
    if (file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'ขนาดไฟล์ต้องไม่เกิน 5 MB' }, { status: 413 });

    const filename = `${randomUUID()}.${extension}`;
    const content = Buffer.from(await file.arrayBuffer()).toString('base64');
    const path = `public/uploads/${filename}`;
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Upload product image ${filename}`, content }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error('GitHub image upload failed:', response.status, details.slice(0, 300));
      return NextResponse.json({ error: 'อัปโหลดรูปไป GitHub ไม่สำเร็จ ตรวจสอบ token และสิทธิ์ Contents: write' }, { status: 502 });
    }
    return NextResponse.json({ url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`, filename });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดระหว่างอัปโหลดรูปภาพ' }, { status: 500 });
  }
}
