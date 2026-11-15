import React from 'react';
import {
  BookOpen,
  Library,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

export default function Dashboard({
  dashboardData,
  loading = false,
  onNavigate,
}) {
  const summary = dashboardData?.summary || {};
  const categoryPreview = dashboardData?.category_preview || [];
  const trendPreview = dashboardData?.trend_preview || [];
  const recentRecords = dashboardData?.recent_records || [];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Circulation &amp; Demand Overview</h2>
          <p className="page-subtitle">
            Summary metrics and real-time circulation trends derived from the active dataset.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => onNavigate('upload')}>
            Upload New CSV
          </button>
          <button className="btn-primary" onClick={() => onNavigate('records')}>
            View All Records
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 5 Primary Stat Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Borrowing Records"
          value={summary.total_records || 0}
          subtitle={`${summary.active_loans || 0} currently active`}
          icon={BookOpen}
          color="blue"
          badge="Total Loans"
          onClick={() => onNavigate('records')}
        />

        <StatCard
          title="Total Books Borrowed"
          value={summary.total_books_borrowed || 0}
          subtitle={`Across ${summary.total_unique_students || 0} students`}
          icon={Library}
          color="lavender"
          badge="Unique Titles"
          onClick={() => onNavigate('records')}
        />

        <StatCard
          title="Overdue Books"
          value={summary.overdue_books || 0}
          subtitle={`${summary.currently_overdue || 0} active &bull; ${summary.returned_late || 0} late returns`}
          icon={AlertTriangle}
          color="rose"
          badge="Attention"
          onClick={() => onNavigate('overdue')}
        />

        <StatCard
          title="Average Loan Duration"
          value={summary.average_loan_duration ? `${summary.average_loan_duration} days` : '0 days'}
          subtitle="Borrow to return interval"
          icon={Clock}
          color="yellow"
          badge="Duration"
          onClick={() => onNavigate('duration')}
        />

        <StatCard
          title="Most Popular Category"
          value={summary.most_popular_category || 'N/A'}
          subtitle={`${summary.most_popular_category_count || 0} total borrowings`}
          icon={Sparkles}
          color="mint"
          badge="Top Demand"
          onClick={() => onNavigate('categories')}
        />
      </div>

      {/* Quick Visualizations Grid */}
      <div className="chart-grid">
        {/* Category Breakdown Preview */}
        <ChartCard
          title="Category Distribution"
          subtitle="Top book borrowing frequency by academic domain"
          badge="Domain Split"
          actions={
            <button
              onClick={() => onNavigate('categories')}
              style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Full Analysis <ArrowRight size={13} />
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={categoryPreview} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${val} loans`, 'Loans']}
              />
              <Bar dataKey="loans" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Activity Preview */}
        <ChartCard
          title="Monthly Borrowing Activity"
          subtitle="Circulation trends over time"
          badge="Timeline"
          actions={
            <button
              onClick={() => onNavigate('monthly')}
              style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Full Trends <ArrowRight size={13} />
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={trendPreview} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${val} loans`, 'Loans Borrowed']}
              />
              <Line
                type="monotone"
                dataKey="loans"
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Borrowing Records
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Latest transactions recorded in system
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('records')}
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            View All ({summary.total_records || 0})
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Book Title</th>
                <th>Category</th>
                <th>Student ID</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No borrowing records found. Upload a CSV to view data.
                  </td>
                </tr>
              ) : (
                recentRecords.map((r) => (
                  <tr key={r.loan_id} className={r.is_overdue ? 'row-overdue' : ''}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{r.loan_id}</td>
                    <td style={{ fontWeight: 500 }}>{r.book_title}</td>
                    <td>
                      <span className="badge badge-blue">{r.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.student_id}</td>
                    <td>{r.borrow_date || '—'}</td>
                    <td>{r.due_date || '—'}</td>
                    <td>
                      {r.is_returned_late ? (
                        <span className="badge badge-rose">Returned Overdue</span>
                      ) : r.is_currently_overdue ? (
                        <span className="badge badge-rose">Currently Overdue</span>
                      ) : r.is_returned ? (
                        <span className="badge badge-mint">Returned On Time</span>
                      ) : (
                        <span className="badge badge-yellow">Currently Borrowed</span>
                      )}
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
