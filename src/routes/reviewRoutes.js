const express = require('express');
const {
  getPropertyReviews,
  getAgentReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/property/:propertyId', getPropertyReviews);
router.get('/agent/:agentId', getAgentReviews);

router.post('/', protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
