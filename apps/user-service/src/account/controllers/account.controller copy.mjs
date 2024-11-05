import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { UserModel } from '../../user/models/user.model.mjs'; // Import the user model
import { AuthTokenModel } from '../models/authToken.model.mjs';

// req.token.userAccess = false;
// req.token.accessToken = null;
// req.token.payload = null;
// req.token.serviceVerify = false;
// req.currentUser = null;

// Controller method to get the current user
export const getCurrentUser = async (req, res) => {
  try {
    // Extract user ID from the decoded JWT token, which should be in the request after authentication
    const user = req.currentUser;

    // Find the user by ID in the database
    const userExists = await UserModel.exists(req.token.payload.userId);

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user data
    res.json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function getTokenByRefreshToken(req, res) {
  const { refreshToken } = req.body; // Assume refreshToken is sent in the request body

  try {
    // Verify the refresh token using the JWT secret
    const refreshTokenPayload = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    // Find the auth token and populate the associated user data
    const authToken = await AuthTokenModel.findOne({ refreshToken }).populate({ path: 'userId' });

    if (!authToken) {
      return res.status(400).json({ error: 'A refresh token was not located.' });
    }

    const user = authToken.userId;

    // Check if the user is disabled
    if (!user.status) {
      return res.status(403).json({ error: 'The user has been disabled.' });
    }

    // Generate a new access token
    authToken.lastTokenGenerated = jwt.sign(
      {
        userId: user._id,
        roles: user.roles || [],
        deviceDocId: _.get(refreshTokenPayload, 'deviceDocId'),
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Increment the generated token count
    authToken.generatedTokenCount += 1;

    // Save changes and update user activity
    await Promise.all([
      authToken.save(),
      // context.dataSources.userActivityDataSource.updateLastActivity(String(user._id)),
      // context.cacheContext.cache.invalidateCache({
      //   type: 'getCurrentUser',
      //   id: String(user._id),
      // }),
    ]);

    // Return the newly generated token
    return res.status(200).json({ token: authToken.lastTokenGenerated });
  } catch (err) {
    console.error('Error during token refresh:', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
}
