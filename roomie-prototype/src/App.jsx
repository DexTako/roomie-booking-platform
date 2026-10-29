import { useState, useEffect, lazy, Suspense } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'
import StaffHeader from './components/StaffHeader'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'
import Footer from './components/Footer'
import VerifyEmailBanner from './components/VerifyEmailBanner'
import api from './services/api'
import { useAuth } from './context/AuthContext'
import { useComparison } from './context/ComparisonContext'

// Pages are loaded only when they are opened (smaller first download, faster home page,
// and the heavy 3D room viewer is fetched only when someone opens a room).
const RoomDetailPage = lazy(() => import('./pages/RoomDetailPage'))
const HostDashboard = lazy(() => import('./pages/HostDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'))
const MyWishlistPage = lazy(() => import('./pages/MyWishlistPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Loading...</div>
)

function App() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const { comparisonCount } = useComparison()

  const [viewState, setCurrentView] = useState('home')
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [resetToken, setResetToken] = useState(null)

  // Opened from the "confirm your email" link: https://site/?verify=TOKEN
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('verify')
    if (!token) return
    window.history.replaceState({}, '', window.location.pathname)
    api.auth.verifyEmail(token)
      .then((res) => {
        showToast(res.message, 'success')
        refreshUser()
      })
      .catch((error) => showToast(error.message, 'error'))
  }, [])

  // Opened from the password reset email: https://site/?reset=TOKEN
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('reset')
    if (token) {
      setResetToken(token)
      setCurrentView('resetPassword')
      // remove the token from the address bar
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

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


  // TERMS OF SERVICE / PRIVACY POLICY
  const handleNavigateToLegal = (type) => {
    setCurrentView(type === 'privacy' ? 'privacy' : 'terms')

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
        <StaffHeader onLoggedOut={handleBackToHome} onShowToast={showToast} />
      )}

      {!isStaff && ![
        'home',
        'login',
        'register',
        'resetPassword'
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

      <Suspense fallback={<PageLoader />}>
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
          
          onShowToast={showToast}
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

      ) : currentView === 'resetPassword' ? (

        <ResetPasswordPage
          token={resetToken}
          onGoToLogin={handleNavigateToLogin}
          onRequestNewLink={handleNavigateToLogin}
        />

      ) : currentView === 'terms' || currentView === 'privacy' ? (

        <LegalPage
          type={currentView}
          onBack={handleBackToHome}
          onNavigate={handleNavigateToLegal}
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
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )

      )}
      </Suspense>

      <VerifyEmailBanner onShowToast={showToast} />


      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}


      {/* FOOTER - same on every page (login/register have their own compact one) */}
      {!isStaff && !['login', 'register', 'resetPassword'].includes(currentView) && (
        <Footer
          onNavigateToHome={handleBackToHome}
          onNavigateToHowItWorks={handleNavigateToHowItWorks}
          onNavigateToContact={handleNavigateToContact}
          onNavigateToTerms={() => handleNavigateToLegal('terms')}
          onNavigateToPrivacy={() => handleNavigateToLegal('privacy')}
        />
      )}

    </div>
  )
}

export default App
