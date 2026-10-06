import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AvailabilityCalendar from './AvailabilityCalendar'
import PaymentStep from './PaymentStep'
import { EMPTY_PAYMENT, validatePayment, paymentDetailsLabel } from '../utils/payment'
import { findNextAvailableRange, isRangeAvailable } from '../data/bookings'
import { calculateStayPrice, formatDateLabel } from '../utils/pricing'

function BookingWizard({ room, onClose, onComplete, initialDates }) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [dateNotice, setDateNotice] = useState('')
  const [payment, setPayment] = useState(EMPTY_PAYMENT)
  const [paymentErrors, setPaymentErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingData, setBookingData] = useState({
    checkIn: initialDates?.checkIn || '',
    checkOut: initialDates?.checkOut || '',
    guests: 1,
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: '',
    specialRequests: '',
    paymentMethod: 'card'
  })

  const steps = [
    { number: 1, title: 'Dates', icon: '📅' },
    { number: 2, title: 'Details', icon: '👥' },
    { number: 3, title: 'Payment', icon: '💳' }
  ]

  // Live price calculation (shared helper keeps every screen consistent)
  const { nights, subtotal, serviceFee, total } = calculateStayPrice(
    room.pricePerNight,
    bookingData.checkIn,
    bookingData.checkOut
  )

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    const method = bookingData.paymentMethod
    const errors = validatePayment(method, payment)
    setPaymentErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsProcessing(true)
    try {
      // Demo gateway: short fake "processing" pause for non-cash payments.
      // Only a masked label (e.g. "Visa •••• 4242") is sent to the server.
      if (method !== 'cash') await new Promise(resolve => setTimeout(resolve, 1200))
      await onComplete({
        ...bookingData,
        roomId: room.id,
        nights,
        total,
        paymentDetails: paymentDetailsLabel(method, payment)
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return bookingData.checkIn && bookingData.checkOut && nights > 0
    }
    if (currentStep === 2) {
      return bookingData.guestName && bookingData.guestEmail && bookingData.guests > 0
    }
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Book Your Stay</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                    currentStep >= step.number 
                      ? 'bg-white text-blue-600' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-white/60'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Step 1: Select Dates */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">When's your trip?</h3>
                <p className="text-gray-600">Select your check-in and check-out dates</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {nights > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-900 font-semibold">
                        <span className="text-2xl">{nights}</span> {nights === 1 ? 'night' : 'nights'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        ${room.pricePerNight} × {nights} = ${subtotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-700">Total</p>
                      <p className="text-2xl font-bold text-blue-900">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Date Suggestions */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Quick Select:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'This Weekend', days: 2 },
                    { label: 'Next Week', days: 7 },
                    { label: '2 Weeks', days: 14 },
                    { label: '1 Month', days: 30 }
                  ].map(option => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        const today = new Date()
                        const checkIn = new Date(today)
                        checkIn.setDate(today.getDate() + 1)
                        const checkOut = new Date(checkIn)
                        checkOut.setDate(checkIn.getDate() + option.days)
                        
                        setBookingData({
                          ...bookingData,
                          checkIn: checkIn.toISOString().split('T')[0],
                          checkOut: checkOut.toISOString().split('T')[0]
                        })
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Guest Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Guest Details</h3>
                <p className="text-gray-600">Tell us who's coming</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Guests
                </label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {[...Array(room.capacity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Method</h3>
                <p className="text-gray-600">Choose how you'd like to pay</p>
              </div>

              <PaymentStep
                method={bookingData.paymentMethod}
                onMethodChange={(id) => {
                  setBookingData({ ...bookingData, paymentMethod: id })
                  setPaymentErrors({})
                }}
                payment={payment}
                onPaymentChange={setPayment}
                errors={paymentErrors}
                disabled={isProcessing}
              />

              {/* Price Summary */}
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">${room.pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="text-gray-900">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-blue-200">
                    <span className="font-bold text-gray-900">{bookingData.paymentMethod === 'cash' ? 'Due on arrival' : 'Total'}</span>
                    <span className="font-bold text-blue-600 text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-100 rounded-xl">
                <p className="text-xs text-gray-600">
                  💡 This is a demo checkout. No real payment will be processed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          {currentStep < 3 ? (
            <>
              <button
                onClick={currentStep === 1 ? onClose : handleBack}
                className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  isStepValid()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentStep === 2 ? 'Continue to Payment' : 'Continue'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processing...
                  </>
                ) : bookingData.paymentMethod === 'cash' ? (
                  'Confirm Booking'
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </button>
            </>
          )}
        </div>

      </div>

    </div>
  )
}

export default BookingWizard
