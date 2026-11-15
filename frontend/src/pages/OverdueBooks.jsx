import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  UserCheck,
  CalendarX,
  Search,
  Filter,
  CheckCircle,
  MailWarning,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function OverdueBooks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadOverdue() {
      try {
        const res = await api.getOverdue();
        setData(res);
      } catch (err) {
        console.error('Failed to load overdue records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverdue();
  }, []);

  const records = data?.records || [];
  const totalOverdue = data?.total_overdue || 0;
  const currentlyOverdue = data?.currently_overdue_count || 0;
  const returnedLate = data?.returned_late_count || 0;
  const maxOverdueDays = data?.max_overdue_days || 0;
  const avgOverdueDays = data?.average_overdue_days || 0;

  // Filter records based on selected tab and search
  const filteredRecords = records.filter((r) => {
    if (filterType === 'current' && !r.overdue_type.includes('Currently')) {
      return false;
    }
    if (filterType === 'returned' && !r.overdue_type.includes('Returned')) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        r.book_title.toLowerCase().includes(q) ||
        r.student_id.toLowerCase().includes(q) ||
        r.loan_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Overdue Books Audit</h2>
          <p className="page-subtitle">
            Monitors unreturned overdue books and loans returned past their scheduled due dates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-rose" style={{ fontSize: '13px', padding: '6px 14px' }}>
            <AlertTriangle size={15} style={{ marginRight: '6px' }} />
            {totalOverdue} Flagged Records
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <StatCard
          title="Total Overdue Incidents"
          value={totalOverdue}
          subtitle="Combined active and resolved overdues"
          icon={AlertTriangle}
          color="rose"
          badge="Audit Total"
        />

        <StatCard
          title="Currently Overdue (Unreturned)"
          value={currentlyOverdue}
          subtitle="Immediate reminder required"
          icon={MailWarning}
          color="peach"
          badge="Action Required"
        />

        <StatCard
          title="Returned Late (Resolved)"
          value={returnedLate}
          subtitle="Returned past scheduled due date"
          icon={Clock}
          color="yellow"
          badge="Historical Late"
        />

        <StatCard
          title="Maximum Overdue Interval"
          value={`${maxOverdueDays} days`}
          subtitle={`Average: ${avgOverdueDays} days overdue`}
          icon={CalendarX}
          color="lavender"
          badge="Max Delay"
        />
      </div>

      {/* Overdue Table with soft red/peach styling */}
      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div className="input-search" style={{ flex: 1 }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search overdue by student ID, title, or loan ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className={`btn-secondary ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
              style={{
                backgroundColor: filterType === 'all' ? 'var(--pastel-sky-bg)' : 'white',
                borderColor: filterType === 'all' ? 'var(--pastel-sky-border)' : 'var(--border-light)',
                color: filterType === 'all' ? 'var(--pastel-sky-text)' : 'inherit',
                fontSize: '12.5px',
                padding: '6px 12px',
              }}
            >
              All ({totalOverdue})
            </button>

            <button
              className={`btn-secondary ${filterType === 'current' ? 'active' : ''}`}
              onClick={() => setFilterType('current')}
              style={{
                backgroundColor: filterType === 'current' ? 'var(--pastel-rose-bg)' : 'white',
                borderColor: filterType === 'current' ? 'var(--pastel-rose-border)' : 'var(--border-light)',
                color: filterType === 'current' ? 'var(--pastel-rose-text)' : 'inherit',
                fontSize: '12.5px',
                padding: '6px 12px',
              }}
            >
              Currently Overdue ({currentlyOverdue})
            </button>

            <button
              className={`btn-secondary ${filterType === 'returned' ? 'active' : ''}`}
              onClick={() => setFilterType('returned')}
              style={{
                backgroundColor: filterType === 'returned' ? 'var(--pastel-peach-bg)' : 'white',
                borderColor: filterType === 'returned' ? 'var(--pastel-peach-border)' : 'var(--border-light)',
                color: filterType === 'returned' ? 'var(--pastel-peach-text)' : 'inherit',
                fontSize: '12.5px',
                padding: '6px 12px',
              }}
            >
              Returned Late ({returnedLate})
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Book Title</th>
                <th>Student ID</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Overdue Days</th>
                <th>Overdue Classification</th>
                <th>Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading overdue records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <CheckCircle size={36} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                      No Overdue Books In This View
                    </p>
                    <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
                      All checked records are returned on time or within permitted lending deadlines.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isCurrent = r.overdue_type.includes('Currently');
                  return (
                    <tr
                      key={r.loan_id}
                      className="row-overdue"
                      style={{
                        backgroundColor: isCurrent ? '#fff1f2' : '#fff7ed',
                      }}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--pastel-rose-text)' }}>
                        {r.loan_id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.book_title}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {r.student_id}
                      </td>
                      <td>{r.borrow_date || '—'}</td>
                      <td style={{ fontWeight: 600, color: '#b91c1c' }}>
                        {r.due_date || '—'}
                      </td>
                      <td>
                        {r.return_date ? (
                          r.return_date
                        ) : (
                          <span className="badge badge-rose">Still Checked Out</span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            color: '#b91c1c',
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          +{r.overdue_days} days
                        </span>
                      </td>
                      <td>
                        {isCurrent ? (
                          <span className="badge badge-rose">Currently Overdue</span>
                        ) : (
                          <span className="badge badge-peach">Returned Late</span>
                        )}
                      </td>
                      <td>
                        {isCurrent ? (
                          <span style={{ fontSize: '12px', color: '#be123c', fontWeight: 600 }}>
                            Send Reminder Email
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#047857', fontWeight: 500 }}>
                            Resolved / Book In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
