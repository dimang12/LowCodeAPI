import React, { useMemo, useState } from 'react';

/**
 * TabularDataGrid - A lightweight data grid component for displaying execution results
 * Features: sorting, search/filter, pagination, row highlighting for copy
 */
const TabularDataGrid = ({ data = [], title = "Data Preview" }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Extract columns from data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow);
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((row) => {
      return columns.some((col) => {
        const value = row[col];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCopyRow = (row) => {
    const text = columns.map((col) => row[col]).join('\t');
    navigator.clipboard.writeText(text);
  };

  const handleCopyAll = () => {
    const header = columns.join('\t');
    const rows = sortedData.map((row) => columns.map((col) => row[col]).join('\t')).join('\n');
    navigator.clipboard.writeText(`${header}\n${rows}`);
  };

  if (columns.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b flex-shrink-0">
        <h3 className="font-semibold text-base">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{sortedData.length} rows</span>
          <button
            onClick={handleCopyAll}
            className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition"
            title="Copy all data to clipboard"
          >
            Copy All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none border-b"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col}</span>
                    {sortConfig.key === col && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-gray-700 border-b w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b hover:bg-blue-50 transition group"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 text-gray-800"
                    title={String(row[col] ?? '')}
                  >
                    {row[col] === null || row[col] === undefined
                      ? <span className="text-gray-400 italic">null</span>
                      : String(row[col])}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleCopyRow(row)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                    title="Copy row"
                  >
                    Copy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t text-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabularDataGrid;
