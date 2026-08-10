import { useState } from 'react'
import RoomCard from '../components/RoomCard'
import { rooms } from '../data/rooms'

function HomePage({ onSelectRoom }) {
  const [filterTheme, setFilterTheme] = useState('all')

  const filteredRooms = filterTheme === 'all' 
    ? rooms 
    : rooms.filter(room => room.theme === filterTheme)

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">Find Your Perfect Stay</h1>
          <p className="text-xl text-blue-100 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Explore unique apartments with immersive 3D tours
          </p>
          
          {/* Search Bar (Placeholder) */}
          <div className="max-w-2xl mx-auto bg-white rounded-full shadow-xl p-2 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <input
              type="text"
              placeholder="Search by location, theme, or amenities..."
              className="flex-1 px-6 py-3 rounded-full text-gray-800 outline-none"
            />
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-semibold text-gray-700">Filter by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTheme('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTheme === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Rooms
            </button>
            <button
              onClick={() => setFilterTheme('modern')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTheme === 'modern'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setFilterTheme('rustic')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTheme === 'rustic'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Rustic
            </button>
            <button
              onClick={() => setFilterTheme('luxury')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterTheme === 'luxury'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Luxury
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} available
        </p>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onSelect={onSelectRoom}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Roomie?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive 3D Tours</h3>
              <p className="text-gray-600">Explore apartments in immersive 3D before booking</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600">All properties are verified for quality and accuracy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">Competitive rates with transparent pricing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
