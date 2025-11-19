import React, { useState, useEffect, useRef } from "react";
import "./PageLayout.css";

// Helper to get user from localStorage (from JWT payload)
function getUserFromStorage() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user || null;
  } catch {
    return null;
  }
}

//made for pages after login as it includes profile option
const PageLayout = ({
  title,
  subtitle,
  children,
  showHeaderActions,
  headerActions 
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const user = getUserFromStorage();
  const profileRef = useRef();

  // Hide profile window when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    if (showProfile) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
        <div className="header-actions">
          {showHeaderActions && headerActions}
          <button className="profile-btn" onClick={() => setShowProfile(v => !v)}>
            <span role="img" aria-label="profile">👤</span>
          </button>
          {showProfile && (
            <div className="profile-popup" ref={profileRef}>
              <div className="profile-greet">Hi{user ? ` ${user.name}` : ''}!</div>
              <button className="profile-option" onClick={() => window.location.href='/profile'}>Profile</button>
              <button className="profile-option logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;