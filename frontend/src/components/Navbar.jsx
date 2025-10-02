import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
         PortalSahooh
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/level/1" className="nav-link">
            Level 1
          </Link>
          <Link to="/level/2" className="nav-link">
            Level 2
          </Link>
          <Link to="/level/3" className="nav-link">
            Level 3
          </Link>
          <Link to="/level/4" className="nav-link">
            Level 4
          </Link>
          <Link to="/add-question" className="nav-link add-question-btn">
            Add Question
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;