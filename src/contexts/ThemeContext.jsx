"use client"

import { createContext, useState, useContext, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check if theme preference is stored in localStorage
    const savedTheme = localStorage.getItem("darkMode")
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme))
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(prefersDarkMode)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark-mode")
    }

    // Save theme preference to localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode)
  }

  const value = {
    darkMode,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

