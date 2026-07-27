const Client = require('../models/Client');
const Project = require('../models/Project');

const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find().populate('createdBy', 'name email');
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const client = new Client({
      ...req.body,
      createdBy: req.user._id,
    });
    const createdClient = await client.save();
    res.status(201).json({ success: true, data: createdClient });
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedClient });
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }
    await client.deleteOne();
    await Project.deleteMany({ client: req.params.id }); // cascade delete
    res.json({ success: true, message: 'Client removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
