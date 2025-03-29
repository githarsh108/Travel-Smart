"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { TravelProvider } from "./contexts/TravelContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import PlanTravel from "./pages/PlanTravel"
import TripDetails from "./pages/TripDetails"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import "./App.css"

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading resources
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Travel Planner...</p>
      </div>
    )
  }

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <TravelProvider>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/plan-travel"
                    element={
                      <ProtectedRoute>
                        <PlanTravel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trip/:id"
                    element={
                      <ProtectedRoute>
                        <TripDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </TravelProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

