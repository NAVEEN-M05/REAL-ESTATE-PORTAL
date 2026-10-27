import React from 'react';

export default function StatCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-gray-900">{value}</span>
            {unit && <span className="text-xs font-semibold text-gray-500">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 flex items-center justify-between text-xs border-t border-gray-100 pt-3">
          {subtitle && <span className="text-gray-500">{subtitle}</span>}
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
