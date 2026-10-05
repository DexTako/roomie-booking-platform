// API Service Layer - Connects Frontend to Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let memoryToken = null;
// Helper function to get auth token
const getAuthToken = () => {
  if (memoryToken) return memoryToken;
  const plain = localStorage.getItem('token');
  if (plain) return plain;
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      return user.token;
    } catch (error) {
      console.error('Error parsing user token:', error);
      return null;
    }
  }
  return null;
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== AUTH API ====================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current user
  getMe: async () => {
    return apiRequest('/auth/me');
  },

  // Update profile
  updateProfile: async (updates) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Logout
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// ==================== ROOMS API ====================

export const roomsAPI = {
  // Get all rooms with optional filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/rooms?${queryParams}` : '/rooms';
    return apiRequest(endpoint);
  },

  // Get single room by ID
  getById: async (id) => {
    return apiRequest(`/rooms/${id}`);
  },

  // Check room availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    const queryParams = new URLSearchParams({ checkIn, checkOut }).toString();
    return apiRequest(`/rooms/${roomId}/availability?${queryParams}`);
  },

  // Get occupied dates for calendar
  getOccupiedDates: async (roomId) => {
    return apiRequest(`/rooms/${roomId}/occupied-dates`);
  },

  // Create new room (Host/Admin only)
  create: async (roomData) => {
    return apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  // Update room (Host/Admin only)
  update: async (id, roomData) => {
    return apiRequest(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  // Delete room (Host/Admin only)
  delete: async (id) => {
    return apiRequest(`/rooms/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== BOOKINGS API ====================

export const bookingsAPI = {
  // Get all bookings (filtered by role)
  getAll: async (status = null) => {
    const endpoint = status ? `/bookings?status=${status}` : '/bookings';
    return apiRequest(endpoint);
  },

  // Get single booking
  getById: async (id) => {
    return apiRequest(`/bookings/${id}`);
  },

  // Get current user's bookings
  getMyBookings: async () => {
    return apiRequest('/bookings/my-bookings');
  },

  // Create new booking
  create: async (bookingData) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Update booking status (Host/Admin only)
  updateStatus: async (id, status) => {
    return apiRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Cancel booking
  cancel: async (id) => {
    return apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HELPER FUNCTIONS ====================

// Store auth token after login
export const storeAuthToken = (token, user) => {
  const userData = { ...user, token };
  localStorage.setItem('currentUser', JSON.stringify(userData));
};

// Clear auth token on logout
export const clearAuthToken = () => {
  localStorage.removeItem('currentUser');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// AuthContext calls setAuthToken after login
export const setAuthToken = (token) => {
  memoryToken = token;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

// Backend returns { success, rooms } / { success, bookings } / { success, booking }.
// The pages expect plain arrays/objects, so unwrap here.
const unwrap = (res, key) => (res && res[key] !== undefined ? res[key] : res);

export default {
  // grouped (original style)
  auth: authAPI,
  rooms: roomsAPI,
  bookings: bookingsAPI,
  storeAuthToken,
  clearAuthToken,
  isAuthenticated,
  setAuthToken,

  // flat helpers used by AuthContext and the pages
  login: (email, password) => authAPI.login(email, password),
  register: (userData) => authAPI.register(userData),
  getAllRooms: async (filters) => unwrap(await roomsAPI.getAll(filters), 'rooms'),
  getRoomById: async (id) => unwrap(await roomsAPI.getById(id), 'room'),
  getUserBookings: async () => unwrap(await bookingsAPI.getMyBookings(), 'bookings'),
  createBooking: async (data) => unwrap(await bookingsAPI.create(data), 'booking'),
  cancelBooking: (id) => bookingsAPI.cancel(id),
};
