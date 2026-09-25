import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function BookingWizard({ room, onClose, onComplete }) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: '',
    specialRequests: '',
    paymentMethod: 'card'
  })

  const steps = [
    { number: 1, title: 'Dates', icon: '📅' },
    { number: 2, title: 'Guests', icon: '👥' },
    { number: 3, title: 'Payment', icon: '💳' },
    { number: 4, title: 'Confirm', icon: '✓' }
  ]

  // Calculate number of nights and total
  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    const start = new Date(bookingData.checkIn)
    const end = new Date(bookingData.checkOut)
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 0
  }

  const nights = calculateNights()
  const subtotal = nights * room.pricePerNight
  const serviceFee = subtotal * 0.1
  const total = subtotal + serviceFee

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    onComplete({
      ...bookingData,
      roomId: room.id,
      nights,
      total
    })
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return bookingData.checkIn && bookingData.checkOut && nights > 0
    }
    if (currentStep === 2) {
      return bookingData.guestName && bookingData.guestEmail && bookingData.guests > 0
    }
    if (currentStep === 3) {
      return bookingData.paymentMethod
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
                  rows={3}
                  placeholder="Any special requirements?"
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

              <div className="space-y-3">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                  { id: 'bank', label: 'Bank Transfer', icon: '🏦' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setBookingData({ ...bookingData, paymentMethod: method.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                      bookingData.paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-semibold text-gray-900">{method.label}</span>
                    {bookingData.paymentMethod === method.id && (
                      <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-100 rounded-xl">
                <p className="text-xs text-gray-600">
                  💡 This is a demo. No actual payment will be processed.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Booking</h3>
                <p className="text-gray-600">Please confirm your details</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Room Details</h4>
                  <p className="text-sm text-gray-700">{room.name}</p>
                  <p className="text-sm text-gray-600">{room.location}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Trip Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium text-gray-900">{new Date(bookingData.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium text-gray-900">{new Date(bookingData.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium text-gray-900">{bookingData.guests}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Guest Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">{bookingData.guestName}</p>
                    <p className="text-gray-600">{bookingData.guestEmail}</p>
                    {bookingData.guestPhone && <p className="text-gray-600">{bookingData.guestPhone}</p>}
                  </div>
                </div>

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
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-blue-600 text-lg">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={!isStepValid()}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              isStepValid()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === 4 ? 'Confirm Booking' : 'Continue'}
          </button>
        </div>

      </div>

    </div>
  )
}

export default BookingWizard
