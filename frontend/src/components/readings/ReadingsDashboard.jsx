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

const initialFormState = {
  value_ng_ml: '',
  reading_type: 'fasting',
  notes: ''
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

const ReadingsDashboard = () => {
  const { authorizedFetch, currentUser } = useAuth()
  const [readings, setReadings] = useState([])
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

  const loadReadings = useCallback(async () => {
    if (!currentUser) {
      setReadings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setFeedback((previous) => ({ ...previous, error: '' }))

    try {
      const response = await authorizedFetch('/readings')
      if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to load readings.'))
      }

      const data = await response.json()
      setReadings(data)
    } catch (requestError) {
      setFeedback({ success: '', error: requestError.message })
      setReadings([])
    } finally {
      setLoading(false)
    }
  }, [authorizedFetch, currentUser])

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

    const payload = {
      value_ng_ml: numericValue,
      reading_type: formState.reading_type,
      notes: formState.notes.trim() ? formState.notes.trim() : null
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
      notes: reading.notes || ''
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
            <span className="reading-count">{readings.length} total</span>
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
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ReadingsDashboard
