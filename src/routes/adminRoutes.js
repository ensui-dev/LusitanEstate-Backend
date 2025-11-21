const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllProperties,
  approveProperty,
  rejectProperty,
  bulkApproveProperties,
  deleteProperty,
  getSettings,
  updateSettings,
  getAllInquiries,
  getInquiry,
  respondToInquiry,
  closeInquiry,
  deleteInquiry
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Property management
router.get('/properties', getAllProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject', rejectProperty);
router.put('/properties/bulk-approve', bulkApproveProperties);
router.delete('/properties/:id', deleteProperty);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Inquiry management
router.get('/inquiries', getAllInquiries);
router.get('/inquiries/:id', getInquiry);
router.put('/inquiries/:id/respond', respondToInquiry);
router.put('/inquiries/:id/close', closeInquiry);
router.delete('/inquiries/:id', deleteInquiry);

module.exports = router;