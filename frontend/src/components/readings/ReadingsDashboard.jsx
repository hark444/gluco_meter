import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Outlet } from 'react-router-dom'

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

    const payload = {
      value_ng_ml: numericValue,
      reading_type: formState.reading_type,
      created_at: formState.created_at,
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
      created_at: reading.created_at,
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

  const contextValue = {
    readings,
    totalReadings,
    loading,
    page,
    pageSize,
    loadReadings,
    handleEdit,
    handleDelete,
    pendingDeleteId,
    formatDateTime,
    formState,
    setFormState,
    handleSubmit,
    activeReadingId,
    submitting,
    handleCancelEdit
  };

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
        <Outlet context={contextValue} />
      </div>
    </section>
  )
}

export default ReadingsDashboard;
