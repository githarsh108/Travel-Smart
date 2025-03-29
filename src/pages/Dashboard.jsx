"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useTravel } from "../contexts/TravelContext"
import { FaPlus, FaSearch, FaSuitcase, FaMapMarkedAlt, FaCalendarAlt, FaTrash, FaEdit } from "react-icons/fa"

const Dashboard = () => {
  const { trips, deleteTrip } = useTravel()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const handleDeleteTrip = (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(id)
    }
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "upcoming") {
      return matchesSearch && new Date(trip.startDate) > new Date()
    }
    if (filter === "past") {
      return matchesSearch && new Date(trip.endDate) < new Date()
    }
    if (filter === "current") {
      const now = new Date()
      return matchesSearch && new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
    }
    return matchesSearch
  })

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          <FaSuitcase /> My Trips
        </h1>
        <Link to="/plan-travel" className="create-trip-button">
          <FaPlus /> Plan New Trip
        </Link>
      </div>

      <div className="dashboard-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All
          </button>
          <button className={filter === "upcoming" ? "active" : ""} onClick={() => setFilter("upcoming")}>
            Upcoming
          </button>
          <button className={filter === "current" ? "active" : ""} onClick={() => setFilter("current")}>
            Current
          </button>
          <button className={filter === "past" ? "active" : ""} onClick={() => setFilter("past")}>
            Past
          </button>
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="no-trips">
          <p>No trips found. Start planning your next adventure!</p>
          <Link to="/plan-travel" className="create-trip-button">
            <FaPlus /> Plan New Trip
          </Link>
        </div>
      ) : (
        <div className="trips-grid">
          {filteredTrips.map((trip) => (
            <Link to={`/trip/${trip.id}`} key={trip.id} className="trip-card">
              <div className="trip-image">
                <img
                  src={trip.image || `https://source.unsplash.com/300x200/?${trip.destination}`}
                  alt={trip.destination}
                />
                <div className="trip-actions">
                  <Link
                    to={`/plan-travel?edit=${trip.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="edit-button"
                  >
                    <FaEdit />
                  </Link>
                  <button onClick={(e) => handleDeleteTrip(trip.id, e)} className="delete-button">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="trip-details">
                <h3>{trip.name}</h3>
                <div className="trip-info">
                  <p>
                    <FaMapMarkedAlt /> {trip.destination}
                  </p>
                  <p>
                    <FaCalendarAlt /> {new Date(trip.startDate).toLocaleDateString()} -{" "}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard

