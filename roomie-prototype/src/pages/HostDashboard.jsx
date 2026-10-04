import { useState, useEffect } from 'react'
import BookingRequestCard from '../components/BookingRequestCard'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import { getAllBookings, updateBookingStatus, initializeBookings, subscribeToBookings } from '../data/bookings'
import { rooms } from '../data/rooms'
import {
  countNights,
  addDaysISO,
  todayISO,
  formatDateLabel,
  formatMoney,
  sumRevenue,
  monthlyRevenue
} from '../utils/pricing'

function HostDashboard() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, approved, declined, completed
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [activeView, setActiveView] = useState('list') // list, calendar
  const [guestNotes, setGuestNotes] = useState(() => {
    const saved = localStorage.getItem('hostGuestNotes')
    return saved ? JSON.parse(saved) : {}
  })
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState(null)
  const [calendarRoomId, setCalendarRoomId] = useState(rooms[0]?.id ?? 1)

  // Load bookings on mount
  useEffect(() => {
    initializeBookings()
    loadBookings()
    // Live: refresh whenever a booking is created, approved, declined or cancelled
    return subscribeToBookings(loadBookings)
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

  // Save guest notes
  const saveGuestNote = (bookingId, note) => {
    const updatedNotes = { ...guestNotes, [bookingId]: note }
    setGuestNotes(updatedNotes)
    localStorage.setItem('hostGuestNotes', JSON.stringify(updatedNotes))
    showNotificationMessage('Guest note saved ✓')
    setShowNotesModal(false)
  }

  // Upcoming confirmed stays in the next 30 days
  const getCalendarBookings = () => {
    const today = todayISO()
    const limit = addDaysISO(today, 30)
    return bookings
      .filter(b =>
        (b.status === 'approved' || b.status === 'completed') &&
        b.checkIn >= today &&
        b.checkIn <= limit
      )
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  }

  // Live earnings (recalculated from the bookings every time they change)
  const totalEarnings = sumRevenue(bookings)
  const monthEarnings = monthlyRevenue(bookings)

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

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
            <p className="text-gray-600">Review and respond to booking requests for your rooms</p>
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

            {/* Earnings */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Earnings</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatMoney(totalEarnings)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatMoney(monthEarnings)} this month</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <div className="space-y-6">

          {/* Room occupancy (live, read-only) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h3 className="text-xl font-bold text-gray-900">Room Occupancy</h3>
              <select
                value={calendarRoomId}
                onChange={(e) => setCalendarRoomId(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <AvailabilityCalendar roomId={calendarRoomId} readOnly />
          </div>

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
                  const nights = countNights(booking.checkIn, booking.checkOut)
                  const daysUntil = countNights(todayISO(), booking.checkIn)
                  
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
                              {formatDateLabel(booking.checkIn)} → {formatDateLabel(booking.checkOut)}
                            </span>
                            <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">In {daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
                          <p className="text-lg font-bold text-green-600">{formatMoney(booking.totalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default HostDashboard
