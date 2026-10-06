import { useState } from 'react'
import { normalizeReceipt, downloadReceiptPdf, printReceiptPdf } from '../utils/receiptPdf'
import { paymentMethodLabel } from '../utils/payment'
import { formatDateLabel } from '../utils/pricing'

const money = (n) => `$${Number(n || 0).toFixed(2)}`
const isoDay = (v) => (v ? new Date(v).toISOString().split('T')[0] : '')

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`text-right text-gray-900 ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
    </div>
  )
}

// justBooked = true right after checkout (shows the success header)
function ReceiptModal({ booking, onClose, justBooked = false }) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  if (!booking) return null
  const r = normalizeReceipt(booking)

  const run = async (kind, fn) => {
    setBusy(kind)
    setError('')
    try {
      await fn(booking)
    } catch (e) {
      console.error('Receipt error:', e)
      setError('Could not create the PDF. Please try again.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide opacity-90">Roomie</p>
              <h2 className="text-2xl font-bold mt-1">
                {justBooked ? (r.paid ? 'Payment confirmed! 🎉' : 'Booking request sent! 🎉') : 'Payment receipt'}
              </h2>
              <p className="text-sm opacity-90 mt-1">Receipt no. {r.reference}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close receipt"
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${r.paid ? 'bg-green-600' : 'bg-amber-600'}`}>
              {r.paid ? 'PAID' : 'PAY ON ARRIVAL'}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              Status: {r.status}{r.status === 'pending' ? ' (awaiting host approval)' : ''}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">{r.roomName}</h3>
            <Row label="Check-in" value={formatDateLabel(isoDay(r.checkIn))} />
            <Row label="Check-out" value={formatDateLabel(isoDay(r.checkOut))} />
            <Row label="Guests" value={r.guests} />
            <Row label="Guest" value={r.guestName} />
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-2">
            <Row label={`${money(r.pricePerNight)} × ${r.nights} ${r.nights === 1 ? 'night' : 'nights'}`} value={money(r.subtotal)} />
            <Row label="Service fee" value={money(r.serviceFee)} />
            <div className="flex justify-between pt-2 border-t-2 border-blue-200">
              <span className="font-bold text-gray-900">{r.paid ? 'Total paid' : 'Due on arrival'}</span>
              <span className="font-bold text-blue-600 text-lg">{money(r.total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Row label="Payment method" value={paymentMethodLabel(r.paymentMethod)} />
            {r.paymentDetails && <Row label="Details" value={r.paymentDetails} />}
            {r.transactionId && <Row label="Transaction ID" value={r.transactionId} />}
          </div>

          <p className="text-xs text-gray-500 bg-gray-100 rounded-xl p-3">
            💡 Demo payment: no real money was charged.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-3">
          <button
            onClick={() => run('download', downloadReceiptPdf)}
            disabled={!!busy}
            className="flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg disabled:bg-gray-400 transition-all"
          >
            {busy === 'download' ? 'Preparing…' : '⬇ Download PDF'}
          </button>
          <button
            onClick={() => run('print', printReceiptPdf)}
            disabled={!!busy}
            className="flex-1 min-w-[100px] px-4 py-3 rounded-xl font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all"
          >
            {busy === 'print' ? 'Opening…' : '🖨 Print'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal
