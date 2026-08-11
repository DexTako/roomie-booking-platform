import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import RoomViewer from '../components/RoomViewer'
import RoomGallery from '../components/RoomGallery'
import BookingForm from '../components/BookingForm'
import ReviewList from '../components/ReviewList'
import AddReview from '../components/AddReview'
import StarRating from '../components/StarRating'
import { 
  getReviewsByRoom, 
  calculateAverageRating, 
  getCategoryAverages,
  addReview,
  initializeReviews
} from '../data/reviews'
import { addBooking, initializeBookings } from '../data/bookings'

function RoomDetailPage({ room, onBack }) {
  const { user } = useAuth()
  const [isBooked, setIsBooked] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [show3DView, setShow3DView] = useState(false)
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [categoryAverages, setCategoryAverages] = useState(null)
  const [showAddReview, setShowAddReview] = useState(false)

  // Load reviews on mount
  useEffect(() => {
    initializeReviews()
    initializeBookings()
    loadReviews()
  }, [room.id])

  const loadReviews = () => {
    const roomReviews = getReviewsByRoom(room.id)
    const avg = calculateAverageRating(room.id)
    const catAvg = getCategoryAverages(room.id)
    
    setReviews(roomReviews)
    setAverageRating(avg)
    setCategoryAverages(catAvg)
  }

  const handleAddReview = (reviewData) => {
    addReview(reviewData)
    loadReviews()
    setShowAddReview(false)
    
    // Show success message
    alert('Thank you for your review! It has been posted successfully.')
  }

  const handleBooking = (formData) => {
    // Check if user is logged in
    if (!user) {
      alert('Please login to make a booking.')
      return
    }

    // Calculate nights and pricing
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    const subtotal = nights * room.pricePerNight
    const serviceFee = subtotal * 0.05 // 5% service fee
    const totalPrice = subtotal + serviceFee

    // Create booking object
    const newBooking = {
      roomId: room.id,
      roomName: room.name,
      renterId: user.id,
      renterName: user.name,
      renterEmail: user.email,
      renterPhone: user.phone || '',
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: room.capacity,
      pricePerNight: room.pricePerNight,
      nights,
      subtotal,
      serviceFee,
      totalPrice,
      specialRequests: formData.specialRequests || ''
    }

    // Add booking to localStorage store
    const result = addBooking(newBooking)
    
    if (!result.success) {
      // Show error if dates overlap
      alert(result.error)
      return
    }
    
    setBookingData(result.booking)
    setIsBooked(true)
  }

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsBooked(false)
      setBookingData(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to All Rooms</span>
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {room.name}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {room.location}
              </p>
            </div>
            
            <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
              room.theme === 'modern' ? 'bg-blue-500 text-white' :
              room.theme === 'rustic' ? 'bg-amber-600 text-white' :
              room.theme === 'luxury' ? 'bg-purple-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {room.theme.toUpperCase()}
            </div>
          </div>

          <p className="text-gray-600 mb-4">{room.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Up to {room.capacity} guests
            </span>
            {reviews.length > 0 && (
              <span className="flex items-center gap-1">
                <StarRating rating={parseFloat(averageRating)} readonly size="sm" />
                <span className="font-semibold">{averageRating}</span>
                <span className="text-gray-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </span>
            )}
            <span className="font-bold text-2xl text-blue-600">
              ${room.pricePerNight}
              <span className="text-sm text-gray-600 font-normal"> / night</span>
            </span>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {room.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {amenity}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Gallery/3D Viewer and Booking Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Gallery/3D Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-100 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {show3DView ? 'Interactive 3D Tour' : 'Room Gallery'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {show3DView ? 'Drag to rotate • Scroll to zoom' : `${room.galleryImages.length} photos`}
                  </p>
                </div>
                
                {/* Toggle Button */}
                {show3DView && (
                  <button
                    onClick={() => setShow3DView(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Back to Photos
                  </button>
                )}
              </div>
              
              {/* Conditional Rendering: Gallery or 3D Viewer */}
              {show3DView ? (
                room.has3D ? (
                  <RoomViewer 
                    modelPath={room.model3D} 
                    waypoints={room.waypoints || {}}
                    isBooked={isBooked}
                    fixMaterials={room.fixMaterials || false}
                    enablePhysics={room.enablePhysics || false}
                  />
                ) : (
                  <div className="h-[500px] flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                      <p className="text-gray-600">3D tour not available for this room yet</p>
                    </div>
                  </div>
                )
              ) : (
                <RoomGallery 
                  images={room.galleryImages} 
                  onTryMe={room.has3D ? () => setShow3DView(true) : null}
                />
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              {isBooked && bookingData ? (
                <div>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Booking Confirmed!
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest:</span>
                      <span className="font-medium">{bookingData.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{bookingData.guestEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{bookingData.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{bookingData.checkOut}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="text-gray-600">Total ({bookingData.nights} nights):</span>
                      <span className="font-bold text-lg text-blue-600">${bookingData.totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              ) : (
                <BookingForm 
                  pricePerNight={room.pricePerNight}
                  onSubmit={handleBooking}
                />
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Guest Reviews
              {reviews.length > 0 && (
                <span className="text-gray-500 text-2xl ml-2">({reviews.length})</span>
              )}
            </h2>
            
            {!showAddReview && (
              <button
                onClick={() => setShowAddReview(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Write a Review
              </button>
            )}
          </div>

          {/* Add Review Form */}
          {showAddReview && (
            <div className="mb-8">
              <AddReview
                roomId={room.id}
                onSubmit={handleAddReview}
                onCancel={() => setShowAddReview(false)}
              />
            </div>
          )}

          {/* Reviews List or Empty State */}
          {reviews.length > 0 ? (
            <ReviewList
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={reviews.length}
              categoryAverages={categoryAverages}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your experience with this property!</p>
              <button
                onClick={() => setShowAddReview(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Write the First Review
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default RoomDetailPage
