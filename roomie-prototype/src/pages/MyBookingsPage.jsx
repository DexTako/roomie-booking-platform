import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllBookings } from '../data/bookings'
import { getRoomById } from '../data/rooms'

function MyBookingsPage({ onBack, onViewRoom }) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, upcoming, past, pending

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = () => {
    const allBookings = getAllBookings()
    // Filter bookings for current user (by email for now)
    const userBookings = allBookings.filter(b => b.renterEmail === user?.email)
    setBookings(userBookings)
  }

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0]
    
    switch(filter) {
      case 'upcoming':
        return bookings.filter(b => b.checkIn >= today && (b.status === 'approved' || b.status === 'pending'))
      case 'past':
        return bookings.filter(b => b.checkOut < today || b.status === 'completed')
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
      case 'approved': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your room reservations</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All Bookings', count: bookings.length },
            { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.checkIn >= new Date().toISOString().split('T')[0] && (b.status === 'approved' || b.status === 'pending')).length },
            { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
            { id: 'past', label: 'Past', count: bookings.filter(b => b.checkOut < new Date().toISOString().split('T')[0] || b.status === 'completed').length }
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
              const room = getRoomById(booking.roomId)
              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Room Image */}
                    <div className="md:w-48 h-48 md:h-auto">
                      <img
                        src={room?.images?.[0] || '/placeholder.jpg'}
                        alt={booking.roomName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{booking.roomName}</h3>
                          <p className="text-sm text-gray-600 mt-1">Booking ID: #{booking.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold">{new Date(booking.checkIn).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold">{new Date(booking.checkOut).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Guests</p>
                          <p className="font-semibold">{booking.guests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-semibold text-blue-600">${booking.totalPrice.toFixed(2)}</p>
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
                          onClick={() => onViewRoom(booking.roomId)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          View Room
                        </button>
                        {booking.status === 'approved' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Contact Host
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
      </div>
    </div>
  )
}

export default MyBookingsPage
