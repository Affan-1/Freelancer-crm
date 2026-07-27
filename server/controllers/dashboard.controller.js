const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');

const getStats = async (req, res, next) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalProjects = await Project.countDocuments();
    
    const invoices = await Invoice.find();
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((acc, curr) => acc + curr.total, 0);
      
    const pendingInvoices = invoices.filter(inv => inv.status !== 'paid').length;

    res.json({
      success: true,
      data: {
        totalClients,
        totalProjects,
        totalRevenue,
        pendingInvoices
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenue = await Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for Recharts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = revenue.map(item => ({
      name: months[item._id - 1],
      total: item.total
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getRevenue };
