import { useState } from 'react'

function BookingForm({ pricePerNight, onSubmit }) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    checkIn: '',
    checkOut: '',
    specialRequests: ''
  })

  const [errors, setErrors] = useState({})

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      return nights > 0 ? nights : 0
    }
    return 0
  }

  const calculatePricing = () => {
    const nights = calculateNights()
    const subtotal = nights * pricePerNight
    const serviceFeeRate = 0.05 // 5% service fee
    const serviceFee = subtotal * serviceFeeRate
    const total = subtotal + serviceFee

    return {
      nights,
      subtotal,
      serviceFee,
      total
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Name is required'
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Email is invalid'
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required'
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required'
    }

    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      
      if (checkOut <= checkIn) {
        newErrors.checkOut = 'Check-out must be after check-in'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validate()) {
      onSubmit(formData)
    }
  }

  const pricing = calculatePricing()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Book Your Stay</h2>

      {/* Guest Name */}
      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="guestName"
          name="guestName"
          value={formData.guestName}
          onChange={handleChange}
          placeholder="John Doe"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.guestName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.guestName && (
          <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>
        )}
      </div>

      {/* Guest Email */}
      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="guestEmail"
          name="guestEmail"
          value={formData.guestEmail}
          onChange={handleChange}
          placeholder="john@example.com"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.guestEmail ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.guestEmail && (
          <p className="text-red-500 text-xs mt-1">{errors.guestEmail}</p>
        )}
      </div>

      {/* Check-in Date */}
      <div>
        <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
          Check-in Date
        </label>
        <input
          type="date"
          id="checkIn"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          min={today}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.checkIn ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.checkIn && (
          <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>
        )}
      </div>

      {/* Check-out Date */}
      <div>
        <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
          Check-out Date
        </label>
        <input
          type="date"
          id="checkOut"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          min={formData.checkIn || today}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
            errors.checkOut ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.checkOut && (
          <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>
        )}
      </div>

      {/* Special Requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests (Optional)
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={3}
          placeholder="Early check-in, extra towels, etc."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Price Breakdown */}
      {pricing.nights > 0 && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</h3>
          
          <div className="space-y-2.5">
            {/* Nightly Rate */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${pricePerNight} × {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="font-medium text-gray-900">
                ${pricing.subtotal.toFixed(2)}
              </span>
            </div>

            {/* Service Fee */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service fee (5%)</span>
              <span className="font-medium text-gray-900">
                ${pricing.serviceFee.toFixed(2)}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300 my-2"></div>

            {/* Total */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                ${pricing.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
      >
        Book Now
      </button>

      <p className="text-xs text-gray-500 text-center">
        You won't be charged yet
      </p>
    </form>
  )
}

export default BookingForm
