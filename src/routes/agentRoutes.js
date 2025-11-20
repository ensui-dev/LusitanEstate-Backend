const express = require('express');
const {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  getMyAgentProfile
} = require('../controllers/agentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAgents)
  .post(protect, createAgent);

router.get('/me', protect, getMyAgentProfile);

router.route('/:id')
  .get(getAgent)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

module.exports = router;
