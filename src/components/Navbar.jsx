"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { FaSun, FaMoon, FaUser, FaSignOutAlt, FaPlus } from "react-icons/fa"

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className={`navbar ${darkMode ? "dark" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"></span>
          <img src="/touristbuddy.png" className="logo-icon" alt="" />
          {/* <span className="logo-text">TouristBuddy</span> */}
        </Link>

        <div className="navbar-right">
          {currentUser ? (
            <>
              <Link to="/plan-travel" className="nav-button create-trip">
                <FaPlus /> New Trip
              </Link>
              <div className="user-menu">
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <span className="username">{currentUser.name}</span>
                </div>
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-button login">
                Login
              </Link>
              <Link to="/register" className="nav-button register">
                Register
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

