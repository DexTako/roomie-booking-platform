import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// Conversation about one booking: the customer writes to the host, the host replies.
// Works from both the customer's My Bookings page and the host dashboard.
function BookingMessagesModal({ bookingId, title, subtitle, onClose }) {
  const { user } = useAuth()
  const myId = user?.id || user?._id
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.messages.getThread(bookingId)
      setMessages(res.messages || [])
      if (!silent) setError('')
    } catch (err) {
      if (!silent) setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [bookingId])

  // Load now, then check for replies every 8 seconds while the window is open
  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), 8000)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || isSending) return
    setIsSending(true)
    setError('')
    try {
      const res = await api.messages.send(bookingId, body)
      setMessages(prev => [...prev, res.message])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[200px]">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No messages yet. Write the first one below.
            </p>
          ) : (
            messages.map(m => {
              const mine = (m.senderId?._id || m.senderId) === myId
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      mine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {!mine && (
                      <p className="text-xs font-semibold mb-0.5 capitalize text-gray-500">
                        {m.senderName} · {m.senderRole}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`text-[11px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              rows={2}
              placeholder="Type your message... (Enter to send, Shift+Enter for a new line)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
            <button
              type="submit"
              disabled={isSending || !text.trim()}
              className="px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSending ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingMessagesModal
