const express = require('express');
const router = express.Router();
const {
  getAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
  verifyAgency,
  unverifyAgency,
  getAgencyStats,
  addAgentToAgency,
  removeAgentFromAgency
} = require('../controllers/agencyController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAgencies);
router.get('/:id', getAgency);

// Protected routes
router.post('/', protect, authorize('admin'), createAgency);
router.put('/:id', protect, updateAgency);
router.delete('/:id', protect, authorize('admin'), deleteAgency);

// Admin only - verification
router.put('/:id/verify', protect, authorize('admin'), verifyAgency);
router.put('/:id/unverify', protect, authorize('admin'), unverifyAgency);

// Agency manager or admin - statistics and agent management
router.get('/:id/stats', protect, getAgencyStats);
router.post('/:id/agents', protect, addAgentToAgency);
router.delete('/:id/agents/:agentId', protect, removeAgentFromAgency);

module.exports = router;
