import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-vs">video</span>
          <span className="logo-badge">stream</span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          <Link to="/earn" className={`nav-link ${location.pathname === '/earn' ? 'active' : ''}`}>
            Earn Money
          </Link>
          <Link to="/premium" className={`nav-link ${location.pathname === '/premium' ? 'active' : ''}`}>
            Premium
          </Link>
          <Link to="/api-docs" className={`nav-link ${location.pathname === '/api-docs' ? 'active' : ''}`}>
            Api Docs
          </Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
            Contact
          </Link>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <div className="user-menu">
              <button className="btn-primary" onClick={() => navigate('/upload')}>
                + Upload
              </button>
              <div className="avatar-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <span>{user.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <span className="username-text">{user.username}</span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />

                  {/* 👇 Show Admin Panel link only for admin/moderator */}
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}
                      style={{ color: '#ff6b35' }}>
                      👑 Admin Panel
                    </Link>
                  )}

                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📊 Dashboard
                  </Link>
                  <Link to="/my-videos" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    🎬 My Videos
                  </Link>
                  <Link to="/earnings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    💰 Earnings
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    ⚙️ Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;