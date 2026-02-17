'use client';

interface SummaryCardProps {
  title: string;
  value: string;
  onClick?: () => void;
}

export function SummaryCard({ title, value, onClick }: SummaryCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${onClick ? 'cursor-pointer hover:border-primary-300' : ''}`}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
