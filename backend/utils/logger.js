const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user = null, userName = 'System', role = 'visitor', action, description, relatedId = '' }) => {
  try {
    const actorName = user && user.name ? user.name : userName;
    const actorRole = user && user.role ? user.role : role;
    const userId = user && (user._id || user.id) ? (user._id || user.id) : null;

    await ActivityLog.create({
      user: userId,
      userName: actorName,
      role: actorRole,
      action,
      description,
      relatedId: relatedId ? String(relatedId) : '',
    });
  } catch (error) {
    console.error('Failed to record activity log:', error.message);
  }
};

module.exports = { logActivity };
