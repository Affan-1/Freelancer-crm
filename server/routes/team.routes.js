const express = require('express');
const router = express.Router();
const {
  getTeam,
  getInvitations,
  inviteMember,
  respondToInvitation,
  updateMember,
  removeMember,
  cancelInvitation,
} = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/role.middleware');

// Public route — invitation response (accept/reject via email link)
router.post('/invitation/respond', respondToInvitation);

// Protected routes
router.get('/', protect, getTeam);
router.get('/invitations', protect, getInvitations);
router.post('/invite', protect, admin, inviteMember);
router.put('/:id', protect, admin, updateMember);
router.delete('/:id', protect, admin, removeMember);
router.delete('/invitation/:id', protect, admin, cancelInvitation);

module.exports = router;
