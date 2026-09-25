import { useState } from 'react'
import { 
  getReviewsByRoom, 
  calculateAverageRating, 
  getRatingBreakdown,
  getCategoryAverages 
} from '../data/reviews'
import StarRating from './StarRating'
import { useAuth } from '../context/AuthContext'

function ReviewsSection({ roomId, onShowToast }) {
  const { user } = useAuth()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filterRating, setFilterRating] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const reviews = getReviewsByRoom(roomId)
  const averageRating = calculateAverageRating(roomId)
  const ratingBreakdown = getRatingBreakdown(roomId)
  const categoryAverages = getCategoryAverages(roomId)

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Guest Reviews
        </h2>
        <p className="text-gray-600">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from verified guests
        </p>
      </div>


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
                            className={`w-4 h-4 ${
                              star <= parseFloat(categoryAverages[category.key])
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8">
                        {categoryAverages[category.key]}
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
                  key={review.id}
                  className="pb-6 border-b last:border-0"
                >
                  
                  {/* Reviewer Info */}
                  <div className="flex items-start gap-4 mb-4">
                    
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(review.reviewerName)}
                    </div>

                    {/* Name & Date */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">
                        {review.reviewerName}
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

                  {/* Comment */}
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  {/* Helpful Buttons */}
                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Helpful ({review.helpful})
                    </button>
                  </div>

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
          <p className="text-gray-600">
            Be the first to review this room after your stay!
          </p>
        </div>

      )}

    </div>
  )
}

export default ReviewsSection
