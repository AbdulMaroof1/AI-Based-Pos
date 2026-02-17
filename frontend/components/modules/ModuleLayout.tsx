'use client';

import Link from 'next/link';

interface ModuleLayoutProps {
  moduleName: string;
  basePath: string;
  backHref?: string;
  backLabel?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function ModuleLayout({
  moduleName,
  basePath,
  backHref = '/dashboard',
  backLabel = 'Back to Apps',
  sidebar,
  children,
}: ModuleLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <Link href={backHref} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            ← {backLabel}
          </Link>
          <h2 className="mt-2 font-semibold text-gray-900">{moduleName}</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">{sidebar}</nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
