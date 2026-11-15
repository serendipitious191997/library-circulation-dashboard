import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Award,
  TrendingDown,
  Layers,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

const PASTEL_PALETTE = [
  '#38bdf8', // Sky Blue
  '#a78bfa', // Soft Lavender
  '#fb923c', // Peach Orange
  '#4ade80', // Mint Green
  '#facc15', // Soft Yellow
  '#f472b6', // Pink Rose
  '#60a5fa', // Blue
  '#2dd4bf', // Teal
];

export default function CategoryAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCategoryAnalysis();
        setData(res);
      } catch (err) {
        console.error('Failed to load category analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = data?.categories || [];
  const mostBorrowed = data?.most_borrowed || {};
  const leastBorrowed = data?.least_borrowed || {};
  const totalCategories = data?.total_categories || 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Category Demand Analysis</h2>
        <p className="page-subtitle">
          Evaluates student reading preferences across academic disciplines and subject classifications.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Most Borrowed Category"
          value={mostBorrowed.category || 'N/A'}
          subtitle={`${mostBorrowed.count || 0} loans (${mostBorrowed.percentage || 0}%)`}
          icon={Award}
          color="mint"
          badge="High Demand"
        />

        <StatCard
          title="Least Borrowed Category"
          value={leastBorrowed.category || 'N/A'}
          subtitle={`${leastBorrowed.count || 0} loans (${leastBorrowed.percentage || 0}%)`}
          icon={TrendingDown}
          color="peach"
          badge="Low Demand"
        />

        <StatCard
          title="Active Categories"
          value={totalCategories}
          subtitle="Distinct catalog departments"
          icon={Layers}
          color="lavender"
          badge="Disciplines"
        />

        <StatCard
          title="Top Category Dominance"
          value={mostBorrowed.percentage ? `${mostBorrowed.percentage}%` : '0%'}
          subtitle="Share of overall circulation"
          icon={Percent}
          color="blue"
          badge="Market Share"
        />
      </div>

      {/* Visualizations Grid */}
      <div className="chart-grid">
        {/* Bar Chart: Frequency by Category */}
        <ChartCard
          title="Borrowing Frequency by Category"
          subtitle="Total volume of loans issued per subject"
          badge="Volume"
          loading={loading}
          empty={categories.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categories}
              margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
            >
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
                formatter={(val, name, item) => [
                  `${val} loans (${item.payload.percentage}%)`,
                  'Circulation Volume',
                ]}
              />
              <Bar dataKey="loans" radius={[6, 6, 0, 0]}>
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PASTEL_PALETTE[index % PASTEL_PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie / Donut Chart: Percentage Distribution */}
        <ChartCard
          title="Percentage Distribution"
          subtitle="Proportional circulation breakdown"
          badge="Share"
          loading={loading}
          empty={categories.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
                formatter={(val, name, item) => [
                  `${item.payload.loans} loans (${val}%)`,
                  item.payload.category,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val, entry) => (
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                    {entry.payload.category}
                  </span>
                )}
              />
              <Pie
                data={categories}
                dataKey="percentage"
                nameKey="category"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`pie-cell-${index}`}
                    fill={PASTEL_PALETTE[index % PASTEL_PALETTE.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Summary Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Category Circulation Ledger
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Detailed counts, proportions, and demand classification
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category / Discipline</th>
                <th>Total Loans</th>
                <th>Circulation Share</th>
                <th>Visual Distribution</th>
                <th>Demand Level</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.category}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          backgroundColor: PASTEL_PALETTE[idx % PASTEL_PALETTE.length],
                          display: 'inline-block',
                        }}
                      />
                      <span>{cat.category}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.loans} books
                  </td>
                  <td>{cat.percentage}%</td>
                  <td style={{ width: '220px' }}>
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
                          width: `${cat.percentage}%`,
                          backgroundColor: PASTEL_PALETTE[idx % PASTEL_PALETTE.length],
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    {cat.percentage >= 25 ? (
                      <span className="badge badge-mint">High Demand</span>
                    ) : cat.percentage >= 15 ? (
                      <span className="badge badge-blue">Moderate Demand</span>
                    ) : (
                      <span className="badge badge-yellow">Low Demand</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
