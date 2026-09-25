import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('roomie-wishlist')
    if (saved) {
      try {
        setWishlist(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load wishlist:', error)
      }
    }
  }, [])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('roomie-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

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
