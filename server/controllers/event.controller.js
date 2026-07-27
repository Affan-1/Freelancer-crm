const Event = require('../models/Event');

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ createdBy: req.user._id });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user._id,
    });
    const createdEvent = await event.save();
    res.status(201).json({ success: true, data: createdEvent });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, createEvent, deleteEvent };
