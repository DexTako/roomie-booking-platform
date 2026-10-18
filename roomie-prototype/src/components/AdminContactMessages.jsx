import { useState, useEffect } from 'react'
import api from '../services/api'

const STATUS_STYLE = {
  new: 'bg-red-100 text-red-700',
  read: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700'
}

// Admin inbox for messages sent from the public Contact page
function AdminContactMessages() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  const load = async () => {
    try {
      const res = await api.contact.list()
      setMessages(res.messages || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (id, status) => {
    try {
      const res = await api.contact.setStatus(id, status)
      setMessages(prev => prev.map(m => (m._id === id ? res.message : m)))
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleOpen = (m) => {
    const opening = openId !== m._id
    setOpenId(opening ? m._id : null)
    // Opening a new message marks it as read
    if (opening && m.status === 'new') setStatus(m._id, 'read')
  }

  if (isLoading) return <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">Loading messages...</div>

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Contact Messages ({messages.filter(m => m.status === 'new').length} new)
        </h3>
        <button onClick={load} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {messages.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m._id} className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => toggleOpen(m)}
                className="w-full flex items-center justify-between gap-3 text-left px-4 py-3"
              >
                <div className="min-w-0">
                  <p className={`truncate ${m.status === 'new' ? 'font-bold' : 'font-medium'} text-gray-900`}>
                    {m.subject}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {m.name} · {m.email} · {new Date(m.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLE[m.status]}`}>
                  {m.status}
                </span>
              </button>

              {openId === m._id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="whitespace-pre-wrap break-words text-sm text-gray-700 py-3">{m.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                    >
                      Reply by email
                    </a>
                    {m.status !== 'resolved' ? (
                      <button
                        onClick={() => setStatus(m._id, 'resolved')}
                        className="px-4 py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50"
                      >
                        Mark resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => setStatus(m._id, 'read')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminContactMessages
