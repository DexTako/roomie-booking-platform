import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Card styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

// Payment form component
function PaymentFormContent({ bookingData, onSuccess, onCancel, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentBreakdown, setPaymentBreakdown] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingData })
      })

      const data = await response.json()
      if (data.success) {
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setPaymentBreakdown(data.breakdown)
      } else {
        onError(data.message || 'Failed to create payment intent')
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      onError('Failed to initialize payment')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const cardElement = elements.getElement(CardElement)

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: user?.name || bookingData.guestName,
          email: user?.email || bookingData.guestEmail,
        },
      }
    })

    if (error) {
      console.error('Payment failed:', error)
      onError(error.message)
      setIsProcessing(false)
    } else if (paymentIntent.status === 'succeeded') {
      // Payment succeeded, create booking
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            paymentIntentId: paymentIntent.id,
            bookingData 
          })
        })

        const data = await response.json()
        if (data.success) {
          onSuccess(data.booking)
        } else {
          onError(data.message || 'Failed to create booking')
        }
      } catch (error) {
        console.error('Error confirming payment:', error)
        onError('Failed to complete booking')
      }
    }

    setIsProcessing(false)
  }

  if (!paymentBreakdown) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Preparing payment...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Room:</span>
            <span className="font-medium">{bookingData.roomName}</span>
          </div>
          <div className="flex justify-between">
            <span>Dates:</span>
            <span>{bookingData.checkIn} - {bookingData.checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span>Guests:</span>
            <span>{bookingData.guests}</span>
          </div>
          <div className="flex justify-between">
            <span>{paymentBreakdown.nights} nights × ${paymentBreakdown.pricePerNight}:</span>
            <span>${paymentBreakdown.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee (15%):</span>
            <span>${paymentBreakdown.serviceFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span className="text-blue-600">${(paymentBreakdown.subtotal + paymentBreakdown.serviceFee).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Your payment is secured by Stripe. Your card details are never stored on our servers.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            `Pay $${(paymentBreakdown.subtotal + paymentBreakdown.serviceFee).toFixed(2)}`
          )}
        </button>
      </div>

      {/* Test Card Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 font-medium mb-1">Test Mode - Use these card numbers:</p>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• Success: 4242 4242 4242 4242</div>
          <div>• Decline: 4000 0000 0000 0002</div>
          <div>• Any future date, any CVC</div>
        </div>
      </div>
    </form>
  )
}

// Main payment form with Stripe Elements wrapper
function PaymentForm({ bookingData, onSuccess, onCancel, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent
        bookingData={bookingData}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onError={onError}
      />
    </Elements>
  )
}

export default PaymentForm