// Demo payment helpers. Nothing here talks to a real payment gateway:
// the full card number never leaves the browser, only a masked label is sent.

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', hint: 'Visa, Mastercard, AmEx' },
  { id: 'gcash', label: 'GCash', icon: '📱', hint: 'Pay with your GCash wallet' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️', hint: 'Pay with your PayPal account' },
  { id: 'cash', label: 'Cash on Arrival', icon: '💵', hint: 'Pay at check-in, no payment now' }
]

export const paymentMethodLabel = (id) =>
  PAYMENT_METHODS.find(m => m.id === id)?.label || 'Card'

export const EMPTY_PAYMENT = {
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvc: '',
  gcashNumber: '',
  paypalEmail: ''
}

const digitsOnly = (v) => String(v || '').replace(/\D/g, '')

export const formatCardNumber = (v) =>
  digitsOnly(v).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

export const formatExpiry = (v) => {
  const d = digitsOnly(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export const formatPHMobile = (v) => {
  const d = digitsOnly(v).slice(0, 11)
  if (d.length <= 4) return d
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
}

// Luhn checksum
const passesLuhn = (num) => {
  let sum = 0
  let alt = false
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i])
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export const cardBrand = (number) => {
  const n = digitsOnly(number)
  if (/^4/.test(n)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'AmEx'
  return 'Card'
}

// Returns an object of field errors ({} means valid)
export const validatePayment = (method, p) => {
  const errors = {}
  if (method === 'card') {
    const num = digitsOnly(p.cardNumber)
    if (num.length < 13 || num.length > 16 || !passesLuhn(num)) errors.cardNumber = 'Enter a valid card number'
    if (!p.cardName.trim()) errors.cardName = 'Enter the name on the card'
    const m = /^(\d{2})\/(\d{2})$/.exec(p.expiry)
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) {
      errors.expiry = 'Use MM/YY'
    } else {
      const now = new Date()
      const expEnd = new Date(2000 + Number(m[2]), Number(m[1]), 1) // first day after expiry month
      if (expEnd <= now) errors.expiry = 'This card has expired'
    }
    if (!/^\d{3,4}$/.test(p.cvc)) errors.cvc = '3 or 4 digits'
  }
  if (method === 'gcash') {
    if (!/^09\d{9}$/.test(digitsOnly(p.gcashNumber))) errors.gcashNumber = 'Enter an 11-digit number starting with 09'
  }
  if (method === 'paypal') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.paypalEmail.trim())) errors.paypalEmail = 'Enter a valid PayPal email'
  }
  return errors
}

// Masked label stored with the booking and shown on the receipt
export const paymentDetailsLabel = (method, p) => {
  if (method === 'card') {
    const num = digitsOnly(p.cardNumber)
    return `${cardBrand(num)} •••• ${num.slice(-4)}`
  }
  if (method === 'gcash') {
    const d = digitsOnly(p.gcashNumber)
    return `GCash ${d.slice(0, 4)}•••${d.slice(-2)}`
  }
  if (method === 'paypal') {
    const [name, domain] = p.paypalEmail.trim().split('@')
    return `PayPal ${name.slice(0, 2)}•••@${domain}`
  }
  return 'Pay at check-in'
}
