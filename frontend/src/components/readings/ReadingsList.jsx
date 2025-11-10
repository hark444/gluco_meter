import React from 'react';
import { readingTypeOptions } from './ReadingForm';

const readingTypeLabels = readingTypeOptions.reduce((accumulator, option) => {
  return { ...accumulator, [option.value]: option.label }
}, {})

const ReadingsList = ({ readings, totalReadings, loading, page, pageSize, loadReadings, handleEdit, handleDelete, pendingDeleteId, formatDateTime }) => {
  return (
    <div className="readings-panel">
      <div className="panel-header">
        <h2>Your recent readings</h2>
        <span className="reading-count">{totalReadings} total</span>
      </div>

      {loading ? (
        <div className="loading-indicator" role="status" aria-live="polite">
          Loading your readings...
        </div>
      ) : readings.length === 0 ? (
        <div className="empty-state">
          <h3>No readings recorded yet</h3>
          <p>Start by adding your first glucose reading.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="readings-table">
            <thead>
              <tr>
                <th scope="col">Recorded</th>
                <th scope="col">Value (mg/dL)</th>
                <th scope="col">Type</th>
                <th scope="col">Notes</th>
                <th scope="col" className="actions-column">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => (
                <tr key={reading.id}>
                  <td>{formatDateTime(reading.created_at)}</td>
                  <td className="reading-value">{reading.value_ng_ml}</td>
                  <td>
                    <span className="reading-badge">{readingTypeLabels[reading.reading_type] || reading.reading_type}</span>
                  </td>
                  <td className="notes-cell">{reading.notes || '—'}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => handleEdit(reading)} className="link-button">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reading.id)}
                      className="link-button destructive"
                      disabled={pendingDeleteId === reading.id}
                    >
                      {pendingDeleteId === reading.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls">
            <button
              type="button"
              onClick={() => loadReadings(page - 1)}
              disabled={page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {page} of {Math.ceil(totalReadings / pageSize)}
            </span>
            <button
              type="button"
              onClick={() => loadReadings(page + 1)}
              disabled={page * pageSize >= totalReadings}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingsList;
