const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('project', 'title')
      .populate('client', 'name company');

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      createdBy: req.user._id,
    });

    const createdInvoice = await invoice.save();

    res.status(201).json({
      success: true,
      data: createdInvoice,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.',
      });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Create notification when invoice is marked as paid
    if (req.body.status === 'paid' && invoice.status !== 'paid') {
      await Notification.create({
        user: req.user._id,
        message: 'Invoice marked as paid.',
        type: 'invoice',
      });
    }

    res.json({
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.',
      });
    }

    await invoice.deleteOne();

    res.json({
      success: true,
      message: 'Invoice removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};