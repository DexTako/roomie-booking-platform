import { useEffect } from 'react'
import LegalDocument from './LegalContent'

// Pop-up version, so people can read the terms from the sign-up form without losing what they typed
function LegalModal({ type, onClose }) {
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
      >
        <div className="flex justify-end p-3 border-b">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2" aria-label="Close">
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <LegalDocument type={type} />
        </div>
        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LegalModal
