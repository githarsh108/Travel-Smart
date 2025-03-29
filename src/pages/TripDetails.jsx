"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useTravel } from "../contexts/TravelContext"
import {
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaHotel,
  FaPlane,
  FaListUl,
  FaFileDownload,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

const TripDetails = () => {
  const { id } = useParams()
  const { getTrip, deleteTrip } = useTravel()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({ description: "", amount: "", category: "accommodation" })
  const [showAddExpense, setShowAddExpense] = useState(false)
  const mapRef = useRef(null)
  const tripContentRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const tripData = getTrip(id)
    if (tripData) {
      setTrip(tripData)

      // Load saved expenses or initialize empty array
      const savedExpenses = JSON.parse(localStorage.getItem(`expenses_${id}`) || "[]")
      setExpenses(savedExpenses)

      setLoading(false)
    } else {
      setError("Trip not found")
      setLoading(false)
    }
  }, [id, getTrip])

  useEffect(() => {
    if (trip && activeTab === "map" && !mapLoaded) {
      // Initialize map (this is a simplified version)
      // In a real app, you would use a proper map library like Leaflet.js
      const mapElement = mapRef.current
      if (mapElement) {
        mapElement.innerHTML = `
          <div class="map-placeholder">
            <h3>Map of ${trip.destination}</h3>
            <p>Interactive map would be displayed here using Leaflet.js or Google Maps</p>
            <img src="https://source.unsplash.com/800x400/?map,${trip.destination}" alt="Map of ${trip.destination}" />
          </div>
        `
        setMapLoaded(true)
      }
    }
  }, [trip, activeTab, mapLoaded])

  const handleDeleteTrip = () => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(id)
      navigate("/dashboard")
    }
  }

  const handleExpenseChange = (e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({ ...prev, [name]: value }))
  }

  const addExpense = (e) => {
    e.preventDefault()

    if (!newExpense.description || !newExpense.amount) {
      return
    }

    const expenseToAdd = {
      id: Date.now().toString(),
      ...newExpense,
      amount: Number.parseFloat(newExpense.amount),
      date: new Date().toISOString(),
    }

    const updatedExpenses = [...expenses, expenseToAdd]
    setExpenses(updatedExpenses)
    localStorage.setItem(`expenses_${id}`, JSON.stringify(updatedExpenses))

    // Reset form
    setNewExpense({ description: "", amount: "", category: "accommodation" })
    setShowAddExpense(false)
  }

  const deleteExpense = (expenseId) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== expenseId)
    setExpenses(updatedExpenses)
    localStorage.setItem(`expenses_${id}`, JSON.stringify(updatedExpenses))
  }

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getRemainingBudget = () => {
    return trip.budget - getTotalExpenses()
  }

  const generatePDF = async () => {
    const content = tripContentRef.current

    if (!content) return

    try {
      const canvas = await html2canvas(content, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`${trip.name}_itinerary.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
    }
  }

  if (loading) {
    return <div className="loading">Loading trip details...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="error-container">
        <p className="error-message">Trip not found</p>
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="trip-details-container">
      <div className="trip-details-header">
        <div className="trip-title">
          <h1>{trip.name}</h1>
          <p className="destination">
            <FaMapMarkedAlt /> {trip.destination}
          </p>
        </div>

        <div className="trip-actions">
          <button onClick={generatePDF} className="pdf-button" title="Download as PDF">
            <FaFileDownload /> Export PDF
          </button>
          <Link to={`/plan-travel?edit=${id}`} className="edit-button" title="Edit Trip">
            <FaEdit /> Edit
          </Link>
          <button onClick={handleDeleteTrip} className="delete-button" title="Delete Trip">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="trip-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
          Overview
        </button>
        <button className={activeTab === "itinerary" ? "active" : ""} onClick={() => setActiveTab("itinerary")}>
          Itinerary
        </button>
        <button className={activeTab === "expenses" ? "active" : ""} onClick={() => setActiveTab("expenses")}>
          Expenses
        </button>
        <button className={activeTab === "map" ? "active" : ""} onClick={() => setActiveTab("map")}>
          Map
        </button>
      </div>

      <div className="trip-content" ref={tripContentRef}>
        {activeTab === "overview" && (
          <div className="trip-overview">
            <div className="trip-info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <FaCalendarAlt />
                </div>
                <div className="info-content">
                  <h3>Dates</h3>
                  <p>
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <p className="info-subtitle">
                    {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="info-content">
                  <h3>Budget</h3>
                  <p>${trip.budget.toLocaleString()}</p>
                  <p className="info-subtitle">
                    Spent: ${getTotalExpenses().toLocaleString()} | Remaining: ${getRemainingBudget().toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaUsers />
                </div>
                <div className="info-content">
                  <h3>Travelers</h3>
                  <p>
                    {trip.travelers} {trip.travelers === 1 ? "Person" : "People"}
                  </p>
                  <p className="info-subtitle">
                    Purpose: {trip.purpose.charAt(0).toUpperCase() + trip.purpose.slice(1)}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaHotel />
                </div>
                <div className="info-content">
                  <h3>Accommodation</h3>
                  <p>{trip.accommodation.charAt(0).toUpperCase() + trip.accommodation.slice(1)}</p>
                </div>
              </div>
            </div>

            <div className="trip-details-section">
              <h2>Activities</h2>
              {trip.activities && trip.activities.length > 0 ? (
                <div className="activities-list">
                  {trip.activities.map((activity) => (
                    <div key={activity} className="activity-tag">
                      {activity.charAt(0).toUpperCase() + activity.slice(1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No activities selected</p>
              )}
            </div>

            {trip.notes && (
              <div className="trip-details-section">
                <h2>Notes</h2>
                <p className="trip-notes">{trip.notes}</p>
              </div>
            )}

            <div className="trip-details-section">
              <h2>Transportation</h2>
              <div className="transportation-info">
                <div className="transportation-icon">
                  <FaPlane />
                </div>
                <div className="transportation-details">
                  <h3>{trip.transportation.charAt(0).toUpperCase() + trip.transportation.slice(1)}</h3>
                  <p>Primary mode of transportation</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "itinerary" && (
          <div className="trip-itinerary">
            <div className="itinerary-header">
              <h2>
                <FaListUl /> Trip Itinerary
              </h2>
              <p>Suggested activities and places to visit in {trip.destination}</p>
            </div>

            <div className="itinerary-days">
              {Array.from({
                length: Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1,
              }).map((_, index) => {
                const currentDate = new Date(trip.startDate)
                currentDate.setDate(currentDate.getDate() + index)

                return (
                  <div key={index} className="itinerary-day">
                    <div className="day-header">
                      <h3>Day {index + 1}</h3>
                      <p>
                        {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                    </div>

                    <div className="day-activities">
                      <p className="activity-placeholder">
                        This is where your planned activities for Day {index + 1} will appear. In a full implementation,
                        this would be populated with suggested activities based on your destination and preferences.
                      </p>

                      <div className="suggested-places">
                        <h4>Suggested Places</h4>
                        <p>
                          Popular attractions in {trip.destination} would be listed here, pulled from external APIs like
                          Google Places or TripAdvisor.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="trip-expenses">
            <div className="expenses-header">
              <div className="expenses-summary">
                <h2>Expense Tracker</h2>
                <div className="budget-summary">
                  <div className="budget-item">
                    <span>Total Budget:</span>
                    <span className="budget-amount">${trip.budget.toLocaleString()}</span>
                  </div>
                  <div className="budget-item">
                    <span>Total Spent:</span>
                    <span className="spent-amount">${getTotalExpenses().toLocaleString()}</span>
                  </div>
                  <div className="budget-item">
                    <span>Remaining:</span>
                    <span className={`remaining-amount ${getRemainingBudget() < 0 ? "negative" : ""}`}>
                      ${getRemainingBudget().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button className="add-expense-button" onClick={() => setShowAddExpense(!showAddExpense)}>
                {showAddExpense ? <FaChevronUp /> : <FaChevronDown />}
                {showAddExpense ? "Hide Form" : "Add Expense"}
              </button>
            </div>

            {showAddExpense && (
              <form onSubmit={addExpense} className="expense-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={newExpense.description}
                      onChange={handleExpenseChange}
                      placeholder="e.g. Hotel Booking"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="amount">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleExpenseChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" value={newExpense.category} onChange={handleExpenseChange}>
                      <option value="accommodation">Accommodation</option>
                      <option value="transportation">Transportation</option>
                      <option value="food">Food & Dining</option>
                      <option value="activities">Activities & Entertainment</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="save-expense-button">
                  Add Expense
                </button>
              </form>
            )}

            {expenses.length > 0 ? (
              <div className="expenses-list">
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{expense.description}</td>
                        <td>
                          <span className={`category-badge ${expense.category}`}>
                            {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                          </span>
                        </td>
                        <td className="amount-cell">${expense.amount.toFixed(2)}</td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="delete-expense-button"
                            title="Delete Expense"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2">
                        <strong>Total</strong>
                      </td>
                      <td className="amount-cell">
                        <strong>${getTotalExpenses().toFixed(2)}</strong>
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="no-expenses">
                <p>No expenses recorded yet. Add your first expense to start tracking your spending.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="trip-map">
            <div className="map-header">
              <h2>
                <FaMapMarkedAlt /> {trip.destination} Map
              </h2>
              <p>Explore your destination and points of interest</p>
            </div>

            <div className="map-container" ref={mapRef}></div>

            <div className="map-info">
              <p>
                In a full implementation, this would be an interactive map using Leaflet.js or Google Maps API, showing
                your destination, accommodation, and points of interest.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TripDetails

