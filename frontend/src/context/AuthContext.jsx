import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../config/api'

const AuthContext = createContext(null)

const parseError = async (response, fallbackMessage) => {
  const errorBody = await response.json().catch(() => ({}))
  return errorBody.detail || fallbackMessage
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const initials = useMemo(() => {
    if (!currentUser) return ''
    if (currentUser.full_name) {
      return currentUser.full_name
        .split(' ')
        .filter(Boolean)
        .map((name) => name[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    }
    return currentUser.email.slice(0, 2).toUpperCase()
  }, [currentUser])

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Unable to retrieve user details.')
      }

      const data = await response.json()
      setCurrentUser(data)
    } catch (fetchError) {
      console.error(fetchError)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setCurrentUser(null)
    } finally {
      setInitializing(false)
    }
  }

  const login = async ({ email, password }) => {
    setAuthLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: email,
          password
        })
      })

      if (!response.ok) {
        throw new Error(await parseError(response, 'Login failed. Please try again.'))
      }

      const data = await response.json()
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token)
      await fetchCurrentUser(data.access_token)
      setMessage('Welcome back! You are now signed in.')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const signup = async ({ full_name, email, password }) => {
    setAuthLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name,
          email,
          password,
          role: 'regular'
        })
      })

      if (!response.ok) {
        throw new Error(await parseError(response, 'Sign up failed. Please try again.'))
      }

      setMessage('Account created! Signing you in...')

      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: email,
          password
        })
      })

      if (!loginResponse.ok) {
        throw new Error('Account created but automatic login failed. Please login manually.')
      }

      const loginData = await loginResponse.json()
      localStorage.setItem(TOKEN_STORAGE_KEY, loginData.access_token)
      await fetchCurrentUser(loginData.access_token)
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setCurrentUser(null)
    setMessage('You have been logged out successfully.')
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (storedToken) {
      fetchCurrentUser(storedToken)
    } else {
      setInitializing(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        currentUser,
        error,
        initials,
        initializing,
        login,
        logout,
        message,
        setMessage,
        setError,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
