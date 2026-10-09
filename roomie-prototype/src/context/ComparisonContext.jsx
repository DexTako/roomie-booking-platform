import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ComparisonContext = createContext()

export function ComparisonProvider({ children }) {
  const [comparison, setComparison] = useState([])
  const { user } = useAuth()

  // Get user-specific localStorage key
  const getComparisonKey = () => {
    return user ? `roomComparison-${user.id}` : 'roomComparison-guest'
  }

  // Load user-specific comparison when user changes
  useEffect(() => {
    if (user) {
      // Load comparison for this specific user
      const saved = localStorage.getItem(getComparisonKey())
      if (saved) {
        try {
          setComparison(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load comparison:', error)
          setComparison([])
        }
      } else {
        setComparison([])
      }
    } else {
      // Clear comparison when no user is logged in
      setComparison([])
    }
  }, [user])

  // Save to localStorage whenever comparison changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(getComparisonKey(), JSON.stringify(comparison))
    }
  }, [comparison, user])

  const addToComparison = (roomId) => {
    if (comparison.length >= 3) {
      return { success: false, message: 'Maximum 3 rooms can be compared' }
    }
    if (comparison.includes(roomId)) {
      return { success: false, message: 'Room already in comparison' }
    }
    setComparison([...comparison, roomId])
    return { success: true }
  }

  const removeFromComparison = (roomId) => {
    setComparison(comparison.filter(id => id !== roomId))
  }

  const clearComparison = () => {
    setComparison([])
  }

  const isInComparison = (roomId) => {
    return comparison.includes(roomId)
  }

  return (
    <ComparisonContext.Provider
      value={{
        comparison,
        comparisonCount: comparison.length,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider')
  }
  return context
}
