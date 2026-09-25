import { useState, useEffect } from 'react'

function AdvancedFilters({ onFilterChange, totalRooms }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    capacity: 'all',
    amenities: [],
    sortBy: 'featured'
  })

  const amenitiesList = [
    { id: 'wifi', label: 'Free WiFi', icon: '📶' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { id: 'workspace', label: 'Workspace', icon: '💼' },
    { id: '3d', label: '3D Tour', icon: '🎮' }
  ]

  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  const handlePriceChange = (index, value) => {
    const newRange = [...filters.priceRange]
    newRange[index] = parseInt(value)
    setFilters({ ...filters, priceRange: newRange })
  }

  const toggleAmenity = (amenityId) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(a => a !== amenityId)
      : [...filters.amenities, amenityId]
    setFilters({ ...filters, amenities: newAmenities })
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 500],
      capacity: 'all',
      amenities: [],
      sortBy: 'featured'
    })
  }

  const activeFiltersCount = 
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0) +
    (filters.capacity !== 'all' ? 1 : 0) +
    filters.amenities.length

  return (
    <div className="relative">
      
      {/* Filter Button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 transition-all shadow-sm hover:shadow-md group"
        >
          <svg className="w-5 h-5 text-gray-700 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-semibold text-gray-900 group-hover:text-blue-600">
            Advanced Filters
          </span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 bg-white cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mb-6 bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6 animate-fade-in">
          
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                💰 Price per Night
              </label>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 -mt-2"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-center">
                    <span className="text-sm font-bold text-gray-900">
                      ${filters.priceRange[0]}
                    </span>
                  </div>
                  <span className="text-gray-500">—</span>
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-center">
                    <span className="text-sm font-bold text-gray-900">
                      ${filters.priceRange[1]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                👥 Guest Capacity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['all', '1-2', '3-4', '5+'].map(cap => (
                  <button
                    key={cap}
                    onClick={() => setFilters({ ...filters, capacity: cap })}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      filters.capacity === cap
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cap === 'all' ? 'Any' : cap}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                ✨ Amenities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {amenitiesList.map(amenity => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.amenities.includes(amenity.id)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{amenity.icon}</span>
                    <span>{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results Count */}
          <div className="mt-6 pt-6 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{totalRooms}</span> room{totalRooms !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

export default AdvancedFilters
