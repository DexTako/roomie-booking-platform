import { useState, useEffect, useRef } from 'react'
import RoomCard from '../components/RoomCard'
import AdvancedFilters from '../components/AdvancedFilters'
import SearchBar from '../components/SearchBar'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import { rooms } from '../data/rooms'
import { useWishlist } from '../context/WishlistContext'
import { useComparison } from '../context/ComparisonContext'
import { useAuth } from '../context/AuthContext'
import { calculateAverageRating } from '../data/reviews'

function HomePage({
  onSelectRoom,
  user,
  onNavigateToHome,
  onNavigateToHost,
  onNavigateToAdmin,
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToMyBookings,
  onNavigateToWishlist,
  onNavigateToComparison,
  onNavigateToMyProfile,
  onNavigateToSettings,
  onNavigateToHowItWorks,
  onNavigateToContact
}) {
  const { wishlistCount } = useWishlist()
  const { comparisonCount } = useComparison()
  const { logout } = useAuth()
  const [filterTheme, setFilterTheme] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: [0, 500],
    capacity: 'all',
    amenities: [],
    sortBy: 'featured'
  })
  const [activeShowcase, setActiveShowcase] = useState('rooms')
  const [navVisible, setNavVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const hideTimer = useRef(null)

  // Apply all filters
  const applyFilters = (roomsList) => {
    let filtered = roomsList

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(search) ||
        room.location.toLowerCase().includes(search) ||
        room.description.toLowerCase().includes(search)
      )
    }

    // Theme filter
    if (filterTheme !== 'all') {
      filtered = filtered.filter(room => room.theme === filterTheme)
    }

    // Price filter
    filtered = filtered.filter(room =>
      room.pricePerNight >= advancedFilters.priceRange[0] &&
      room.pricePerNight <= advancedFilters.priceRange[1]
    )

    // Capacity filter
    if (advancedFilters.capacity !== 'all') {
      if (advancedFilters.capacity === '1-2') {
        filtered = filtered.filter(room => room.capacity >= 1 && room.capacity <= 2)
      } else if (advancedFilters.capacity === '3-4') {
        filtered = filtered.filter(room => room.capacity >= 3 && room.capacity <= 4)
      } else if (advancedFilters.capacity === '5+') {
        filtered = filtered.filter(room => room.capacity >= 5)
      }
    }

    // Amenities filter
    if (advancedFilters.amenities.length > 0) {
      filtered = filtered.filter(room => {
        return advancedFilters.amenities.every(amenity => {
          if (amenity === 'wifi') return room.amenities.some(a => a.toLowerCase().includes('wifi'))
          if (amenity === 'kitchen') return room.amenities.some(a => a.toLowerCase().includes('kitchen'))
          if (amenity === 'parking') return room.amenities.some(a => a.toLowerCase().includes('parking'))
          if (amenity === 'ac') return room.amenities.some(a => a.toLowerCase().includes('air conditioning'))
          if (amenity === 'workspace') return room.amenities.some(a => a.toLowerCase().includes('workspace'))
          if (amenity === '3d') return room.has3D
          return true
        })
      })
    }

    // Sort
    if (advancedFilters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight)
    } else if (advancedFilters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight)
    } else if (advancedFilters.sortBy === 'rating') {
      filtered.sort((a, b) => {
        const ratingA = parseFloat(calculateAverageRating(a.id)) || 0
        const ratingB = parseFloat(calculateAverageRating(b.id)) || 0
        return ratingB - ratingA
      })
    } else if (advancedFilters.sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id)
    }

    return filtered
  }

  const filteredRooms = applyFilters(rooms)

  // Navbar auto hide/show
  useEffect(() => {
    const resetHideTimer = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }

      // If we are at the top, navbar should always stay visible
      if (window.scrollY <= 20) {
        setNavVisible(true)
        return
      }

      // When down the page, show navbar first
      setNavVisible(true)

      // Then hide after 3 seconds if not being used
      hideTimer.current = setTimeout(() => {
        if (!mobileMenuOpen && window.scrollY > 20) {
          setNavVisible(false)
        }
      }, 3000)
    }

    const handleScroll = () => {
      // Always visible at the top
      if (window.scrollY <= 20) {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current)
        }

        setNavVisible(true)
        return
      }

      resetHideTimer()
    }

    const handleMouseMove = () => {
      if (window.scrollY > 20) {
        resetHideTimer()
      }
    }

    const handleTouch = () => {
      if (window.scrollY > 20) {
        resetHideTimer()
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouch)

    // Initial state
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouch)

      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
    }
  }, [mobileMenuOpen])

  const scrollToSection = id => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    })

    setMobileMenuOpen(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 animate-fade-in">

        {/* ================= NAVBAR ================= */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-500 ${
            navVisible
              ? 'translate-y-0 opacity-100'
              : '-translate-y-full opacity-0'
          }`}
        >
          <nav
            className="
              max-w-7xl
              mx-auto
              rounded-2xl
              bg-white/75
              backdrop-blur-xl
              border
              border-white/50
              shadow-xl
              shadow-black/10
            "
          >
            <div className="h-16 px-4 sm:px-5 flex items-center justify-between">

              {/* LOGO */}
              <button
                type="button"
                onClick={() => {
                  scrollToSection('home')

                  if (onNavigateToHome) {
                    onNavigateToHome()
                  }
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="
                    w-9
                    h-9
                    rounded-lg
                    bg-gradient-to-br
                    from-violet-500
                    to-indigo-600
                    flex
                    items-center
                    justify-center
                    shadow-sm
                  "
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10"
                    />
                  </svg>
                </div>

                <span className="text-xl font-bold text-indigo-500">
                  Roomie
                </span>
              </button>

              {/* DESKTOP NAVIGATION */}
              <div className="hidden md:flex items-center gap-7">

                <button
                  type="button"
                  onClick={() => scrollToSection('rooms')}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Browse
                </button>

                <button
                  type="button"
                  onClick={onNavigateToHowItWorks}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  How it Works
                </button>

                <button
                  type="button"
                  onClick={onNavigateToContact}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Contact
                </button>

                {/* NOT LOGGED IN */}
                {!user && (
                  <>
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToRegister}
                      className="
                        px-5
                        py-2.5
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        rounded-lg
                        text-sm
                        font-semibold
                        shadow-sm
                        transition-all
                        duration-200
                      "
                    >
                      Sign Up
                    </button>
                  </>
                )}

                {/* LOGGED IN */}
                {user && (
                  <>
                    {/* Host Dashboard - Desktop */}
                    {user.role === 'host' && (
                      <button
                        type="button"
                        onClick={onNavigateToHost}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </button>
                    )}

                    {/* Admin Dashboard - Desktop */}
                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={onNavigateToAdmin}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onNavigateToMyBookings}
                      className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      My Bookings
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToWishlist}
                      className="relative text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Wishlist
                      </div>
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToComparison}
                      className="relative text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Compare
                      </div>
                      {comparisonCount > 0 && (
                        <span className="absolute -top-1 -right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {comparisonCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToMyProfile}
                      className="
                        w-10
                        h-10
                        rounded-full
                        bg-indigo-100
                        text-indigo-600
                        flex
                        items-center
                        justify-center
                        font-bold
                        hover:bg-indigo-200
                        transition-colors
                      "
                      title={user.name}
                    >
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : 'U'}
                    </button>

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={() => setShowLogoutModal(true)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* MOBILE MENU BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen)
                  setNavVisible(true)
                }}
                className="
                  md:hidden
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-700
                  hover:bg-white/60
                  transition
                "
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* MOBILE MENU */}
            {mobileMenuOpen && (
              <div
                className="
                  md:hidden
                  px-2
                  pb-safe
                  border-t
                  border-white/50
                  max-h-[calc(100vh-5rem)]
                  overflow-y-auto
                "
              >
                <div className="flex flex-col pt-2 gap-0.5 pb-2">

                  <button
                    type="button"
                    onClick={() => scrollToSection('rooms')}
                    className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                  >
                    Browse Rooms
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToHowItWorks}
                    className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                  >
                    How it Works
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToContact}
                    className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                  >
                    Contact
                  </button>

                  {!user ? (
                    <>
                      <div className="h-px bg-gray-200 my-2"></div>

                      <button
                        type="button"
                        onClick={onNavigateToLogin}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-semibold text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                      >
                        Sign In
                      </button>

                      <button
                        type="button"
                        onClick={onNavigateToRegister}
                        className="mt-1 px-3 py-3.5 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="h-px bg-gray-200 my-2"></div>

                      {/* Host Dashboard - Mobile */}
                      {user.role === 'host' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            onNavigateToHost?.()
                          }}
                          className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Host Dashboard
                          </span>
                        </button>
                      )}

                      {/* Admin Dashboard - Mobile */}
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            onNavigateToAdmin?.()
                          }}
                          className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-purple-600 hover:bg-purple-50 active:bg-purple-100 transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Dashboard
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onNavigateToMyBookings?.()
                        }}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                      >
                        My Bookings
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onNavigateToWishlist?.()
                        }}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Wishlist
                        </span>
                        {wishlistCount > 0 && (
                          <span className="min-w-[28px] h-7 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center px-2">
                            {wishlistCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onNavigateToComparison?.()
                        }}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Compare
                        </span>
                        {comparisonCount > 0 && (
                          <span className="min-w-[28px] h-7 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center px-2">
                            {comparisonCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={onNavigateToMyProfile}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                      >
                        My Profile
                      </button>

                      <button
                        type="button"
                        onClick={onNavigateToSettings}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                      >
                        Settings
                      </button>

                      {user.role === 'host' && (
                        <button
                          type="button"
                          onClick={onNavigateToHost}
                          className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                        >
                          Host Dashboard
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={onNavigateToAdmin}
                          className="text-left px-3 py-3.5 rounded-lg text-base font-medium text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors"
                        >
                          Admin Dashboard
                        </button>
                      )}

                      <div className="h-px bg-gray-200 my-2"></div>

                      {/* Logout Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setShowLogoutModal(true)
                        }}
                        className="text-left px-3 py-3.5 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </span>
                      </button>
                    </>
                  )}

                </div>
              </div>
            )}
          </nav>
        </header>


        {/* ================= HERO SECTION ================= */}
        <section
          id="home"
          className="
            relative
            min-h-screen
            flex
            items-center
            overflow-hidden
            text-white
          "
        >
          {/* HERO ROOM IMAGE */}
          <div
            className="
              absolute
              inset-0
              bg-cover
              bg-center
              bg-no-repeat
            "
            style={{
              backgroundImage: "url('/images/room1/hero-room.jpg')"
            }}
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/45" />

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

          {/* HERO CONTENT */}
          <div
            className="
              relative
              z-10
              container
              mx-auto
              px-4
              pt-24
            "
          >
            <div className="max-w-3xl">

              <div
                className="
                  inline-flex
                  px-4
                  py-2
                  rounded-full
                  bg-white/10
                  backdrop-blur-md
                  border
                  border-white/20
                  text-xs
                  font-semibold
                  tracking-widest
                  mb-6
                "
              >
                FIND YOUR NEXT STAY
              </div>

              <h1
                className="
                  text-5xl
                  sm:text-6xl
                  md:text-7xl
                  lg:text-8xl
                  font-bold
                  leading-[0.95]
                  tracking-tight
                  mb-6
                  animate-fade-in
                "
              >
                Find Your
                <span className="block">
                  Perfect Stay
                </span>
              </h1>

              <p
                className="
                  text-lg
                  sm:text-xl
                  text-white/80
                  mb-8
                  max-w-xl
                  animate-fade-in
                "
                style={{ animationDelay: '0.1s' }}
              >
                Explore unique apartments with immersive 3D tours
              </p>

              {/* SEARCH BAR */}
              <div
                className="
                  max-w-2xl
                  bg-white/90
                  backdrop-blur-xl
                  rounded-2xl
                  shadow-2xl
                  p-2
                  flex
                  flex-col
                  sm:flex-row
                  items-center
                  gap-2
                  animate-fade-in
                "
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex items-center flex-1 w-full">

                  <div className="pl-4 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder="Search by location, theme, or amenities..."
                    className="
                      flex-1
                      px-4
                      py-3
                      bg-transparent
                      text-gray-800
                      placeholder-gray-400
                      outline-none
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={() => scrollToSection('rooms')}
                  className="
                    w-full
                    sm:w-auto
                    px-8
                    py-3
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    rounded-xl
                    font-semibold
                    transition-colors
                  "
                >
                  Search
                </button>
              </div>

            </div>
          </div>

          {/* SCROLL INDICATOR */}
          <button
            type="button"
            onClick={() => scrollToSection('rooms')}
            className="
              absolute
              bottom-7
              left-1/2
              -translate-x-1/2
              z-10
              text-white/70
              hover:text-white
            "
          >
            <svg
              className="w-7 h-7 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </section>

        {/* Roomie Showcase Section */}
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Heading */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                More than just a place to stay
              </h2>

              <p className="text-gray-500 max-w-2xl mx-auto">
                Explore spaces designed around comfort, convenience, and the way you want to stay.
              </p>
            </div>


            {/* Tabs */}
            <div className="border-b border-gray-300 mb-10">
              <div className="flex justify-center gap-8 md:gap-16 overflow-x-auto">

                <button
                  onClick={() => setActiveShowcase('rooms')}
                  className={`pb-4 text-sm md:text-base whitespace-nowrap transition-all ${
                    activeShowcase === 'rooms'
                      ? 'text-gray-900 border-b-2 border-blue-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Rooms
                </button>

                <button
                  onClick={() => setActiveShowcase('booking')}
                  className={`pb-4 text-sm md:text-base whitespace-nowrap transition-all ${
                    activeShowcase === 'booking'
                      ? 'text-gray-900 border-b-2 border-blue-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Easy Booking
                </button>

                <button
                  onClick={() => setActiveShowcase('tours')}
                  className={`pb-4 text-sm md:text-base whitespace-nowrap transition-all ${
                    activeShowcase === 'tours'
                      ? 'text-gray-900 border-b-2 border-blue-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  3D Tours
                </button>

                <button
                  onClick={() => setActiveShowcase('spaces')}
                  className={`pb-4 text-sm md:text-base whitespace-nowrap transition-all ${
                    activeShowcase === 'spaces'
                      ? 'text-gray-900 border-b-2 border-blue-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Living Spaces
                </button>

              </div>
            </div>


            {/* ROOMS */}
            {activeShowcase === 'rooms' && (
              <div className=" grid md:grid-cols-2 bg-gray-50 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 ">

                <div className="h-[300px] md:h-[430px]">
                  <img
                    src="/images/room1/rooms.jpg"
                    alt="Roomie bedroom"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center">
                  <div className="p-8 md:p-14">

                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">
                      Comfortable stays
                    </span>

                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-5">
                      Your space, your comfort
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      Find rooms that match your style, needs, and budget. From simple
                      modern spaces to premium stays, Roomie helps you discover a place
                      that feels right before you book.
                    </p>

                  </div>
                </div>

              </div>
            )}


            {/* EASY BOOKING */}
            {activeShowcase === 'booking' && (
              <div className=" grid md:grid-cols-2 bg-gray-50 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 ">

                <div className="h-[300px] md:h-[430px]">
                  <img
                    src="/images/room1/eb-room.jpg"
                    alt="Easy room booking"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center">
                  <div className="p-8 md:p-14">

                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">
                      Simple process
                    </span>

                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-5">
                      Booking made easier
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      Browse available rooms, check the details, and choose the stay
                      that works for you without going through a complicated process.
                    </p>

                  </div>
                </div>

              </div>
            )}


            {/* 3D TOURS */}
            {activeShowcase === 'tours' && (
              <div className=" grid md:grid-cols-2 bg-gray-50 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 ">

                <div className="h-[300px] md:h-[430px]">
                  <img
                    src="/images/room1/3d-room.jpg"
                    alt="Room 3D tour"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center">
                  <div className="p-8 md:p-14">

                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">
                      Explore before booking
                    </span>

                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-5">
                      See the room before you stay
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      Explore available spaces through immersive 3D tours so you can
                      better understand the room layout before making your decision.
                    </p>

                  </div>
                </div>

              </div>
            )}


            {/* LIVING SPACES */}
            {activeShowcase === 'spaces' && (
              <div className=" grid md:grid-cols-2 bg-gray-50 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 ">

                <div className="h-[300px] md:h-[430px]">
                  <img
                    src="/images/room1/ls-room.jpg"
                    alt="Roomie living space"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center">
                  <div className="p-8 md:p-14">

                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">
                      Spaces that fit you
                    </span>

                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-5">
                      Designed for everyday living
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      Discover spaces where you can rest, work, and feel comfortable,
                      whether you're staying for a night or for a longer period.
                    </p>

                  </div>
                </div>

              </div>
            )}

          </div>
        </section>

        {/* ================= HOW IT WORKS PREVIEW ================= */}
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Heading */}
            <div className="text-center mb-12 md:mb-14">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                see how Roomie works
              </h2>

              <p className="mt-5 text-gray-600 text-sm md:text-base">
                Finding your next stay should be simple.
              </p>
            </div>


            {/* Main Card */}
            <div
              className="
                grid
                md:grid-cols-[42%_58%]
                bg-white
                rounded-2xl
                overflow-hidden
                shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                min-h-[430px]
              "
            >

              {/* LEFT SIDE */}
              <div className="flex items-center">
                <div className="px-8 py-10 sm:px-10 md:px-12 lg:px-14">

                  <h3
                    className="
                      text-2xl
                      md:text-3xl
                      font-bold
                      text-gray-900
                      leading-tight
                      mb-6
                    "
                  >
                    find the right room
                    <br />
                    without the hassle.
                  </h3>

                  <p
                    className="
                      text-sm
                      md:text-base
                      text-gray-500
                      leading-relaxed
                      mb-7
                      max-w-md
                    "
                  >
                    Browse available rooms, explore their details and amenities,
                    view immersive 3D tours, and choose a space that matches your
                    needs before making your booking.
                  </p>


                  {/* HOW IT WORKS BUTTON */}
                  <button
                    type="button"
                    onClick={onNavigateToHowItWorks}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-6
                      py-3
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      rounded-full
                      text-sm
                      font-semibold
                      shadow-md
                      hover:shadow-lg
                      hover:-translate-y-0.5
                      transition-all
                      duration-300
                    "
                  >
                    How It Works

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14m-6-6l6 6-6 6"
                      />
                    </svg>
                  </button>

                </div>
              </div>


              {/* RIGHT SIDE IMAGE */}
              <div className="relative min-h-[300px] md:min-h-[430px] overflow-hidden">

                <img
                  src="/images/room1/hiw-room.jpg"
                  alt="Roomie room experience"
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-105
                  "
                />

              </div>

            </div>

          </div>
        </section>


        {/* ================= FILTERS ================= */}
        <div
          id="rooms"
          className="container mx-auto px-4 py-8"
        >

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar onSearch={setSearchTerm} />
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            onFilterChange={setAdvancedFilters}
            totalRooms={filteredRooms.length}
          />

          <div className="flex items-center gap-4 mb-8">

            <span className="font-semibold text-gray-700">
              Theme:
            </span>

            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() => setFilterTheme('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterTheme === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Rooms
              </button>

              <button
                onClick={() => setFilterTheme('modern')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterTheme === 'modern'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Modern
              </button>

              <button
                onClick={() => setFilterTheme('rustic')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterTheme === 'rustic'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Rustic
              </button>

              <button
                onClick={() => setFilterTheme('luxury')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterTheme === 'luxury'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Luxury
              </button>

            </div>
          </div>


          {/* ROOM GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={onSelectRoom}
              />
            ))}

          </div>


          {/* NO RESULTS */}
          {filteredRooms.length === 0 && (
            <div className="text-center py-16">

              <svg
                className="w-20 h-20 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>

              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No rooms found
              </h3>

              <p className="text-gray-500">
                Try adjusting your filters
              </p>

            </div>
          )}
        </div>


        {/* ================= FEATURES SECTION ================= */}
        <div
          id="features"
          className="bg-white py-16 mt-16"
        >
          <div className="container mx-auto px-4">

            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Roomie?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

              {/* Feature 1 */}
              <div className="text-center">

                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">

                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>

                </div>

                <h3 className="text-xl font-semibold mb-2">
                  Interactive 3D Tours
                </h3>

                <p className="text-gray-600">
                  Explore apartments in immersive 3D before booking
                </p>

              </div>


              {/* Feature 2 */}
              <div className="text-center">

                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">

                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                </div>

                <h3 className="text-xl font-semibold mb-2">
                  Verified Listings
                </h3>

                <p className="text-gray-600">
                  All properties are verified for quality and accuracy
                </p>

              </div>


              {/* Feature 3 */}
              <div className="text-center">

                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">

                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                </div>

                <h3 className="text-xl font-semibold mb-2">
                  Best Price Guarantee
                </h3>

                <p className="text-gray-600">
                  Competitive rates with transparent pricing
                </p>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutConfirmModal
          userName={user?.name}
          onConfirm={() => {
            logout()
            setShowLogoutModal(false)
            window.location.reload()
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  )
}

export default HomePage