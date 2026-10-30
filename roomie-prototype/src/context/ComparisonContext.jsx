import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

const ComparisonContext = createContext()

const MAX_ROOMS = 3

const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ComparisonProvider({ children }) {
  const { user } = useAuth()

  // Each account (and each guest) has its own comparison list, so the next person who
  // logs in on the same browser does not see rooms the previous person compared.
  const storageKey = `roomComparison:${user?.id || user?._id || 'guest'}`
  const keyRef = useRef(storageKey)
  const [comparison, setComparison] = useState(() => readList(storageKey))

  // Switch lists when someone logs in or out
  useEffect(() => {
    if (keyRef.current !== storageKey) {
      keyRef.current = storageKey
      setComparison(readList(storageKey))
    }
  }, [storageKey])

  // Update the list and save it under the current account's key
  const update = (change) => {
    setComparison((prev) => {
      const next = change(prev)
      try {
        localStorage.setItem(keyRef.current, JSON.stringify(next))
      } catch (error) {
        console.error('Failed to save comparison list:', error)
      }
      return next
    })
  }

  const addToComparison = (roomId) => {
    if (comparison.length >= MAX_ROOMS) {
      return { success: false, message: `Maximum ${MAX_ROOMS} rooms can be compared` }
    }
    if (comparison.includes(roomId)) {
      return { success: false, message: 'Room already in comparison' }
    }
    update((prev) => (prev.includes(roomId) ? prev : [...prev, roomId]))
    return { success: true }
  }

  const removeFromComparison = (roomId) => {
    update((prev) => prev.filter((id) => id !== roomId))
  }

  const clearComparison = () => {
    update(() => [])
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
