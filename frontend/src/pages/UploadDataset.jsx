import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  FileCheck,
  Info,
} from 'lucide-react';
import api from '../services/api';

export default function UploadDataset({
  onUploadSuccess,
  onLoadSample,
  loadingSample = false,
  datasetInfo,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [previewRecords, setPreviewRecords] = useState([]);
  const [validationInfo, setValidationInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadMessage({
        type: 'error',
        text: 'Invalid file format. Please upload a standard comma-separated (.csv) file.',
      });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadMessage(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage(null);

    try {
      const result = await api.uploadCSV(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setUploadMessage({
        type: 'success',
        text: `Success! "${selectedFile.name}" was uploaded and analyzed (${result.dataset_info?.total_rows || 0} records).`,
      });
      setPreviewRecords(result.preview || []);
      setValidationInfo(result.validation || null);

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to upload CSV file. Please check file format and required headers.';
      
      const missing = err.response?.data?.missing_columns;
      setUploadMessage({
        type: 'error',
        text: missing ? `${errorMsg} Missing: ${missing.join(', ')}` : errorMsg,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Upload Borrowing Dataset</h2>
        <p className="page-subtitle">
          Upload your library borrowing records in CSV format to trigger automated validation, duration calculation, and demand metrics.
        </p>
      </div>

      {/* Alert Messages */}
      {uploadMessage && (
        <div className={`alert alert-${uploadMessage.type}`}>
          {uploadMessage.type === 'success' ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            <strong>{uploadMessage.type === 'success' ? 'Upload Successful' : 'Validation Error'}</strong>
            <p style={{ marginTop: '2px' }}>{uploadMessage.text}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Card */}
      <div className="chart-card" style={{ marginBottom: '28px' }}>
        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv"
            style={{ display: 'none' }}
          />

          <div className="dropzone-icon">
            <UploadCloud size={28} />
          </div>

          <h3 className="dropzone-title">
            {selectedFile ? selectedFile.name : 'Drag & drop your CSV file here'}
          </h3>
          <p className="dropzone-desc">
            {selectedFile
              ? `Selected file size: ${(selectedFile.size / 1024).toFixed(1)} KB`
              : 'or click to browse from your computer'}
          </p>

          <button
            type="button"
            className="btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileSpreadsheet size={16} />
            Browse Files
          </button>
        </div>

        {/* Selected file actions bar */}
        {selectedFile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              marginTop: '8px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCheck size={20} style={{ color: 'var(--primary-color)' }} />
              <div>
                <p style={{ fontSize: '13.5px', fontWeight: 600 }}>{selectedFile.name}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Ready to process and compute statistics
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleUploadSubmit}
                disabled={uploading}
              >
                {uploading ? 'Processing...' : 'Upload & Analyze Dataset'}
              </button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  backgroundColor: 'var(--primary-color)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
              {uploadProgress}% processed
            </p>
          </div>
        )}
      </div>

      {/* Dataset Specification & Sample Downloads */}
      <div className="chart-grid" style={{ marginBottom: '28px' }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Expected CSV Format</h3>
              <p className="chart-card-subtitle">Required and optional column headers</p>
            </div>
            <span className="badge badge-blue">9 Columns</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
            {[
              { col: 'Loan ID', req: true, note: 'Unique identifier' },
              { col: 'Book ID', req: true, note: 'Catalog book code' },
              { col: 'Book Title', req: true, note: 'Name of the book' },
              { col: 'Category', req: true, note: 'Subject/Department' },
              { col: 'Student ID', req: true, note: 'Borrower ID' },
              { col: 'Borrow Date', req: true, note: 'YYYY-MM-DD' },
              { col: 'Due Date', req: true, note: 'YYYY-MM-DD' },
              { col: 'Return Date', req: false, note: 'Blank if active' },
              { col: 'Loan Duration', req: false, note: 'Auto-calculated if blank' },
            ].map((item) => (
              <div
                key={item.col}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.col}</strong>
                  {item.req ? (
                    <span className="badge badge-mint" style={{ fontSize: '10px' }}>Required</span>
                  ) : (
                    <span className="badge badge-yellow" style={{ fontSize: '10px' }}>Optional</span>
                  )}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Sample Dataset Access</h3>
              <p className="chart-card-subtitle">Download pre-configured college laboratory dataset</p>
            </div>
            <span className="badge badge-mint">50 Records</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
            For fast testing and lab evaluation, download our curated 50-record sample dataset matching project specifications (Computer Science: 16, Mathematics: 12, Electronics: 9, Literature: 7, Physics: 6).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <a
              href={api.getSampleCsvUrl()}
              download="library_records_sample.csv"
              className="btn-primary"
              style={{ justifyContent: 'center' }}
            >
              <Download size={16} />
              Download Sample CSV File
            </a>

            <button
              type="button"
              className="btn-secondary"
              onClick={onLoadSample}
              disabled={loadingSample}
              style={{ justifyContent: 'center' }}
            >
              <RefreshCw size={15} style={{ animation: loadingSample ? 'spin 1s linear infinite' : 'none' }} />
              {loadingSample ? 'Loading Sample...' : 'Directly Load Sample into Dashboard'}
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Preview Table */}
      {previewRecords.length > 0 && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Dataset Preview (First {previewRecords.length} Records)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Processed records demonstrating automatic duration calculations and status flags
              </p>
            </div>
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
                  <th>Return Date</th>
                  <th>Duration (Days)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRecords.map((r) => (
                  <tr key={r.loan_id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{r.loan_id}</td>
                    <td style={{ fontWeight: 500 }}>{r.book_title}</td>
                    <td><span className="badge badge-blue">{r.category}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.student_id}</td>
                    <td>{r.borrow_date || '—'}</td>
                    <td>{r.due_date || '—'}</td>
                    <td>{r.return_date || <em style={{ color: 'var(--text-muted)' }}>Not Returned</em>}</td>
                    <td style={{ fontWeight: 600 }}>{r.loan_duration} days</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
