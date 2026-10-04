// Single source of truth for dates, nights and prices.
// Every screen that shows a night count, subtotal, fee or total must use
// these helpers so the numbers always agree with each other.

export const SERVICE_FEE_RATE = 0.1 // 10% service fee

const MS_PER_DAY = 24 * 60 * 60 * 1000

// ---------- dates ----------
// Dates are handled as "YYYY-MM-DD" strings in LOCAL time. Parsing them with
// new Date('YYYY-MM-DD') would use UTC and can shift the day by one.
export const toISODate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const parseISODate = (iso) => {
  if (!iso) return null
  const [y, m, d] = String(iso).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const todayISO = () => toISODate(new Date())

export const addDaysISO = (iso, days) => {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

// Whole nights between two ISO dates (0 if either is missing or the range is invalid)
export const countNights = (checkIn, checkOut) => {
  const start = parseISODate(checkIn)
  const end = parseISODate(checkOut)
  if (!start || !end) return 0
  const nights = Math.round((end - start) / MS_PER_DAY)
  return nights > 0 ? nights : 0
}

// ---------- money ----------
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

// Full price breakdown for a stay
export const calculatePrice = (pricePerNight, nights) => {
  const safeNights = Math.max(0, Number(nights) || 0)
  const subtotal = round2(safeNights * (Number(pricePerNight) || 0))
  const serviceFee = round2(subtotal * SERVICE_FEE_RATE)
  const total = round2(subtotal + serviceFee)
  return { nights: safeNights, pricePerNight: Number(pricePerNight) || 0, subtotal, serviceFee, total }
}

export const calculateStayPrice = (pricePerNight, checkIn, checkOut) =>
  calculatePrice(pricePerNight, countNights(checkIn, checkOut))

export const formatMoney = (amount) =>
  `$${(Number(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDateLabel = (iso, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  const date = parseISODate(iso)
  return date ? date.toLocaleDateString('en-US', options) : ''
}

// ---------- booking totals (host / admin dashboards) ----------
export const isEarningStatus = (status) => status === 'approved' || status === 'completed'

export const sumRevenue = (bookings) =>
  round2(bookings.filter(b => isEarningStatus(b.status)).reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0))

export const sumNights = (bookings) =>
  bookings
    .filter(b => isEarningStatus(b.status))
    .reduce((sum, b) => sum + (b.nights || countNights(b.checkIn, b.checkOut)), 0)

// Revenue from bookings whose stay starts in the given month (default: current month)
export const monthlyRevenue = (bookings, date = new Date()) =>
  round2(
    bookings
      .filter(b => isEarningStatus(b.status))
      .filter(b => {
        const d = parseISODate(b.checkIn)
        return d && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
      })
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)
  )
