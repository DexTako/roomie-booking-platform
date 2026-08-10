import { useState } from 'react'

function BookingRequestCard({ booking, onApprove, onDecline }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    return nights
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    // Simulate API delay
    setTimeout(() => {
      onApprove(booking.id)
      setIsProcessing(false)
    }, 500)
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    // Simulate API delay
    setTimeout(() => {
      onDecline(booking.id)
      setIsProcessing(false)
    }, 500)
  }

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Approved
          </span>
        )
      case 'declined':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            ✗ Declined
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            ✓ Completed
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with Room Name and Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {booking.roomName}
          </h3>
          <p className="text-sm text-gray-500">Booking ID: #{booking.id}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Renter Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Guest Information</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-gray-900">{booking.renterName}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-600">{booking.renterEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-gray-600">{booking.renterPhone}</span>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Check-in */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Check-in</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
        </div>
        {/* Check-out */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Check-out</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
        </div>
        {/* Nights */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Nights</p>
          <p className="text-sm font-semibold text-gray-900">{calculateNights()} nights</p>
        </div>
        {/* Guests */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-1">Guests</p>
          <p className="text-sm font-semibold text-gray-900">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
        </div>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-700 font-semibold mb-1">Special Requests:</p>
          <p className="text-sm text-blue-900">{booking.specialRequests}</p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>${booking.pricePerNight} × {booking.nights} nights</span>
            <span>${booking.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Service fee</span>
            <span>${booking.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>${booking.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Only show for pending bookings */}
      {booking.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              '✓ Approve Booking'
            )}
          </button>
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              '✗ Decline'
            )}
          </button>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Requested {new Date(booking.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}

export default BookingRequestCard
