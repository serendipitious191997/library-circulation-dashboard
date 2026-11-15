import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

export default function MonthlyTrends() {
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadTrends = async (year) => {
    setLoading(true);
    try {
      const yearParam = year === 'all' ? null : parseInt(year, 10);
      const res = await api.getMonthlyTrends(yearParam);
      setData(res);
    } catch (err) {
      console.error('Failed to load monthly trends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends(selectedYear);
  }, [selectedYear]);

  const monthlyData = data?.monthly_data || [];
  const highestMonth = data?.highest_month || {};
  const lowestMonth = data?.lowest_month || {};
  const availableYears = data?.available_years || [];
  const totalLoans = data?.total_loans_in_period || 0;

  const avgPerMonth =
    monthlyData.length > 0 ? (totalLoans / monthlyData.length).toFixed(1) : 0;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Monthly Circulation Trends</h2>
          <p className="page-subtitle">
            Tracks book borrowing patterns and academic activity peaks across semesters and calendar months.
          </p>
        </div>

        {/* Year Filter Dropdown */}
        {availableYears.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="select-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">All Available Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Highlights Grid */}
      <div className="stat-grid">
        <StatCard
          title="Highest Borrowing Month"
          value={highestMonth.month || 'N/A'}
          subtitle={`${highestMonth.count || 0} loans issued`}
          icon={ArrowUpRight}
          color="mint"
          badge="Peak Activity"
        />

        <StatCard
          title="Lowest Borrowing Month"
          value={lowestMonth.month || 'N/A'}
          subtitle={`${lowestMonth.count || 0} loans issued`}
          icon={ArrowDownRight}
          color="peach"
          badge="Slow Period"
        />

        <StatCard
          title="Total Period Circulation"
          value={totalLoans}
          subtitle={`Across ${monthlyData.length} recorded months`}
          icon={Calendar}
          color="blue"
          badge="Total Loans"
        />

        <StatCard
          title="Average Monthly Volume"
          value={`${avgPerMonth} loans`}
          subtitle="Mean borrowing rate"
          icon={TrendingUp}
          color="lavender"
          badge="Monthly Average"
        />
      </div>

      {/* Main Interactive Line Chart */}
      <div className="chart-grid" style={{ gridTemplateColumns: '1fr' }}>
        <ChartCard
          title="Circulation Trajectory Over Time"
          subtitle="Monthly volume of book loans (smooth interpolation)"
          badge="Trend Line"
          loading={loading}
          empty={monthlyData.length === 0}
          height={340}
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
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
                formatter={(val) => [`${val} loans`, 'Books Borrowed']}
              />
              <Area
                type="monotone"
                dataKey="loans"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorLoans)"
                dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Monthly Circulation Breakdown
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Detailed month-by-month transaction counts
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month &amp; Year</th>
                <th>Period Key</th>
                <th>Total Borrowings</th>
                <th>Share of Annual Volume</th>
                <th>Activity Indicator</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m) => {
                const share = totalLoans > 0 ? ((m.loans / totalLoans) * 100).toFixed(1) : 0;
                const isHighest = m.loans === highestMonth.count;
                const isLowest = m.loans === lowestMonth.count;

                return (
                  <tr key={m.period}>
                    <td style={{ fontWeight: 600 }}>{m.month}</td>
                    <td style={{ color: 'var(--text-secondary)' }}><code>{m.period}</code></td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {m.loans} loans
                    </td>
                    <td>{share}%</td>
                    <td>
                      {isHighest ? (
                        <span className="badge badge-mint">Peak Month</span>
                      ) : isLowest ? (
                        <span className="badge badge-peach">Lowest Volume</span>
                      ) : (
                        <span className="badge badge-blue">Normal Circulation</span>
                      )}
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
