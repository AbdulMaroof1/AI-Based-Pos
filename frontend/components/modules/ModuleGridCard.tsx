'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ModuleGridCardProps {
  title: string;
  href: string;
  icon: LucideIcon;
}

export function ModuleGridCard({ title, href, icon: Icon }: ModuleGridCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-colors"
    >
      <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <span className="text-sm font-medium text-gray-900 text-center">{title}</span>
    </Link>
  );
}
