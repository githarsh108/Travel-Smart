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
import "./trip.css"

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
  const [itinerary, setItinerary] = useState([])
  const [itineraryLoadingStatus, setItineraryLoadingStatus] = useState("")
  const [itineraryError, setItineraryError] = useState("")
  const [isFetchingItinerary, setIsFetchingItinerary] = useState(false)
  const mapRef = useRef(null)
  const tripContentRef = useRef(null)
  const navigate = useNavigate()

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  // Fetch image from Unsplash
  const getImage = async (query) => {
    if (!UNSPLASH_ACCESS_KEY) return "https://via.placeholder.com/800x400"
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
      )
      const data = await response.json()
      return data?.results[0]?.urls?.regular || "https://via.placeholder.com/800x400"
    } catch (e) {
      console.log("Error fetching Unsplash images:", e)
      return "https://via.placeholder.com/800x400"
    }
  }

  // Generate a unique cache key based on trip details
  const getItineraryCacheKey = (trip) => {
    const { destination, budget, startDate, endDate, travelers, accommodation, transportation, purpose, activities } = trip
    return `itinerary_${destination}_${budget}_${startDate}_${endDate}_${travelers}_${accommodation}_${transportation}_${purpose}_${activities?.join(",") || ""}`
  }

  // Load trip data and expenses
  useEffect(() => {
    const tripData = getTrip(id)
    if (tripData) {
      setTrip(tripData)
      const savedExpenses = JSON.parse(localStorage.getItem(`expenses_${id}`) || "[]")
      setExpenses(savedExpenses)
      setLoading(false)
    } else {
      setError("Trip not found")
      setLoading(false)
    }
  }, [id, getTrip])

  // Load or fetch itinerary when component mounts
  useEffect(() => {
    if (trip && GEMINI_API_KEY && UNSPLASH_ACCESS_KEY && itinerary.length === 0) {
      const cacheKey = getItineraryCacheKey(trip)
      const cachedItinerary = JSON.parse(localStorage.getItem(cacheKey) || "null")
      if (cachedItinerary) {
        setItinerary(cachedItinerary)
      } else {
        setIsFetchingItinerary(true)
        fetchItinerary(cacheKey).finally(() => setIsFetchingItinerary(false))
      }
    }
  }, [trip, GEMINI_API_KEY, UNSPLASH_ACCESS_KEY])

  // Fetch itinerary from Gemini API and images from Unsplash
  const fetchItinerary = async (cacheKey) => {
    setItineraryLoadingStatus("Analyzing your trip preferences...")
    const prompt = `
      Generate a detailed daily itinerary for a trip to ${trip.destination} 
      with a budget of ₹${trip.budget} for ${trip.travelers} traveler(s), 
      staying from ${trip.startDate} to ${trip.endDate}, 
      preferring ${trip.accommodation} accommodation and ${trip.transportation} transportation.
      Purpose: ${trip.purpose}. Activities: ${trip.activities?.join(", ") || "general sightseeing"}.
      Provide a breakdown of activities, estimated costs in INR, and locations for each day.
      Return the response in JSON format with an array of days under the field "itinerary", 
      each containing date, activities array (with name, location, estimatedCostINR), and dailyTotalINR.
    `

    try {
      setItineraryLoadingStatus("Generating personalized itinerary...")
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      const jsonString = data.candidates[0].content.parts[0].text.replace("```json\n", "").replace("\n```", "")
      const itineraryData = JSON.parse(jsonString)

      // Log the parsed data for debugging
      console.log("Parsed itinerary data:", itineraryData)

      // Check for either 'itinerary' or 'days'
      const dailyItinerary = itineraryData.itinerary || itineraryData.days

      if (!Array.isArray(dailyItinerary)) {
        throw new Error("Invalid itinerary format: Neither 'itinerary' nor 'days' field is present or not an array")
      }

      setItineraryLoadingStatus("Fetching destination images...")
      const itineraryWithImages = await Promise.all(
        dailyItinerary.map(async (day) => {
          const mainActivity = day.activities[0]?.name || trip.destination
          const imageUrl = await getImage(`${trip.destination} ${mainActivity}`)
          return { ...day, imageUrl }
        })
      )

      setItinerary(itineraryWithImages)
      localStorage.setItem(cacheKey, JSON.stringify(itineraryWithImages))
      setItineraryLoadingStatus("")
    } catch (err) {
      console.error("Error fetching or processing itinerary:", err)
      setItineraryError("Failed to generate itinerary. Please try again later.")
      setItineraryLoadingStatus("")
      setItinerary([])
    }
  }

  // Regenerate itinerary on demand
  const regenerateItinerary = () => {
    if (trip && GEMINI_API_KEY && UNSPLASH_ACCESS_KEY) {
      const cacheKey = getItineraryCacheKey(trip)
      localStorage.removeItem(cacheKey) // Clear cache
      setItinerary([]) // Reset itinerary to trigger fetch
      setIsFetchingItinerary(true)
      fetchItinerary(cacheKey).finally(() => setIsFetchingItinerary(false))
    }
  }

  // Load map placeholder
  useEffect(() => {
    if (trip && activeTab === "map" && !mapLoaded) {
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

  // Expense handling functions (unchanged)
  const handleExpenseChange = (e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({ ...prev, [name]: value }))
  }

  const addExpense = (e) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount) return
    const expenseToAdd = {
      id: Date.now().toString(),
      ...newExpense,
      amount: Number.parseFloat(newExpense.amount),
      date: new Date().toISOString(),
    }
    const updatedExpenses = [...expenses, expenseToAdd]
    setExpenses(updatedExpenses)
    localStorage.setItem(`expenses_${id}`, JSON.stringify(updatedExpenses))
    setNewExpense({ description: "", amount: "", category: "accommodation" })
    setShowAddExpense(false)
  }

  const deleteExpense = (expenseId) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== expenseId)
    setExpenses(updatedExpenses)
    localStorage.setItem(`expenses_${id}`, JSON.stringify(updatedExpenses))
  }

  const getTotalExpenses = () => expenses.reduce((total, expense) => total + expense.amount, 0)
  const getRemainingBudget = () => trip.budget - getTotalExpenses()

  // PDF generation (unchanged)
  const generatePDF = async () => {
    const content = tripContentRef.current
    if (!content) return
    try {
      const canvas = await html2canvas(content, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`${trip.name}_itinerary.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
    }
  }

  const handleDeleteTrip = () => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(id)
      navigate("/dashboard")
    }
  }

  if (loading) return <div className="loading">Loading trip details...</div>
  if (error || !trip) {
    return (
      <div className="error-container">
        <p className="error-message">{error || "Trip not found"}</p>
        <Link to="/dashboard" className="back-button">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="trip-details-container">
      <div className="trip-details-header">
        <div className="trip-title">
          <h1>{trip.name}</h1>
          <p className="destination"><FaMapMarkedAlt /> {trip.destination}</p>
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
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={activeTab === "itinerary" ? "active" : ""} onClick={() => setActiveTab("itinerary")}>Itinerary</button>
        <button className={activeTab === "expenses" ? "active" : ""} onClick={() => setActiveTab("expenses")}>Expenses</button>
        <button className={activeTab === "map" ? "active" : ""} onClick={() => setActiveTab("map")}>Map</button>
      </div>

      <div className="trip-content" ref={tripContentRef}>
        {activeTab === "overview" && (
          <div className="trip-overview">
            <div className="trip-info-cards">
              <div className="info-card">
                <div className="info-icon"><FaCalendarAlt /></div>
                <div className="info-content">
                  <h3>Dates</h3>
                  <p>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                  <p className="info-subtitle">{Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon"><FaMoneyBillWave /></div>
                <div className="info-content">
                  <h3>Budget</h3>
                  <p>₹{trip.budget.toLocaleString()}</p>
                  <p className="info-subtitle">Spent: ₹{getTotalExpenses().toLocaleString()} | Remaining: ₹{getRemainingBudget().toLocaleString()}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon"><FaUsers /></div>
                <div className="info-content">
                  <h3>Travellers</h3>
                  <p>{trip.travelers} {trip.travelers === 1 ? "Person" : "People"}</p>
                  <p className="info-subtitle">Purpose: {trip.purpose.charAt(0).toUpperCase() + trip.purpose.slice(1)}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon"><FaHotel /></div>
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
                    <div key={activity} className="activity-tag">{activity.charAt(0).toUpperCase() + activity.slice(1)}</div>
                  ))}
                </div>
              ) : <p>No activities selected</p>}
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
                <div className="transportation-icon"><FaPlane /></div>
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
              <h2><FaListUl /> Trip Itinerary</h2>
              <p>Personalized plan for {trip.destination}</p>
              <button onClick={regenerateItinerary} disabled={isFetchingItinerary}>
                {isFetchingItinerary ? "Regenerating..." : "Regenerate Itinerary"}
              </button>
            </div>
            <div className="itinerary-days">
              {isFetchingItinerary ? (
                <p>{itineraryLoadingStatus || "Planning your trip..."}</p>
              ) : itineraryError ? (
                <p className="error-message">{itineraryError}</p>
              ) : itinerary.length > 0 ? (
                itinerary.map((day, index) => (
                  <div key={index} className="itinerary-day">
                    <div className="day-header">
                      <h3>Day {index + 1}</h3>
                      <p>{new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="day-image">
                      <img src={day.imageUrl} alt={`Day ${index + 1} in ${trip.destination}`} style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} />
                    </div>
                    <div className="day-activities">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="activity-item">
                          <p><strong>{activity.name}</strong> - {activity.location}</p>
                          <p>Estimated Cost: ₹{activity.estimatedCostINR.toLocaleString()}</p>
                          {activity.notes && <p className="activity-notes">Notes: {activity.notes}</p>}
                        </div>
                      ))}
                      <p className="daily-total">Daily Total: ₹{day.dailyTotalINR.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No itinerary available. Click "Regenerate Itinerary" to create one.</p>
              )}
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
                    <span className="budget-amount">₹{trip.budget.toLocaleString()}</span>
                  </div>
                  <div className="budget-item">
                    <span>Total Spent:</span>
                    <span className="spent-amount">₹{getTotalExpenses().toLocaleString()}</span>
                  </div>
                  <div className="budget-item">
                    <span>Remaining:</span>
                    <span className={`remaining-amount ${getRemainingBudget() < 0 ? "negative" : ""}`}>
                      ₹{getRemainingBudget().toLocaleString()}
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
                    <label htmlFor="amount">Amount (₹)</label>
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
                <button type="submit" className="save-expense-button">Add Expense</button>
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
                        <td><span className={`category-badge ${expense.category}`}>{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</span></td>
                        <td className="amount-cell">₹{expense.amount.toFixed(2)}</td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => deleteExpense(expense.id)} className="delete-expense-button" title="Delete Expense">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2"><strong>Total</strong></td>
                      <td className="amount-cell"><strong>₹{getTotalExpenses().toFixed(2)}</strong></td>
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
              <h2><FaMapMarkedAlt /> {trip.destination} Map</h2>
              <p>Explore your destination and points of interest</p>
            </div>


              <CityMap city={trip.destination} />
            
          
          </div>
        )}
      </div>
    </div>
  )
}

export default TripDetails;


const CityMap = ({ city }) => {
  const [coordinates, setCoordinates] = useState(null); // Store lat/lon
  const [error, setError] = useState(null); // Handle errors

  // Fetch coordinates from Nominatim when city prop changes
  useEffect(() => {
    if (!city) {
      setCoordinates(null);
      setError(null);
      return;
    }

    const fetchCoordinates = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          city
        )}&format=json&limit=1`;
        const response = await fetch(url, {
          headers: { "User-Agent": "CityMapApp/1.0" }, // Nominatim requires a User-Agent
        });
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setCoordinates({ lat, lon });
          setError(null);
        } else {
          setError("City not found.");
          setCoordinates(null);
        }
      } catch (err) {
        setError("Error fetching coordinates.");
        setCoordinates(null);
      }
    };

    fetchCoordinates();
  }, [city]); // Run effect when city prop changes

  // Generate Bing Maps iframe src URL
  const getMapUrl = () => {
    if (!coordinates) return "";
    const { lat, lon } = coordinates;
    return `https://www.bing.com/maps/embed?h=350&w=400&cp=${lat}~${lon}&lvl=10&typ=d&sty=r`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Map for {city || "No City Provided"}</h2>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {coordinates ? (

          <iframe
            src={getMapUrl()}
            // className="map-container"
            width="100%"
            height={"350px"}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: "none", width: "100%", margin: "auto" }}
          />
      ) : (
        !error && city && <p>Loading map...</p>
      )}
    </div>
  );
};
