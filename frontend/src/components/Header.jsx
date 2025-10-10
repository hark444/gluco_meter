import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { currentUser, initials, logout } = useAuth()

  return (
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
            <button className="logout-button" onClick={logout}>
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
  )
}

export default Header
