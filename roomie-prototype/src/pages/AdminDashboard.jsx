import { useState, useEffect } from 'react'
import { getAllBookings } from '../data/bookings'
import { getAllReviews } from '../data/reviews'

function AdminDashboard({ onBack }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalRenters: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalRevenue: 0,
    totalReviews: 0,
    averageRating: 0
  })
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // overview, users, bookings

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Load users
    const usersJson = localStorage.getItem('registeredUsers')
    const allUsers = usersJson ? JSON.parse(usersJson) : []
    
    // Load bookings
    const allBookings = getAllBookings()
    
    // Load reviews
    const allReviews = getAllReviews()
    
    // Calculate stats
    const hosts = allUsers.filter(u => u.role === 'host')
    const renters = allUsers.filter(u => u.role === 'renter')
    const pending = allBookings.filter(b => b.status === 'pending')
    const approved = allBookings.filter(b => b.status === 'approved' || b.status === 'completed')
    const totalRevenue = allBookings
      .filter(b => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0)
    
    const avgRating = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 0

    setStats({
      totalUsers: allUsers.length,
      totalHosts: hosts.length,
      totalRenters: renters.length,
      totalBookings: allBookings.length,
      pendingBookings: pending.length,
      approvedBookings: approved.length,
      totalRevenue: totalRevenue,
      totalReviews: allReviews.length,
      averageRating: avgRating
    })

    setUsers(allUsers)
    setBookings(allBookings)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'host': return 'bg-blue-100 text-blue-800'
      case 'renter': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">System overview and management</p>
            </div>
          </div>
          
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-gray-500 mt-2">{stats.totalHosts} hosts · {stats.totalRenters} renters</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBookings}</h3>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-xs text-gray-500 mt-2">{stats.pendingBookings} pending · {stats.approvedBookings} approved</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xs text-gray-500 mt-2">From approved bookings</p>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalReviews}</h3>
            <p className="text-sm text-gray-600">Total Reviews</p>
            <p className="text-xs text-gray-500 mt-2">Avg rating: {stats.averageRating}★</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Bookings ({stats.totalBookings})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-700">{stats.pendingBookings} bookings awaiting approval</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-700">{stats.totalUsers} registered users</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-gray-700">{stats.totalReviews} reviews submitted</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left font-medium transition-colors"
                  >
                    Manage Users →
                  </button>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-left font-medium transition-colors"
                  >
                    View All Bookings →
                  </button>
                  <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-left font-medium transition-colors">
                    Export Reports →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{booking.roomName}</h3>
                    <p className="text-sm text-gray-600">Booking #{booking.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Guest</p>
                    <p className="font-medium">{booking.renterName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Check-in</p>
                    <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Check-out</p>
                    <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-semibold text-green-600">${booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
