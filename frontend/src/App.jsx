import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UploadDataset from './pages/UploadDataset';
import BorrowingRecords from './pages/BorrowingRecords';
import CategoryAnalysis from './pages/CategoryAnalysis';
import MonthlyTrends from './pages/MonthlyTrends';
import LoanDuration from './pages/LoanDuration';
import OverdueBooks from './pages/OverdueBooks';
import DataValidation from './pages/DataValidation';
import ExportReports from './pages/ExportReports';
import AboutProject from './pages/AboutProject';
import api from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [validationIssueCount, setValidationIssueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load initial dashboard data from Flask REST API
  const fetchGlobalData = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
      setDatasetInfo(data.dataset_info || null);
      setOverdueCount(data.summary?.overdue_books || 0);

      // Fetch validation issues count for badge
      try {
        const valRes = await api.getValidation();
        setValidationIssueCount(valRes.validation?.total_invalid_records || 0);
      } catch (valErr) {
        console.warn('Could not fetch validation summary:', valErr);
      }
    } catch (err) {
      console.error('Failed to connect to backend server:', err);
      setServerError(
        'Unable to connect to Flask backend server. Ensure the Python server is running on http://127.0.0.1:5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  // Handler for uploading new dataset
  const handleUploadSuccess = (uploadResult) => {
    setDatasetInfo(uploadResult.dataset_info);
    if (uploadResult.summary) {
      setOverdueCount(uploadResult.summary.overdue_books || 0);
    }
    fetchGlobalData();
  };

  // Handler for loading realistic 50-row sample dataset
  const handleLoadSample = async () => {
    setLoadingSample(true);
    try {
      const result = await api.loadSample();
      setDatasetInfo(result.dataset_info);
      await fetchGlobalData();
    } catch (err) {
      console.error('Failed to load sample data:', err);
      alert('Error loading sample dataset: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingSample(false);
    }
  };

  // Render active page component
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            dashboardData={dashboardData}
            loading={loading}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'upload':
        return (
          <UploadDataset
            onUploadSuccess={handleUploadSuccess}
            onLoadSample={handleLoadSample}
            loadingSample={loadingSample}
            datasetInfo={datasetInfo}
          />
        );
      case 'records':
        return <BorrowingRecords />;
      case 'categories':
        return <CategoryAnalysis />;
      case 'monthly':
        return <MonthlyTrends />;
      case 'duration':
        return <LoanDuration />;
      case 'overdue':
        return <OverdueBooks />;
      case 'validation':
        return <DataValidation />;
      case 'export':
        return <ExportReports />;
      case 'about':
        return <AboutProject />;
      default:
        return (
          <Dashboard
            dashboardData={dashboardData}
            loading={loading}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetInfo={datasetInfo}
        overdueCount={overdueCount}
        validationIssueCount={validationIssueCount}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main App Layout */}
      <div className="main-wrapper">
        <Header
          datasetInfo={datasetInfo}
          onLoadSample={handleLoadSample}
          loadingSample={loadingSample}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Server Connection Error Notice */}
        {serverError && (
          <div style={{ padding: '16px 28px 0' }}>
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{serverError}</span>
              </div>
              <button
                className="btn-secondary"
                onClick={fetchGlobalData}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <RefreshCw size={13} /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Active Page View */}
        <main>{renderActivePage()}</main>
      </div>
    </div>
  );
}
