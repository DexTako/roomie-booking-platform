import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

// Create the auth context
const AuthContext = createContext(null)

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount and verify token
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('currentUser')
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Set token in api service
        api.setAuthToken(token)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('currentUser')
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem('token', response.token)
        localStorage.setItem('currentUser', JSON.stringify(response.user))
        
        // Set token in api service
        api.setAuthToken(response.token)
        
        // Update state
        setUser(response.user)
        
        return { success: true, user: response.user }
      }
      
      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.register(userData)
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem('token', response.token)
        localStorage.setItem('currentUser', JSON.stringify(response.user))
        
        // Set token in api service
        api.setAuthToken(response.token)
        
        // Update state
        setUser(response.user)
        
        return { success: true, user: response.user }
      }
      
      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      }
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('token')
    api.setAuthToken(null)
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Update user profile (currently uses localStorage, can be extended with API call)
  const updateProfile = (updates) => {
    if (!user) return { success: false, error: 'No user logged in' }

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))

    return { success: true, user: updatedUser }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Note: Default accounts are now seeded directly in the backend database.
// Run the seed script (npm run seed) in the backend to initialize default users:
// - admin@roomie.com / admin123
// - host@roomie.com / host123
// - customer@roomie.com / customer123
