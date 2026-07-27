const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');
const { sendInvitationEmail } = require('../utils/email');

// GET /api/team — list all team members
const getTeam = async (req, res, next) => {
  try {
    const team = await User.find().select('-password');
    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// GET /api/team/invitations — list all invitations
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

// POST /api/team/invite — send an invitation email
const inviteMember = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email is already a team member.' });
    }

    // Check if there's already a pending invitation
    const existingInvite = await Invitation.findOne({ email, status: 'pending' });
    if (existingInvite) {
      return res.status(400).json({ success: false, message: 'A pending invitation already exists for this email.' });
    }

    // Generate a unique token
    const token = Invitation.generateToken();

    // Create the invitation record
    const invitation = await Invitation.create({
      name,
      email,
      role: role || 'member',
      invitedBy: req.user._id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Build accept/reject URLs
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const acceptUrl = `${baseUrl}/invitation?token=${token}&action=accept`;
    const rejectUrl = `${baseUrl}/invitation?token=${token}&action=reject`;

    // Send the email
    const emailResult = await sendInvitationEmail({
      to: email,
      inviterName: req.user.name,
      role: role || 'member',
      acceptUrl,
      rejectUrl,
    });

    // Create a notification
    const notification = await Notification.create({
      user: req.user._id,
      message: `Invitation sent to ${name} (${email}) as ${role}`,
      type: 'team',
    });
    req.io.emit('notification', notification);

    res.status(201).json({
      success: true,
      data: invitation,
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/team/invitation/respond — accept or reject (public route, no auth)
const respondToInvitation = async (req, res, next) => {
  try {
    const { token, action } = req.body;

    if (!token || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid token or action.' });
    }

    const invitation = await Invitation.findOne({ token }).populate('invitedBy', 'name');
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This invitation has already been ${invitation.status}.` });
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'rejected';
      await invitation.save();
      return res.status(400).json({ success: false, message: 'This invitation has expired.' });
    }

    if (action === 'accept') {
      // Create the user account
      const user = await User.create({
        name: invitation.name,
        email: invitation.email,
        password: 'ChangeMe123!', // default password; user should change on first login
        role: invitation.role,
      });

      invitation.status = 'accepted';
      await invitation.save();

      // Notify the inviter
      const notification = await Notification.create({
        user: invitation.invitedBy._id,
        message: `${invitation.name} has accepted the team invitation!`,
        type: 'team',
      });
      req.io.emit('notification', notification);

      return res.json({ success: true, message: 'Invitation accepted! You can now log in.', data: { name: user.name, email: user.email } });
    } else {
      invitation.status = 'rejected';
      await invitation.save();

      // Notify the inviter
      const notification = await Notification.create({
        user: invitation.invitedBy._id,
        message: `${invitation.name} has declined the team invitation.`,
        type: 'team',
      });
      req.io.emit('notification', notification);

      return res.json({ success: true, message: 'Invitation declined.' });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /api/team/:id — update a team member (role, name)
const updateMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== user.role) {
      return res.status(400).json({ success: false, message: "You cannot change your own role." });
    }

    if (req.body.role) user.role = req.body.role;
    if (req.body.name) user.name = req.body.name;

    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/:id — remove a team member
const removeMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent self-removal
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot remove yourself from the team." });
    }

    await User.findByIdAndDelete(req.params.id);

    const notification = await Notification.create({
      user: req.user._id,
      message: `${user.name} has been removed from the team.`,
      type: 'team',
    });
    req.io.emit('notification', notification);

    res.json({ success: true, message: 'Member removed.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/team/invitation/:id — cancel a pending invitation
const cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    await Invitation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invitation cancelled.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTeam, getInvitations, inviteMember, respondToInvitation, updateMember, removeMember, cancelInvitation };
