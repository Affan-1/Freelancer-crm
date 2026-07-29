const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');
const { sendInvitationEmail } = require('../utils/email');

// GET /api/team
const getTeam = async (req, res, next) => {
  try {
    const team = await User.find().select('-password');
    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// GET /api/team/invitations
const getInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find()
      .populate('invitedBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
};

// POST /api/team/invite
const inviteMember = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email is already a team member.',
      });
    }

    const existingInvite = await Invitation.findOne({
      email,
      status: 'pending',
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'A pending invitation already exists.',
      });
    }

    const token = Invitation.generateToken();

    const invitation = await Invitation.create({
      name,
      email,
      role: role || 'member',
      invitedBy: req.user._id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const baseUrl = process.env.CLIENT_URL;

    const acceptUrl = `${baseUrl}/invitation?token=${token}&action=accept`;
    const rejectUrl = `${baseUrl}/invitation?token=${token}&action=reject`;

    const emailResult = await sendInvitationEmail({
      to: email,
      inviterName: req.user.name,
      role: role || 'member',
      acceptUrl,
      rejectUrl,
    });

    await Notification.create({
      user: req.user._id,
      message: `Invitation sent to ${name} (${email})`,
      type: 'team',
    });

    res.status(201).json({
      success: true,
      data: invitation,
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/team/invitation/respond
const respondToInvitation = async (req, res, next) => {
  try {
    const { token, action } = req.body;

    if (!token || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token or action.',
      });
    }

    const invitation = await Invitation.findOne({ token }).populate(
      'invitedBy',
      'name'
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation already ${invitation.status}.`,
      });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'rejected';
      await invitation.save();

      return res.status(400).json({
        success: false,
        message: 'Invitation expired.',
      });
    }

    if (action === 'accept') {
      const user = await User.create({
        name: invitation.name,
        email: invitation.email,
        password: 'ChangeMe123!',
        role: invitation.role,
      });

      invitation.status = 'accepted';
      await invitation.save();

      await Notification.create({
        user: invitation.invitedBy._id,
        message: `${invitation.name} accepted your invitation.`,
        type: 'team',
      });

      return res.json({
        success: true,
        message: 'Invitation accepted.',
        data: {
          name: user.name,
          email: user.email,
        },
      });
    }

    invitation.status = 'rejected';
    await invitation.save();

    await Notification.create({
      user: invitation.invitedBy._id,
      message: `${invitation.name} rejected your invitation.`,
      type: 'team',
    });

    return res.json({
      success: true,
      message: 'Invitation rejected.',
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/team/:id
const updateMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (
      user._id.toString() === req.user._id.toString() &&
      req.body.role &&
      req.body.role !== user.role
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role.',
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.role) user.role = req.body.role;

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/:id
const removeMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove yourself.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await Notification.create({
      user: req.user._id,
      message: `${user.name} removed from team.`,
      type: 'team',
    });

    res.json({
      success: true,
      message: 'Member removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/invitation/:id
const cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      });
    }

    await Invitation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Invitation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeam,
  getInvitations,
  inviteMember,
  respondToInvitation,
  updateMember,
  removeMember,
  cancelInvitation,
};