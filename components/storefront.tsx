'use client';

import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, type Product } from '@/lib/products';

const money = (price: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(price || 0);

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products').then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setProducts).catch(() => setError('โหลดสินค้าไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ Google Sheet'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => products.filter((p) =>
    (category === 'ทั้งหมด' || p.category === category) && `${p.name} ${p.category} ${p.specs}`.toLowerCase().includes(search.toLowerCase()),
  ), [products, category, search]);
  const cartItems = products.filter((p) => cart[p.id]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = cartItems.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  const adjust = (id: string, delta: number, stock: number) => setCart((old) => {
    const quantity = (old[id] ?? 0) + delta;
    if (quantity <= 0) { const next = { ...old }; delete next[id]; return next; }
    if (quantity > stock) return old;
    return { ...old, [id]: quantity };
  });
  const checkout = async () => {
    const text = ['สรุปรายการสั่งซื้อ BYTEFORGE', ...cartItems.map((p) => `• ${p.name} x${cart[p.id]} — ${money(p.price * cart[p.id])}`), `รวมทั้งหมด: ${money(total)}`].join('\n');
    try { await navigator.clipboard.writeText(text); alert('คัดลอกรายการแล้ว พร้อมนำไปส่งให้แอดมินทาง Line/แชท'); }
    catch { window.prompt('คัดลอกรายการสั่งซื้อ', text); }
  };

  return <main className="min-h-screen bg-[#080b12] text-slate-100">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="/" className="text-xl font-black tracking-[.16em]">BYTE<span className="text-lime-400">FORGE</span></a>
        <nav className="flex items-center gap-3"><a className="hidden text-sm text-slate-400 hover:text-white sm:block" href="#products">สินค้า</a><a href="/admin" className="hidden text-sm text-slate-400 hover:text-white sm:block">จัดการร้าน</a><button onClick={() => setCartOpen(true)} className="rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-bold text-lime-300">ตะกร้า ({count})</button></nav>
      </div>
    </header>
    <section className="relative overflow-hidden border-b border-white/5"><div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-20 md:grid-cols-[1.2fr_.8fr] md:py-28">
        <div><p className="mb-4 text-xs font-bold tracking-[.35em] text-lime-300">BUILD YOUR NEXT LEVEL</p><h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">อัปเกรดความแรง<br/><span className="text-lime-400">ไปให้สุดทุกเกม</span></h1><p className="mt-5 max-w-xl text-slate-400">คอมพิวเตอร์และอุปกรณ์ไอทีที่คัดมาเพื่อเกมเมอร์ ครีเอเตอร์ และคนทำงานยุคใหม่</p><a href="#products" className="mt-8 inline-flex rounded-xl bg-lime-400 px-6 py-3 font-extrabold text-slate-950 hover:bg-lime-300">เลือกช้อปสินค้า <span className="ml-2">↘</span></a></div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-950 p-8 shadow-2xl"><div className="mb-6 flex items-center justify-between"><span className="text-sm font-bold text-slate-300">PERFORMANCE / 2025</span><span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs text-lime-300">READY TO PLAY</span></div><div className="text-7xl">⌁</div><div className="mt-6 grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-white/5 p-3"><strong className="block text-lime-300">PC</strong><small className="text-slate-500">Custom build</small></div><div className="rounded-xl bg-white/5 p-3"><strong className="block text-lime-300">GEAR</strong><small className="text-slate-500">Pro devices</small></div><div className="rounded-xl bg-white/5 p-3"><strong className="block text-lime-300">CARE</strong><small className="text-slate-500">Expert support</small></div></div></div>
      </div>
    </section>
    <section id="products" className="mx-auto max-w-7xl px-5 py-14"><div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold tracking-[.25em] text-lime-300">SHOP THE COLLECTION</p><h2 className="mt-2 text-3xl font-black">สินค้าแนะนำ</h2></div><label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:max-w-sm"><span>⌕</span><input aria-label="ค้นหาสินค้า" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="ค้นหาสินค้า..." value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">{CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${category === item ? 'border-lime-400 bg-lime-400 text-slate-950 font-bold' : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}>{item}</button>)}</div>
      {error && <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {loading ? <p className="py-16 text-center text-slate-500">กำลังโหลดสินค้า…</p> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((p) => <article key={p.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#10141e] transition hover:-translate-y-1 hover:border-lime-400/40"><div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">{p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-6xl text-lime-300/40">⌘</span>}<span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-lime-300">{p.category}</span></div><div className="p-5"><h3 className="line-clamp-1 font-bold">{p.name}</h3><p className="mt-2 min-h-10 line-clamp-2 text-sm text-slate-500">{p.specs || p.description}</p><div className="mt-4 flex items-center justify-between"><div><strong className="block text-lg text-lime-300">{money(p.price)}</strong><small className={p.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>{p.stock > 0 ? `พร้อมส่ง ${p.stock} ชิ้น` : 'สินค้าหมด'}</small></div><button disabled={p.stock <= 0} onClick={() => { adjust(p.id, 1, p.stock); setCartOpen(true); }} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-lime-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">เพิ่มลงตะกร้า +</button></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-slate-500">ไม่พบสินค้าในหมวดหมู่นี้</div>}
    </section>
    <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-600">© {new Date().getFullYear()} BYTEFORGE — Gaming & Tech Store</footer>
    {cartOpen && <div className="fixed inset-0 z-50"><button aria-label="ปิดตะกร้า" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/70"/><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#10141e] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black">ตะกร้าสินค้า ({count})</h2><button onClick={() => setCartOpen(false)} className="text-2xl text-slate-400">×</button></div><div className="mt-6 flex-1 space-y-4 overflow-y-auto">{cartItems.length ? cartItems.map((p) => <div key={p.id} className="flex items-center gap-3 border-b border-white/10 pb-4"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">{p.image && <img src={p.image} alt="" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="truncate font-bold">{p.name}</p><p className="text-sm text-lime-300">{money(p.price)}</p><div className="mt-2 flex items-center gap-3"><button onClick={() => adjust(p.id, -1, p.stock)} className="rounded bg-white/10 px-2">−</button><span>{cart[p.id]}</span><button onClick={() => adjust(p.id, 1, p.stock)} className="rounded bg-white/10 px-2">+</button></div></div></div>) : <p className="py-12 text-center text-slate-500">ยังไม่มีสินค้าในตะกร้า</p>}</div><div className="border-t border-white/10 pt-5"><div className="mb-4 flex justify-between"><span className="text-slate-400">ยอดรวม</span><strong className="text-xl text-lime-300">{money(total)}</strong></div><button disabled={!count} onClick={checkout} className="w-full rounded-xl bg-lime-400 py-3 font-extrabold text-slate-950 disabled:opacity-40">สรุปรายการสั่งซื้อ</button><p className="mt-3 text-center text-xs text-slate-500">คัดลอกรายการเพื่อส่งให้แอดมินทาง Line/แชท</p></div></aside></div>}
  </main>;
}
