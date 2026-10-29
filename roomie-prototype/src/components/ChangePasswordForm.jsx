import { useState } from 'react'
import api from '../services/api'

// Change password for a logged-in user. Used on the profile page (customers)
// and in a pop-up for hosts and admins.
function ChangePasswordForm({ onDone, onShowToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '', general: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.currentPassword) next.currentPassword = 'Please enter your current password.'
    if (!form.newPassword) {
      next.newPassword = 'Please enter a new password.'
    } else if (form.newPassword.length < 6) {
      next.newPassword = `Your new password is too short (${form.newPassword.length} of 6 characters). Please use at least 6 characters.`
    } else if (form.newPassword === form.currentPassword) {
      next.newPassword = 'Your new password must be different from your current password.'
    }
    if (!form.confirmPassword) {
      next.confirmPassword = 'Please re-enter your new password to confirm it.'
    } else if (form.confirmPassword !== form.newPassword) {
      next.confirmPassword = 'The two new passwords don\'t match. Please type them again.'
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setIsSaving(true)
    try {
      const res = await api.auth.changePassword(form.currentPassword, form.newPassword)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onShowToast?.(res.message || 'Your password has been changed.', 'success')
      onDone?.()
    } catch (error) {
      // e.g. "Your current password is incorrect."
      if (/current password/i.test(error.message)) {
        setErrors({ currentPassword: error.message })
      } else {
        setErrors({ general: error.message })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
      hasError ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
    }`

  const field = (name, label, autoComplete) => (
    <div>
      <label htmlFor={`cp-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={`cp-${name}`}
        name={name}
        type={showPasswords ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={handleChange}
        className={inputClass(errors[name])}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.general && (
        <p className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</p>
      )}

      {field('currentPassword', 'Current password', 'current-password')}
      {field('newPassword', 'New password', 'new-password')}
      {field('confirmPassword', 'Confirm new password', 'new-password')}

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(e) => setShowPasswords(e.target.checked)}
          className="h-4 w-4"
        />
        Show passwords
      </label>

      <button
        type="submit"
        disabled={isSaving}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {isSaving ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  )
}

export default ChangePasswordForm
