const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    }
  }],
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
