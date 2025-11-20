const Review = require('../models/Review');
const Agent = require('../models/Agent');

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      property: req.params.propertyId,
      reviewType: 'property'
    })
      .populate('user', 'name profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reviews for an agent
// @route   GET /api/reviews/agent/:agentId
// @access  Public
exports.getAgentReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      agent: req.params.agentId,
      reviewType: 'agent'
    })
      .populate('user', 'name profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    req.body.user = req.user._id;

    const review = await Review.create(req.body);

    // Update agent average rating if it's an agent review
    if (review.reviewType === 'agent') {
      await updateAgentRating(review.agent);
    }

    await review.populate('user', 'name profilePicture');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (review owner)
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is review owner
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update agent average rating if it's an agent review
    if (review.reviewType === 'agent') {
      await updateAgentRating(review.agent);
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (review owner, admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is review owner or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const agentId = review.agent;

    await review.deleteOne();

    // Update agent average rating if it was an agent review
    if (review.reviewType === 'agent' && agentId) {
      await updateAgentRating(agentId);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update agent rating
async function updateAgentRating(agentId) {
  const reviews = await Review.find({ agent: agentId, reviewType: 'agent' });

  if (reviews.length === 0) {
    await Agent.findByIdAndUpdate(agentId, {
      averageRating: 0,
      totalReviews: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Agent.findByIdAndUpdate(agentId, {
    averageRating: averageRating.toFixed(1),
    totalReviews: reviews.length
  });
}

module.exports = {
  getPropertyReviews: exports.getPropertyReviews,
  getAgentReviews: exports.getAgentReviews,
  createReview: exports.createReview,
  updateReview: exports.updateReview,
  deleteReview: exports.deleteReview
};
