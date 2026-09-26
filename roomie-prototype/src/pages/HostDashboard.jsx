import { useState, useEffect } from 'react'
import BookingRequestCard from '../components/BookingRequestCard'
import Breadcrumb from '../components/Breadcrumb'
import { getAllBookings, updateBookingStatus, initializeBookings } from '../data/bookings'

function HostDashboard({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, approved, declined, completed
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [activeView, setActiveView] = useState('list') // list, calendar, analytics
  const [guestNotes, setGuestNotes] = useState(() => {
    const saved = localStorage.getItem('hostGuestNotes')
    return saved ? JSON.parse(saved) : {}
  })
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState(null)

  // Load bookings on mount
  useEffect(() => {
    initializeBookings()
    loadBookings()
  }, [])

  const loadBookings = () => {
    const allBookings = getAllBookings()
    setBookings(allBookings)
  }

  const handleApprove = (bookingId) => {
    updateBookingStatus(bookingId, 'approved')
    loadBookings() // Reload to show updated status
    showNotificationMessage('Booking approved successfully! ✓')
  }

  const handleDecline = (bookingId) => {
    updateBookingStatus(bookingId, 'declined')
    loadBookings() // Reload to show updated status
    showNotificationMessage('Booking declined.')
  }

  const showNotificationMessage = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  // Calculate earnings
  const calculateEarnings = () => {
    const approvedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'completed')
    const totalEarnings = approvedBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    const monthlyEarnings = approvedBookings
      .filter(b => {
        const bookingDate = new Date(b.checkIn)
        return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear
      })
      .reduce((sum, b) => sum + b.totalPrice, 0)
    
    return { totalEarnings, monthlyEarnings }
  }

  // Calculate occupancy rate
  const calculateOccupancyRate = () => {
    const totalDays = 30 // Last 30 days
    const bookedDays = bookings
      .filter(b => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => {
        const checkIn = new Date(b.checkIn)
        const checkOut = new Date(b.checkOut)
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
    
    return Math.min(Math.round((bookedDays / totalDays) * 100), 100)
  }

  // Calculate response time
  const getResponseStats = () => {
    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const respondedCount = bookings.filter(b => b.status !== 'pending').length
    const responseRate = bookings.length > 0 
      ? Math.round((respondedCount / bookings.length) * 100) 
      : 100
    
    return { responseRate, pendingCount }
  }

  // Save guest notes
  const saveGuestNote = (bookingId, note) => {
    const updatedNotes = { ...guestNotes, [bookingId]: note }
    setGuestNotes(updatedNotes)
    localStorage.setItem('hostGuestNotes', JSON.stringify(updatedNotes))
    showNotificationMessage('Guest note saved ✓')
    setShowNotesModal(false)
  }

  // Get calendar data
  const getCalendarBookings = () => {
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(today.getDate() + 30)
    
    return bookings
      .filter(b => 
        (b.status === 'approved' || b.status === 'completed') &&
        new Date(b.checkIn) >= today &&
        new Date(b.checkIn) <= thirtyDaysLater
      )
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
  }

  const { totalEarnings, monthlyEarnings } = calculateEarnings()
  const occupancyRate = calculateOccupancyRate()
  const { responseRate } = getResponseStats()

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter)

  // Count bookings by status
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const approvedCount = bookings.filter(b => b.status === 'approved').length
  const declinedCount = bookings.filter(b => b.status === 'declined').length
  const completedCount = bookings.filter(b => b.status === 'completed').length

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {notificationMessage}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', onClick: onBack },
            { label: 'Host Dashboard' }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
            <p className="text-gray-600">Manage your property bookings</p>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveView('list')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List View
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeView === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Total Bookings */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                  <p className="text-2xl font-bold text-purple-600">{occupancyRate}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs (only show for list view) */}
          {activeView === 'list' && (
            <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('declined')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'declined'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Declined ({declinedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed ({completedCount})
            </button>
            </div>
          )}
        </div>

        {/* Guest Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Guest Notes</h3>
              <textarea
                defaultValue={guestNotes[currentBookingId] || ''}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this guest..."
                id="guest-note-input"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    const note = document.getElementById('guest-note-input').value
                    saveGuestNote(currentBookingId, note)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && filteredBookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-500">
              {filter === 'pending' 
                ? 'No pending requests at the moment' 
                : filter === 'all'
                ? 'Bookings will appear here once guests make reservations'
                : `You don't have any ${filter} bookings`
              }
            </p>
          </div>
        )}

        {activeView === 'list' && filteredBookings.length > 0 && (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="relative">
                <BookingRequestCard
                  booking={booking}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                />
                {/* Guest Notes Button */}
                <button
                  onClick={() => {
                    setCurrentBookingId(booking.id)
                    setShowNotesModal(true)
                  }}
                  className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                  title="Add guest notes"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {guestNotes[booking.id] && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">Guest Note:</p>
                    <p className="text-sm text-yellow-700">{guestNotes[booking.id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Bookings (Next 30 Days)
            </h3>
            
            {getCalendarBookings().length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No upcoming bookings in the next 30 days</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getCalendarBookings().map((booking) => {
                  const checkIn = new Date(booking.checkIn)
                  const checkOut = new Date(booking.checkOut)
                  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
                  const daysUntil = Math.ceil((checkIn - new Date()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div key={booking.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{booking.roomName}</h4>
                          <p className="text-sm text-gray-700 mt-1">Guest: {booking.renterName}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {checkIn.toLocaleDateString()} → {checkOut.toLocaleDateString()}
                            </span>
                            <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">In {daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
                          <p className="text-lg font-bold text-green-600">${booking.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Total Earnings</h3>
                <p className="text-4xl font-bold mb-2">${totalEarnings.toFixed(2)}</p>
                <p className="text-sm opacity-80">All-time revenue from bookings</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2 opacity-90">This Month</h3>
                <p className="text-4xl font-bold mb-2">${monthlyEarnings.toFixed(2)}</p>
                <p className="text-sm opacity-80">Revenue for {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
              
              <div className="space-y-6">
                {/* Response Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Response Rate</span>
                    <span className="text-lg font-bold text-blue-600">{responseRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${responseRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {responseRate >= 90 ? 'Excellent!' : responseRate >= 75 ? 'Good' : 'Needs improvement'}
                  </p>
                </div>

                {/* Occupancy Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Occupancy Rate (Last 30 days)</span>
                    <span className="text-lg font-bold text-purple-600">{occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {occupancyRate >= 80 ? 'High demand!' : occupancyRate >= 50 ? 'Moderate' : 'Consider promotions'}
                  </p>
                </div>

                {/* Approval Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Approval Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {bookings.length > 0 ? Math.round((approvedCount / bookings.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${bookings.length > 0 ? (approvedCount / bookings.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Approved {approvedCount} out of {bookings.length} total requests
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 mb-1">Average Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${approvedCount > 0 ? (totalEarnings / approvedCount).toFixed(2) : '0.00'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Total Nights Booked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings
                    .filter(b => b.status === 'approved' || b.status === 'completed')
                    .reduce((sum, b) => {
                      const checkIn = new Date(b.checkIn)
                      const checkOut = new Date(b.checkOut)
                      return sum + Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
                    }, 0)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostDashboard
