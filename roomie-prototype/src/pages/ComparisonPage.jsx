import { useComparison } from '../context/ComparisonContext'
import { getRoomById } from '../data/rooms'
import Breadcrumb from '../components/Breadcrumb'

function ComparisonPage({ onBack, onViewRoom }) {
  const { comparison, removeFromComparison, clearComparison } = useComparison()

  // Safety check - ensure comparison is an array
  const comparisonArray = Array.isArray(comparison) ? comparison : []
  const comparisonRooms = comparisonArray.map(id => getRoomById(id)).filter(Boolean)

  if (comparisonRooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBack },
              { label: 'Compare Rooms' }
            ]}
          />

          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No rooms to compare
            </h2>

            <p className="text-gray-600 mb-8">
              Add rooms to comparison by clicking the "Compare" checkbox on room cards.
            </p>

            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Rooms
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <Breadcrumb
          items={[
            { label: 'Home', onClick: onBack },
            { label: 'Compare Rooms' }
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Compare Rooms</h1>
            <p className="text-gray-600 mt-1">
              Comparing {comparisonRooms.length} {comparisonRooms.length === 1 ? 'room' : 'rooms'}
            </p>
          </div>

          <button
            onClick={clearComparison}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Mobile Warning */}
          <div className="md:hidden bg-blue-50 border-b border-blue-200 px-4 py-3">
            <p className="text-sm text-blue-900 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Swipe left/right to see all rooms
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left font-semibold text-gray-900 min-w-[200px]">
                    Feature
                  </th>
                  {comparisonRooms.map(room => (
                    <th key={room.id} className="px-4 sm:px-6 py-4 min-w-[240px] sm:min-w-[280px]">
                      <div className="space-y-3">
                        <img
                          src={room.galleryImages?.[0] || room.images?.[0] || '/placeholder.jpg'}
                          alt={room.name}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg"
                        />
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{room.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{room.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewRoom(room.id)}
                            className="flex-1 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => removeFromComparison(room.id)}
                            className="px-2 sm:px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                
                {/* Price */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base">
                    Price per Night
                  </td>
                  {comparisonRooms.map(room => (
                    <td key={room.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">${room.pricePerNight}</span>
                    </td>
                  ))}
                </tr>

                {/* Theme */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base">
                    Theme
                  </td>
                  {comparisonRooms.map(room => (
                    <td key={room.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize ${
                        room.theme === 'modern' ? 'bg-blue-100 text-blue-700' :
                        room.theme === 'rustic' ? 'bg-amber-100 text-amber-700' :
                        room.theme === 'luxury' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {room.theme}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Capacity */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base">
                    Capacity
                  </td>
                  {comparisonRooms.map(room => (
                    <td key={room.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-gray-700 text-sm sm:text-base">Up to {room.capacity} guests</span>
                    </td>
                  ))}
                </tr>

                {/* 3D Tour */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base">
                    3D Virtual Tour
                  </td>
                  {comparisonRooms.map(room => (
                    <td key={room.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      {room.has3D ? (
                        <span className="flex items-center gap-2 text-green-600 text-sm sm:text-base">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Available</span>
                          <span className="sm:hidden">Yes</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm sm:text-base">No</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Amenities */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base">
                    Amenities
                  </td>
                  {comparisonRooms.map(room => (
                    <td key={room.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <ul className="space-y-1 sm:space-y-2">
                        {room.amenities.map((amenity, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="break-words">{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base">
                    Description
                  </td>
                  {comparisonRooms.map(room => (
                    <td key={room.id} className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs sm:text-sm text-gray-700">{room.description}</p>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ComparisonPage
