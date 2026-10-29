import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { todayISO, formatMoney, formatDateLabel } from '../utils/pricing'
import api from '../services/api'
import Breadcrumb from '../components/Breadcrumb'
import ConfirmationModal from '../components/ConfirmationModal'
import NotificationModal from '../components/NotificationModal'
import BookingMessagesModal from '../components/BookingMessagesModal'

// Booking statuses that still count as a live reservation.
// The backend uses 'approved' (older code used 'confirmed'), so accept both.
const ACTIVE_STATUSES = ['pending', 'approved', 'confirmed']

// Backend sends ISO timestamps (checkIn/checkOut). The page works with YYYY-MM-DD.
const toDay = (value) => (value ? String(value).slice(0, 10) : '')

function MyBookingsPage({ onBack, onViewRoom }) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past, pending
  const [messageBooking, setMessageBooking] = useState(null)
  const [unreadByBooking, setUnreadByBooking] = useState({})
  
  // Modal states
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false })
  const [notificationModal, setNotificationModal] = useState({ isOpen: false })

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true)
      try {
        const data = await api.getAllRooms()
        setRooms(data)
      } catch (error) {
        console.error('Failed to fetch rooms:', error)
      } finally {
        setIsLoadingRooms(false)
      }
    }

    fetchRooms()
  }, [])

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    if (!(user?.id || user?._id)) return
    
    setIsLoadingBookings(true)
    try {
      const data = await api.getUserBookings()
      // Map the backend field names (checkIn, checkOut, guests) to what this page uses
      setBookings((data || []).map(b => ({
        ...b,
        checkInDate: b.checkInDate || toDay(b.checkIn),
        checkOutDate: b.checkOutDate || toDay(b.checkOut),
        numberOfGuests: b.numberOfGuests || b.guests
      })))
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const loadUnread = async () => {
    try {
      const res = await api.messages.getUnread()
      setUnreadByBooking(res.byBooking || {})
    } catch {
      // badges are optional, ignore errors
    }
  }

  useEffect(() => {
    if (user) {
      loadUnread()
      const timer = setInterval(loadUnread, 30000)
      return () => clearInterval(timer)
    }
  }, [user])

  const handleCancel = async (bookingId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Cancel Booking?',
      message: 'Are you sure you want to cancel this booking request? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const result = await api.cancelBooking(bookingId)
          // Refresh bookings after cancellation
          loadBookings()
          setNotificationModal({
            isOpen: true,
            title: 'Booking Cancelled',
            // includes "Your PayPal payment has been refunded." when that applies
            message: (result && result.message ? result.message + '.' : 'Your booking has been cancelled successfully.').replace('..', '.'),
            type: 'info'
          })
        } catch (error) {
          console.error('Failed to cancel booking:', error)
          setNotificationModal({
            isOpen: true,
            title: 'Cancellation Failed', 
            message: error.message || 'Failed to cancel booking. Please try again.',
            type: 'error'
          })
        }
      }
    })
  }

  const getRoomById = (id) => {
    return rooms.find(room => room.id === parseInt(id) || room._id === id)
  }

  // Upcoming = still active and the stay has not ended yet (so a stay in progress counts too)
  const isUpcoming = (b) => ACTIVE_STATUSES.includes(b.status) && b.checkOutDate >= todayISO()
  const isPast = (b) => b.checkOutDate < todayISO() || b.status === 'completed'

  const getFilteredBookings = () => {
    switch(filter) {
      case 'upcoming':
        return bookings
          .filter(isUpcoming)
          .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))
      case 'past':
        return bookings.filter(isPast)
      case 'pending':
        return bookings.filter(b => b.status === 'pending')
      default:
        return bookings
    }
  }

  const filteredBookings = getFilteredBookings()

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
      case 'approved': return 'bg-green-100 text-green-800'
      case 'declined':
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isLoading = isLoadingRooms || isLoadingBookings

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', onClick: onBack },
            { label: 'My Bookings' }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your room reservations</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-1 flex gap-2 mb-6">
              {[
                { id: 'all', label: 'All Bookings', count: bookings.length },
                { id: 'upcoming', label: 'Upcoming', count: bookings.filter(isUpcoming).length },
                { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
                { id: 'past', label: 'Past', count: bookings.filter(isPast).length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    filter === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Start exploring rooms!"
                : `No ${filter} bookings at this time.`}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => {
              const room = getRoomById(booking.roomId?._id || booking.roomId)
              const roomName = booking.roomId?.name || 'Room'
              const roomImage = booking.roomId?.galleryImages?.[0] || booking.roomId?.images?.[0] || room?.galleryImages?.[0] || '/placeholder.jpg'
              
              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Room Image */}
                    <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={roomImage}
                        alt={roomName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{roomName}</h3>
                          <p className="text-sm text-gray-600 mt-1">Booking ID: #{booking._id.slice(-8)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold">{formatDateLabel(booking.checkInDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold">{formatDateLabel(booking.checkOutDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Guests</p>
                          <p className="font-semibold">{booking.numberOfGuests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-semibold text-blue-600">{formatMoney(booking.totalPrice)}</p>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Special Requests:</p>
                          <p className="text-sm italic text-gray-700">"{booking.specialRequests}"</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => onViewRoom(booking.roomId?._id || booking.roomId)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          View Room
                        </button>
                        {ACTIVE_STATUSES.includes(booking.status) && booking.checkOutDate >= todayISO() && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            Cancel Booking
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => setMessageBooking(booking)}
                            className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Contact Host
                            {unreadByBooking[booking._id] > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                                {unreadByBooking[booking._id]}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
          </>
        )}

      {/* Messages with the host */}
      {messageBooking && (
        <BookingMessagesModal
          bookingId={messageBooking._id}
          title={`Message the host · ${messageBooking.roomId?.name || 'Room'}`}
          subtitle={`${formatDateLabel(messageBooking.checkInDate)} → ${formatDateLabel(messageBooking.checkOutDate)}`}
          onClose={() => {
            setMessageBooking(null)
            loadUnread()
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type="danger"
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({ ...notificationModal, isOpen: false })}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />
      </div>
    </div>
  )
}

export default MyBookingsPage
