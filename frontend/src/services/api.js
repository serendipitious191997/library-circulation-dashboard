/**
 * api.js
 * Centralized API client for communicating with the Flask backend.
 */

import axios from 'axios';

// Base API URL: uses environment variable if defined, otherwise falls back to local Flask server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // Base URL access for direct links / downloads
  baseUrl: API_BASE_URL,

  // Health & Server info
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Dashboard overall summary
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  // Borrowing records with search, filter, sort, and pagination
  getRecords: async (params = {}) => {
    const response = await apiClient.get('/records', { params });
    return response.data;
  },

  // Category analysis
  getCategoryAnalysis: async () => {
    const response = await apiClient.get('/category-analysis');
    return response.data;
  },

  // Monthly trends with optional year filtering
  getMonthlyTrends: async (year = null) => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/monthly-trends', { params });
    return response.data;
  },

  // Loan duration distribution
  getDurationAnalysis: async () => {
    const response = await apiClient.get('/duration-analysis');
    return response.data;
  },

  // Overdue books tracking
  getOverdue: async () => {
    const response = await apiClient.get('/overdue');
    return response.data;
  },

  // Data validation metrics and issue audit
  getValidation: async () => {
    const response = await apiClient.get('/validation');
    return response.data;
  },

  // Upload CSV dataset
  uploadCSV: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  // Load sample dataset
  loadSample: async () => {
    const response = await apiClient.post('/load-sample');
    return response.data;
  },

  // Helper download URLs
  getSampleCsvUrl: () => `${API_BASE_URL}/sample-csv`,
  getExportCsvUrl: () => `${API_BASE_URL}/export/csv`,
  getExportJsonUrl: (type = 'complete') => `${API_BASE_URL}/export/json?type=${type}`,
};

export default api;
