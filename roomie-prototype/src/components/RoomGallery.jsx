import { useState } from 'react'
import ImageLightbox from './ImageLightbox'

function RoomGallery({ images, onTryMe }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index) => {
    setCurrentIndex(index)
  }

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setShowLightbox(true)
  }

  return (
    <>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {/* Main Image Display */}
        <div className="relative aspect-[4/3] bg-gray-800">
          <img
            src={images[currentIndex]}
            alt={`Room view ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openLightbox(currentIndex)}
          />

          {/* Expand Icon */}
          <button
            onClick={() => openLightbox(currentIndex)}
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
            title="View Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Try Me Button - Responsive and Mobile-Friendly */}
        {onTryMe && (
          <button
            onClick={onTryMe}
            className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 group z-10"
          >
            <div className="relative">
              {/* Glow effect - subtle on mobile */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg md:blur-xl opacity-60 md:opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              
              {/* Button - Compact on mobile, larger on desktop */}
              <div className="relative px-3 py-2 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-xl md:shadow-2xl group-hover:shadow-blue-500/50 transition-all transform group-hover:scale-105 active:scale-95">
                <div className="flex items-center gap-1.5 md:gap-3">
                  {/* Icon */}
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* Text */}
                  <span className="text-white font-bold text-xs md:text-lg uppercase tracking-wide md:tracking-wider">
                    Try 3D Tour
                  </span>
                  {/* Arrow - hidden on small mobile */}
                  <svg className="hidden sm:block w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 bg-gray-800 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              onDoubleClick={() => openLightbox(index)}
              className={`relative flex-shrink-0 w-20 h-16 rounded overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-blue-500 opacity-100'
                  : 'opacity-50 hover:opacity-75'
              }`}
              title="Double-click for fullscreen"
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Lightbox */}
    {showLightbox && (
      <ImageLightbox
        images={images}
        initialIndex={currentIndex}
        onClose={() => setShowLightbox(false)}
      />
    )}
  </>
  )
}

export default RoomGallery
