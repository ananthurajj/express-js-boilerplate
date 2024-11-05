import { Role } from '../../models/user.model.mjs';
import { adminUpdateUserSchema, userUpdateUserSchema } from '../../validators/user.validator.mjs';

export const checkPermissionsById = (req, res, next) => {
  const { role, userId } = req.user; // Assume `req.user` contains authenticated user details
  const isOwner = userId === req.params.id;

  // Admin validation
  if (role === Role.Admin) {
    const { error } = adminUpdateUserSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    return next();
  }

  // Regular user validation for their own profile
  if (role === Role.User && isOwner) {
    const { error } = userUpdateUserSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
    return next();
  }

  // Unauthorized if user is attempting to update another user's profile
  return res.status(403).json({ error: 'You are not authorized to perform this action.' });
};
