import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])
  const { user } = useAuth()

  // Get user-specific localStorage key
  const getWishlistKey = () => {
    return user ? `roomie-wishlist-${user.id}` : 'roomie-wishlist-guest'
  }

  // Load user-specific wishlist when user changes
  useEffect(() => {
    if (user) {
      // Load wishlist for this specific user
      const saved = localStorage.getItem(getWishlistKey())
      if (saved) {
        try {
          setWishlist(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load wishlist:', error)
          setWishlist([])
        }
      } else {
        setWishlist([])
      }
    } else {
      // Clear wishlist when no user is logged in
      setWishlist([])
    }
  }, [user])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(getWishlistKey(), JSON.stringify(wishlist))
    }
  }, [wishlist, user])

  const addToWishlist = (roomId) => {
    if (!wishlist.includes(roomId)) {
      setWishlist([...wishlist, roomId])
      return true
    }
    return false
  }

  const removeFromWishlist = (roomId) => {
    setWishlist(wishlist.filter(id => id !== roomId))
  }

  const toggleWishlist = (roomId) => {
    if (wishlist.includes(roomId)) {
      removeFromWishlist(roomId)
      return false
    } else {
      addToWishlist(roomId)
      return true
    }
  }

  const isInWishlist = (roomId) => {
    return wishlist.includes(roomId)
  }

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
