function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center animate-pulse shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Text */}
        <h2 className="text-3xl font-bold text-white mb-2">Roomie</h2>
        <p className="text-white/80 text-sm">Loading immersive experience...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
