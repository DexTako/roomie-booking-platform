import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

// Session cookie used for "Remember me" (a cookie without an expiry lives until the browser closes)
const hasSessionCookie = () => document.cookie.split('; ').some((c) => c.startsWith('roomieSession='))
const setSessionCookie = () => { document.cookie = 'roomieSession=1; path=/; SameSite=Lax' }
const clearSessionCookie = () => { document.cookie = 'roomieSession=; path=/; max-age=0; SameSite=Lax' }

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
    // "Remember me" unchecked = stay signed in only until the browser is closed.
    // A session cookie (no expiry) is shared by all tabs and deleted when the browser closes,
    // while localStorage is kept. If "remember me" was off and the cookie is gone, sign out.
    if (localStorage.getItem('rememberMe') === 'false' && !hasSessionCookie()) {
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('rememberMe')
    }

    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('currentUser')
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Set token in api service
        api.setAuthToken(token)

        // Re-sync with the server so the profile picture/name are never stale,
        // and sign out if the token has expired or the account was removed/banned.
        api.auth.getMe()
          .then((res) => {
            if (res?.user) {
              setUser(res.user)
              localStorage.setItem('currentUser', JSON.stringify(res.user))
            }
          })
          .catch((err) => {
            if (err.status === 401) {
              setUser(null)
              localStorage.removeItem('currentUser')
              localStorage.removeItem('token')
              api.setAuthToken(null)
            }
          })
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('currentUser')
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.login(email, password, rememberMe)
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem('token', response.token)
        localStorage.setItem('currentUser', JSON.stringify(response.user))
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')
        setSessionCookie()
        
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
        error: error.message || 'Login failed. Please try again.' 
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
        localStorage.setItem('rememberMe', 'true')
        setSessionCookie()
        
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
        error: error.message || 'Registration failed. Please try again.' 
      }
    }
  }

  // Logout function
  // Re-read the account from the server (e.g. after the email was verified)
  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe()
      if (res?.user) {
        setUser(res.user)
        localStorage.setItem('currentUser', JSON.stringify(res.user))
      }
    } catch {
      // keep the current user if the server can't be reached
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
    clearSessionCookie()
    api.setAuthToken(null)
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Update user profile - calls backend API
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const response = await api.auth.updateProfile(updates)
      
      if (response.success && response.user) {
        const updatedUser = response.user
        setUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        return { success: true, user: updatedUser }
      }
      
      return { success: false, error: 'Failed to update profile' }
    } catch (error) {
      console.error('Update profile error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      }
    }
  }

  const value = {
    user,
    isLoading,
    refreshUser,
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
