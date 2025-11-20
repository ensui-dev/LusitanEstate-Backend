const express = require('express');
const {
  getPropertyInquiries,
  getMyInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  getInquiry
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All inquiry routes require authentication
router.use(protect);

router.post('/', createInquiry);
router.get('/my-inquiries', getMyInquiries);
router.get('/property/:propertyId', getPropertyInquiries);

router.route('/:id')
  .get(getInquiry)
  .put(updateInquiry)
  .delete(deleteInquiry);

module.exports = router;
