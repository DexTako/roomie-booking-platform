import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider, initializeDefaultAccounts } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { ComparisonProvider } from './context/ComparisonContext.jsx'
import { initializeReviews } from './data/reviews.js'

// Seed default accounts and reviews on app start
initializeDefaultAccounts()
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
