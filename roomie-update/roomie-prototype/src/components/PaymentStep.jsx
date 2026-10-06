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

function PaymentStep({ method, onMethodChange, payment, onPaymentChange, errors, disabled }) {
  const set = (field, value) => onPaymentChange({ ...payment, [field]: value })

  return (
    <div className="space-y-6">
      {/* Method picker */}
      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => (
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
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Field label="GCash mobile number" error={errors.gcashNumber}>
            <input
              type="tel"
              inputMode="numeric"
              value={payment.gcashNumber}
              onChange={(e) => set('gcashNumber', formatPHMobile(e.target.value))}
              placeholder="0917 123 4567"
              disabled={disabled}
              className={inputClass(errors.gcashNumber)}
            />
          </Field>
          <p className="text-xs text-gray-500">In a live setup you would approve the payment inside the GCash app.</p>
        </div>
      )}

      {method === 'paypal' && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Field label="PayPal email" error={errors.paypalEmail}>
            <input
              type="email"
              value={payment.paypalEmail}
              onChange={(e) => set('paypalEmail', e.target.value)}
              placeholder="you@example.com"
              disabled={disabled}
              className={inputClass(errors.paypalEmail)}
            />
          </Field>
          <p className="text-xs text-gray-500">In a live setup you would be redirected to PayPal to log in and approve.</p>
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
