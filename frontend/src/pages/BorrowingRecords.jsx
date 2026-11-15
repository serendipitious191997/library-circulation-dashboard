import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import api from '../services/api';

export default function BorrowingRecords() {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_records: 0,
    total_pages: 1,
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.getRecords({
        search,
        category: selectedCategory,
        status: selectedStatus,
        sort: sortOrder,
        page,
        limit: pagination.per_page,
      });

      setRecords(data.records || []);
      setPagination(data.pagination || {});
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch borrowing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, [selectedCategory, selectedStatus, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchRecords(newPage);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="page-title">Borrowing Records Registry</h2>
          <p className="page-subtitle">
            Comprehensive database of library circulation transactions with search, multi-field filtering, and duration tracking.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-blue">
            {pagination.total_records} Total Matches
          </span>
        </div>
      </div>

      <div className="table-card">
        {/* Search and Filter Toolbar */}
        <div className="table-toolbar">
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}
          >
            <div className="input-search" style={{ flex: 1 }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by book title, student ID, or loan ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary" style={{ padding: '8px 14px' }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                className="select-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              className="select-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Returned On Time">Returned On Time</option>
              <option value="Returned Overdue">Returned Overdue</option>
              <option value="Currently Borrowed">Currently Borrowed</option>
              <option value="Currently Overdue">Currently Overdue</option>
            </select>

            {/* Sort Toggle */}
            <button
              type="button"
              className="btn-secondary"
              onClick={toggleSortOrder}
              style={{ padding: '8px 12px', fontSize: '13px' }}
              title="Toggle sort order by Borrow Date"
            >
              <ArrowUpDown size={14} />
              <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
            </button>
          </div>
        </div>

        {/* Records Table */}
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
                <th>Loan Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading records from backend...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <BookOpen size={36} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>No Borrowing Records Found</p>
                    <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
                      Try clearing search queries, adjusting category filters, or uploading a new CSV dataset.
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.loan_id} className={r.is_overdue ? 'row-overdue' : ''}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {r.loan_id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.book_title}</td>
                    <td>
                      <span className="badge badge-blue">{r.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.student_id}</td>
                    <td>{r.borrow_date || '—'}</td>
                    <td>{r.due_date || '—'}</td>
                    <td>
                      {r.return_date ? (
                        r.return_date
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Not Returned
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {r.loan_duration !== null && r.loan_duration !== undefined
                        ? `${r.loan_duration} days`
                        : '0 days'}
                    </td>
                    <td>
                      {r.is_returned_late ? (
                        <span className="badge badge-rose">
                          Returned Overdue (+{r.overdue_days}d)
                        </span>
                      ) : r.is_currently_overdue ? (
                        <span className="badge badge-rose">
                          Currently Overdue (+{r.overdue_days}d)
                        </span>
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

        {/* Pagination Bar */}
        <div className="pagination">
          <div>
            Showing{' '}
            <strong>
              {records.length > 0 ? (pagination.current_page - 1) * pagination.per_page + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong>
              {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)}
            </strong>{' '}
            of <strong>{pagination.total_records}</strong> entries
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              <ChevronLeft size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Previous
            </button>

            <span style={{ fontSize: '13px', fontWeight: 600, padding: '0 8px' }}>
              Page {pagination.current_page} of {pagination.total_pages}
            </span>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.total_pages}
            >
              Next
              <ChevronRight size={14} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
