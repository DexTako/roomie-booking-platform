const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Production-ready middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          // Main Vercel production URL
          'https://roomie-booking-platform-ub23.vercel.app',
          // Allow any Vercel preview URL pattern (with or without trailing slash)
          /^https:\/\/roomie-booking-platform-ub23-.*\.vercel\.app\/?$/,
          // Also support the specific frontend URL if set
          ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, '')) : [])
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === normalizedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin) || allowedOrigin.test(normalizedOrigin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (important for Render)
app.set('trust proxy', 1);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🏨 Roomie Booking API is running!',
    status: 'success' 
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api', require('./routes/reviews'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🔄 Received shutdown signal, shutting down gracefully...');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS origin: ${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'localhost:3000'}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = app;
