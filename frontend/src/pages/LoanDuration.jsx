import React, { useState, useEffect } from 'react';
import {
  Clock,
  Timer,
  Maximize2,
  Minimize2,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

const DURATION_COLORS = [
  '#38bdf8', // 1-5 days (Sky blue)
  '#4ade80', // 6-10 days (Mint green)
  '#a78bfa', // 11-15 days (Lavender)
  '#facc15', // 16-20 days (Soft yellow)
  '#fb7185', // >20 days (Soft rose)
];

export default function LoanDuration() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDuration() {
      try {
        const res = await api.getDurationAnalysis();
        setData(res);
      } catch (err) {
        console.error('Failed to load duration analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDuration();
  }, []);

  const distribution = data?.distribution || [];
  const avgDuration = data?.average_duration || 0;
  const minDuration = data?.min_duration || 0;
  const maxDuration = data?.max_duration || 0;
  const totalAnalyzed = data?.total_analyzed || 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Loan Duration Analysis</h2>
        <p className="page-subtitle">
          Examines book retention times, return behavior distributions, and adherence to library checkout policies.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <StatCard
          title="Average Loan Duration"
          value={`${avgDuration} days`}
          subtitle="Mean time books stay borrowed"
          icon={Clock}
          color="lavender"
          badge="Average"
        />

        <StatCard
          title="Minimum Loan Duration"
          value={`${minDuration} days`}
          subtitle="Shortest borrow period recorded"
          icon={Minimize2}
          color="mint"
          badge="Shortest"
        />

        <StatCard
          title="Maximum Loan Duration"
          value={`${maxDuration} days`}
          subtitle="Longest loan period recorded"
          icon={Maximize2}
          color="rose"
          badge="Longest"
        />

        <StatCard
          title="Circulation Analyzed"
          value={`${totalAnalyzed} loans`}
          subtitle="Transactions with valid duration"
          icon={Timer}
          color="blue"
          badge="Evaluated"
        />
      </div>

      {/* Main Chart */}
      <div className="chart-grid" style={{ gridTemplateColumns: '1fr' }}>
        <ChartCard
          title="Distribution of Borrowing Durations"
          subtitle="Frequency of loans categorized into standard retention intervals"
          badge="Duration Buckets"
          loading={loading}
          empty={distribution.length === 0}
          height={340}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={distribution}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="group"
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
                formatter={(val, name, item) => [
                  `${val} loans (${item.payload.percentage}%)`,
                  'Frequency',
                ]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {distribution.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={DURATION_COLORS[index % DURATION_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Duration Ledger Breakdown Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Loan Retention Breakdown
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Evaluation of standard 14-day library lending windows
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Duration Group</th>
                <th>Total Loans</th>
                <th>Percentage Share</th>
                <th>Distribution Bar</th>
                <th>Policy Assessment</th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((grp, idx) => {
                let badgeClass = 'badge-blue';
                let assessment = 'Within Normal Policy';

                if (grp.group === '1–5 days') {
                  badgeClass = 'badge-mint';
                  assessment = 'Quick Return';
                } else if (grp.group === '6–10 days' || grp.group === '11–15 days') {
                  badgeClass = 'badge-blue';
                  assessment = 'Standard Policy Period (14 Days)';
                } else if (grp.group === '16–20 days') {
                  badgeClass = 'badge-yellow';
                  assessment = 'Slightly Extended / Late';
                } else {
                  badgeClass = 'badge-rose';
                  assessment = 'Significant Extension / Overdue';
                }

                return (
                  <tr key={grp.group}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: DURATION_COLORS[idx % DURATION_COLORS.length],
                            display: 'inline-block',
                          }}
                        />
                        <span>{grp.group}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {grp.count} loans
                    </td>
                    <td>{grp.percentage}%</td>
                    <td style={{ width: '240px' }}>
                      <div
                        style={{
                          height: '8px',
                          width: '100%',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${grp.percentage}%`,
                            backgroundColor: DURATION_COLORS[idx % DURATION_COLORS.length],
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{assessment}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
