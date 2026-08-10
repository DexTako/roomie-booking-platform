// Mock review data - simulates what would come from a database

export const reviews = [
  {
    id: 1,
    roomId: 1,
    userId: 'user_renter_1',
    reviewerName: 'Sarah Johnson',
    reviewerAvatar: null,
    rating: 5,
    ratings: {
      cleanliness: 5,
      accuracy: 5,
      location: 4,
      value: 5
    },
    comment: 'Absolutely amazing apartment! The 3D tour was incredibly helpful in making my decision. The space was exactly as shown, modern and well-maintained. The downtown location is perfect for exploring the city. Would definitely book again!',
    photos: [],
    createdAt: '2024-07-15T14:30:00Z',
    helpful: 12,
    notHelpful: 1
  },
  {
    id: 2,
    roomId: 1,
    userId: 'user_003',
    reviewerName: 'Michael Chen',
    reviewerAvatar: null,
    rating: 4,
    ratings: {
      cleanliness: 5,
      accuracy: 4,
      location: 5,
      value: 4
    },
    comment: 'Great location in the heart of downtown. The apartment is clean and well-furnished. Only minor issue was the WiFi was a bit slow, but overall a fantastic stay. The interactive 3D tour really helped set expectations.',
    photos: [],
    createdAt: '2024-07-22T09:15:00Z',
    helpful: 8,
    notHelpful: 0
  },
  {
    id: 3,
    roomId: 1,
    userId: 'user_004',
    reviewerName: 'Emily Rodriguez',
    reviewerAvatar: null,
    rating: 5,
    ratings: {
      cleanliness: 5,
      accuracy: 5,
      location: 5,
      value: 5
    },
    comment: 'Perfect for a business trip! The workspace setup was excellent and the location made it easy to get to meetings. The 3D virtual tour feature is a game-changer for booking. Host was very responsive.',
    photos: [],
    createdAt: '2024-08-01T16:45:00Z',
    helpful: 15,
    notHelpful: 0
  },
  {
    id: 4,
    roomId: 2,
    userId: 'user_005',
    reviewerName: 'David Park',
    reviewerAvatar: null,
    rating: 5,
    ratings: {
      cleanliness: 5,
      accuracy: 5,
      location: 5,
      value: 5
    },
    comment: 'Cozy studio with great character! The exposed brick and high ceilings were beautiful. Arts District location is perfect for exploring galleries and restaurants. The 3D tour really captured the vibe of the place.',
    photos: [],
    createdAt: '2024-07-18T11:20:00Z',
    helpful: 10,
    notHelpful: 1
  },
  {
    id: 5,
    roomId: 2,
    userId: 'user_006',
    reviewerName: 'Lisa Thompson',
    reviewerAvatar: null,
    rating: 4,
    ratings: {
      cleanliness: 4,
      accuracy: 5,
      location: 5,
      value: 4
    },
    comment: 'Loved the location and the unique loft style. Everything was clean and as described. The kitchenette was well-equipped for my needs. Great value for the price!',
    photos: [],
    createdAt: '2024-07-25T13:10:00Z',
    helpful: 6,
    notHelpful: 0
  },
  {
    id: 6,
    roomId: 3,
    userId: 'user_007',
    reviewerName: 'James Wilson',
    reviewerAvatar: null,
    rating: 5,
    ratings: {
      cleanliness: 5,
      accuracy: 5,
      location: 5,
      value: 4
    },
    comment: 'Luxury penthouse exceeded all expectations! The panoramic views are breathtaking and the private terrace is perfect for evening relaxation. Premium amenities throughout. Worth every penny!',
    photos: [],
    createdAt: '2024-08-05T18:30:00Z',
    helpful: 20,
    notHelpful: 2
  }
]

// Helper functions
export const getReviewsByRoom = (roomId) => {
  const storedReviews = localStorage.getItem('reviews')
  const allReviews = storedReviews ? JSON.parse(storedReviews) : [...reviews]
  return allReviews.filter(review => review.roomId === parseInt(roomId))
}

export const getReviewById = (id) => {
  const storedReviews = localStorage.getItem('reviews')
  const allReviews = storedReviews ? JSON.parse(storedReviews) : [...reviews]
  return allReviews.find(review => review.id === parseInt(id))
}

export const calculateAverageRating = (roomId) => {
  const roomReviews = getReviewsByRoom(roomId)
  if (roomReviews.length === 0) return 0
  
  const sum = roomReviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / roomReviews.length).toFixed(1)
}

export const getRatingBreakdown = (roomId) => {
  const roomReviews = getReviewsByRoom(roomId)
  if (roomReviews.length === 0) {
    return {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    }
  }
  
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  roomReviews.forEach(review => {
    breakdown[review.rating]++
  })
  
  return breakdown
}

export const getCategoryAverages = (roomId) => {
  const roomReviews = getReviewsByRoom(roomId)
  if (roomReviews.length === 0) {
    return {
      cleanliness: 0,
      accuracy: 0,
      location: 0,
      value: 0
    }
  }
  
  const totals = {
    cleanliness: 0,
    accuracy: 0,
    location: 0,
    value: 0
  }
  
  roomReviews.forEach(review => {
    if (review.ratings) {
      totals.cleanliness += review.ratings.cleanliness
      totals.accuracy += review.ratings.accuracy
      totals.location += review.ratings.location
      totals.value += review.ratings.value
    }
  })
  
  return {
    cleanliness: (totals.cleanliness / roomReviews.length).toFixed(1),
    accuracy: (totals.accuracy / roomReviews.length).toFixed(1),
    location: (totals.location / roomReviews.length).toFixed(1),
    value: (totals.value / roomReviews.length).toFixed(1)
  }
}

export const addReview = (reviewData) => {
  const storedReviews = localStorage.getItem('reviews')
  const allReviews = storedReviews ? JSON.parse(storedReviews) : [...reviews]
  
  const newReview = {
    id: Date.now(),
    ...reviewData,
    createdAt: new Date().toISOString(),
    helpful: 0,
    notHelpful: 0,
    photos: reviewData.photos || []
  }
  
  allReviews.push(newReview)
  localStorage.setItem('reviews', JSON.stringify(allReviews))
  
  return newReview
}

export const initializeReviews = () => {
  if (!localStorage.getItem('reviews')) {
    localStorage.setItem('reviews', JSON.stringify(reviews))
    console.log('✅ Reviews initialized')
  }
}

export const getAllReviews = () => {
  const storedReviews = localStorage.getItem('reviews')
  return storedReviews ? JSON.parse(storedReviews) : [...reviews]
}
