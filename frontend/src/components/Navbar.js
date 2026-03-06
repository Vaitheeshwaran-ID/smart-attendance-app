import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🎓</div>
        <span>SmartAttend</span>
      </div>
      {user && (
        <div className="navbar-right">
          <div className="navbar-pill">
            <div className="navbar-avatar">{initials}</div>
            <div className="navbar-info">
              <div className="navbar-name">{user.name}</div>
              <div className="navbar-role">{user.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm"
            onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;