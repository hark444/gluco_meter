import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const readingTypeOptions = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'pp', label: 'Postprandial' },
  { value: 'random', label: 'Random' }
]

const readingTypeLabels = readingTypeOptions.reduce((accumulator, option) => {
  return { ...accumulator, [option.value]: option.label }
}, {})

const getCurrentDateTimeLocal = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const initialFormState = {
  value_ng_ml: '',
  reading_type: 'fasting',
  created_at: getCurrentDateTimeLocal(),
  notes: '',
  // Health metrics (optional)
  step_count: '',
  sleep_hours: '',
  calorie_count: '',
  protein_intake_g: '',
  carb_intake_g: '',
  exercise_minutes: ''
}

const parseErrorResponse = async (response, fallbackMessage) => {
  try {
    const data = await response.json()
    if (typeof data === 'string') {
      return data
    }
    return data.detail || fallbackMessage
  } catch (error) {
    return fallbackMessage
  }
}

const formatDateTime = (value) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

const formatNumber = (value) => {
  if (value == null) return '—'
  if (typeof value === 'number') {
    // Format integers without decimals, floats with 1 decimal place
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)
  }
  return value
}

const ReadingsDashboard = () => {
  const { authorizedFetch, currentUser } = useAuth()
  const [readings, setReadings] = useState([])
  const [page, setPage] = useState(1)
  const [totalReadings, setTotalReadings] = useState(0)
  const pageSize = 10
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState(initialFormState)
  const [activeReadingId, setActiveReadingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [feedback, setFeedback] = useState({ success: '', error: '' })

  const greeting = useMemo(() => {
    if (!currentUser) return 'Gluco overview'
    if (currentUser.full_name) {
      return `${currentUser.full_name.split(' ')[0]}'s glucose overview`
    }
    return `${currentUser.email}'s glucose overview`
  }, [currentUser])

  const resetForm = () => {
    setFormState(initialFormState)
    setActiveReadingId(null)
  }

  const loadReadings = useCallback(
    async (requestedPage = 1) => {
      if (!currentUser) {
        setReadings([])
        setLoading(false)
        return
      }

      setLoading(true)
      setFeedback((previous) => ({ ...previous, error: '' }))

      try {
        const response = await authorizedFetch(`/readings?page=${requestedPage}&size=${pageSize}`)
        if (!response.ok) {
          throw new Error(await parseErrorResponse(response, 'Unable to load readings.'))
        }

        const data = await response.json()
        setReadings(data.readings)
        setTotalReadings(data.total)
        setPage(requestedPage)
      } catch (requestError) {
        setFeedback({ success: '', error: requestError.message })
        setReadings([])
        setTotalReadings(0)
      } finally {
        setLoading(false)
      }
    },
    [authorizedFetch, currentUser]
  )

  useEffect(() => {
    loadReadings()
  }, [loadReadings])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback({ success: '', error: '' })

    const numericValue = Number.parseInt(formState.value_ng_ml, 10)
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setFeedback({ success: '', error: 'Please enter a valid reading value in mg/dL.' })
      return
    }

    // Validate health metrics if provided
    if (formState.sleep_hours !== '') {
      const sleepHours = Number.parseFloat(formState.sleep_hours)
      if (Number.isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        setFeedback({ success: '', error: 'Sleep hours must be between 0 and 24.' })
        return
      }
    }

    // Helper function to parse optional numeric values
    const parseOptionalNumber = (value) => {
      if (value === '' || value === null || value === undefined) return null
      const parsed = value.includes('.') ? Number.parseFloat(value) : Number.parseInt(value, 10)
      if (Number.isNaN(parsed) || parsed < 0) {
        return null
      }
      return parsed
    }

    const payload = {
      value_ng_ml: numericValue,
      reading_type: formState.reading_type,
      created_at: formState.created_at,
      notes: formState.notes.trim() ? formState.notes.trim() : null,
      // Health metrics - convert empty strings to null
      step_count: parseOptionalNumber(formState.step_count),
      sleep_hours: parseOptionalNumber(formState.sleep_hours),
      calorie_count: parseOptionalNumber(formState.calorie_count),
      protein_intake_g: parseOptionalNumber(formState.protein_intake_g),
      carb_intake_g: parseOptionalNumber(formState.carb_intake_g),
      exercise_minutes: parseOptionalNumber(formState.exercise_minutes)
    }

    const isEditing = Boolean(activeReadingId)
    const endpoint = isEditing ? `/readings/${activeReadingId}` : '/readings'
    const method = isEditing ? 'PATCH' : 'POST'

    setSubmitting(true)

    try {
      const response = await authorizedFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(
          await parseErrorResponse(
            response,
            isEditing ? 'Unable to update the reading. Please try again.' : 'Unable to add the reading. Please try again.'
          )
        )
      }

      await loadReadings()
      setFeedback({
        success: isEditing ? 'Reading updated successfully.' : 'Reading added successfully.',
        error: ''
      })
      resetForm()
    } catch (requestError) {
      setFeedback({ success: '', error: requestError.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (reading) => {
    setActiveReadingId(reading.id)
    setFormState({
      value_ng_ml: String(reading.value_ng_ml),
      reading_type: reading.reading_type,
      created_at: reading.created_at,
      notes: reading.notes || '',
      // Health metrics - convert null/undefined to empty string for form
      step_count: reading.step_count != null ? String(reading.step_count) : '',
      sleep_hours: reading.sleep_hours != null ? String(reading.sleep_hours) : '',
      calorie_count: reading.calorie_count != null ? String(reading.calorie_count) : '',
      protein_intake_g: reading.protein_intake_g != null ? String(reading.protein_intake_g) : '',
      carb_intake_g: reading.carb_intake_g != null ? String(reading.carb_intake_g) : '',
      exercise_minutes: reading.exercise_minutes != null ? String(reading.exercise_minutes) : ''
    })
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleDelete = async (readingId) => {
    const confirmation = window.confirm('Are you sure you want to delete this reading? This action cannot be undone.')
    if (!confirmation) {
      return
    }

    setPendingDeleteId(readingId)
    setFeedback({ success: '', error: '' })

    try {
      const response = await authorizedFetch(`/readings/${readingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to delete the reading. Please try again.'))
      }

      if (activeReadingId === readingId) {
        resetForm()
      }

      await loadReadings()
      setFeedback({ success: 'Reading deleted successfully.', error: '' })
    } catch (requestError) {
      setFeedback({ success: '', error: requestError.message })
    } finally {
      setPendingDeleteId(null)
    }
  }

  return (
    <section className="dashboard" aria-label="Glucose readings dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{greeting}</h1>
          <p>Review, add, and maintain your personal glucose readings below.</p>
        </div>
        <button type="button" onClick={loadReadings} className="refresh-button" disabled={loading || submitting}>
          Refresh data
        </button>
      </header>

      {feedback.error && <div className="dashboard-alert error">{feedback.error}</div>}
      {feedback.success && <div className="dashboard-alert success">{feedback.success}</div>}

      <div className="dashboard-grid">
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

          <div className="form-section">
            <h3 className="form-section-title">Activity & Lifestyle (Optional)</h3>
            <div className="form-grid">
              <label>
                Step Count
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formState.step_count}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, step_count: event.target.value }))
                  }
                  placeholder="e.g., 10000"
                />
              </label>
              <label>
                Sleep Hours
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.1"
                  inputMode="decimal"
                  value={formState.sleep_hours}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, sleep_hours: event.target.value }))
                  }
                  placeholder="e.g., 7.5"
                />
              </label>
              <label>
                Exercise Minutes
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formState.exercise_minutes}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, exercise_minutes: event.target.value }))
                  }
                  placeholder="e.g., 30"
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Nutrition (Optional)</h3>
            <div className="form-grid">
              <label>
                Total Calories
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formState.calorie_count}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, calorie_count: event.target.value }))
                  }
                  placeholder="e.g., 2000"
                />
              </label>
              <label>
                Protein (grams)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={formState.protein_intake_g}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, protein_intake_g: event.target.value }))
                  }
                  placeholder="e.g., 150"
                />
              </label>
              <label>
                Carbs (grams)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={formState.carb_intake_g}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, carb_intake_g: event.target.value }))
                  }
                  placeholder="e.g., 200"
                />
              </label>
            </div>
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
              <p>Start by adding your first glucose reading using the form on the left.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="readings-table">
                <thead>
                  <tr>
                    <th scope="col">Recorded</th>
                    <th scope="col">Value (mg/dL)</th>
                    <th scope="col">Type</th>
                    <th scope="col" className="metric-header">Steps</th>
                    <th scope="col" className="metric-header">Sleep (hrs)</th>
                    <th scope="col" className="metric-header">Exercise (min)</th>
                    <th scope="col" className="metric-header">Calories</th>
                    <th scope="col" className="metric-header">Protein (g)</th>
                    <th scope="col" className="metric-header">Carbs (g)</th>
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
                      <td className="metric-cell">{formatNumber(reading.step_count)}</td>
                      <td className="metric-cell">{formatNumber(reading.sleep_hours)}</td>
                      <td className="metric-cell">{formatNumber(reading.exercise_minutes)}</td>
                      <td className="metric-cell">{formatNumber(reading.calorie_count)}</td>
                      <td className="metric-cell">{formatNumber(reading.protein_intake_g)}</td>
                      <td className="metric-cell">{formatNumber(reading.carb_intake_g)}</td>
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
      </div>
    </section>
  )
}

export default ReadingsDashboard
