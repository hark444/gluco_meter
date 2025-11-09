import React from 'react';

export const readingTypeOptions = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'pp', label: 'Postprandial' },
  { value: 'random', label: 'Random' }
];

const ReadingForm = ({ formState, setFormState, handleSubmit, activeReadingId, submitting, handleCancelEdit }) => {
  return (
    <form className="reading-form" onSubmit={handleSubmit}>
      <h2>{activeReadingId ? 'Update reading' : 'Add a new reading'}</h2>
      <div className="form-grid">
        <label>
          Reading value (mg/dL)
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={formState.value_ng_ml}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, value_ng_ml: event.target.value }))
            }
            required
          />
        </label>
        <label>
          Reading type
          <select
            value={formState.reading_type}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, reading_type: event.target.value }))
            }
          >
            {readingTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="datetime-local"
            value={formState.created_at}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, created_at: event.target.value }))
            }
            required
          />
        </label>
      </div>
      <label className="notes-field">
        Notes (optional)
        <textarea
          rows="3"
          value={formState.notes}
          onChange={(event) =>
            setFormState((previous) => ({ ...previous, notes: event.target.value }))
          }
          placeholder="Add any context you want to remember about this reading."
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? (activeReadingId ? 'Saving changes...' : 'Saving reading...') : activeReadingId ? 'Save changes' : 'Save reading'}
        </button>
        {activeReadingId && (
          <button type="button" className="secondary" onClick={handleCancelEdit} disabled={submitting}>
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
};

export default ReadingForm;
