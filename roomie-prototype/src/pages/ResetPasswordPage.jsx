import { useState } from 'react'
import api from '../services/api'

// Opened from the link in the password reset email (/?reset=TOKEN)
function ResetPasswordPage({ token, onGoToLogin, onRequestNewLink }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [linkProblem, setLinkProblem] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password) return setError('Please enter your new password.')
    if (password.length < 6) {
      return setError(`Your new password is too short (${password.length} of 6 characters). Please use at least 6 characters.`)
    }
    if (password !== confirm) return setError('The two passwords don\'t match. Please type them again.')

    setIsSaving(true)
    try {
      await api.auth.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err.message)
      if (/invalid or has expired|incomplete/i.test(err.message)) setLinkProblem(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-green-600">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password updated</h1>
            <p className="text-sm text-gray-600 mb-6">You can now log in with your new password.</p>
            <button
              onClick={onGoToLogin}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
              <p className="text-sm text-gray-500 mt-1">Enter a new password for your Roomie account.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
                {linkProblem && (
                  <button
                    type="button"
                    onClick={onRequestNewLink}
                    className="block mt-2 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Request a new reset link
                  </button>
                )}
              </div>
            )}

            <div>
              <label htmlFor="rp-password" className="block text-sm font-semibold text-gray-700 mb-2">
                New password
              </label>
              <input
                id="rp-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
              />
            </div>

            <div>
              <label htmlFor="rp-confirm" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError('') }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} className="h-4 w-4" />
              Show passwords
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
