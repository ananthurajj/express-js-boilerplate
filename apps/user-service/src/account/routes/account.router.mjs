/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management operations
 */

/**
 * @swagger
 * /api/v1/accounts/current-user:
 *   get:
 *     summary: Get Current User
 *     description: Fetch the currently authenticated user based on the provided JWT token.
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  # Use the reusable schema
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: Invalid or missing token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 */

/**
 * @swagger
 * /api/v1/accounts/generate-access-token:
 *   post:
 *     summary: Generate Access Token
 *     description: Generate a new access token using a valid refresh token.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "your_refresh_token_here"
 *     responses:
 *       200:
 *         description: Successfully generated a new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "new_access_token_here"
 *       400:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired refresh token"
 */

/**
 * @swagger
 * /api/v1/accounts/generate-otp:
 *   post:
 *     summary: Generate OTP
 *     description: Generate OTP and send it to the user’s phone number.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countryCode:
 *                 type: string
 *                 example: "+1"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: OTP successfully sent
 *       400:
 *         description: Invalid phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid phone number"
 */

/**
 * @swagger
 * /api/v1/accounts/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the OTP sent to the user’s phone number.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countryCode:
 *                 type: string
 *                 example: "+1"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP successfully verified
 *       400:
 *         description: Invalid OTP or OTP verification failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP"
 */

/**
 * @swagger
 * /api/v1/accounts/login:
 *   post:
 *     summary: User Login
 *     description: Login a user using email and password.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "yourpassword"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "your_access_token_here"
 *                 refreshToken:
 *                   type: string
 *                   example: "your_refresh_token_here"
 *       400:
 *         description: Invalid email/password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email/password"
 *       429:
 *         description: Too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Too many failed attempts"
 */

/**
 * @swagger
 * /api/v1/accounts/logout:
 *   post:
 *     summary: Logout
 *     description: Logout the current user by invalidating their access token and deleting the device token.
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Logout failed
 */

/**
 * @swagger
 * /api/v1/accounts/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Send a password reset email to the user.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/accounts/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Reset the user’s password using a reset token.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetPasswordToken:
 *                 type: string
 *                 example: reset_token_here
 *               newPassword:
 *                 type: string
 *                 example: newpassword
 *               type:
 *                 type: string
 *                 example: ForgetPassword
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset token
 */

/**
 * @swagger
 * /api/v1/accounts/change-password:
 *   put:
 *     summary: Change Password
 *     description: Change the current user’s password.
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword
 *               newPassword:
 *                 type: string
 *                 example: newpassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Incorrect password
 */

/**
 * @swagger
 * /api/v1/accounts/invite-user:
 *   post:
 *     summary: Invite User
 *     description: Send an invitation email to a new user.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Email already in use for another role
 */

/**
 * @swagger
 * /api/v1/accounts/request-delete-account:
 *   delete:
 *     summary: Request Account Deletion
 *     description: Request to delete the current user’s account.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Account deletion email sent
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /api/v1/accounts/delete-account:
 *   delete:
 *     summary: Confirm Account Deletion
 *     description: Delete the user’s account using a deletion token.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deleteAccountToken:
 *                 type: string
 *                 example: delete_account_token_here
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Invalid or expired account deletion token
 */

import {
  changePassword,
  deleteAccount,
  forgotPassword,
  generateOtp,
  getCurrentUser,
  getTokenByRefreshToken,
  inviteUser,
  login,
  logout,
  requestDeleteAccount,
  resetPassword,
  verifyOtp,
} from '../controllers/account.controller.mjs';

import express from 'express';

const router = express.Router();

// Route to get the current authenticated user
router.get('/current-user', getCurrentUser);

// Route to refresh tokens
router.post('/generate-access-token', getTokenByRefreshToken);

// Route to generate OTP
router.post('/generate-otp', generateOtp);

// Route to verify OTP
router.post('/verify-otp', verifyOtp);

// Route to log in a user
router.post('/login', login);

// Route to log out a user
router.post('/logout', logout);

// Route to handle forgotten password
router.post('/forgot-password', forgotPassword);

// Route to reset password
router.post('/reset-password', resetPassword);

// Route to change password
router.put('/change-password', changePassword);

// Route to invite a new user
router.post('/invite-user', inviteUser);

// Route to request account deletion
router.delete('/request-delete-account', requestDeleteAccount);

// Route to confirm account deletion
router.delete('/delete-account', deleteAccount);

export default router;
