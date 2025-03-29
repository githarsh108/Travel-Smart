"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTravel } from "../contexts/TravelContext"
import { FaPlus, FaSearch, FaSuitcase, FaMapMarkedAlt, FaCalendarAlt, FaTrash, FaEdit } from "react-icons/fa"

// Separate TripCard component
const TripCard = ({ trip, onDelete }) => {
  const [imageUrl, setImageUrl] = useState("");

  const getImage = async (query) => {
    const clientId = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    
    if (!clientId) {
      return "";
    }

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${clientId}`
      );
      const data = await response.json();
      return data?.results[0]?.urls?.regular || "";
    } catch (e) {
      console.log("Error :: Unable to fetch Unsplash images :: ", e);
      return "";
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      const url = await getImage(trip.destination);
      setImageUrl(url);
    };
    fetchImage();
  }, [trip.destination]);

  return (
    <Link to={`/trip/${trip.id}`} className="trip-card">
      <div className="trip-image">
        <img
          src={imageUrl} // Fallback image
          alt={trip.destination}
          onError={(e)=> this.src="https://via.placeholder.com/300"}
        />
        <div className="trip-actions">
          <Link
            to={`/plan-travel?edit=${trip.id}`}
            onClick={(e) => e.stopPropagation()}
            className="edit-button"
          >
            <FaEdit />
          </Link>
          <button onClick={(e) => onDelete(trip.id, e)} className="delete-button">
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
  );
};

const Dashboard = () => {
  const { trips, deleteTrip } = useTravel();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const handleDeleteTrip = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(id);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "upcoming") {
      return matchesSearch && new Date(trip.startDate) > new Date();
    }
    if (filter === "past") {
      return matchesSearch && new Date(trip.endDate) < new Date();
    }
    if (filter === "current") {
      const now = new Date();
      return matchesSearch && new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
    }
    return matchesSearch;
  });

  return (
    <>
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
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        )}
      </div>

      <div className="community-purpose">
        <Link style={{textDecoration:"none", color: "white"}} to="/">Community</Link>
      </div>
    </>
  );
};

export default Dashboard;