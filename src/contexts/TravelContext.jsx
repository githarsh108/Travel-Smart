"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"

const TravelContext = createContext()

export const useTravel = () => useContext(TravelContext)

export const TravelProvider = ({ children }) => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      // Load user's trips from localStorage
      const userTrips = JSON.parse(localStorage.getItem(`trips_${currentUser.id}`) || "[]")
      setTrips(userTrips)
    } else {
      setTrips([])
    }
    setLoading(false)
  }, [currentUser])

  const saveTrip = (tripData) => {
    if (!currentUser) return null

    const newTrip = {
      id: Date.now().toString(),
      ...tripData,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    }

    const updatedTrips = [...trips, newTrip]
    setTrips(updatedTrips)
    localStorage.setItem(`trips_${currentUser.id}`, JSON.stringify(updatedTrips))

    return newTrip
  }

  const updateTrip = (tripId, updatedData) => {
    if (!currentUser) return false

    const updatedTrips = trips.map((trip) =>
      trip.id === tripId ? { ...trip, ...updatedData, updatedAt: new Date().toISOString() } : trip,
    )

    setTrips(updatedTrips)
    localStorage.setItem(`trips_${currentUser.id}`, JSON.stringify(updatedTrips))

    return true
  }

  const deleteTrip = (tripId) => {
    if (!currentUser) return false

    const updatedTrips = trips.filter((trip) => trip.id !== tripId)
    setTrips(updatedTrips)
    localStorage.setItem(`trips_${currentUser.id}`, JSON.stringify(updatedTrips))

    return true
  }

  const getTrip = (tripId) => {
    return trips.find((trip) => trip.id === tripId) || null
  }

  const value = {
    trips,
    loading,
    saveTrip,
    updateTrip,
    deleteTrip,
    getTrip,
  }

  return <TravelContext.Provider value={value}>{!loading && children}</TravelContext.Provider>
}

