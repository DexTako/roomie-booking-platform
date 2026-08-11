import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import RoomDetailPage from './pages/RoomDetailPage'
import HostDashboard from './pages/HostDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyBookingsPage from './pages/MyBookingsPage'
import MyProfilePage from './pages/MyProfilePage'
import SettingsPage from './pages/SettingsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import ContactPage from './pages/ContactPage'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'
import { getRoomById } from './data/rooms'
import { useAuth } from './context/AuthContext'

function App() {
  const { user, isLoading: authLoading } = useAuth()
  const [currentView, setCurrentView] = useState('home') // 'home', 'detail', 'host', 'admin', 'login', 'register', 'myBookings', 'myProfile', 'settings', 'howItWorks', 'contact'
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 second loading screen for polish
    
    return () => clearTimeout(timer)
  }, [])

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId)
    setCurrentView('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedRoomId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToHost = () => {
    // Check if user is logged in as host
    if (!user) {
      setCurrentView('login')
      return
    }
    
    if (user.role !== 'host') {
      showToast('Only hosts can access the Host Dashboard. Please login as a host.', 'error')
      return
    }
    
    setCurrentView('host')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToAdmin = () => {
    // Check if user is logged in as admin
    if (!user) {
      setCurrentView('login')
      return
    }
    
    if (user.role !== 'admin') {
      showToast('Only administrators can access the Admin Dashboard.', 'error')
      return
    }
    
    setCurrentView('admin')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToLogin = () => {
    setCurrentView('login')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToRegister = () => {
    setCurrentView('register')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToMyBookings = () => {
    setCurrentView('myBookings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToMyProfile = () => {
    setCurrentView('myProfile')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToSettings = () => {
    setCurrentView('settings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToHowItWorks = () => {
    setCurrentView('howItWorks')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateToContact = () => {
    setCurrentView('contact')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  const selectedRoom = selectedRoomId ? getRoomById(selectedRoomId) : null

  if (isLoading || authLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView !== 'login' && currentView !== 'register' && (
        <Navbar 
          onNavigateToHost={handleNavigateToHost}
          onNavigateToAdmin={handleNavigateToAdmin}
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToRegister={handleNavigateToRegister}
          onNavigateToMyBookings={handleNavigateToMyBookings}
          onNavigateToMyProfile={handleNavigateToMyProfile}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToHowItWorks={handleNavigateToHowItWorks}
          onNavigateToContact={handleNavigateToContact}
          onNavigateToHome={handleBackToHome}
          onShowToast={showToast}
        />
      )}
      
      {currentView === 'home' ? (
        <HomePage onSelectRoom={handleSelectRoom} />
      ) : currentView === 'host' ? (
        <HostDashboard onBack={handleBackToHome} />
      ) : currentView === 'admin' ? (
        <AdminDashboard onBack={handleBackToHome} />
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
      ) : (
        selectedRoom && (
          <RoomDetailPage 
            room={selectedRoom} 
            onBack={handleBackToHome}
          />
        )
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Footer - Don't show on login/register/howItWorks/contact pages */}
      {!['login', 'register', 'howItWorks', 'contact'].includes(currentView) && (
        <footer className="mt-16 bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">© 2024 Roomie - Immersive Room Booking Platform</p>
            <p className="text-sm text-gray-500 mt-2">Advanced Web Application Project - IT 305W</p>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
