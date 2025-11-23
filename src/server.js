require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { startCleanupScheduler } = require('./jobs/cleanupUnverifiedUsers');

// Import routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
// CORS configuration for production
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LusitanEstate API',
    version: '2.0.0',
    description: 'LusitanEstate - Professional real estate platform for Portugal',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      agents: '/api/agents',
      agencies: '/api/agencies',
      favorites: '/api/favorites',
      inquiries: '/api/inquiries',
      reviews: '/api/reviews',
      admin: '/api/admin (Admin only)',
      upload: '/api/upload (Authenticated users)'
    },
    features: [
      'Portuguese market specifics (Districts, Energy Certificates, IMT)',
      'Multi-role authentication (Buyer, Seller, Agent, Admin)',
      'Agency management system',
      'Property approval workflow',
      'Admin dashboard with analytics',
      'CMS settings and configuration'
    ]
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start cleanup job for unverified users (runs every hour)
  startCleanupScheduler(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
