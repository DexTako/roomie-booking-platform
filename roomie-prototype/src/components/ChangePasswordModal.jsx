import { useEffect } from 'react'
import ChangePasswordForm from './ChangePasswordForm'

// Pop-up used by host/admin accounts (they have no profile page)
function ChangePasswordModal({ onClose, onShowToast }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">
            ×
          </button>
        </div>
        <ChangePasswordForm onShowToast={onShowToast} onDone={onClose} />
      </div>
    </div>
  )
}

export default ChangePasswordModal
