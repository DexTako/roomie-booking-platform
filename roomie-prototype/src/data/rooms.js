// Central data store for all rooms/apartments
// NOTE: This file is now deprecated in favor of API calls.
// Rooms are fetched from the backend at /api/rooms
// This file is kept for reference only.

// Helper function to get a room by ID from a rooms array
export const getRoomById = (roomsArray, id) => {
  return roomsArray.find(room => room.id === parseInt(id)) || 
         roomsArray.find(room => room._id === id)
}

// Helper function to get available rooms (for filtering later)
export const getAvailableRooms = (roomsArray) => {
  return roomsArray.filter(room => room.isActive !== false)
}

// Legacy rooms array - kept for reference only, not used in production
export const rooms = []
