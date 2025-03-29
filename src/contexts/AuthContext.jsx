"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const register = (name, email, password) => {
    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if user already exists
    const userExists = users.find((user) => user.email === email)
    if (userExists) {
      throw new Error("User with this email already exists")
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, you would hash this password
    }

    // Add user to users array
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Set current user and store in localStorage
    setCurrentUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))

    return newUser
  }

  const login = (email, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Find user with matching email and password
    const user = users.find((user) => user.email === email && user.password === password)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Set current user and store in localStorage
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))

    return user
  }

  const logout = () => {
    // Remove current user from localStorage and state
    localStorage.removeItem("currentUser")
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

