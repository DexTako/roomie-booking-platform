import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import StarRating from './StarRating'

function AddReview({ roomId, onSubmit, onCancel }) {
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    rating: 0,
    ratings: {
      cleanliness: 0,
      accuracy: 0,
      location: 0,
      value: 0
    },
    comment: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (value) => {
    setFormData(prev => ({ ...prev, rating: value }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleCategoryRating = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value
      }
    }))
  }

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }))
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.rating === 0) {
      newErrors.rating = 'Please select an overall rating'
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Please write a review'
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters'
    }

    // Check if all category ratings are filled
    if (Object.values(formData.ratings).some(rating => rating === 0)) {
      newErrors.categories = 'Please rate all categories'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API delay
    setTimeout(() => {
      const reviewData = {
        roomId,
        userId: user?.id || 'guest',
        reviewerName: user?.name || 'Anonymous',
        rating: formData.rating,
        ratings: formData.ratings,
        comment: formData.comment.trim()
      }

      onSubmit(reviewData)
      setIsSubmitting(false)
      
      // Reset form
      setFormData({
        rating: 0,
        ratings: {
          cleanliness: 0,
          accuracy: 0,
          location: 0,
          value: 0
        },
        comment: ''
      })
    }, 500)
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to leave a review</h3>
        <p className="text-sm text-gray-600 mb-4">
          You need to be logged in to share your experience
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <StarRating
            rating={formData.rating}
            onChange={handleRatingChange}
            size="xl"
            showNumber={formData.rating > 0}
          />
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Category Ratings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate by Category *
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Cleanliness */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Cleanliness</p>
              <StarRating
                rating={formData.ratings.cleanliness}
                onChange={(value) => handleCategoryRating('cleanliness', value)}
                size="md"
              />
            </div>

            {/* Accuracy */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Accuracy</p>
              <StarRating
                rating={formData.ratings.accuracy}
                onChange={(value) => handleCategoryRating('accuracy', value)}
                size="md"
              />
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
              <StarRating
                rating={formData.ratings.location}
                onChange={(value) => handleCategoryRating('location', value)}
                size="md"
              />
            </div>

            {/* Value */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Value</p>
              <StarRating
                rating={formData.ratings.value}
                onChange={(value) => handleCategoryRating('value', value)}
                size="md"
              />
            </div>
          </div>
          {errors.categories && (
            <p className="mt-2 text-sm text-red-600">{errors.categories}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            rows="5"
            value={formData.comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this property..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
              errors.comment 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.comment ? (
              <p className="text-sm text-red-600">{errors.comment}</p>
            ) : (
              <p className="text-sm text-gray-500">
                {formData.comment.length} characters (minimum 10)
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              'Post Review'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddReview
