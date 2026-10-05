import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import {
  toISODate,
  parseISODate,
  todayISO,
  addDaysISO,
  countNights,
  formatDateLabel
} from '../utils/pricing'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const monthTitle = (year, month) =>
  new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

// Interactive, responsive availability calendar for one room.
//  - Shows booked and pending nights live (fetches from backend API).
//  - Lets the customer pick check-in and check-out; ranges that would cross a
//    booked night cannot be selected.
//  - readOnly mode is used by the host to just view occupancy.
function AvailabilityCalendar({
  roomId,
  checkIn = '',
  checkOut = '',
  onChange,
  readOnly = false
}) {
  const today = todayISO()
  const todayDate = parseISODate(today)

  const [view, setView] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() })
  const [occupied, setOccupied] = useState({})
  const [hoverDate, setHoverDate] = useState('')
  const [notice, setNotice] = useState('')

  // Fetch occupied dates from backend API
  useEffect(() => {
    const fetchOccupiedDates = async () => {
      if (!roomId) return
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rooms/${roomId}/occupied-dates`)
        const data = await response.json()
        
        if (data.success && data.occupiedRanges) {
          // Convert ranges to night-by-night occupied map
          const occupiedMap = {}
          data.occupiedRanges.forEach(range => {
            const startISO = range.checkIn.split('T')[0]
            const endISO = range.checkOut.split('T')[0]
            const nights = countNights(startISO, endISO)
            
            for (let i = 0; i < nights; i++) {
              const night = addDaysISO(startISO, i)
              occupiedMap[night] = range.status
            }
          })
          
          setOccupied(occupiedMap)
        }
      } catch (error) {
        console.error('Failed to fetch occupied dates:', error)
      }
    }

    fetchOccupiedDates()
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchOccupiedDates, 30000)
    return () => clearInterval(interval)
  }, [roomId])

  // If the selected dates get taken (e.g. by someone else) clear the selection
  useEffect(() => {
    if (readOnly || !checkIn || !checkOut) return
    const nights = countNights(checkIn, checkOut)
    for (let i = 0; i < nights; i++) {
      if (occupied[addDaysISO(checkIn, i)]) {
        onChange?.({ checkIn: '', checkOut: '' })
        setNotice('Those dates were just booked. Please pick new dates.')
        break
      }
    }
  }, [occupied])

  // When dates are set from outside (e.g. "next available"), bring them into view
  useEffect(() => {
    if (!checkIn) return
    const d = parseISODate(checkIn)
    const twoMonths = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
    const offset = (d.getFullYear() - view.year) * 12 + (d.getMonth() - view.month)
    if (offset < 0 || offset > (twoMonths ? 1 : 0)) {
      setView({ year: d.getFullYear(), month: d.getMonth() })
    }
  }, [checkIn])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  // Last day the guest could check out on, given the chosen check-in
  // (the first booked night after check-in is still a valid check-out day)
  const maxCheckOut = useMemo(() => {
    if (!checkIn || checkOut) return ''
    for (let i = 0; i < 365; i++) {
      const night = addDaysISO(checkIn, i)
      if (i > 0 && occupied[night]) return night
    }
    return ''
  }, [checkIn, checkOut, occupied])

  const isPast = (iso) => iso < today
  const selectingEnd = !!checkIn && !checkOut

  const handleDayClick = (iso) => {
    if (readOnly || isPast(iso)) return

    // Picking a check-out date
    if (selectingEnd && iso > checkIn) {
      if (maxCheckOut && iso > maxCheckOut) {
        setNotice('Your stay can’t include nights that are already booked.')
        return
      }
      onChange?.({ checkIn, checkOut: iso })
      setHoverDate('')
      return
    }

    // Starting (or restarting) a selection
    if (occupied[iso]) {
      setNotice(occupied[iso] === 'pending'
        ? 'That night has a pending request.'
        : 'That night is already booked.')
      return
    }
    onChange?.({ checkIn: iso, checkOut: '' })
  }

  const clearDates = () => {
    onChange?.({ checkIn: '', checkOut: '' })
    setHoverDate('')
    setNotice('')
  }

  const shiftMonth = (delta) => {
    setView(prev => {
      const d = new Date(prev.year, prev.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const canGoBack =
    view.year > todayDate.getFullYear() ||
    (view.year === todayDate.getFullYear() && view.month > todayDate.getMonth())

  const previewEnd = selectingEnd && hoverDate && hoverDate > checkIn && (!maxCheckOut || hoverDate <= maxCheckOut)
    ? hoverDate
    : ''

  const renderMonth = (year, month, extraClass = '') => {
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []

    for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`pad-${i}`} />)

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISODate(new Date(year, month, day))
      const status = occupied[iso] // 'approved' | 'pending' | undefined
      const past = isPast(iso)
      const isStart = iso === checkIn
      const isEnd = iso === checkOut
      const rangeEnd = checkOut || previewEnd
      const inRange = checkIn && rangeEnd && iso > checkIn && iso < rangeEnd
      const beyondLimit = selectingEnd && maxCheckOut && iso > maxCheckOut

      let style = 'bg-white text-gray-800 hover:bg-blue-50 border border-gray-200'
      let label = 'Available'

      if (past) {
        style = 'bg-gray-50 text-gray-300 border border-transparent cursor-not-allowed'
        label = 'Past date'
      } else if (isStart || isEnd) {
        style = 'bg-blue-600 text-white border border-blue-600 font-semibold'
        label = isStart ? 'Check-in' : 'Check-out'
      } else if (inRange) {
        style = 'bg-blue-100 text-blue-900 border border-blue-100'
        label = 'In your stay'
      } else if (selectingEnd && iso === maxCheckOut) {
        // The day another guest checks in is still a valid check-out day
        style = 'bg-white text-gray-800 hover:bg-blue-50 border border-blue-300'
        label = 'Available as check-out'
      } else if (status === 'approved') {
        style = 'bg-red-100 text-red-700 border border-red-200 cursor-not-allowed line-through decoration-red-300'
        label = 'Booked'
      } else if (status === 'pending') {
        style = 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed'
        label = 'Pending request'
      } else if (beyondLimit) {
        style = 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
        label = 'Unavailable for this stay'
      }

      if (iso === today && !isStart && !isEnd) style += ' ring-1 ring-blue-400'
      if (readOnly) style = style.replace('hover:bg-blue-50', '')

      cells.push(
        <button
          key={iso}
          type="button"
          onClick={() => handleDayClick(iso)}
          onMouseEnter={() => setHoverDate(iso)}
          onMouseLeave={() => setHoverDate('')}
          disabled={past}
          aria-label={`${formatDateLabel(iso)}: ${label}`}
          title={`${formatDateLabel(iso)} • ${label}`}
          className={`aspect-square w-full rounded-lg text-xs sm:text-sm flex items-center justify-center transition-colors ${style} ${readOnly ? 'cursor-default' : ''}`}
        >
          {day}
        </button>
      )
    }

    return (
      <div className={extraClass}>
        <h4 className="text-center font-semibold text-gray-900 mb-3">{monthTitle(year, month)}</h4>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-medium text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    )
  }

  const next = new Date(view.year, view.month + 1, 1)
  const nights = countNights(checkIn, checkOut)

  return (
    <div className="w-full">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-xs text-gray-500 hidden sm:block">
          {readOnly ? 'Occupancy calendar' : selectingEnd ? 'Now choose your check-out date' : 'Choose your check-in date'}
        </span>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* One month on phones, two on larger screens */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderMonth(view.year, view.month)}
        {renderMonth(next.getFullYear(), next.getMonth(), 'hidden md:block')}
      </div>

      {/* Notice */}
      {notice && (
        <div role="status" className="mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          {notice}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-white border border-gray-300" />Available</span>
        {!readOnly && <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-blue-600" />Your dates</span>}
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-200" />Pending request</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-200" />Booked</span>
      </div>

      {/* Selection summary */}
      {!readOnly && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{checkIn ? formatDateLabel(checkIn) : 'Check-in'}</span>
            <span className="mx-2 text-gray-400">→</span>
            <span className="font-medium">{checkOut ? formatDateLabel(checkOut) : 'Check-out'}</span>
            {nights > 0 && <span className="ml-2 text-blue-600 font-semibold">{nights} {nights === 1 ? 'night' : 'nights'}</span>}
          </div>
          {(checkIn || checkOut) && (
            <button type="button" onClick={clearDates} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AvailabilityCalendar
