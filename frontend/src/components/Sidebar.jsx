import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  BookOpen,
  PieChart,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Info,
  Library,
  X,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  datasetInfo,
  overdueCount = 0,
  validationIssueCount = 0,
  isMobileOpen = false,
  setIsMobileOpen = () => {},
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Dataset', icon: UploadCloud },
    { id: 'records', label: 'Borrowing Records', icon: BookOpen },
    { id: 'categories', label: 'Category Analysis', icon: PieChart },
    { id: 'monthly', label: 'Monthly Trends', icon: TrendingUp },
    { id: 'duration', label: 'Loan Duration', icon: Clock },
    {
      id: 'overdue',
      label: 'Overdue Books',
      icon: AlertTriangle,
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'rose',
    },
    {
      id: 'validation',
      label: 'Data Validation',
      icon: CheckCircle2,
      badge: validationIssueCount > 0 ? validationIssueCount : null,
      badgeColor: 'yellow',
    },
    { id: 'export', label: 'Export Reports', icon: FileDown },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Library size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sidebar-brand-title">Library Circulation</h2>
          <p className="sidebar-brand-subtitle">&amp; Demand Dashboard</p>
        </div>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-dataset-status">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span className="status-indicator"></span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {datasetInfo?.filename || 'No dataset loaded'}
            </strong>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            {datasetInfo?.total_rows ? `${datasetInfo.total_rows} records active` : 'Ready for upload'}
          </p>
        </div>
      </div>
    </aside>
  );
}
