import { useState, useEffect } from 'react'

function LoginPromptModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister,
  title = "Sign in Required",
  message = "Please sign in to continue with your booking."
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 150)
  }

  const handleLogin = () => {
    onLogin()
    handleClose()
  }

  const handleRegister = () => {
    onRegister()
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Content */}
        <div className="p-8">
          
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-8">
            {message}
          </p>
          
          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors"
            >
              Sign In
            </button>
            
            <div className="text-center text-gray-500">or</div>
            
            <button
              onClick={handleRegister}
              className="w-full py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-lg transition-colors"
            >
              Create Account
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Join thousands of users who trust Roomie for their accommodation needs
          </p>
          
        </div>
        
      </div>
    </div>
  )
}

export default LoginPromptModal