const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Reference to Agency model
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: [true, 'Please assign agent to an agency']
  },
  // Keeping agencyName for backward compatibility, but can be deprecated
  agencyName: {
    type: String,
    trim: true,
    maxlength: [200, 'Agency name cannot be more than 200 characters']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide AMI license number'],
    unique: true,
    trim: true
  },
  specialization: [{
    type: String,
    enum: ['residential', 'commercial', 'luxury', 'rentals', 'land', 'investment']
  }],
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative']
  },
  languages: [{
    type: String,
    enum: ['Portuguese', 'English', 'French', 'Spanish', 'German', 'Italian', 'Dutch', 'Russian', 'Chinese', 'Other']
  }],
  // Performance metrics
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  propertiesListed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  totalSales: {
    type: Number,
    default: 0
  },
  totalRentals: {
    type: Number,
    default: 0
  },
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  // Contact availability
  availability: {
    type: String,
    enum: ['available', 'busy', 'on-vacation', 'offline'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agent', agentSchema);
