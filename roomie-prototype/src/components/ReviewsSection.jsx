import { useState, useEffect } from 'react'
import StarRating from './StarRating'
import { useAuth } from '../context/AuthContext'

function ReviewsSection({ roomId, onShowToast, onNavigateToLogin }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filterRating, setFilterRating] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  })

  // Fetch reviews from backend
  useEffect(() => {
    fetchReviews()
  }, [roomId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/reviews`)
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWriteReview = () => {
    if (!user) {
      // Navigate to login if provided
      if (onNavigateToLogin) {
        onNavigateToLogin()
      } else {
        onShowToast?.('Please sign in to write a review', 'info')
      }
      return
    }
    setShowReviewForm(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!reviewForm.title || !reviewForm.comment) {
      onShowToast?.('Please fill in all fields', 'error')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      })

      const data = await response.json()

      if (data.success) {
        onShowToast?.('Review submitted successfully!', 'success')
        setShowReviewForm(false)
        setReviewForm({ rating: 5, title: '', comment: '' })
        fetchReviews() // Refresh reviews
      } else {
        onShowToast?.(data.message || 'Failed to submit review', 'error')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      onShowToast?.('Failed to submit review. Please try again.', 'error')
    }
  }

  // Calculate statistics
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const ratingBreakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  }

  // Filter reviews
  let filteredReviews = reviews
  if (filterRating !== 'all') {
    filteredReviews = reviews.filter(r => r.rating === parseInt(filterRating))
  }

  // Sort reviews
  if (sortBy === 'recent') {
    filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy === 'highest') {
    filteredReviews.sort((a, b) => b.rating - a.rating)
  } else if (sortBy === 'lowest') {
    filteredReviews.sort((a, b) => a.rating - b.rating)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Guest Reviews ({reviews.length})
          </h2>
          <p className="text-gray-600">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from verified guests
          </p>
        </div>
        <button
          onClick={handleWriteReview}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        star <= reviewForm.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Sum up your experience"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience with this room..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {reviews.length > 0 ? (
        <>
          {/* Rating Overview */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
            
            {/* Left: Overall Rating */}
            <div>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-6xl font-bold text-gray-900">
                  {averageRating}
                </span>
                <div className="pb-2">
                  <StarRating rating={parseFloat(averageRating)} readonly size="lg" />
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingBreakdown[rating]
                  const percentage = reviews.length > 0 
                    ? (count / reviews.length) * 100 
                    : 0

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-12">
                        {rating} stars
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Category Ratings */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Rating Categories
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'cleanliness', label: 'Cleanliness', icon: '✨' },
                  { key: 'accuracy', label: 'Accuracy', icon: '✓' },
                  { key: 'location', label: 'Location', icon: '📍' },
                  { key: 'value', label: 'Value', icon: '💰' }
                ].map(category => (
                  <div key={category.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {category.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className="w-4 h-4 text-yellow-400 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8">
                        {averageRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            
            {/* Filter by Rating */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most recent</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </div>

          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <div 
                  key={review._id}
                  className="pb-6 border-b last:border-0"
                >
                  
                  {/* Reviewer Info */}
                  <div className="flex items-start gap-4 mb-4">
                    
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(review.userName)}
                    </div>

                    {/* Name & Date */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">
                        {review.userName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex-shrink-0">
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>

                  </div>

                  {/* Title */}
                  <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>

                  {/* Comment */}
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>

                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No reviews match your filter.
              </p>
            )}
          </div>

        </>
      ) : (
        
        /* No Reviews Yet */
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to review this room after your stay!
          </p>
          <button
            onClick={handleWriteReview}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write First Review
          </button>
        </div>

      )}

    </div>
  )
}

export default ReviewsSection
