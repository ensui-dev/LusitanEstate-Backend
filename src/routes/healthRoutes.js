const express = require('express');
const { getHealthStatus } = require('../controllers/healthController');

const router = express.Router();

// Health check endpoint - public
router.get('/', getHealthStatus);

module.exports = router;
