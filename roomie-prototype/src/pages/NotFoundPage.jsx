function NotFoundPage({ onNavigateToHome }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8 relative">
          <h1 className="text-[200px] md:text-[280px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Oops! Room Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto">
            Looks like this room doesn't exist. Maybe it was booked by someone else, or the link is broken.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/50 shadow-xl mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Here's what you can do:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Go Home</p>
                <p className="text-sm text-gray-600">Start fresh from the homepage</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Rooms</p>
                <p className="text-sm text-gray-600">Explore available rooms</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Check Wishlist</p>
                <p className="text-sm text-gray-600">View your saved rooms</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onNavigateToHome}
          className="
            px-8
            py-4
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            hover:from-indigo-700
            hover:to-purple-700
            text-white
            rounded-xl
            text-lg
            font-semibold
            shadow-lg
            hover:shadow-xl
            transform
            hover:scale-105
            transition-all
            duration-200
            inline-flex
            items-center
            gap-2
          "
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />
          </svg>
          Back to Home
        </button>

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Lost?</span>
          <span className="animate-bounce">🏠</span>
          <span>We'll help you find your way!</span>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
