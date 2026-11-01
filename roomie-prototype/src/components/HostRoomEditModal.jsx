import { useState, useEffect } from 'react'
import api from '../services/api'

// Lets a host change the price (and basic details) of one of their rooms
function HostRoomEditModal({ room, onClose, onSaved }) {
  const [form, setForm] = useState({
    pricePerNight: String(room.pricePerNight ?? ''),
    capacity: String(room.capacity ?? ''),
    name: room.name || '',
    description: room.description || ''
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '', general: '' }))
  }

  const validate = () => {
    const next = {}
    const price = Number(form.pricePerNight)
    if (form.pricePerNight === '' || !Number.isFinite(price) || price <= 0) {
      next.pricePerNight = 'Please enter a price per night greater than 0.'
    } else if (price > 100000) {
      next.pricePerNight = 'That price looks too high. Please enter 100,000 or less.'
    }
    const capacity = Number(form.capacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
      next.capacity = 'Capacity must be a whole number from 1 to 20 guests.'
    }
    if (form.name.trim().length < 3) next.name = 'The room name must be at least 3 characters.'
    if (form.description.trim().length < 10) next.description = 'Please write a description of at least 10 characters.'
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
    const patch = {
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      name: form.name.trim(),
      description: form.description.trim()
    }
    try {
      const res = await api.rooms.update(room._id || room.id, patch)
      onSaved({ ...room, ...patch, ...(res?.room || {}) })
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = (bad) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
      bad ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        noValidate
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-900">Edit room</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">×</button>
        </div>

        {errors.general && (
          <p className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">{errors.general}</p>
        )}

        <div>
          <label htmlFor="re-price" className="block text-sm font-medium text-gray-700 mb-1">Price per night ($)</label>
          <input id="re-price" name="pricePerNight" type="number" min="1" step="0.01" inputMode="decimal"
            value={form.pricePerNight} onChange={handleChange} className={inputClass(errors.pricePerNight)} />
          {errors.pricePerNight
            ? <p className="mt-1 text-xs text-red-600">{errors.pricePerNight}</p>
            : <p className="mt-1 text-xs text-gray-500">The new price applies to future bookings. Existing bookings keep the price they were made at.</p>}
        </div>

        <div>
          <label htmlFor="re-capacity" className="block text-sm font-medium text-gray-700 mb-1">Maximum guests</label>
          <input id="re-capacity" name="capacity" type="number" min="1" max="20"
            value={form.capacity} onChange={handleChange} className={inputClass(errors.capacity)} />
          {errors.capacity && <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>}
        </div>

        <div>
          <label htmlFor="re-name" className="block text-sm font-medium text-gray-700 mb-1">Room name</label>
          <input id="re-name" name="name" type="text" value={form.name} onChange={handleChange} className={inputClass(errors.name)} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="re-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="re-desc" name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass(errors.description)} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default HostRoomEditModal
