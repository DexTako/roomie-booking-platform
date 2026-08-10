import { calculateAverageRating, getReviewsByRoom } from '../data/reviews'
import StarRating from './StarRating'

function RoomCard({ room, onSelect }) {
  const averageRating = calculateAverageRating(room.id)
  const reviewCount = getReviewsByRoom(room.id).length

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelect(room.id)}
    >
      {/* Room Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={room.galleryImages[0]} 
          alt={room.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        
        {/* Theme Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            room.theme === 'modern' ? 'bg-blue-500 text-white' :
            room.theme === 'rustic' ? 'bg-amber-600 text-white' :
            room.theme === 'luxury' ? 'bg-purple-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {room.theme}
          </span>
        </div>

        {/* 3D Badge */}
        {room.has3D && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              3D Tour
            </span>
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
        
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {room.location}
        </p>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={parseFloat(averageRating)} readonly size="sm" />
            <span className="text-sm font-semibold text-gray-900">{averageRating}</span>
            <span className="text-sm text-gray-500">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Up to {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ${room.pricePerNight}
            </span>
            <span className="text-sm text-gray-600"> / night</span>
          </div>
          
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(room.id)
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomCard
