import React from 'react';

/**
 * StatCard Component
 * Displays a colorful pastel metric card with an icon, value, title, and optional badge.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badge,
  onClick,
}) {
  return (
    <div
      className={`stat-card ${color}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-value">
        {value !== undefined && value !== null ? value : '—'}
      </div>

      <div className="stat-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-card-subtitle">{subtitle}</span>
        {badge && (
          <span className={`badge badge-${color}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
