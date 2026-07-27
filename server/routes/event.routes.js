const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .delete(protect, deleteEvent);

module.exports = router;
