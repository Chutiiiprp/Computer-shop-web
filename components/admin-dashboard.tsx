'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { Product } from '@/lib/products';

const categories = ['คอมเซ็ต', 'CPU', 'การ์ดจอ', 'RAM', 'จอคอม', 'อุปกรณ์เสริม'];
const emptyForm = { name: '', category: 'คอมเซ็ต', specs: '', price: '', stock: '', description: '', image: '' };
const money = (n: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n || 0);

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-password');
    if (saved) { setPassword(saved); void verify(saved); }
    else setChecking(false);
  }, []);

  async function verify(value: string) {
    setChecking(true); setMessage('');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: value }) });
      if (!response.ok) throw new Error('รหัสผ่านไม่ถูกต้อง');
      localStorage.setItem('admin-password', value); setPassword(value); setAuthenticated(true);
      await loadProducts();
    } catch (error) {
      localStorage.removeItem('admin-password'); setAuthenticated(false);
      setMessage(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'); setIsError(true);
    } finally { setChecking(false); }
  }

  async function loadProducts() {
    const response = await fetch('/api/products', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'โหลดสินค้าไม่สำเร็จ');
    setProducts(data as Product[]);
  }

  async function apiAction(payload: unknown) {
    const response = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'ดำเนินการไม่สำเร็จ');
    return data;
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setForm({ name: product.name, category: product.category, specs: product.specs, price: String(product.price), stock: String(product.stock), description: product.description, image: product.image });
    setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() { setForm(emptyForm); setEditingId(null); setFile(null); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      let image = form.image;
      if (file) {
        const body = new FormData(); body.append('file', file);
        const upload = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-password': password }, body });
        const result = await upload.json();
        if (!upload.ok) throw new Error(result.error || 'อัปโหลดรูปไม่สำเร็จ');
        image = result.url;
      }
      const product: Product = { id: editingId ?? crypto.randomUUID(), name: form.name.trim(), category: form.category, specs: form.specs.trim(), price: Number(form.price), stock: Number(form.stock), description: form.description.trim(), image };
      await apiAction({ action: editingId ? 'update' : 'add', product });
      await loadProducts(); reset(); setMessage('บันทึกสินค้าเรียบร้อย'); setIsError(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ'); setIsError(true); }
    finally { setBusy(false); }
  }

  async function remove(product: Product) {
    if (!window.confirm(`ยืนยันลบ “${product.name}” หรือไม่?`)) return;
    setBusy(true); setMessage('');
    try { await apiAction({ action: 'delete', id: product.id }); await loadProducts(); setMessage('ลบสินค้าเรียบร้อย'); setIsError(false); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ'); setIsError(true); }
    finally { setBusy(false); }
  }

  function logout() { localStorage.removeItem('admin-password'); setPassword(''); setAuthenticated(false); setMessage(''); }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#080b12] text-slate-400">กำลังตรวจสอบ…</main>;
  if (!authenticated) return <main className="grid min-h-screen place-items-center bg-[#080b12] px-5 text-slate-100"><form onSubmit={(event) => { event.preventDefault(); void verify(password); }} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10141e] p-8"><a href="/" className="text-sm text-lime-300">← กลับหน้าร้าน</a><p className="mt-8 text-xs font-bold tracking-[.25em] text-lime-300">BYTEFORGE ADMIN</p><h1 className="mt-2 text-3xl font-black">เข้าสู่ระบบ</h1><p className="mt-2 text-sm text-slate-400">กรอกรหัสผ่านผู้ดูแลระบบเพื่อจัดการสินค้า</p><input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-7 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-lime-400" placeholder="รหัสผ่าน"/><button className="mt-4 w-full rounded-xl bg-lime-400 py-3 font-bold text-slate-950">เข้าสู่ระบบ</button>{message && <p className="mt-4 text-sm text-red-300">{message}</p>}</form></main>;

  return <main className="min-h-screen bg-[#080b12] px-4 py-8 text-slate-100 sm:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex items-center justify-between"><div><a href="/" className="text-sm text-lime-300">← หน้าร้าน</a><h1 className="mt-2 text-3xl font-black">จัดการสินค้า</h1></div><button onClick={logout} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">ออกจากระบบ</button></header>
    {message && <div role="status" className={`mb-5 rounded-xl border p-3 text-sm ${isError ? 'border-red-400/20 bg-red-400/10 text-red-200' : 'border-lime-400/20 bg-lime-400/10 text-lime-200'}`}>{message}</div>}
    <form onSubmit={save} className="mb-10 rounded-2xl border border-white/10 bg-[#10141e] p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>{editingId && <button type="button" onClick={reset} className="text-sm text-slate-400">ยกเลิกแก้ไข</button>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm text-slate-400">ชื่อสินค้า<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field" /></label>
      <label className="text-sm text-slate-400">หมวดหมู่<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="field">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label className="text-sm text-slate-400">ราคา (บาท)<input required min="0" step="1" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="field" /></label>
      <label className="text-sm text-slate-400">จำนวนสต็อก<input required min="0" step="1" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="field" /></label>
      <label className="text-sm text-slate-400">สเปกย่อ<input value={form.specs} onChange={(event) => setForm({ ...form, specs: event.target.value })} className="field" placeholder="เช่น Ryzen 7 / RTX 4070" /></label>
      <label className="text-sm text-slate-400">รูปภาพสินค้า (ไม่เกิน 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="field file:mr-3 file:rounded file:border-0 file:bg-lime-400 file:px-3 file:py-1 file:text-slate-950" /></label>
      <label className="text-sm text-slate-400 sm:col-span-2 lg:col-span-3">รายละเอียด<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="field" /></label>
    </div>{form.image && <p className="mt-3 text-xs text-slate-500">มีรูปเดิมแล้ว — เลือกรูปใหม่เพื่อแทนที่</p>}<button disabled={busy} className="mt-5 rounded-xl bg-lime-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? 'กำลังบันทึก…' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button></form>
    <div className="mb-4 flex items-end justify-between"><h2 className="text-xl font-bold">รายการสินค้า <span className="text-sm text-slate-500">({products.length})</span></h2><button onClick={() => { void loadProducts().catch((error) => { setMessage(error.message); setIsError(true); }); }} className="text-sm text-lime-300">รีเฟรช</button></div>
    <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/5 text-slate-400"><tr>{['สินค้า', 'หมวดหมู่', 'ราคา', 'สต็อก', 'จัดการ'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-t border-white/10"><td className="px-4 py-3"><div className="flex items-center gap-3">{product.image ? <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover"/> : <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/5">⌘</div>}<div><p className="font-bold">{product.name}</p><p className="max-w-xs truncate text-xs text-slate-500">{product.specs}</p></div></div></td><td className="px-4 py-3 text-slate-400">{product.category}</td><td className="px-4 py-3">{money(product.price)}</td><td className="px-4 py-3">{product.stock}</td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => edit(product)} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">แก้ไข</button><button disabled={busy} onClick={() => void remove(product)} className="rounded-lg bg-red-500/10 px-3 py-2 text-red-300 hover:bg-red-500/20 disabled:opacity-50">ลบ</button></div></td></tr>)}</tbody></table>{products.length === 0 && <p className="p-8 text-center text-slate-500">ยังไม่มีสินค้า</p>}</div>
    <p className="mt-5 text-xs text-slate-600">รูปใหม่จะถูกอัปโหลดไปยัง GitHub ก่อนบันทึกข้อมูลสินค้า</p></div><style jsx>{`.field{display:block;width:100%;margin-top:.5rem;border-radius:.75rem;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.2);padding:.75rem;color:#eef2ff;outline:none}.field:focus{border-color:#a3e635}select option{background:#10141e}`}</style></main>;
}
