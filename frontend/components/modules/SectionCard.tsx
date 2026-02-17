'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface MasterItem {
  label: string;
  href: string;
}

interface SectionCardProps {
  title: string;
  items: MasterItem[];
}

export function SectionCard({ title, items }: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-primary-600 rounded px-2 -mx-2 hover:bg-gray-50"
            >
              {item.label}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
