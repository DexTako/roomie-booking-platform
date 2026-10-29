import { useEffect, useRef, useState } from 'react'
import api from '../services/api'

// Loads PayPal's script once for the whole page
let sdkPromise = null
const loadPayPalSdk = (clientId, currency) => {
  if (window.paypal) return Promise.resolve(window.paypal)
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=capture`
      script.async = true
      script.onload = () => resolve(window.paypal)
      script.onerror = () => {
        sdkPromise = null
        reject(new Error('Could not load PayPal. Check your internet connection and try again.'))
      }
      document.body.appendChild(script)
    })
  }
  return sdkPromise
}

// PayPal checkout buttons.
// The server works out the price, creates the order and takes the payment,
// so the browser can't change what is charged.
function PayPalButton({ stay, onPaid, disabled }) {
  const containerRef = useRef(null)
  const stayRef = useRef(stay)
  const [status, setStatus] = useState('loading') // loading | ready | unavailable
  const [message, setMessage] = useState('')

  // Always use the latest details when the button is clicked
  useEffect(() => {
    stayRef.current = stay
  }, [stay])

  useEffect(() => {
    let buttons = null
    let cancelled = false

    const start = async () => {
      try {
        const config = await api.payments.paypalConfig()
        if (!config.configured) {
          setStatus('unavailable')
          setMessage('PayPal is not set up on this server yet. Please choose another payment method.')
          return
        }

        const paypal = await loadPayPalSdk(config.clientId, config.currency)
        if (cancelled || !containerRef.current) return

        buttons = paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay', height: 45 },

          // 1. The server creates the order and decides the price
          createOrder: async () => {
            setMessage('')
            const { roomId, checkIn, checkOut, guests } = stayRef.current
            const res = await api.payments.paypalCreateOrder({ roomId, checkIn, checkOut, guests })
            return res.orderID
          },

          // 2. The guest approved in PayPal: the server takes the payment and creates the booking
          onApprove: async (data) => {
            try {
              const res = await api.payments.paypalCaptureOrder(data.orderID, stayRef.current)
              onPaid(res.booking)
            } catch (error) {
              setMessage(error.message)
            }
          },

          onCancel: () => setMessage('Payment cancelled. You have not been charged.'),

          onError: (error) => {
            setMessage(error?.message || 'PayPal ran into a problem. You have not been charged. Please try again.')
          }
        })

        if (buttons.isEligible && !buttons.isEligible()) {
          setStatus('unavailable')
          setMessage('PayPal is not available in this browser. Please choose another payment method.')
          return
        }

        await buttons.render(containerRef.current)
        if (!cancelled) setStatus('ready')
      } catch (error) {
        if (!cancelled) {
          setStatus('unavailable')
          setMessage(error.message)
        }
      }
    }

    start()

    return () => {
      cancelled = true
      if (buttons && buttons.close) buttons.close()
    }
  }, [])

  return (
    <div className="w-full">
      {status === 'loading' && <p className="text-sm text-gray-500 text-center">Loading PayPal...</p>}
      <div
        ref={containerRef}
        className={disabled ? 'pointer-events-none opacity-50' : ''}
        style={{ minWidth: 220 }}
      />
      {message && (
        <p className={`mt-2 text-xs ${status === 'unavailable' ? 'text-gray-600' : 'text-red-600'}`} role="alert">
          {message}
        </p>
      )}
    </div>
  )
}

export default PayPalButton
