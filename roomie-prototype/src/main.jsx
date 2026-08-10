import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider, initializeDemoUsers } from './context/AuthContext.jsx'
import { initializeReviews } from './data/reviews.js'

// Initialize demo users and reviews on app start
initializeDemoUsers()
initializeReviews()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
