import { useRef } from 'react'

function BookingReceipt({ booking, room, onClose }) {
  const receiptRef = useRef()
  const receiptId = `receipt-${booking._id || booking.id || Date.now()}`

  console.log('📄 BookingReceipt received booking:', booking)
  console.log('📄 Booking price fields:', {
    nights: booking.nights,
    pricePerNight: booking.pricePerNight,
    subtotal: booking.subtotal,
    serviceFee: booking.serviceFee,
    totalPrice: booking.totalPrice
  })

  // Calculate price details if missing (for old bookings)
  const calculateMissingPrices = () => {
    if (booking.pricePerNight && booking.subtotal && booking.serviceFee) {
      console.log('✅ Using booking price data')
      return { 
        pricePerNight: booking.pricePerNight,
        subtotal: booking.subtotal,
        serviceFee: booking.serviceFee,
        nights: booking.nights
      }
    }

    console.log('⚠️ Calculating fallback prices')
    // Fallback calculation if prices are missing
    const total = booking.totalPrice || booking.total || 0
    const nights = booking.nights || 0
    const serviceFee = booking.serviceFee || (total * 0.1) // 10% service fee
    const subtotal = total - serviceFee
    const pricePerNight = nights > 0 ? subtotal / nights : 0

    return { pricePerNight, subtotal, serviceFee, nights }
  }

  const prices = calculateMissingPrices()
  console.log('💰 Final prices to display:', prices)

  const handlePrint = () => {
    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank')
    const receiptContent = document.getElementById(receiptId)
    
    if (printWindow && receiptContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${booking._id?.slice(-8).toUpperCase() || 'BOOKING'}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                padding: 20px;
                background: white;
              }
              @media print {
                @page {
                  margin: 1cm;
                }
              }
            </style>
            <style>
              ${getComputedStyles()}
            </style>
          </head>
          <body>
            ${receiptContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const getComputedStyles = () => {
    // Copy essential Tailwind styles
    return `
      .text-center { text-align: center; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 0.75rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mb-8 { margin-bottom: 2rem; }
      .mt-1 { margin-top: 0.25rem; }
      .mt-2 { margin-top: 0.5rem; }
      .mt-4 { margin-top: 1rem; }
      .p-4 { padding: 1rem; }
      .p-6 { padding: 1.5rem; }
      .pt-3 { padding-top: 0.75rem; }
      .pt-6 { padding-top: 1.5rem; }
      .pb-2 { padding-bottom: 0.5rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .text-xs { font-size: 0.75rem; }
      .text-sm { font-size: 0.875rem; }
      .text-lg { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .text-2xl { font-size: 1.5rem; }
      .text-3xl { font-size: 1.875rem; }
      .text-6xl { font-size: 3.75rem; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-mono { font-family: ui-monospace, monospace; }
      .text-gray-500 { color: #6b7280; }
      .text-gray-600 { color: #4b5563; }
      .text-gray-700 { color: #374151; }
      .text-gray-900 { color: #111827; }
      .text-blue-600 { color: #2563eb; }
      .text-green-600 { color: #16a34a; }
      .text-green-800 { color: #166534; }
      .text-yellow-600 { color: #ca8a04; }
      .bg-gray-50 { background-color: #f9fafb; }
      .bg-green-100 { background-color: #dcfce7; }
      .bg-blue-50 { background-color: #eff6ff; }
      .border-2 { border-width: 2px; }
      .border-t-2 { border-top-width: 2px; }
      .border-gray-200 { border-color: #e5e7eb; }
      .border-gray-300 { border-color: #d1d5db; }
      .border-blue-200 { border-color: #bfdbfe; }
      .rounded-xl { border-radius: 0.75rem; }
      .rounded-full { border-radius: 9999px; }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .items-end { align-items: flex-end; }
      .justify-between { justify-content: space-between; }
      .justify-center { justify-content: center; }
      .gap-2 { gap: 0.5rem; }
      .gap-3 { gap: 0.75rem; }
      .gap-4 { gap: 1rem; }
      .space-y-2 > * + * { margin-top: 0.5rem; }
      .space-y-3 > * + * { margin-top: 0.75rem; }
      .space-y-4 > * + * { margin-top: 1rem; }
      .space-y-6 > * + * { margin-top: 1.5rem; }
      .w-8 { width: 2rem; }
      .h-8 { height: 2rem; }
      .w-16 { width: 4rem; }
      .h-16 { height: 4rem; }
      .inline-block { display: inline-block; }
      .inline-flex { display: inline-flex; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .tracking-wider { letter-spacing: 0.05em; }
    `
  }

  const handleDownloadPDF = async () => {
    // Use browser's print to PDF functionality
    window.print()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header - No Print */}
          <div className="no-print p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Booking Confirmed! 🎉</h2>
                <p className="text-blue-100 text-sm mt-1">Your receipt is ready</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Receipt Content - Printable */}
          <div id={receiptId} className="flex-1 overflow-y-auto p-8">
            
            {/* Receipt Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold mb-4">
                R
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Roomie Booking</h1>
              <p className="text-gray-600">Official Booking Receipt</p>
              <div className="mt-4 inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                ✓ Payment {booking.paymentStatus === 'completed' ? 'Completed' : 'Pending'}
              </div>
            </div>

            <div className="border-t-2 border-gray-300 my-6"></div>

            {/* Booking Details */}
            <div className="space-y-6">
              
              {/* Confirmation Number */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Confirmation Number</div>
                <div className="text-2xl font-bold text-blue-600 font-mono tracking-wider">
                  {booking._id?.slice(-8).toUpperCase() || 'PENDING'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Booked on {formatDateTime(booking.createdAt || new Date())}
                </div>
              </div>

              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Guest Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{booking.renterName || booking.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{booking.renterEmail || booking.guestEmail}</span>
                  </div>
                  {(booking.renterPhone || booking.guestPhone) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-900">{booking.renterPhone || booking.guestPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold text-gray-900">{booking.guests}</span>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🏠</span>
                  Room Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="font-bold text-lg text-gray-900 mb-2">{room?.name || booking.roomName}</div>
                  <div className="text-gray-600 text-sm">{room?.location || 'Location'}</div>
                </div>
              </div>

              {/* Stay Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Stay Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Check-in</div>
                      <div className="font-semibold text-gray-900">{formatDate(booking.checkIn)}</div>
                      <div className="text-xs text-gray-500">After 2:00 PM</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Check-out</div>
                      <div className="font-semibold text-gray-900">{formatDate(booking.checkOut)}</div>
                      <div className="text-xs text-gray-500">Before 11:00 AM</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total nights:</span>
                      <span className="font-bold text-gray-900 text-lg">{booking.nights}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Price Breakdown
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>${prices.pricePerNight.toFixed(2)} × {prices.nights} {prices.nights === 1 ? 'night' : 'nights'}</span>
                    <span className="font-semibold">${prices.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service fee</span>
                    <span className="font-semibold">${prices.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total (USD)</span>
                      <span className="text-2xl font-bold text-blue-600">${(booking.totalPrice || booking.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment method:</span>
                    <span className="font-semibold text-gray-900">
                      {booking.paymentDetails || booking.paymentMethod || 'Card'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${
                      booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {booking.paymentStatus === 'completed' ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                  {booking.paymentIntentId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="text-gray-600 font-mono">{booking.paymentIntentId.slice(-12)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Special Requests
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700">{booking.specialRequests}</p>
                  </div>
                </div>
              )}

              {/* Important Information */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 mb-2">📋 Important Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please bring a valid ID for check-in</li>
                  <li>• Your host will confirm this booking within 24 hours</li>
                  <li>• Check-in: After 2:00 PM | Check-out: Before 11:00 AM</li>
                  <li>• Cancellation policy: Free cancellation up to 48 hours before check-in</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 pt-6 border-t-2 border-gray-200">
                <p>Thank you for choosing Roomie!</p>
                <p className="mt-1">Questions? Contact us at support@roomie.com</p>
                <p className="mt-4 text-xs">This is an official receipt for your booking.</p>
              </div>

            </div>
          </div>

          {/* Action Buttons - No Print */}
          <div className="no-print p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Save as PDF
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default BookingReceipt
