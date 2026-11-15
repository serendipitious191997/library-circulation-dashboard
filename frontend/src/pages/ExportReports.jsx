import React, { useState } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle,
  Eye,
  Download,
  Copy,
} from 'lucide-react';
import api from '../services/api';

export default function ExportReports() {
  const [previewContent, setPreviewContent] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFetchPreview = async (type, title) => {
    setLoadingPreview(true);
    setPreviewTitle(title);
    try {
      let data;
      if (type === 'category') {
        data = await api.getCategoryAnalysis();
      } else if (type === 'monthly') {
        data = await api.getMonthlyTrends();
      } else if (type === 'summary') {
        data = await api.getDashboard();
      } else {
        const [dash, cat, mon, dur, val, over] = await Promise.all([
          api.getDashboard(),
          api.getCategoryAnalysis(),
          api.getMonthlyTrends(),
          api.getDurationAnalysis(),
          api.getValidation(),
          api.getOverdue(),
        ]);
        data = {
          report_title: 'Complete Library Circulation & Demand Audit',
          generated_at: new Date().toISOString(),
          dashboard: dash,
          category_analysis: cat,
          monthly_trends: mon,
          duration_analysis: dur,
          validation: val,
          overdue: over,
        };
      }
      setPreviewContent(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to preview export:', err);
      setPreviewContent(JSON.stringify({ error: 'Failed to retrieve preview data from backend' }, null, 2));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCopyClipboard = () => {
    if (previewContent) {
      navigator.clipboard.writeText(previewContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Export Analysis Reports</h2>
        <p className="page-subtitle">
          Export verified backend circulation analytics in standard CSV and JSON data interchange formats.
        </p>
      </div>

      {/* 4 Working Export Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {/* Processed CSV */}
        <div className="stat-card blue" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--pastel-sky-bg)', color: 'var(--pastel-sky-text)' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Processed Dataset</h3>
              <span className="badge badge-blue">CSV Format</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
            Cleaned records including auto-calculated loan durations, overdue days, and status labels.
          </p>
          <a
            href={api.getExportCsvUrl()}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            download
          >
            <Download size={15} />
            Download CSV
          </a>
        </div>

        {/* Category Analysis JSON */}
        <div className="stat-card lavender" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--pastel-lavender-bg)', color: 'var(--pastel-lavender-text)' }}>
              <FileCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Category Analysis</h3>
              <span className="badge badge-mint">JSON Report</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
            Subject circulation frequency, percentage distributions, and most/least borrowed domains.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              onClick={() => handleFetchPreview('category', 'Category Analysis JSON')}
            >
              <Eye size={14} /> Preview
            </button>
            <a
              href={api.getExportJsonUrl('category')}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              download
            >
              <Download size={14} /> Download
            </a>
          </div>
        </div>

        {/* Monthly Trends JSON */}
        <div className="stat-card mint" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--pastel-mint-bg)', color: 'var(--pastel-mint-text)' }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Monthly Summaries</h3>
              <span className="badge badge-mint">JSON Report</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
            Monthly circulation counts, timeline trajectories, and highest/lowest borrowing intervals.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              onClick={() => handleFetchPreview('monthly', 'Monthly Trends JSON')}
            >
              <Eye size={14} /> Preview
            </button>
            <a
              href={api.getExportJsonUrl('monthly')}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              download
            >
              <Download size={14} /> Download
            </a>
          </div>
        </div>

        {/* Complete Consolidated Summary */}
        <div className="stat-card yellow" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="stat-card-icon" style={{ backgroundColor: 'var(--pastel-yellow-bg)', color: 'var(--pastel-yellow-text)' }}>
              <FileDown size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Complete Audit JSON</h3>
              <span className="badge badge-yellow">Consolidated</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
            Consolidated package including dashboard metrics, categories, trends, durations, and validation logs.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              onClick={() => handleFetchPreview('complete', 'Complete Analysis Summary JSON')}
            >
              <Eye size={14} /> Preview
            </button>
            <a
              href={api.getExportJsonUrl('complete')}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              download
            >
              <Download size={14} /> Download
            </a>
          </div>
        </div>
      </div>

      {/* Live Preview Viewer Box */}
      {previewContent && (
        <div className="table-card" style={{ marginTop: '28px' }}>
          <div className="table-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} style={{ color: 'var(--primary-color)' }} />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700 }}>
                Live Output Preview &bull; {previewTitle}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={handleCopyClipboard}
              >
                <Copy size={13} />
                {copied ? 'Copied to Clipboard!' : 'Copy JSON'}
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setPreviewContent(null)}
              >
                Close Preview
              </button>
            </div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f8fafc', overflowX: 'auto', maxHeight: '420px' }}>
            <pre style={{ margin: 0, fontSize: '12.5px', fontFamily: 'monospace', color: '#1e293b' }}>
              {previewContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
