import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ChartCard Component
 * Consistent container for Recharts and analytical visual elements.
 */
export default function ChartCard({
  title,
  subtitle,
  badge,
  actions,
  children,
  loading = false,
  empty = false,
  emptyMessage = 'No data available for display',
  height = 320,
}) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="chart-card-title">{title}</h3>
            {badge && <span className="badge badge-blue">{badge}</span>}
          </div>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="chart-card-actions">{actions}</div>}
      </div>

      <div
        className="chart-container"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '13px' }}>Loading chart data...</p>
          </div>
        ) : empty ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '13px' }}>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
