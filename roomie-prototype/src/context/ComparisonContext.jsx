import { createContext, useContext, useState, useEffect } from 'react'

const ComparisonContext = createContext()

export function ComparisonProvider({ children }) {
  const [comparison, setComparison] = useState(() => {
    const saved = localStorage.getItem('roomComparison')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('roomComparison', JSON.stringify(comparison))
  }, [comparison])

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
