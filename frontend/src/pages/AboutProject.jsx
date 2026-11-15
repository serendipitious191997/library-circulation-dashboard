import React from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Layout,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export default function AboutProject() {
  const technologies = [
    { name: 'Python 3', role: 'Core Backend Language & OOP Architecture', color: 'blue' },
    { name: 'Pandas', role: 'High-Performance Data Ingestion & Tabular Wrangling', color: 'lavender' },
    { name: 'Flask', role: 'Lightweight RESTful API Microframework', color: 'mint' },
    { name: 'React.js & Vite', role: 'Fast Component-Driven Frontend Client', color: 'sky' },
    { name: 'Recharts', role: 'Declarative Interactive Data Visualizations', color: 'peach' },
    { name: 'Matplotlib', role: 'Statistical Plotting & Chart Generation', color: 'yellow' },
    { name: 'CSV & JSON', role: 'Standardized Data Ingestion & Serialization Protocols', color: 'rose' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">About the Project</h2>
        <p className="page-subtitle">
          College Python Programming Laboratory Project &bull; Architecture and Technical Overview
        </p>
      </div>

      {/* Hero Overview Card */}
      <div className="chart-card" style={{ marginBottom: '28px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #dcfce7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Library Circulation and Demand Dashboard
            </h3>
            <span className="badge badge-mint" style={{ marginTop: '4px' }}>
              Python Programming Laboratory Project
            </span>
          </div>
        </div>

        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
          A Python-based data analysis system designed to analyse library borrowing records, identify overdue books,
          calculate borrowing frequencies, examine loan durations and understand monthly circulation patterns.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              🎯 Project Objective
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enable college library administrators to move away from static spreadsheets and access dynamic, automated insights on book circulation frequency, demand peaks, and late returns.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              💡 Engineering Highlights
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Implements clean OOP design using a dedicated <code>LoanRecord</code> class, robust validation without silent row dropping, dynamic fallback date calculation, and full REST API integration.
            </p>
          </div>
        </div>
      </div>

      {/* Technologies Grid */}
      <div className="chart-card" style={{ marginBottom: '28px' }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-card-title">Technology Stack</h3>
            <p className="chart-card-subtitle">Tools and libraries powering the full-stack architecture</p>
          </div>
          <span className="badge badge-blue">Full-Stack Python + React</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {technologies.map((t) => (
            <div
              key={t.name}
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{t.name}</strong>
                <Code2 size={16} style={{ color: 'var(--primary-color)' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-card-title">System Architecture &amp; Data Pipeline</h3>
            <p className="chart-card-subtitle">End-to-end data processing workflow</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            {
              step: 'Step 1',
              title: 'Dataset Ingestion',
              desc: 'User uploads CSV dataset with borrowing logs or loads pre-configured 50-row lab benchmark.',
            },
            {
              step: 'Step 2',
              title: 'Validation & Audit',
              desc: 'Python checks column headers, checks for duplicate Loan IDs, and parses dates without silent record deletion.',
            },
            {
              step: 'Step 3',
              title: 'OOP Modeling',
              desc: 'Each row instantiates a LoanRecord object computing duration and overdue status relative to present date.',
            },
            {
              step: 'Step 4',
              title: 'Analytics Aggregation',
              desc: 'Pandas computes frequency distributions, monthly trends, duration histograms, and export payloads.',
            },
            {
              step: 'Step 5',
              title: 'Reactive Frontend',
              desc: 'React and Recharts fetch JSON from Flask REST endpoints and render responsive pastel charts.',
            },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                padding: '14px',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <span className="badge badge-mint" style={{ fontSize: '11px', marginBottom: '8px' }}>
                {s.step}
              </span>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '6px 0 4px', color: 'var(--text-primary)' }}>
                {s.title}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.45 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
