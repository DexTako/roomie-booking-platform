import { useRef } from 'react'

function BookingReceipt({ booking, room, onClose }) {
  const receiptRef = useRef()
  const receiptId = `receipt-${booking._id || booking.id || Date.now()}`

  const handlePrint = () => {
    window.print()
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
      {/* Print styles */}
      <style>{`
        @media print {
          /* NUCLEAR OPTION: Hide absolutely everything */
          body,
          body > *,
          body > * > *,
          #root,
          #root > * {
            display: none !important;
            visibility: hidden !important;
            overflow: hidden !important;
          }
          
          /* Only show this specific receipt and its parents */
          #${receiptId} {
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            padding: 20px !important;
            z-index: 999999 !important;
            overflow: visible !important;
          }
          
          #${receiptId},
          #${receiptId} * {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Make sure flex/grid children display correctly */
          #${receiptId} .flex,
          #${receiptId} .grid {
            display: flex !important;
          }
          
          #${receiptId} .grid {
            display: grid !important;
          }
          
          /* Hide elements with no-print class */
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Remove all decorative effects */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            animation: none !important;
            transition: none !important;
          }
          
          /* Page setup */
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
          
          /* Remove page breaks inside important sections */
          #${receiptId} > * {
            page-break-inside: avoid;
          }
        }
      `}</style>

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
                    <span>${booking.pricePerNight || 0} × {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</span>
                    <span className="font-semibold">${(booking.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service fee</span>
                    <span className="font-semibold">${(booking.serviceFee || 0).toFixed(2)}</span>
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
