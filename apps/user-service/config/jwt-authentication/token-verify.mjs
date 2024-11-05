import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { UserModel } from '../../src/user/index.mjs';
const { chain, get, isEqual } = _;

// Middleware to verify the service token
export function ServiceVerify(req, res, next) {
  req.token = {};
  req.token.serviceVerify = false;
  const token = get(req.headers, 'service-token', '');
  if (isEqual(String(token), String(process.env.SERVICE_TOKEN))) {
    req.token.serviceVerify = true;
  }
  next();
}

// Middleware to verify JWT token
export function TokenVerify(req, res, next) {
  try {
    req.token.userAccess = false;
    req.token.accessToken = null;
    req.token.payload = null;
    const authorizationHeader = get(req.headers, 'authorization', '');
    const tokenType = chain(authorizationHeader).split(' ').head().toLower().value();
    const tokenValue = chain(authorizationHeader).split(' ').nth(1).value();

    if (isEqual(tokenType, 'bearer') && tokenValue) {
      const payload = jwt.verify(tokenValue, process.env.JWT_SECRET);
      req.token.userAccess = true;
      req.token.accessToken = tokenValue;
      req.token.payload = payload; // Store the JWT payload (user info) in req.user
    }
    // else {
    //   res.status(401).json({ error: 'Unauthorized: Token missing or invalid' });
    // }
    next();
  } catch (err) {
    console.log('TokenVerify error:', err);
    next();
  }
}

export async function SetCurrentUser(req, res, next) {
  try {
    req.currentUser = null;
    // Check if token verification has set userAccess and payload
    if (req.token && req.token.userAccess && req.token.payload && req.token.payload.userId) {
      const user = await UserModel.findById(req.token.payload.userId).select('-password');
      if (user) req.currentUser = user; // Set the current user if found
    }
    next();
  } catch (err) {
    console.error('UserVerify error:', err);
    next();
  }
}
