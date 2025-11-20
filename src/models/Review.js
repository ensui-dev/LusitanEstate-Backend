const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['property', 'agent'],
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent multiple reviews from same user for same property/agent
reviewSchema.index({ user: 1, property: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, agent: 1 }, { unique: true, sparse: true });

// Ensure either property or agent is set based on reviewType
reviewSchema.pre('save', function(next) {
  if (this.reviewType === 'property' && !this.property) {
    return next(new Error('Property is required for property reviews'));
  }
  if (this.reviewType === 'agent' && !this.agent) {
    return next(new Error('Agent is required for agent reviews'));
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
