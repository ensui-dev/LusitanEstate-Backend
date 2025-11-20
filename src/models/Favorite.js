const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  savedSearches: [{
    searchName: {
      type: String,
      trim: true
    },
    criteria: {
      propertyType: String,
      minPrice: Number,
      maxPrice: Number,
      bedrooms: Number,
      bathrooms: Number,
      city: String,
      state: String,
      features: [String]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one favorite document per user
favoriteSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
