import React, { useState, useEffect } from 'react';
import { Menu, Calendar, BookOpen, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({
  datasetInfo,
  onLoadSample,
  loadingSample = false,
  onOpenMobileMenu,
}) {
  const [currentDateString, setCurrentDateString] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    setCurrentDateString(formatted);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>Library Circulation and Demand Dashboard</h1>
          </div>
          <div className="header-welcome">
            <Sparkles size={13} style={{ color: '#eab308' }} />
            <span>Welcome, College Engineering Lab Admin &bull; Real-time Circulation Analytics</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-date-badge">
          <Calendar size={14} />
          <span>{currentDateString || 'Today'}</span>
        </div>

        {datasetInfo && datasetInfo.total_rows > 0 && (
          <div className="header-dataset-pill">
            <BookOpen size={13} />
            <span>{datasetInfo.total_rows} Records</span>
          </div>
        )}

        <button
          className="btn-sample-load"
          onClick={onLoadSample}
          disabled={loadingSample}
          title="Reload the 50-row realistic sample dataset"
        >
          <RefreshCw
            size={13}
            style={{
              animation: loadingSample ? 'spin 1s linear infinite' : 'none',
            }}
          />
          <span>{loadingSample ? 'Loading...' : 'Sample Dataset'}</span>
        </button>
      </div>
    </header>
  );
}
