import { useWishlist } from '../context/WishlistContext'
import { rooms } from '../data/rooms'
import RoomCard from '../components/RoomCard'
import Breadcrumb from '../components/Breadcrumb'

function MyWishlistPage({ onBack, onViewRoom }) {
  const { wishlist, wishlistCount } = useWishlist()

  const wishlistRooms = rooms.filter(room => wishlist.includes(room.id))

  return (
    <div className="min-h-screen bg-gray-50 pt-24">

      {/* Header */}
      <div className="bg-white border-b sticky top-20 z-10">
        <div className="container mx-auto px-4 py-6">
          
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBack },
              { label: 'My Wishlist' }
            ]}
          />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistCount} {wishlistCount === 1 ? 'room' : 'rooms'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">

        {wishlistRooms.length === 0 ? (
          
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16">
            
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your wishlist is empty
            </h2>

            <p className="text-gray-600 mb-8">
              Start saving rooms you love by clicking the heart icon on any room card.
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

        ) : (

          /* Wishlist Grid */
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Click on any room to view details or click the heart again to remove from wishlist.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onSelect={onViewRoom}
                />
              ))}
            </div>
          </>

        )}

      </div>

    </div>
  )
}

export default MyWishlistPage
