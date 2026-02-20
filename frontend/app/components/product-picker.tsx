'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

interface Product {
  id: string;
  sku: string;
  name: string;
  type?: string;
  salePrice?: number;
  standardCost?: number;
}

interface ProductPickerProps {
  value: string;
  onChange: (product: Product | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ProductPicker({ value, onChange, placeholder = 'Search product…', className = '', disabled }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient.getProducts(search || undefined).then((res) => {
      if (res.success) setProducts(res.data || []);
    }).finally(() => setLoading(false));
  }, [open, search]);

  useEffect(() => {
    if (value && products.length) {
      const p = products.find((x) => x.id === value);
      if (p) setSelected(p);
      else setSelected(null);
    } else setSelected(null);
  }, [value, products]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const handleSelect = (p: Product) => {
    setSelected(p);
    onChange(p);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-1">
        <input
          type="text"
          value={open ? search : (selected ? `${selected.sku} — ${selected.name}` : '')}
          onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        />
        {selected && (
          <button type="button" onClick={handleClear} className="px-2 text-gray-400 hover:text-red-500 text-sm">×</button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No products found</div>
          ) : (
            products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-50 last:border-0"
              >
                <span className="font-medium">{p.sku}</span>
                <span className="text-gray-600"> — {p.name}</span>
                {p.salePrice != null && <span className="text-gray-500 ml-1">${Number(p.salePrice).toFixed(2)}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
