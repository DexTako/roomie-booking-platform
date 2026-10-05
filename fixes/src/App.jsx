import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import RoomDetailPage from './pages/RoomDetailPage'
import HostDashboard from './pages/HostDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyBookingsPage from './pages/MyBookingsPage'
import MyProfilePage from './pages/MyProfilePage'
import MyWishlistPage from './pages/MyWishlistPage'
import ComparisonPage from './pages/ComparisonPage'
import SettingsPage from './pages/SettingsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'
import StaffHeader from './components/StaffHeader'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'
import api from './services/api'
import { useAuth } from './context/AuthContext'
import { useComparison } from './context/ComparisonContext'

function App() {
  const { user, isLoading: authLoading } = useAuth()
  const { comparisonCount } = useComparison()

  const [viewState, setCurrentView] = useState('home')
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // ROLE-BASED VIEWS
  // Host and admin only ever see their own dashboard (no customer pages).
  // Guests and customers can never reach a dashboard.
  const isStaff = user?.role === 'host' || user?.role === 'admin'
  const staffView = user?.role === 'admin' ? 'admin' : 'host'
  const currentView = isStaff
    ? staffView
    : (viewState === 'host' || viewState === 'admin' ? 'home' : viewState)

  // Initial loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])


  // SELECT ROOM
  const handleSelectRoom = async roomId => {
    let room = null
    try {
      room = await api.getRoomById(roomId)
    } catch (error) {
      console.error('Failed to load room:', error)
    }

    // If room doesn't exist, show 404
    if (!room || (!room._id && !room.id)) {
      setCurrentView('notFound')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSelectedRoom(room)
    setSelectedRoomId(roomId)
    setCurrentView('detail')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // HOME
  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedRoomId(null)
    setSelectedRoom(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // LOGIN
  const handleNavigateToLogin = () => {
    setCurrentView('login')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // REGISTER
  const handleNavigateToRegister = () => {
    setCurrentView('register')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // MY BOOKINGS
  const handleNavigateToMyBookings = () => {
    setCurrentView('myBookings')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // WISHLIST
  const handleNavigateToWishlist = () => {
    setCurrentView('myWishlist')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // COMPARISON
  const handleNavigateToComparison = () => {
    setCurrentView('comparison')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // PROFILE
  const handleNavigateToMyProfile = () => {
    setCurrentView('myProfile')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // SETTINGS
  const handleNavigateToSettings = () => {
    setCurrentView('settings')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // HOW IT WORKS
  const handleNavigateToHowItWorks = () => {
    setCurrentView('howItWorks')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // CONTACT
  const handleNavigateToContact = () => {
    setCurrentView('contact')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // TOAST
  const showToast = (message, type = 'success') => {
    setToast({
      message,
      type
    })
  }


  const hideToast = () => {
    setToast(null)
  }


  // LOADING
  if (isLoading || authLoading) {
    return <LoadingScreen />
  }


  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* 
        ORIGINAL NAVBAR

        Do NOT show it on home because HomePage
        has the new glass navbar.

        It will still be used on the other pages.
      */}
      {isStaff && (
        <StaffHeader onLoggedOut={handleBackToHome} />
      )}

      {!isStaff && ![
        'home',
        'login',
        'register'
      ].includes(currentView) && (
        <Navbar
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToRegister={handleNavigateToRegister}
          onNavigateToMyBookings={handleNavigateToMyBookings}
          onNavigateToWishlist={handleNavigateToWishlist}
          onNavigateToComparison={handleNavigateToComparison}
          onNavigateToMyProfile={handleNavigateToMyProfile}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToHowItWorks={handleNavigateToHowItWorks}
          onNavigateToContact={handleNavigateToContact}
          onNavigateToHome={handleBackToHome}
          onShowToast={showToast}
          comparisonCount={comparisonCount}
        />
      )}


      {/* ================= PAGES ================= */}

      {currentView === 'home' ? (

        <HomePage
          user={user}
          onSelectRoom={handleSelectRoom}

          onNavigateToHome={handleBackToHome}

          onNavigateToLogin={handleNavigateToLogin}

          onNavigateToRegister={handleNavigateToRegister}

          onNavigateToMyBookings={handleNavigateToMyBookings}

          onNavigateToWishlist={handleNavigateToWishlist}

          onNavigateToComparison={handleNavigateToComparison}

          onNavigateToMyProfile={handleNavigateToMyProfile}

          onNavigateToSettings={handleNavigateToSettings}

          onNavigateToHowItWorks={handleNavigateToHowItWorks}

          onNavigateToContact={handleNavigateToContact}
        />

      ) : currentView === 'host' ? (

        <HostDashboard />

      ) : currentView === 'admin' ? (

        <AdminDashboard />

      ) : currentView === 'login' ? (

        <LoginPage
          onBack={handleBackToHome}
          onSwitchToRegister={handleNavigateToRegister}
          onShowToast={showToast}
        />

      ) : currentView === 'register' ? (

        <RegisterPage
          onBack={handleBackToHome}
          onSwitchToLogin={handleNavigateToLogin}
          onShowToast={showToast}
        />

      ) : currentView === 'myBookings' ? (

        <MyBookingsPage
          onBack={handleBackToHome}
          onViewRoom={handleSelectRoom}
        />

      ) : currentView === 'myWishlist' ? (

        <MyWishlistPage
          onBack={handleBackToHome}
          onViewRoom={handleSelectRoom}
        />

      ) : currentView === 'comparison' ? (

        <ComparisonPage
          onBack={handleBackToHome}
          onViewRoom={handleSelectRoom}
        />

      ) : currentView === 'myProfile' ? (

        <MyProfilePage
          onBack={handleBackToHome}
          onShowToast={showToast}
        />

      ) : currentView === 'settings' ? (

        <SettingsPage
          onBack={handleBackToHome}
          onShowToast={showToast}
        />

      ) : currentView === 'howItWorks' ? (

        <HowItWorksPage
          onBack={handleBackToHome}
        />

      ) : currentView === 'contact' ? (

        <ContactPage
          onBack={handleBackToHome}
          onShowToast={showToast}
        />

      ) : currentView === 'notFound' ? (

        <NotFoundPage
          onNavigateToHome={handleBackToHome}
        />

      ) : (

        selectedRoom && (
          <RoomDetailPage
            room={selectedRoom}
            onBack={handleBackToHome}
          />
        )

      )}


      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}


      {/* FOOTER */}
      {!isStaff && ![
        'login',
        'register',
        'howItWorks',
        'contact',
        'notFound'
      ].includes(currentView) && (

        <footer className="mt-16 bg-gray-800 text-white py-8">

          <div className="container mx-auto px-4 text-center">

            <p className="text-gray-400">
              © 2024 Roomie - Immersive Room Booking Platform
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Advanced Web Application Project - IT 305W
            </p>

          </div>

        </footer>

      )}

    </div>
  )
}

export default App
