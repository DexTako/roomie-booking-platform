import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth()

  // Each account (and each guest) has its own wishlist, so a second person using the
  // same browser doesn't see or change someone else's saved rooms.
  const storageKey = `roomie-wishlist:${user?.id || user?._id || 'guest'}`
  const keyRef = useRef(storageKey)

  // Read the saved list straight away (no empty first render that could overwrite it)
  const [wishlist, setWishlist] = useState(() => readList(storageKey))

  // Switch lists when the user logs in or out
  useEffect(() => {
    if (keyRef.current !== storageKey) {
      keyRef.current = storageKey
      setWishlist(readList(storageKey))
    }
  }, [storageKey])

  // Save only when the wishlist is changed by the user
  const update = (change) => {
    setWishlist(prev => {
      const next = change(prev)
      try {
        localStorage.setItem(keyRef.current, JSON.stringify(next))
      } catch (error) {
        console.error('Failed to save wishlist:', error)
      }
      return next
    })
  }

  const addToWishlist = (roomId) => {
    if (wishlist.includes(roomId)) return false
    update(prev => (prev.includes(roomId) ? prev : [...prev, roomId]))
    return true
  }

  const removeFromWishlist = (roomId) => {
    update(prev => prev.filter(id => id !== roomId))
  }

  const toggleWishlist = (roomId) => {
    if (wishlist.includes(roomId)) {
      removeFromWishlist(roomId)
      return false
    }
    addToWishlist(roomId)
    return true
  }

  const isInWishlist = (roomId) => wishlist.includes(roomId)

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
