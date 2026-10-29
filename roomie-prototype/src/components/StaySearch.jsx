import { todayISO } from '../utils/pricing'

// "When are you staying?" search: only rooms that are free for the chosen dates are shown.
function StaySearch({ stay, onChange, resultCount, isLoading }) {
  const today = todayISO()
  const hasDates = stay.checkIn && stay.checkOut
  const invalid = stay.checkIn && stay.checkOut && stay.checkOut <= stay.checkIn

  const set = (field, value) => {
    const next = { ...stay, [field]: value }
    // keep check-out after check-in
    if (field === 'checkIn' && next.checkOut && next.checkOut <= value) next.checkOut = ''
    onChange(next)
  }

  const fieldClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <p className="text-sm font-semibold text-gray-800 mb-3">Find a room for your dates</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <label className="text-xs text-gray-500">
          Check-in
          <input type="date" min={today} value={stay.checkIn} onChange={(e) => set('checkIn', e.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs text-gray-500">
          Check-out
          <input type="date" min={stay.checkIn || today} value={stay.checkOut} onChange={(e) => set('checkOut', e.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs text-gray-500">
          Guests
          <select value={stay.guests} onChange={(e) => set('guests', e.target.value)} className={fieldClass}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
              <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => onChange({ checkIn: '', checkOut: '', guests: '' })}
          disabled={!stay.checkIn && !stay.checkOut && !stay.guests}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Clear dates
        </button>
      </div>
      {invalid && <p className="mt-2 text-xs text-red-600">Check-out must be after check-in.</p>}
      {hasDates && !invalid && (
        <p className="mt-2 text-xs text-gray-600" role="status">
          {isLoading ? 'Checking availability...' : `${resultCount} room${resultCount === 1 ? '' : 's'} available for these dates.`}
        </p>
      )}
    </div>
  )
}

export default StaySearch
