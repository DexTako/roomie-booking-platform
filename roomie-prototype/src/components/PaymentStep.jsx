import { useState, useEffect } from 'react'
import api from '../services/api'
import { PAYMENT_METHODS, formatCardNumber, formatExpiry, formatPHMobile, cardBrand } from '../utils/payment'

const inputClass = (error) =>
  `w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
    error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
  }`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function PaymentStep({ method, onMethodChange, payment, onPaymentChange, errors, disabled, total, hiddenMethods = [] }) {
  const set = (field, value) => onPaymentChange({ ...payment, [field]: value })

  // Where to send the GCash money (loaded from the backend)
  const [gcash, setGcash] = useState({ number: '', accountName: '', isDemo: false })
  useEffect(() => {
    api.payments.gcashConfig()
      .then(setGcash)
      .catch(() => setGcash({ number: 'unavailable', accountName: 'Could not load the GCash number', isDemo: false }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Method picker */}
      <div className="space-y-3">
        {PAYMENT_METHODS.filter(m => !hiddenMethods.includes(m.id)).map(m => (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onMethodChange(m.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
              method === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="text-2xl">{m.icon}</span>
            <span>
              <span className="block font-semibold text-gray-900">{m.label}</span>
              <span className="block text-xs text-gray-500">{m.hint}</span>
            </span>
            {method === m.id && (
              <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Method details */}
      {method === 'card' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Field label="Card number" error={errors.cardNumber}>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={payment.cardNumber}
                onChange={(e) => set('cardNumber', formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                disabled={disabled}
                className={inputClass(errors.cardNumber)}
              />
              {payment.cardNumber && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                  {cardBrand(payment.cardNumber)}
                </span>
              )}
            </div>
          </Field>
          <Field label="Name on card" error={errors.cardName}>
            <input
              type="text"
              autoComplete="cc-name"
              value={payment.cardName}
              onChange={(e) => set('cardName', e.target.value)}
              placeholder="Juan Dela Cruz"
              disabled={disabled}
              className={inputClass(errors.cardName)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry" error={errors.expiry}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={payment.expiry}
                onChange={(e) => set('expiry', formatExpiry(e.target.value))}
                placeholder="MM/YY"
                disabled={disabled}
                className={inputClass(errors.expiry)}
              />
            </Field>
            <Field label="CVC" error={errors.cvc}>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                value={payment.cvc}
                onChange={(e) => set('cvc', e.target.value.replace(/\D/g, ''))}
                placeholder="•••"
                disabled={disabled}
                className={inputClass(errors.cvc)}
              />
            </Field>
          </div>
        </div>
      )}

      {method === 'gcash' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Open <b>GCash</b> and tap <b>Send Money</b>.</li>
            <li>
              Send <b>${Number(total || 0).toFixed(2)}</b> (or the peso equivalent) to:
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-lg text-gray-900 tracking-wide">{gcash.number}</p>
                  <p className="text-xs text-gray-500">{gcash.accountName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(gcash.number)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Copy number
                </button>
              </div>
            </li>
            <li>Type the <b>reference number</b> from your GCash receipt below.</li>
          </ol>

          <Field label="GCash reference number" error={errors.gcashReference}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={20}
              value={payment.gcashReference}
              onChange={(e) => set('gcashReference', e.target.value.replace(/[^\d ]/g, ''))}
              placeholder="e.g. 1234 567 890123"
              disabled={disabled}
              className={inputClass(errors.gcashReference)}
            />
          </Field>

          <p className="text-xs text-gray-500">
            Your booking is sent to the host with this reference. The host checks the payment and approves your booking.
            {gcash.isDemo && ' (Demo number: the owner still needs to set GCASH_NUMBER in the backend .env.)'}
          </p>
        </div>
      )}

      {method === 'paypal' && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-700">
            Press the PayPal button below. A PayPal window opens where you log in and approve the payment.
            Your booking is created as soon as the payment goes through.
          </p>
        </div>
      )}

      {method === 'cash' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-900">
          No payment is taken now. You'll pay the host in cash at check-in, and your receipt will show the
          amount as <strong>Pay on arrival</strong>.
        </div>
      )}
    </div>
  )
}

export default PaymentStep
