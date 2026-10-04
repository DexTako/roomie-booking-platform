import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LogoutConfirmModal from './LogoutConfirmModal'

// Minimal header for the host and admin accounts.
// They only get their dashboard, so there is no browsing, booking,
// wishlist or compare navigation here — just who is signed in and logout.
function StaffHeader({ onLoggedOut }) {
  const { user, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  if (!user) return null

  const label = user.role === 'admin' ? 'Admin' : 'Host'

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />
              </svg>
            </div>
            <span className="text-xl font-bold text-indigo-500">Roomie</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user.name}
            </span>
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

        </div>
      </header>

      {showLogoutModal && (
        <LogoutConfirmModal
          userName={user.name}
          onConfirm={() => {
            logout()
            setShowLogoutModal(false)
            onLoggedOut?.()
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  )
}

export default StaffHeader
