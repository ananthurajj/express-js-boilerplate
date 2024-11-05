import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { SQSHandler } from '../../../config/aws/sqs.mjs';
import { TwilioClient } from '../../../config/twilio/config-twilio.mjs';
import { Role, UserModel } from '../../user/models/user.model.mjs';
import { AuthTokenModel } from '../models/authToken.model.mjs';
import { DeviceTokenModel, DeviceType } from '../models/deviceToken.model.mjs';
import { updateLastActivity } from './user-activity.controller.mjs';
const { get } = _;

// req.token.userAccess = false;
// req.token.accessToken = null;
// req.token.payload = null;
// req.token.serviceVerify = false;
// req.currentUser = null;

// Controller method to get the current user
export const getCurrentUser = async (req, res) => {
  try {
    let userExists = null;
    if (req.token.payload && req.token.payload.userId) {
      // Find the user by ID in the database
      userExists = await UserModel.exists({ _id: req.token.payload.userId });
    }
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user data
    return res.json({ user: req.currentUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate new tokens (access and refresh tokens)
const getTokens = async (payload) => {
  try {
    const authToken = new AuthTokenModel({
      userId: payload.userId,
      lastTokenGenerated: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }),
      refreshToken: jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: '30d' }),
    });
    return authToken.save();
  } catch (err) {
    console.log('err: getTokens', err);
    throw new Error('Token generation failed.');
  }
};

// Refresh token
export const getTokenByRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const refreshTokenPayload = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    const authToken = await AuthTokenModel.findOne({ refreshToken }).populate({ path: 'userId' });
    if (!authToken) return res.status(400).json({ error: 'Refresh token not located.' });

    const user = authToken.userId;
    if (!user.status) return res.status(403).json({ error: 'User has been disabled.' });

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        roles: user.roles || [],
        deviceDocId: get(refreshTokenPayload, 'deviceDocId'),
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    authToken.lastTokenGenerated = newAccessToken;
    authToken.generatedTokenCount += 1;
    await Promise.all([authToken.save(), updateLastActivity(String(user._id))]);

    return res.json({ token: newAccessToken });
  } catch (err) {
    console.log('err: getTokenByRefreshToken', err);
    return res.status(400).json({ error: 'Invalid or expired refresh token' });
  }
};

const trustedPhoneNumbers = ['+919778207807', '+919207304407'];
// Generate OTP
export const generateOtp = async (req, res) => {
  const { countryCode, phoneNumber } = req.body;
  try {
    if (process.env.TEST_MODE === 'false' && !trustedPhoneNumbers.includes(countryCode + phoneNumber)) {
      const client = TwilioClient();
      await client.verifications.create({
        rateLimits: {
          project_rate_limiter: countryCode + phoneNumber,
        },
        to: countryCode + phoneNumber,
        channel: 'sms',
      });
    }

    const user = await UserModel.exists({ phoneNumberWithCountryCode: countryCode + phoneNumber });
    return res.json({
      status: user?._id ? 200 : 201,
      message: 'Successfully sent OTP to your number',
    });
  } catch (err) {
    console.log('err: generateOtp', err);
    return res.status(400).json({ error: 'Invalid phone number' });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { countryCode, phoneNumber, otp } = req.body;

  try {
    let user = await UserModel.findOne({ phoneNumberWithCountryCode: countryCode + phoneNumber });
    if (user && (!user.status || user.role === Role.Admin))
      return res.status(403).json({ error: 'User has been disabled' });

    if (process.env.TEST_MODE === 'false' && !trustedPhoneNumbers.includes(countryCode + phoneNumber)) {
      const client = TwilioClient();
      const verify = await client.verificationChecks.create({
        rateLimits: {
          project_rate_limiter: countryCode + phoneNumber,
        },
        to: countryCode + phoneNumber,
        code: otp,
      });
      if (!verify.valid) return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!user) {
      user = new UserModel({ countryCode, phoneNumber });
      await user.save();
    }

    const device = new DeviceTokenModel({ userId: String(user._id) });
    const tokens = await getTokens({ userId: String(user._id), role: user.role, deviceDocId: String(device._id) });
    await device.save();

    return res.json({
      accessToken: tokens.lastTokenGenerated,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.log('err: verifyOtp', err);
    return res.status(400).json({ error: 'OTP verification failed' });
  }
};

// Logout
export const logout = async (req, res) => {
  const { accessToken, payload } = req.token;
  try {
    await Promise.all([
      AuthTokenModel.deleteOne({ lastTokenGenerated: accessToken }),
      DeviceTokenModel.deleteOne({ _id: payload.deviceDocId }),
    ]);
    return res.json({ status: 200, message: 'Logged out successfully' });
  } catch (err) {
    console.log('err: logout', err);
    return res.status(400).json({ error: 'Logout failed' });
  }
};

// Check if the user is locked out due to too many login attempts
function checkTimeOut(user) {
  return user.loginTryCount >= 5 && DateTime.now().diff(DateTime.fromJSDate(user.lastLoggedIn), 'minutes').minutes < 5;
}

// Login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email, role: Role.Admin, status: true });
    if (!user) return res.status(400).json({ error: 'User has been disabled or not found' });
    if (!user.password) return res.status(400).json({ error: 'Please verify your email and set a new password' });

    if (checkTimeOut(user)) {
      const payload = {
        to: user.email,
        subject: 'Too many login attempts',
        template: 'login-failed',
        variables: { username: user.displayName },
      };
      SQSHandler({ MessageBody: JSON.stringify(payload), QueueUrl: process.env.EMAIL_QUEUE });
      return res.status(429).json({ error: 'Too many failed attempts. Please try again in 5 minutes' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.lastLoggedIn = DateTime.utc().toJSDate();
      user.loginTryCount += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid email/password' });
    }

    const device = new DeviceTokenModel({ userId: String(user._id), deviceType: DeviceType.NotProvided });
    const [tokens] = await Promise.all([
      getTokens({ userId: String(user._id), role: user.role, deviceDocId: String(device._id) }),
      device.save(),
      updateLastActivity(String(user._id)),
    ]);

    return res.json({
      accessToken: tokens.lastTokenGenerated,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.log('err: login', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email, role: Role.Admin, status: true });
    if (!user) return res.status(400).json({ error: 'User has been disabled or not found' });

    const resetToken = jwt.sign({ userId: user._id }, process.env.FORGET_PASSWORD_SECRET, { expiresIn: '10m' });
    user.resetPasswordToken = resetToken;
    await user.save();

    const payload = {
      to: user.email,
      subject: 'Reset Password',
      template: 'reset-password',
      variables: {
        username: user.displayName,
        url: `${process.env.ADMIN_URL}/reset-password?accessToken=${resetToken}&email=${user.email}`,
      },
    };
    SQSHandler({ MessageBody: JSON.stringify(payload), QueueUrl: process.env.EMAIL_QUEUE });

    res.json({ message: `Password reset email has been sent to ${email}` });
  } catch (err) {
    console.log('err: forgotPassword', err);
    return res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { resetPasswordToken, newPassword, type } = req.body;

  try {
    const secret = type === 'ForgetPassword' ? process.env.FORGET_PASSWORD_SECRET : process.env.INVITE_SECRET;
    const userData = jwt.verify(resetPasswordToken, secret);
    if (!userData) throw new Error('The token has been expired. Please try again');

    const user = await UserModel.findOne({
      _id: get(userData, 'userId'),
      role: Role.Admin,
      resetPasswordToken: resetPasswordToken,
      status: true,
    });
    if (!user)
      return res.status(400).json({ error: 'Sorry we cant find your request for reset password. Please try again' });

    user.password = newPassword;
    user.resetPasswordToken = null;
    await user.save();

    const payload = {
      to: user.email,
      subject: 'Password Reset Successful',
      template: 'set-password',
      variables: { username: user.displayName },
    };
    SQSHandler({ MessageBody: JSON.stringify(payload), QueueUrl: process.env.EMAIL_QUEUE });

    res.json({ message: 'Password has been updated successfully' });
  } catch (err) {
    console.log('err: resetPassword', err);
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({ _id: req.currentUser._id, status: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // const isMatch = await bcrypt.compare(oldPassword, user.password);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.log('err: changePassword', err);
    return res.status(500).json({ error: 'Failed to update password' });
  }
};

// Invite User
export const inviteUser = async (req, res) => {
  const { email, ...rest } = req.body;
  const currentUser = req.currentUser;

  try {
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = new UserModel({ ...rest, email, role: Role.Admin, createdBy: currentUser?._id || null });
      await user.save();
    }

    if (user.role !== Role.Admin) return res.status(400).json({ error: 'Email already used for a different role' });

    const resetToken = jwt.sign({ userId: user._id }, process.env.INVITE_SECRET, { expiresIn: '1d' });
    user.resetPasswordToken = resetToken;
    await user.save();

    const payload = {
      to: user.email,
      subject: 'Activate your Account',
      template: 'admin-invitation',
      variables: {
        username: user.displayName,
        url: `${process.env.ADMIN_URL}/inviteUser?accessToken=${resetToken}`,
        inviteSenderName: `${currentUser.firstName} ${currentUser.lastName}`,
      },
    };
    SQSHandler({ MessageBody: JSON.stringify(payload), QueueUrl: process.env.EMAIL_QUEUE });

    res.json({ message: 'Invitation sent successfully' });
  } catch (err) {
    console.log('err: inviteUser', err);
    return res.status(500).json({ error: 'Failed to send invitation' });
  }
};

// Delete Account Request
export const requestDeleteAccount = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email, role: Role.User });
    if (!user) return res.status(404).json({ error: 'Account not found for deletion' });

    const deleteToken = jwt.sign({ userId: user._id }, process.env.DELETE_ACCOUNT_SECRET, { expiresIn: '5m' });
    user.deleteAccountToken = deleteToken;
    await user.save();

    const payload = {
      to: user.email,
      subject: 'Account Deletion',
      template: 'delete-account',
      variables: {
        username: user.displayName,
        url: `${process.env.ADMIN_URL}/confirmDeletion?accessToken=${deleteToken}`,
      },
    };
    SQSHandler({ MessageBody: JSON.stringify(payload), QueueUrl: process.env.EMAIL_QUEUE });

    res.json({ message: 'Account deletion email sent' });
  } catch (err) {
    console.log('err: requestDeleteAccount', err);
    return res.status(500).json({ error: 'Failed to process account deletion request' });
  }
};

// Confirm Account Deletion
export const deleteAccount = async (req, res) => {
  const { deleteAccountToken } = req.body;

  try {
    const userData = jwt.verify(deleteAccountToken, process.env.DELETE_ACCOUNT_SECRET);
    const user = await UserModel.findOne({ _id: get(userData, 'userId'), deleteAccountToken: deleteAccountToken });

    if (!user) return res.status(404).json({ error: 'Invalid account deletion request' });

    await UserModel.deleteOne({ _id: user._id });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.log('err: deleteAccount', err);
    return res.status(400).json({ error: 'Invalid or expired account deletion token' });
  }
};
