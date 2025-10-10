import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const initialLoginForm = { email: '', password: '' }
const initialSignupForm = { full_name: '', email: '', password: '' }

const AuthCard = () => {
  const { authLoading, error, initializing, login, message, setError, setMessage, signup } =
    useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [signupForm, setSignupForm] = useState(initialSignupForm)

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    const success = await login(loginForm)
    if (success) {
      setLoginForm(initialLoginForm)
    }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    const success = await signup(signupForm)
    if (success) {
      setSignupForm(initialSignupForm)
    }
  }

  const switchTab = (nextTab) => {
    if (authLoading) return
    setActiveTab(nextTab)
    setMessage('')
    setError('')
  }

  return (
    <div className="auth-card" id="get-started">
      <div className="auth-header">
        <h2>{activeTab === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p>
          {activeTab === 'login'
            ? 'Log in to access your dashboard and continue monitoring your health.'
            : 'Sign up to unlock tailored insights and track your progress effortlessly.'}
        </p>
      </div>
      <div className="auth-tabs">
        <button
          className={activeTab === 'login' ? 'active' : ''}
          type="button"
          onClick={() => switchTab('login')}
          disabled={authLoading}
        >
          Login
        </button>
        <button
          className={activeTab === 'signup' ? 'active' : ''}
          type="button"
          onClick={() => switchTab('signup')}
          disabled={authLoading}
        >
          Sign up
        </button>
      </div>
      {error && <div className="auth-alert error">{error}</div>}
      {message && <div className="auth-alert success">{message}</div>}
      {initializing ? (
        <div className="loading-state">Checking your session...</div>
      ) : activeTab === 'signup' ? (
        <form onSubmit={handleSignupSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              name="full_name"
              value={signupForm.full_name}
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, full_name: event.target.value }))
              }
              placeholder="Jane Doe"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={signupForm.email}
              onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="jane@gluco.app"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={signupForm.password}
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Create a secure password"
              required
              minLength={6}
            />
          </label>
          <button type="submit" disabled={authLoading}>
            {authLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="you@gluco.app"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Enter your password"
              required
            />
          </label>
          <button type="submit" disabled={authLoading}>
            {authLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      )}
      <p className="auth-footnote">
        By continuing, you agree to our privacy practices and consent to receiving health tips from
        GlucoMeter.
      </p>
    </div>
  )
}

export default AuthCard
