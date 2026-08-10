function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, type = "danger" }) {
  if (!isOpen) return null

  const colors = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    }
  }

  const currentColors = colors[type] || colors.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Icon */}
        <div className={`w-12 h-12 ${currentColors.iconBg} rounded-full flex items-center justify-center mb-4 mx-auto`}>
          <svg className={`w-6 h-6 ${currentColors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 ${currentColors.button} text-white rounded-lg transition-colors font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
