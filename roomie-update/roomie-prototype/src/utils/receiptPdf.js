// Builds the themed (blue/indigo) PDF receipt with jsPDF.
// jsPDF is loaded on demand so it doesn't slow down the first page load.
import { paymentMethodLabel } from './payment'

const money = (n) => `$${Number(n || 0).toFixed(2)}`

const fmtDate = (value, long = true) => {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d)) return String(value)
  return d.toLocaleDateString('en-US', {
    month: long ? 'long' : 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  })
}

const fmtDateTime = (value) => {
  const d = value ? new Date(value) : new Date()
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Accepts the booking from the API (or the My Bookings list shape) and returns one flat object
export const normalizeReceipt = (b = {}) => {
  const id = String(b._id || b.id || '')
  const paid = b.paymentStatus === 'completed'
  return {
    reference: `RMX-${id.slice(-8).toUpperCase() || 'PENDING'}`,
    roomName: b.roomName || b.roomId?.name || 'Room',
    location: b.roomId?.location || '',
    guestName: b.renterName || b.guestName || '',
    guestEmail: b.renterEmail || b.guestEmail || '',
    guestPhone: b.renterPhone || b.guestPhone || '',
    checkIn: b.checkIn || b.checkInDate,
    checkOut: b.checkOut || b.checkOutDate,
    guests: b.guests || b.numberOfGuests || 1,
    nights: b.nights || 1,
    pricePerNight: b.pricePerNight || 0,
    subtotal: b.subtotal || 0,
    serviceFee: b.serviceFee || 0,
    total: b.totalPrice ?? b.total ?? 0,
    paymentMethod: b.paymentMethod || 'card',
    paymentDetails: b.paymentDetails || '',
    transactionId: b.transactionId || '',
    paid,
    paidAt: b.paidAt || b.createdAt,
    issuedAt: b.createdAt || new Date().toISOString(),
    status: b.status || 'pending'
  }
}

const BLUE = [37, 99, 235]     // tailwind blue-600
const INDIGO = [79, 70, 229]   // tailwind indigo-600
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const LIGHT = [239, 246, 255]  // blue-50
const LINE = [229, 231, 235]

export const buildReceiptPdf = async (booking) => {
  const { jsPDF } = await import('jspdf')
  const r = normalizeReceipt(booking)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const M = 18

  // ---- Gradient header (blue-600 -> indigo-600) ----
  const bands = 60
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1)
    doc.setFillColor(...BLUE.map((c, k) => Math.round(c + (INDIGO[k] - c) * t)))
    doc.rect((W / bands) * i, 0, W / bands + 0.5, 46, 'F')
  }
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
  doc.text('Roomie', M, 22)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  doc.text('Payment Receipt', M, 31)
  doc.setFontSize(9)
  doc.text('RECEIPT NO.', W - M, 18, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.text(r.reference, W - M, 25, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(fmtDateTime(r.issuedAt), W - M, 31, { align: 'right' })

  // ---- Status pill ----
  let y = 58
  const pillText = r.paid ? 'PAID' : 'PAY ON ARRIVAL'
  const pillColor = r.paid ? [22, 163, 74] : [217, 119, 6]
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  const pillW = doc.getTextWidth(pillText) + 12
  doc.setFillColor(...pillColor)
  doc.roundedRect(M, y - 6, pillW, 9, 4.5, 4.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(pillText, M + pillW / 2, y, { align: 'center' })
  doc.setTextColor(...GRAY); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Booking status: ' + r.status.charAt(0).toUpperCase() + r.status.slice(1) +
    (r.status === 'pending' ? ' (awaiting host approval)' : ''), M + pillW + 5, y)

  const section = (title) => {
    y += 14
    doc.setTextColor(...BLUE); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    doc.text(title.toUpperCase(), M, y)
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4)
    doc.line(M, y + 2, W - M, y + 2)
    y += 8
  }
  const row = (label, value) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...GRAY)
    doc.text(label, M, y)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
    const lines = doc.splitTextToSize(String(value || '-'), 110)
    doc.text(lines, W - M, y, { align: 'right' })
    y += 6.5 * lines.length
  }

  // ---- Booking ----
  section('Booking details')
  row('Room', r.roomName)
  if (r.location) row('Location', r.location)
  row('Check-in', fmtDate(r.checkIn))
  row('Check-out', fmtDate(r.checkOut))
  row('Nights', r.nights)
  row('Guests', r.guests)

  // ---- Guest ----
  section('Guest')
  row('Name', r.guestName)
  row('Email', r.guestEmail)
  if (r.guestPhone) row('Phone', r.guestPhone)

  // ---- Price breakdown ----
  section('Price breakdown')
  row(`${money(r.pricePerNight)} x ${r.nights} ${r.nights === 1 ? 'night' : 'nights'}`, money(r.subtotal))
  row('Service fee', money(r.serviceFee))
  y += 1
  doc.setFillColor(...LIGHT)
  doc.roundedRect(M, y - 5.5, W - M * 2, 12, 3, 3, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...DARK)
  doc.text(r.paid ? 'Total paid' : 'Total due on arrival', M + 4, y + 2)
  doc.setTextColor(...BLUE); doc.setFontSize(14)
  doc.text(money(r.total), W - M - 4, y + 2, { align: 'right' })
  y += 12

  // ---- Payment ----
  section('Payment')
  row('Method', paymentMethodLabel(r.paymentMethod))
  if (r.paymentDetails) row('Details', r.paymentDetails)
  if (r.transactionId) row('Transaction ID', r.transactionId)
  row(r.paid ? 'Paid on' : 'Payment', r.paid ? fmtDateTime(r.paidAt) : 'To be collected at check-in')

  // ---- Footer ----
  doc.setDrawColor(...LINE)
  doc.line(M, 270, W - M, 270)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...GRAY)
  doc.text('Thank you for booking with Roomie! Keep this receipt for your records.', W / 2, 277, { align: 'center' })
  doc.text('Demo payment: no real money was charged.', W / 2, 282, { align: 'center' })

  return { doc, reference: r.reference }
}

export const downloadReceiptPdf = async (booking) => {
  const { doc, reference } = await buildReceiptPdf(booking)
  doc.save(`Roomie-Receipt-${reference}.pdf`)
}

export const printReceiptPdf = async (booking) => {
  const { doc } = await buildReceiptPdf(booking)
  const url = doc.output('bloburl')
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  iframe.src = url
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (e) {
      window.open(url, '_blank') // fallback: the browser's PDF viewer has its own print button
    }
  }
  document.body.appendChild(iframe)
  setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url) }, 120000)
}
