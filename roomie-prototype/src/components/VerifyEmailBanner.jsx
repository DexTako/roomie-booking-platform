import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// Shown to customers who have not confirmed their email address yet (they can't book until they do)
function VerifyEmailBanner({ onShowToast }) {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)

  if (!user || user.role !== 'customer' || user.isEmailVerified !== false) return null

  const handleResend = async () => {
    setIsSending(true)
    try {
      const res = await api.auth.resendVerification()
      onShowToast?.(res.message, 'success')
    } catch (error) {
      onShowToast?.(error.message, 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl bg-amber-50 border border-amber-300 text-amber-900 rounded-xl shadow-lg px-4 py-3 flex items-center justify-between gap-3 text-sm"
    >
      <span>
        📧 Please verify your email <b>{user.email}</b> to start booking. We sent you a link.
      </span>
      <button
        type="button"
        onClick={handleResend}
        disabled={isSending}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-60"
      >
        {isSending ? 'Sending...' : 'Resend email'}
      </button>
    </div>
  )
}

export default VerifyEmailBanner
