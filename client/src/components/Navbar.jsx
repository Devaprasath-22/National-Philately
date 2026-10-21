import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome, HiOutlineCollection, HiOutlineChatAlt2,
  HiOutlineSwitchHorizontal, HiOutlineUser, HiOutlineCog,
  HiOutlineLogout, HiOutlineMenu, HiOutlineX
} from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <HiOutlineHome /> },
    { path: '/stamps', label: 'Catalog', icon: <HiOutlineCollection /> },
    { path: '/forum', label: 'Community', icon: <HiOutlineChatAlt2 /> },
    { path: '/trades', label: 'Trading', icon: <HiOutlineSwitchHorizontal />, auth: true },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">📮</div>
          PhilatelyIndia
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => {
            if (link.auth && !user) return null;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <HiOutlineCog />
              Admin
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                className="navbar-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
                title={user.name}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: '200px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 300,
                  overflow: 'hidden',
                  animation: 'slideUp 0.2s ease'
                }}>
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.25rem', color: 'var(--text-secondary)',
                      fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg-glass-light)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    <HiOutlineUser /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.25rem', color: 'var(--error)',
                      fontSize: '0.9rem', background: 'none', border: 'none',
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'background 0.15s', fontFamily: 'var(--font-sans)'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg-glass-light)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    <HiOutlineLogout /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </>
          )}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
