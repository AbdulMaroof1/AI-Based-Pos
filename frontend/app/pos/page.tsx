'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Product { id: string; sku: string; name: string; salePrice: number; type?: string; }
interface CartLine { productId?: string; description: string; quantity: number; unitPrice: number; amount: number; }
interface Session { id: string; openedAt: string; startingCash: number; status: string; orders: unknown[]; }

export default function POSPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [startingCash, setStartingCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [search, setSearch] = useState('');
  const [lastOrder, setLastOrder] = useState<{ id: string; number: string } | null>(null);

  const loadSession = useCallback(() => {
    apiClient.getPosSession().then((res) => {
      if (res.success) setSession(res.data);
    });
  }, []);

  const loadProducts = useCallback(() => {
    apiClient.getProducts().then((res) => {
      if (res.success) setProducts(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadSession();
    loadProducts();
    setLoading(false);
  }, [isAuthenticated, router, loadSession, loadProducts]);

  useEffect(() => {
    if (session?.status === 'OPEN') setShowOpenModal(false);
  }, [session]);

  const handleOpenSession = async () => {
    setActing(true);
    try {
      const res = await apiClient.openPosSession({ startingCash });
      if (res.success) { setSession(res.data); setShowOpenModal(false); setStartingCash(0); }
    } finally { setActing(false); }
  };

  const handleCloseSession = async () => {
    setActing(true);
    try {
      const res = await apiClient.closePosSession(session!.id, { closingCash });
      if (res.success) { setSession(null); setShowCloseModal(false); setCart([]); }
    } finally { setActing(false); }
  };

  const addToCart = (p: Product) => {
    const existing = cart.find((c) => c.productId === p.id);
    if (existing) {
      setCart(cart.map((c) => c.productId === p.id ? { ...c, quantity: c.quantity + 1, amount: (c.quantity + 1) * c.unitPrice } : c));
    } else {
      setCart([...cart, { productId: p.id, description: p.name, quantity: 1, unitPrice: Number(p.salePrice), amount: Number(p.salePrice) }]);
    }
  };

  const updateQty = (idx: number, delta: number) => {
    const updated = [...cart];
    updated[idx] = { ...updated[idx], quantity: Math.max(0, updated[idx].quantity + delta), amount: (updated[idx].quantity + delta) * updated[idx].unitPrice };
    if (updated[idx].quantity <= 0) updated.splice(idx, 1);
    setCart(updated);
  };

  const removeLine = (idx: number) => setCart(cart.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((s, l) => s + l.amount, 0);
  const tax = 0;
  const total = subtotal + tax;

  const handlePay = async () => {
    if (!session || !cart.length) return;
    setActing(true);
    try {
      const res = await apiClient.createPosOrder({
        sessionId: session.id,
        lines: cart.map((l) => ({ productId: l.productId, description: l.description, quantity: l.quantity, unitPrice: l.unitPrice })),
      });
      if (res.success) {
        const completeRes = await apiClient.completePosOrder(res.data.id);
        if (completeRes.success) {
          setLastOrder({ id: res.data.id, number: res.data.number });
          setCart([]);
        }
      }
    } finally { setActing(false); }
  };

  const filteredProducts = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" /></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Open Cash Register</h1>
          <p className="text-slate-400 text-sm mb-6">Start a new session to begin selling</p>
          <button onClick={() => setShowOpenModal(true)} className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">
            Open Session
          </button>
          <Link href="/dashboard" className="block mt-4 text-slate-400 hover:text-white text-sm">← Back to Dashboard</Link>
        </div>

        {showOpenModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Starting Cash</h2>
              <input type="number" step="0.01" min="0" value={startingCash} onChange={(e) => setStartingCash(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-xl mb-6" placeholder="0.00" />
              <div className="flex gap-3">
                <button onClick={() => setShowOpenModal(false)} className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Cancel</button>
                <button onClick={handleOpenSession} disabled={acting} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium disabled:opacity-50">Open</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-white font-semibold">POS</span>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">Session Open</span>
          {lastOrder && <span className="text-slate-500 text-sm">Last: {lastOrder.number}</span>}
        </div>
        <button onClick={() => setShowCloseModal(true)} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm rounded-lg transition-colors">
          Close Session
        </button>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Products grid */}
        <div className="flex-1 flex flex-col min-w-0 p-4 overflow-hidden">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full max-w-md mb-4 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm" />
          <div className="flex-1 overflow-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 content-start">
            {filteredProducts.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-left transition-colors group">
                <div className="aspect-square bg-slate-700 rounded-lg mb-2 flex items-center justify-center text-slate-500 text-2xl group-hover:bg-slate-600">📦</div>
                <div className="text-white font-medium text-sm truncate">{p.name}</div>
                <div className="text-emerald-400 font-semibold mt-0.5">${Number(p.salePrice).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart panel */}
        <div className="w-full md:w-96 lg:w-[28rem] flex flex-col bg-slate-800 border-l border-slate-700 shrink-0">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-white font-semibold">Current Order</h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Cart is empty. Tap products to add.</p>
            ) : (
              cart.map((l, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{l.description}</div>
                    <div className="text-slate-400 text-xs">${l.unitPrice.toFixed(2)} × {l.quantity}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(i, -1)} className="w-8 h-8 rounded bg-slate-600 hover:bg-slate-500 text-white text-sm">−</button>
                    <span className="w-8 text-center text-white text-sm font-medium">{l.quantity}</span>
                    <button onClick={() => updateQty(i, 1)} className="w-8 h-8 rounded bg-slate-600 hover:bg-slate-500 text-white text-sm">+</button>
                  </div>
                  <span className="text-emerald-400 font-semibold w-16 text-right">${l.amount.toFixed(2)}</span>
                  <button onClick={() => removeLine(i)} className="text-slate-500 hover:text-red-400 text-sm">×</button>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <button onClick={handlePay} disabled={!cart.length || acting} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg">
              {acting ? 'Processing…' : 'Pay'}
            </button>
          </div>
        </div>
      </div>

      {/* Close session modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Close Session</h2>
            <label className="block text-slate-400 text-sm mb-1">Counted Cash</label>
            <input type="number" step="0.01" min="0" value={closingCash} onChange={(e) => setClosingCash(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-xl mb-6" placeholder="0.00" />
            <div className="flex gap-3">
              <button onClick={() => setShowCloseModal(false)} className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Cancel</button>
              <button onClick={handleCloseSession} disabled={acting} className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium disabled:opacity-50">Close Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
