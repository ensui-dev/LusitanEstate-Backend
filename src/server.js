require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
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

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Portuguese Real Estate CMS API',
    version: '2.0.0',
    description: 'Comprehensive real estate listing and CMS platform for Portugal',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      agents: '/api/agents',
      agencies: '/api/agencies',
      favorites: '/api/favorites',
      inquiries: '/api/inquiries',
      reviews: '/api/reviews',
      admin: '/api/admin (Admin only)'
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
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
