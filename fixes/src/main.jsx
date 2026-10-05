import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { ComparisonProvider } from './context/ComparisonContext.jsx'
import { initializeReviews } from './data/reviews.js'

// Seed reviews on app start (accounts now live in the backend DB)
initializeReviews()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <ComparisonProvider>
          <App />
        </ComparisonProvider>
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>,
)
