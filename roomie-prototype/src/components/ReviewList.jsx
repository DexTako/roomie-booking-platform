import { useState } from 'react'
import StarRating from './StarRating'

function ReviewList({ reviews, averageRating, totalReviews, categoryAverages }) {
  const [filter, setFilter] = useState('all') // all, 5, 4, 3, 2, 1
  const [sortBy, setSortBy] = useState('recent') // recent, helpful

  // Filter reviews
  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(filter))

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortBy === 'helpful') {
      return b.helpful - a.helpful
    }
    return 0
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate rating distribution
  const getRatingPercentage = (rating) => {
    const count = reviews.filter(r => r.rating === rating).length
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl font-bold text-gray-900">
                {averageRating}
              </span>
              <div>
                <StarRating rating={parseFloat(averageRating)} readonly size="lg" />
                <p className="text-sm text-gray-600 mt-1">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = getRatingPercentage(rating)
              const count = reviews.filter(r => r.rating === rating).length
              
              return (
                <button
                  key={rating}
                  onClick={() => setFilter(rating.toString())}
                  className={`w-full flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded transition-colors ${
                    filter === rating.toString() ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-gray-700 font-medium w-8">{rating} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-12 text-right">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Category Ratings */}
        {categoryAverages && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cleanliness</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-gray-900">
                  {categoryAverages.cleanliness}
                </span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Accuracy</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-gray-900">
                  {categoryAverages.accuracy}
                </span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-gray-900">
                  {categoryAverages.location}
                </span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Value</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-gray-900">
                  {categoryAverages.value}
                </span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All reviews
          </button>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most recent</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews found with the selected filter.</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Reviewer Info */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">
                    {getInitials(review.reviewerName)}
                  </span>
                </div>
                
                {/* Name, Rating, Date */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                  <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                </div>
                
                {/* Rating */}
                <StarRating rating={review.rating} readonly size="sm" />
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {/* Category Ratings (if available) */}
              {review.ratings && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 py-3 border-t border-gray-100">
                  <div className="text-xs">
                    <span className="text-gray-500">Cleanliness</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-semibold text-gray-900">{review.ratings.cleanliness}</span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Accuracy</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-semibold text-gray-900">{review.ratings.accuracy}</span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Location</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-semibold text-gray-900">{review.ratings.location}</span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Value</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-semibold text-gray-900">{review.ratings.value}</span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Helpful Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Helpful ({review.helpful})
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewList
