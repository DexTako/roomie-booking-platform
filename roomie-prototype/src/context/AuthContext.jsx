import { createContext, useContext, useState, useEffect } from 'react'

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

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = (email, password) => {
    // Get registered users from localStorage
    const usersJson = localStorage.getItem('registeredUsers')
    const users = usersJson ? JSON.parse(usersJson) : []

    // Find user with matching credentials
    const foundUser = users.find(
      u => u.email === email && u.password === password
    )

    if (foundUser) {
      // Don't store password in current user session
      const { password, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
      return { success: true, user: userWithoutPassword }
    }

    return { success: false, error: 'Invalid email or password' }
  }

  // Register function
  const register = (userData) => {
    // Get existing users
    const usersJson = localStorage.getItem('registeredUsers')
    const users = usersJson ? JSON.parse(usersJson) : []

    // Check if email already exists
    const emailExists = users.some(u => u.email === userData.email)
    if (emailExists) {
      return { success: false, error: 'Email already registered' }
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, this would be hashed
      role: 'customer', // public sign-up is always a customer
      createdAt: new Date().toISOString()
    }

    // Add to users array
    users.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(users))

    // Log in the new user
    const { password, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))

    return { success: true, user: userWithoutPassword }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Update user profile
  const updateProfile = (updates) => {
    if (!user) return { success: false, error: 'No user logged in' }

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))

    // Also update in registered users
    const usersJson = localStorage.getItem('registeredUsers')
    const users = usersJson ? JSON.parse(usersJson) : []
    const userIndex = users.findIndex(u => u.id === user.id)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem('registeredUsers', JSON.stringify(users))
    }

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

// Seed the two fixed staff accounts (one host, one admin) and tidy legacy data.
// Customers can only be created through the public sign-up form.
export const initializeDefaultAccounts = () => {
  const existingUsers = localStorage.getItem('registeredUsers')
  let users = []
  try {
    users = existingUsers ? JSON.parse(existingUsers) : []
  } catch (error) {
    users = []
  }

  // Legacy data: the old "renter" role is now "customer"
  users = users.map(u => (u.role === 'renter' ? { ...u, role: 'customer' } : u))

  // Legacy data: remove the old seeded demo renter account
  users = users.filter(u => u.email !== 'renter@roomie.com')

  // The single admin account
  if (!users.some(u => u.email === 'admin@roomie.com')) {
    users.push({
      id: 'user_admin_1',
      name: 'Admin User',
      email: 'admin@roomie.com',
      password: 'admin123',
      role: 'admin',
      createdAt: '2024-08-01T00:00:00Z'
    })
  }

  // The single host account (owner of all rooms)
  if (!users.some(u => u.email === 'host@roomie.com')) {
    users.push({
      id: 'user_host_1',
      name: 'John Host',
      email: 'host@roomie.com',
      password: 'host123',
      role: 'host',
      createdAt: '2024-08-01T00:00:00Z'
    })
  }

  localStorage.setItem('registeredUsers', JSON.stringify(users))
}
