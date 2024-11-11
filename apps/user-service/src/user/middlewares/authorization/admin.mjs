import { Role } from '../../models/user.model.mjs';
import { adminValidateCreateUser } from '../../validators/user.validator.mjs';

export const checkPermissionsByRole = (req, res, next) => {
  const { role } = req.user ? req.user : { role: null };

  // Admin validation
  if (role === Role.Admin) {
    const { error } = adminValidateCreateUser.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    return next();
  }
  // Unauthorized if user is attempting to update another user's profile
  return res.status(403).json({ error: 'You are not authorized to perform this action.' });
};
