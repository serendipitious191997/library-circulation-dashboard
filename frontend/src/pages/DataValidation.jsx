import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  FileQuestion,
  CalendarX,
  FileX,
  ShieldCheck,
  ShieldAlert,
  Search,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function DataValidation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadValidation() {
      try {
        const res = await api.getValidation();
        setData(res?.validation || {});
      } catch (err) {
        console.error('Failed to load validation findings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadValidation();
  }, []);

  const totalRecords = data?.total_records || 0;
  const validRecords = data?.total_valid_records || 0;
  const invalidRecords = data?.total_invalid_records || 0;
  const duplicateRecords = data?.duplicate_records || 0;
  const incompleteRecords = data?.incomplete_records || 0;
  const missingValueRecords = data?.missing_value_records || 0;
  const invalidDateRecords = data?.invalid_date_records || 0;
  const issues = data?.issues || [];

  const filteredIssues = issues.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.loan_id.toLowerCase().includes(q) ||
      item.book_title.toLowerCase().includes(q) ||
      item.student_id.toLowerCase().includes(q) ||
      item.issues.some((msg) => msg.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Dataset Integrity &amp; Data Validation</h2>
          <p className="page-subtitle">
            Audits dataset hygiene, identifies duplicates, missing attributes, and invalid dates without silent deletion.
          </p>
        </div>

        <div>
          {invalidRecords === 0 ? (
            <span className="badge badge-mint" style={{ fontSize: '13px', padding: '6px 14px' }}>
              <ShieldCheck size={16} style={{ marginRight: '6px' }} />
              100% Quality Score (0 Errors)
            </span>
          ) : (
            <span className="badge badge-rose" style={{ fontSize: '13px', padding: '6px 14px' }}>
              <ShieldAlert size={16} style={{ marginRight: '6px' }} />
              {invalidRecords} Records Require Review
            </span>
          )}
        </div>
      </div>

      {/* 6 Colourful Validation Status Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard
          title="Total Valid Records"
          value={validRecords}
          subtitle={`Out of ${totalRecords} total rows`}
          icon={CheckCircle2}
          color="mint"
          badge="Clean Data"
        />

        <StatCard
          title="Total Invalid Records"
          value={invalidRecords}
          subtitle={invalidRecords > 0 ? 'Requires attention' : 'No defects'}
          icon={AlertTriangle}
          color="rose"
          badge="Defects"
        />

        <StatCard
          title="Duplicate Records"
          value={duplicateRecords}
          subtitle="Repeated Loan IDs"
          icon={Copy}
          color="peach"
          badge="Duplicates"
        />

        <StatCard
          title="Incomplete Records"
          value={incompleteRecords}
          subtitle="Missing critical columns"
          icon={FileX}
          color="yellow"
          badge="Incomplete"
        />

        <StatCard
          title="Missing Values"
          value={missingValueRecords}
          subtitle="Null or blank entries"
          icon={FileQuestion}
          color="lavender"
          badge="Missing"
        />

        <StatCard
          title="Invalid Dates"
          value={invalidDateRecords}
          subtitle="Format or chronological flaws"
          icon={CalendarX}
          color="blue"
          badge="Date Errors"
        />
      </div>

      {/* Validation Issue Audit Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Data Quality Audit Log
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Transparent diagnosis of flagged rows. Records are retained and reported for complete auditability.
            </p>
          </div>

          {issues.length > 0 && (
            <div className="input-search">
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Row #</th>
                <th>Loan ID</th>
                <th>Book Title</th>
                <th>Student ID</th>
                <th>Severity</th>
                <th>Diagnostic Explanation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Running data validation checks...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={40} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                      All Records Are Structurally Valid!
                    </p>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>
                      No duplicates, missing mandatory values, or chronological date errors detected in this dataset.
                    </p>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No issues match your filter query.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((item) => (
                  <tr key={`${item.row_number}-${item.loan_id}`} className="row-overdue">
                    <td style={{ fontWeight: 600 }}>Row {item.row_number}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {item.loan_id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.book_title}</td>
                    <td>{item.student_id}</td>
                    <td>
                      <span className={`badge ${item.severity === 'Error' ? 'badge-rose' : 'badge-yellow'}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td>
                      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#b91c1c' }}>
                        {item.issues.map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
