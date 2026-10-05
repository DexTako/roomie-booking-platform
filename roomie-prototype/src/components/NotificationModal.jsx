import { useState, useEffect } from 'react'

function NotificationModal({ 
  isOpen, 
  onClose, 
  title,
  message,
  type = "success", // success, error, info, warning
  showCloseButton = true,
  autoClose = 3000 // Auto close after 3 seconds, set to 0 to disable
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose()
        }, autoClose)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, autoClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 150)
  }

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '🎉',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700'
        }
      case 'error':
        return {
          icon: '❌',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700'
        }
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          border: 'border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        }
      default: // info
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 border-2 ${styles.border} ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {/* Content */}
        <div className="p-6">
          
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <span className="text-3xl">{styles.icon}</span>
          </div>
          
          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </h3>
          )}
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
          
          {/* Close Button */}
          {showCloseButton && (
            <div className="flex justify-center">
              <button
                onClick={handleClose}
                className={`px-6 py-3 text-white rounded-xl font-semibold transition-colors ${styles.button}`}
              >
                Got it
              </button>
            </div>
          )}
          
        </div>
        
      </div>
    </div>
  )
}

export default NotificationModal