import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ full_name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const tokenKey = 'gluco_meter_token'

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
      localStorage.removeItem(tokenKey)
      setCurrentUser(null)
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(tokenKey)
    if (storedToken) {
      fetchCurrentUser(storedToken)
    } else {
      setInitializing(false)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
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
          username: loginForm.email,
          password: loginForm.password
        })
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.detail || 'Login failed. Please try again.')
      }

      const data = await response.json()
      localStorage.setItem(tokenKey, data.access_token)
      await fetchCurrentUser(data.access_token)
      setMessage('Welcome back! You are now signed in.')
      setLoginForm({ email: '', password: '' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()
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
          ...signupForm,
          role: 'regular'
        })
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.detail || 'Sign up failed. Please try again.')
      }

      setMessage('Account created! Signing you in...')

      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: signupForm.email,
          password: signupForm.password
        })
      })

      if (!loginResponse.ok) {
        throw new Error('Account created but automatic login failed. Please login manually.')
      }

      const loginData = await loginResponse.json()
      localStorage.setItem(tokenKey, loginData.access_token)
      await fetchCurrentUser(loginData.access_token)
      setSignupForm({ full_name: '', email: '', password: '' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(tokenKey)
    setCurrentUser(null)
    setMessage('You have been logged out successfully.')
  }

  const renderAuthForm = () => {
    if (activeTab === 'signup') {
      return (
        <form onSubmit={handleSignup} className="auth-form">
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
              onChange={(event) =>
                setSignupForm((prev) => ({ ...prev, email: event.target.value }))
              }
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
      )
    }

    return (
      <form onSubmit={handleLogin} className="auth-form">
        <label>
          Email
          <input
            type="email"
            name="email"
            value={loginForm.email}
            onChange={(event) =>
              setLoginForm((prev) => ({ ...prev, email: event.target.value }))
            }
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
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">GM</div>
          <div className="brand-text">
            <span className="brand-name">GlucoMeter</span>
            <span className="brand-tagline">Smarter glucose insights</span>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#insights">Insights</a>
          <a href="#security">Security</a>
        </nav>
        <div className="header-actions">
          {currentUser ? (
            <div className="profile-chip" title={currentUser.email}>
              <div className="avatar">{initials}</div>
              <div className="profile-details">
                <span className="profile-name">{currentUser.full_name || 'Member'}</span>
                <span className="profile-email">{currentUser.email}</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <a className="cta-button" href="#get-started">
              Get Started
            </a>
          )}
        </div>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-text">
            <h1>Manage glucose with confidence</h1>
            <p>
              GlucoMeter is your personalized companion for tracking blood glucose trends,
              identifying patterns, and staying ahead of potential concerns. Connect your
              meters, log meals, and receive actionable insights built for your everyday
              routine.
            </p>
            <ul className="hero-points">
              <li>Visualize glucose trends with adaptive charts</li>
              <li>Share secure reports with your care team instantly</li>
              <li>Receive reminders tailored to your lifestyle</li>
            </ul>
            {!currentUser && (
              <a className="primary-cta" href="#get-started">
                Join GlucoMeter today
              </a>
            )}
          </div>
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
                onClick={() => setActiveTab('login')}
                disabled={authLoading}
              >
                Login
              </button>
              <button
                className={activeTab === 'signup' ? 'active' : ''}
                type="button"
                onClick={() => setActiveTab('signup')}
                disabled={authLoading}
              >
                Sign up
              </button>
            </div>
            {error && <div className="auth-alert error">{error}</div>}
            {message && <div className="auth-alert success">{message}</div>}
            {initializing ? (
              <div className="loading-state">Checking your session...</div>
            ) : (
              renderAuthForm()
            )}
            <p className="auth-footnote">
              By continuing, you agree to our privacy practices and consent to receiving
              health tips from GlucoMeter.
            </p>
          </div>
        </section>

        <section className="feature-grid" id="features">
          <article>
            <h3>Unified monitoring</h3>
            <p>
              Consolidate readings from multiple devices and locations into a single
              timeline. GlucoMeter harmonizes your data so every measurement contributes to
              the bigger picture.
            </p>
          </article>
          <article>
            <h3>Intelligent alerts</h3>
            <p>
              Stay informed with proactive alerts when your readings trend outside the
              target range. Customize thresholds to match your physician&apos;s guidance.
            </p>
          </article>
          <article>
            <h3>Collaborative care</h3>
            <p>
              Invite family or healthcare providers to follow along with curated weekly
              digests, charts, and downloadable reports that keep everyone aligned.
            </p>
          </article>
        </section>

        <section className="insights" id="insights">
          <div className="insight-card">
            <h4>Daily trends</h4>
            <p>
              Understand how meals, activity, and medication influence your glucose levels
              throughout the day. Identify opportunities to adjust routines in minutes.
            </p>
          </div>
          <div className="insight-card">
            <h4>Progress tracking</h4>
            <p>
              View week-over-week progress and celebrate milestones with a dashboard built to
              motivate sustainable change.
            </p>
          </div>
          <div className="insight-card">
            <h4>Data portability</h4>
            <p>
              Export your metrics securely for clinical visits or personal records with just
              a click. Your data is always yours to control.
            </p>
          </div>
        </section>

        <section className="security" id="security">
          <h2>Security you can trust</h2>
          <div className="security-content">
            <p>
              Your health data deserves the highest standards of protection. GlucoMeter uses
              encrypted storage, role-based access, and rigorous compliance practices so you
              remain in full control of your records.
            </p>
            <ul>
              <li>End-to-end encryption for sensitive information</li>
              <li>Granular permissions for patient, caregiver, and clinician access</li>
              <li>Audit trails that monitor every critical action</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} GlucoMeter. Empowering better daily decisions.</p>
      </footer>
    </div>
  )
}

export default App
