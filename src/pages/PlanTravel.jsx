"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTravel } from "../contexts/TravelContext"
import {
  FaArrowRight,
  FaArrowLeft,
  FaSave,
  FaPlane,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa"

const PlanTravel = () => {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("edit")
  const { saveTrip, updateTrip, getTrip } = useTravel()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    purpose: "leisure",
    startDate: "",
    endDate: "",
    budget: "",
    travelers: 1,
    accommodation: "hotel",
    transportation: "flight",
    activities: [],
    notes: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editId) {
      const tripToEdit = getTrip(editId)
      if (tripToEdit) {
        setFormData(tripToEdit)
        setIsEditing(true)
      } else {
        navigate("/dashboard")
      }
    }
  }, [editId, getTrip, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleActivitiesChange = (e) => {
    const { value, checked } = e.target

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        activities: [...prev.activities, value],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        activities: prev.activities.filter((activity) => activity !== value),
      }))
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1)
      setError("")
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
    setError("")
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.destination) {
          setError("Please fill in all required fields")
          return false
        }
        return true
      case 2:
        if (!formData.startDate || !formData.endDate) {
          setError("Please select both start and end dates")
          return false
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
          setError("End date must be after start date")
          return false
        }
        return true
      case 3:
        if (!formData.budget) {
          setError("Please enter your budget")
          return false
        }
        return true
      case 4:
        if (formData.activities.length === 0) {
          setError("Please select at least one activity")
          return false
        }
        return true
      default:
        return true
    }
  }

  const validateAllSteps = () => {
    if (!formData.name || !formData.destination) {
      setError("Please fill in all required fields")
      setStep(1)
      return false
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Please select both start and end dates")
      setStep(2)
      return false
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("End date must be after start date")
      setStep(2)
      return false
    }
    if (!formData.budget) {
      setError("Please enter your budget")
      setStep(3)
      return false
    }
    if (formData.activities.length === 0) {
      setError("Please select at least one activity")
      setStep(4)
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateAllSteps()) {
      return
    }

    try {
      if (isEditing) {
        updateTrip(editId, formData)
      } else {
        saveTrip(formData)
      }
      navigate("/dashboard")
    } catch (err) {
      setError("Failed to save trip. Please try again.")
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h2>
              <FaInfoCircle /> Basic Information
            </h2>

            <div className="form-group">
              <label htmlFor="name">Trip Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Summer Vacation 2023"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination*</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Paris, France"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose of Travel</label>
              <select id="purpose" name="purpose" value={formData.purpose} onChange={handleChange}>
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
                <option value="family">Family Visit</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="form-step">
            <h2>
              <FaCalendarAlt /> Dates & Travelers
            </h2>

            <div className="form-group">
              <label htmlFor="startDate">Start Date*</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date*</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="travelers">Number of Travelers</label>
              <input
                type="number"
                id="travelers"
                name="travelers"
                value={formData.travelers}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="form-step">
            <h2>
              <FaMoneyBillWave /> Budget & Preferences
            </h2>

            <div className="form-group">
              <label htmlFor="budget">Budget (INR)*</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 2000"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="accommodation">Preferred Accommodation</label>
              <select id="accommodation" name="accommodation" value={formData.accommodation} onChange={handleChange}>
                <option value="hotel">Hotel</option>
                <option value="hostel">Hostel</option>
                <option value="apartment">Cottage</option>
                <option value="resort">Resort</option>
                <option value="camping">Camping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transportation">Primary Transportation</label>
              <select id="transportation" name="transportation" value={formData.transportation} onChange={handleChange}>
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="car">Car</option>
                <option value="bus">Bus</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="form-step">
            <h2>
              <FaMapMarkedAlt /> Activities & Notes
            </h2>

            <div className="form-group">
              <label>Interested Activities* <small>(select at least one)</small></label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="sightseeing"
                    checked={formData.activities.includes("sightseeing")}
                    onChange={handleActivitiesChange}
                  />
                  Sightseeing
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="museums"
                    checked={formData.activities.includes("museums")}
                    onChange={handleActivitiesChange}
                  />
                  Museums & Culture
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="food"
                    checked={formData.activities.includes("food")}
                    onChange={handleActivitiesChange}
                  />
                  Food & Dining
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="shopping"
                    checked={formData.activities.includes("shopping")}
                    onChange={handleActivitiesChange}
                  />
                  Shopping
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="nature"
                    checked={formData.activities.includes("nature")}
                    onChange={handleActivitiesChange}
                  />
                  Nature & Outdoors
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="adventure"
                    checked={formData.activities.includes("adventure")}
                    onChange={handleActivitiesChange}
                  />
                  Adventure Activities
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    value="relaxation"
                    checked={formData.activities.includes("relaxation")}
                    onChange={handleActivitiesChange}
                  />
                  Relaxation
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or notes for your trip..."
                rows="4"
              ></textarea>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="plan-travel-container">
      <div className="plan-travel-header">
        <h1>
          <FaPlane /> {isEditing ? "Edit Trip" : "Plan Your Trip"}
        </h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        <div className="steps-indicator">
          <span className={step >= 1 ? "active" : ""}>Basic Info</span>
          <span className={step >= 2 ? "active" : ""}>Dates</span>
          <span className={step >= 3 ? "active" : ""}>Budget</span>
          <span className={step >= 4 ? "active" : ""}>Activities</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="travel-form">
        {renderStep()}

        <div className="form-navigation">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="prev-button">
              <FaArrowLeft /> Back
            </button>
          )}

          {step < 4 ? (
            <button type="button" onClick={nextStep} className="next-button">
              Next <FaArrowRight />
            </button>
          ) : (
            <button type="submit" className="submit-button">
              <FaSave /> {isEditing ? "Update Trip" : "Save Trip"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default PlanTravel 