import { useState, useEffect } from 'react'

const FAQS = [
  {
    q: 'How do I book a room?',
    a: 'Open a room, press Book, pick your dates, fill in your details and choose a payment method. Your booking is sent to the host as a request and stays Pending until the host approves it.'
  },
  {
    q: 'Why is my booking still Pending?',
    a: 'The host has to approve or decline every request. You can message the host from My Bookings with the Contact Host button, and you will see their reply there.'
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Open My Bookings and press Cancel on a pending or upcoming booking. The dates become available again for other guests.'
  },
  {
    q: 'Which payment methods can I use?',
    a: 'Card, GCash, PayPal, or cash on arrival. Note that this is a demo checkout, so no real money is taken.'
  },
  {
    q: 'Why can’t I pick some dates?',
    a: 'Dates that are shown in red are already booked, and dates with a pending request are held for that guest until the host answers. Choose white (available) dates instead.'
  },
  {
    q: 'When can I leave a review?',
    a: 'After your stay has ended. Open the room page, go to Guest Reviews and press Write a Review. You can review each room once.'
  },
  {
    q: 'How do I change my profile picture?',
    a: 'Go to My Profile, press Edit and paste a link to your picture. Google Drive, Dropbox and Imgur share links are converted automatically, and the image must be public.'
  },
  {
    q: 'I forgot my password. What now?',
    a: 'Password reset is not available yet. Please email support@roomie.com and we will help you get back in.'
  }
]

function FaqModal({ onClose }) {
  const [openIndex, setOpenIndex] = useState(0)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Frequently asked questions"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          {FAQS.map((item, i) => {
            const open = openIndex === i
            return (
              <div key={item.q} className="border border-gray-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 text-left px-4 py-3 font-semibold text-gray-900"
                >
                  {item.q}
                  <span className={`transition-transform text-gray-400 ${open ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {open && <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FaqModal
