const express = require('express');
const router = express.Router();
const { getStats, getRevenue } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/stats', protect, getStats);
router.get('/revenue', protect, getRevenue);

module.exports = router;
