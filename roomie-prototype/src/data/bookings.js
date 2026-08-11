// Mock booking data - simulates what would come from a database
// In Week 15, this will be replaced with real API calls

export const bookings = [
  {
    id: 1,
    roomId: 1,
    roomName: "Modern Downtown Apartment",
    renterId: "user_001",
    renterName: "Sarah Johnson",
    renterEmail: "sarah.johnson@email.com",
    renterPhone: "+1 (555) 123-4567",
    checkIn: "2024-09-15",
    checkOut: "2024-09-18",
    guests: 2,
    pricePerNight: 89,
    nights: 3,
    subtotal: 267,
    serviceFee: 13.35,
    totalPrice: 280.35,
    status: "pending", // pending, approved, declined, completed
    specialRequests: "Early check-in if possible",
    createdAt: "2024-08-08T14:30:00Z"
  },
  {
    id: 2,
    roomId: 2,
    roomName: "Cozy Studio Loft",
    renterId: "user_002",
    renterName: "Michael Chen",
    renterEmail: "michael.chen@email.com",
    renterPhone: "+1 (555) 987-6543",
    checkIn: "2024-09-20",
    checkOut: "2024-09-25",
    guests: 1,
    pricePerNight: 65,
    nights: 5,
    subtotal: 325,
    serviceFee: 16.25,
    totalPrice: 341.25,
    status: "pending",
    specialRequests: "Quiet workspace needed",
    createdAt: "2024-08-09T10:15:00Z"
  },
  {
    id: 3,
    roomId: 1,
    roomName: "Modern Downtown Apartment",
    renterId: "user_003",
    renterName: "Emily Rodriguez",
    renterEmail: "emily.r@email.com",
    renterPhone: "+1 (555) 456-7890",
    checkIn: "2024-10-01",
    checkOut: "2024-10-07",
    guests: 4,
    pricePerNight: 89,
    nights: 6,
    subtotal: 534,
    serviceFee: 26.70,
    totalPrice: 560.70,
    status: "approved",
    specialRequests: "",
    createdAt: "2024-08-05T09:00:00Z"
  },
  {
    id: 4,
    roomId: 3,
    roomName: "Luxury Penthouse Suite",
    renterId: "user_004",
    renterName: "David Park",
    renterEmail: "david.park@email.com",
    renterPhone: "+1 (555) 234-5678",
    checkIn: "2024-09-10",
    checkOut: "2024-09-12",
    guests: 2,
    pricePerNight: 199,
    nights: 2,
    subtotal: 398,
    serviceFee: 19.90,
    totalPrice: 417.90,
    status: "declined",
    specialRequests: "Airport pickup",
    createdAt: "2024-08-07T16:45:00Z"
  }
]

// Helper functions for booking management
export const getBookingById = (id) => {
  return bookings.find(booking => booking.id === parseInt(id))
}

export const getBookingsByStatus = (status) => {
  return bookings.filter(booking => booking.status === status)
}

export const getBookingsByRoom = (roomId) => {
  return bookings.filter(booking => booking.roomId === parseInt(roomId))
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
    return allBookings[bookingIndex]
  }
  
  return null
}

// Initialize localStorage with mock data if empty
export const initializeBookings = () => {
  if (!localStorage.getItem('bookings')) {
    localStorage.setItem('bookings', JSON.stringify(bookings))
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
  
  // Check for date overlaps with existing bookings for this room
  const roomBookings = allBookings.filter(
    b => b.roomId === bookingData.roomId && 
    (b.status === 'pending' || b.status === 'approved')
  )
  
  const newCheckIn = new Date(bookingData.checkIn)
  const newCheckOut = new Date(bookingData.checkOut)
  
  // Check if dates overlap with any existing booking
  const hasOverlap = roomBookings.some(existingBooking => {
    const existingCheckIn = new Date(existingBooking.checkIn)
    const existingCheckOut = new Date(existingBooking.checkOut)
    
    // Overlap occurs if:
    // - New check-in is between existing dates
    // - New check-out is between existing dates
    // - New booking completely contains existing booking
    return (
      (newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut) ||
      (newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut) ||
      (newCheckIn <= existingCheckIn && newCheckOut >= existingCheckOut)
    )
  })
  
  if (hasOverlap) {
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
  
  return {
    success: true,
    booking: newBooking
  }
}
