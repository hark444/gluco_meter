import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, initials, logout } = useAuth();

  return (
    <header className="app-header">
      <NavLink to="/" className="brand">
        <div className="brand-icon">GM</div>
        <div className="brand-text">
          <span className="brand-name">GlucoMeter</span>
          <span className="brand-tagline">Smarter glucose insights</span>
        </div>
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/readings">View Readings</NavLink>
        <NavLink to="/readings/add">Add Reading</NavLink>
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
          <NavLink className="cta-button" to="/auth/login">
            Get Started
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
