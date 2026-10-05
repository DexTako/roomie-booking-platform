import { addDaysISO, todayISO, countNights } from '../utils/pricing'

const SEED_VERSION = 2

// Seed bookings are disabled: rooms now come from the backend, so there is no
// static room list to build fake bookings from. Real bookings come from the API.
const buildSeed = () => []

export const bookings = buildSeed()

// ---------- live updates ----------
// Anything that changes bookings calls notifyBookingsChanged(); components
// subscribe so calendars and dashboards refresh instantly (this tab through a
// custom event, other tabs through the browser's "storage" event).
const BOOKINGS_EVENT = 'roomie:bookings-changed'

export const notifyBookingsChanged = () => {
  window.dispatchEvent(new Event(BOOKINGS_EVENT))
}

export const subscribeToBookings = (callback) => {
  const onStorage = (e) => {
    if (e.key === 'bookings' || e.key === null) callback()
  }
  window.addEventListener(BOOKINGS_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(BOOKINGS_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

export const getBookingsByStatus = (status) => {
  return getAllBookings().filter(booking => booking.status === status)
}

export const getBookingsByRoom = (roomId) => {
  return getAllBookings().filter(booking => booking.roomId === parseInt(roomId))
}

// Function to update booking status (uses localStorage for now)
export const updateBookingStatus = (bookingId, newStatus) => {
  // Get bookings from localStorage or use default
  const storedBookings = localStorage.getItem('bookings')
  let allBookings = storedBookings ? JSON.parse(storedBookings) : [...bookings]
  
  // Find and update the booking
  const bookingIndex = allBookings.findIndex(b => b.id === bookingId)
  if (bookingIndex !== -1) {
    allBookings[bookingIndex] = {
      ...allBookings[bookingIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    }
    
    // Save back to localStorage
    localStorage.setItem('bookings', JSON.stringify(allBookings))
    notifyBookingsChanged()
    return allBookings[bookingIndex]
  }
  
  return null
}

// Customer cancels their own booking: it stops blocking the calendar right away
export const cancelBooking = (bookingId) => {
  const stored = localStorage.getItem('bookings')
  const allBookings = stored ? JSON.parse(stored) : [...bookings]
  const index = allBookings.findIndex(b => b.id === bookingId)
  if (index === -1) return null
  allBookings[index] = { ...allBookings[index], status: 'cancelled', updatedAt: new Date().toISOString() }
  localStorage.setItem('bookings', JSON.stringify(allBookings))
  notifyBookingsChanged()
  return allBookings[index]
}

// Initialize localStorage with seed data. When the seed version changes, only the
// old seed bookings are replaced; bookings made by real users are kept.
export const initializeBookings = () => {
  const stored = localStorage.getItem('bookings')
  const storedVersion = Number(localStorage.getItem('bookingsSeedVersion')) || 0

  if (!stored) {
    localStorage.setItem('bookings', JSON.stringify(bookings))
    localStorage.setItem('bookingsSeedVersion', String(SEED_VERSION))
    return
  }

  if (storedVersion !== SEED_VERSION) {
    let existing = []
    try { existing = JSON.parse(stored) } catch (e) { existing = [] }
    // Old seed bookings were ids 1-4 (no isSeed flag); anything else was made by a user
    const keep = existing.filter(b => !b.isSeed && b.id > 4)
    const maxSeedId = bookings.length ? Math.max(...bookings.map(b => b.id)) : 0
    // Re-number kept user bookings so they never collide with the new seed ids
    const renumbered = keep.map((b, i) => ({ ...b, id: maxSeedId + 1 + i }))
    localStorage.setItem('bookings', JSON.stringify([...bookings, ...renumbered]))
    localStorage.setItem('bookingsSeedVersion', String(SEED_VERSION))
    notifyBookingsChanged()
  }
}

// Get all bookings (from localStorage if available)
export const getAllBookings = () => {
  const storedBookings = localStorage.getItem('bookings')
  return storedBookings ? JSON.parse(storedBookings) : [...bookings]
}

// Add a new booking
export const addBooking = (bookingData) => {
  // Get existing bookings from localStorage or use default
  const storedBookings = localStorage.getItem('bookings')
  let allBookings = storedBookings ? JSON.parse(storedBookings) : [...bookings]
  
  // Reject bad ranges and any overlap with pending/approved bookings for this room
  if (countNights(bookingData.checkIn, bookingData.checkOut) < 1) {
    return {
      success: false,
      error: 'Please choose a check-out date after your check-in date.'
    }
  }

  if (!isRangeAvailable(bookingData.roomId, bookingData.checkIn, bookingData.checkOut, allBookings)) {
    return {
      success: false,
      error: 'These dates are not available. Please choose different dates.'
    }
  }

  // Generate new ID (max existing ID + 1)
  const maxId = allBookings.length > 0 
    ? Math.max(...allBookings.map(b => b.id)) 
    : 0
  
  // Create new booking with generated ID and default status
  const newBooking = {
    ...bookingData,
    id: maxId + 1,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  // Add to bookings array
  allBookings.push(newBooking)
  
  // Save back to localStorage
  localStorage.setItem('bookings', JSON.stringify(allBookings))
  notifyBookingsChanged()
  
  return {
    success: true,
    booking: newBooking
  }
}


// ================= AVAILABILITY =================
// A booking occupies the NIGHTS from check-in up to (but not including)
// check-out. So the check-out day of one guest can be the check-in day of the next.
const ACTIVE_STATUSES = ['pending', 'approved']

// Map of "YYYY-MM-DD" -> 'pending' | 'approved' for every occupied night of a room
export const getOccupiedNights = (roomId, allBookings = getAllBookings()) => {
  const occupied = {}
  allBookings
    .filter(b => b.roomId === Number(roomId) && ACTIVE_STATUSES.includes(b.status))
    .forEach(b => {
      const nights = countNights(b.checkIn, b.checkOut)
      for (let i = 0; i < nights; i++) {
        const day = addDaysISO(b.checkIn, i)
        // approved wins over pending if (somehow) both exist
        if (occupied[day] !== 'approved') occupied[day] = b.status
      }
    })
  return occupied
}

// True if every night in [checkIn, checkOut) is free
export const isRangeAvailable = (roomId, checkIn, checkOut, allBookings = getAllBookings()) => {
  const nights = countNights(checkIn, checkOut)
  if (nights < 1) return false
  const occupied = getOccupiedNights(roomId, allBookings)
  for (let i = 0; i < nights; i++) {
    if (occupied[addDaysISO(checkIn, i)]) return false
  }
  return true
}

// First free window of N nights starting tomorrow (searches up to a year ahead)
export const findNextAvailableRange = (roomId, nights, allBookings = getAllBookings()) => {
  const occupied = getOccupiedNights(roomId, allBookings)
  const today = todayISO()
  for (let start = 1; start <= 365; start++) {
    let free = true
    for (let n = 0; n < nights; n++) {
      if (occupied[addDaysISO(today, start + n)]) { free = false; break }
    }
    if (free) {
      const checkIn = addDaysISO(today, start)
      return { checkIn, checkOut: addDaysISO(checkIn, nights) }
    }
  }
  return null
}
