/**
 * @jest-environment node
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { AuthTokenModel } from '../../src/account/index.mjs';
import { UserModel } from '../../src/user/index.mjs';
import TestServerInit from '../testServerInit.mjs';

let testServer;
let app;
const loginToken = jwt.sign(
  { userId: '60f7c7e02e799f001c3a7ebc', role: 'ADMIN', deviceDocId: '60f7c7e02e799f001c3a7ec6' },
  process.env.JWT_SECRET
);
const resetPasswordToken = jwt.sign({ userId: '60f7c7e02e799f001c3a7ec2' }, process.env.FORGET_PASSWORD_SECRET);
const deleteAccountToken = jwt.sign({ userId: '60f7c7e02e799f001c3a7ec1' }, process.env.DELETE_ACCOUNT_SECRET);

beforeAll(async () => {
  testServer = new TestServerInit();
  app = await testServer.start();
  await UserModel.create([
    {
      _id: '60f7c7e02e799f001c3a7ebc',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John D.',
      profileImage: 'https://picsum.photos/200/200',
      email: 'johndoe@example.com',
      countryCode: '+1',
      phoneNumber: '1234567890',
      phoneNumberWithCountryCode: '+11234567890',
      gender: 'MALE',
      status: true,
      password: 'password123',
      locationName: 'New York, USA',
      locationPoint: { type: 'Point', coordinates: [-74.006, 40.7128] },
      timezone: 'America/New_York',
      role: 'ADMIN',
      lastLoggedIn: new Date(),
      loginTryCount: 0,
    },
    {
      _id: '60f7c7e02e799f001c3a7ebe',
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: 'Jane S.',
      profileImage: 'https://picsum.photos/200/200',
      email: 'janesmith@example.com',
      countryCode: '+44',
      phoneNumber: '2034567890',
      phoneNumberWithCountryCode: '+442034567890',
      gender: 'FEMALE',
      status: true,
      password: 'password456',
      locationName: 'London, UK',
      locationPoint: { type: 'Point', coordinates: [-0.1276, 51.5074] },
      timezone: 'Europe/London',
      role: 'USER',
      createdById: '60f7c7e02e799f001c3a7ebc',
      lastLoggedIn: new Date(),
      loginTryCount: 2,
    },
    {
      _id: '60f7c7e02e799f001c3a7ec1',
      firstName: 'Alex',
      lastName: 'Taylor',
      displayName: 'Alex T.',
      profileImage: 'https://picsum.photos/200/200',
      email: 'alextaylor@example.com',
      countryCode: '+61',
      phoneNumber: '412345678',
      phoneNumberWithCountryCode: '+61412345678',
      gender: 'NON_BINARY',
      status: false, // Inactive user
      password: 'password789',
      locationName: 'Sydney, Australia',
      locationPoint: { type: 'Point', coordinates: [151.2093, -33.8688] },
      timezone: 'Australia/Sydney',
      role: 'USER',
      createdById: '60f7c7e02e799f001c3a7ebc',
      deleteAccountToken: deleteAccountToken,
    },
    {
      _id: '60f7c7e02e799f001c3a7ec2',
      firstName: 'Jarvis',
      lastName: 'Taylor',
      displayName: 'Alex T.',
      profileImage: 'https://picsum.photos/200/200',
      email: 'jarvis@example.com',
      countryCode: '+61',
      phoneNumber: '412345123',
      phoneNumberWithCountryCode: '+61412345123',
      gender: 'NON_BINARY',
      status: true,
      password: 'password789',
      locationName: 'Sydney, Australia',
      locationPoint: { type: 'Point', coordinates: [151.2093, -33.8688] },
      timezone: 'Australia/Sydney',
      role: 'ADMIN',
      createdById: '60f7c7e02e799f001c3a7ebc',
      resetPasswordToken: resetPasswordToken,
    },
  ]);
});

afterAll(async () => {
  await testServer.stop();
});

describe('Accounts Module Routes', () => {
  // Test /current-user route
  describe('GET /api/v1/accounts/current-user', () => {
    it('should return the current authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/current-user')
        .set('Authorization', `Bearer ${loginToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    // it('should return 401 if token is missing or invalid', async () => {
    //   const response = await request(app).get('/api/v1/accounts/current-user');

    //   expect(response.status).toBe(401);
    //   expect(response.body).toHaveProperty('message', 'Unauthorized: Invalid or missing token');
    // });

    it('should return 404 if user is not found', async () => {
      const response = await request(app)
        .get('/api/v1/accounts/current-user')
        .set('Authorization', `Bearer ${jwt.sign({ userId: '60f7c7e02e799f001c3a7ec3' }, process.env.JWT_SECRET)}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  // Test /generate-access-token route
  describe('POST /api/v1/accounts/generate-access-token', () => {
    it('should generate a new access token with valid refresh token', async () => {
      const refreshToken = jwt.sign(
        { userId: '60f7c7e02e799f001c3a7ebc', deviceDocId: '60f7c7e02e799f001c3a7ec6' },
        process.env.REFRESH_JWT_SECRET
      );
      const token = jwt.sign({ userId: '60f7c7e02e799f001c3a7ebc' }, process.env.JWT_SECRET);
      await AuthTokenModel.create({ userId: '60f7c7e02e799f001c3a7ebc', refreshToken, lastTokenGenerated: token });

      const response = await request(app).post('/api/v1/accounts/generate-access-token').send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if refresh token is invalid or expired', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/generate-access-token')
        .send({ refreshToken: 'invalid_token' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or expired refresh token');
    });
  });

  // Test /generate-otp route
  describe('POST /api/v1/accounts/generate-otp', () => {
    it('should generate OTP successfully', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/generate-otp')
        .send({ countryCode: '+1', phoneNumber: '1234567890' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully sent OTP to your number');
    });

    // it('should return 400 for invalid phone number', async () => {
    //   const response = await request(app)
    //     .post('/api/v1/accounts/generate-otp')
    //     .send({ countryCode: '+1', phoneNumber: 'invalid_number' });

    //   expect(response.status).toBe(400);
    //   expect(response.body).toHaveProperty('error', 'Invalid phone number');
    // });
  });

  // Test /verify-otp route
  describe('POST /api/v1/accounts/verify-otp', () => {
    it('should verify OTP successfully', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/verify-otp')
        .send({ countryCode: '+1', phoneNumber: '1234567890', otp: '123456' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    // it('should return 400 for invalid OTP', async () => {
    //   const response = await request(app)
    //     .post('/api/v1/accounts/verify-otp')
    //     .send({ countryCode: '+1', phoneNumber: '1234567890', otp: 'invalid_otp' });

    //   expect(response.status).toBe(400);
    //   expect(response.body).toHaveProperty('error', 'OTP verification failed');
    // });
  });

  // Test /login route
  describe('POST /api/v1/accounts/login', () => {
    it('should log in the user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/login')
        .send({ email: 'johndoe@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 400 for invalid email/password', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/login')
        .send({ email: 'invalid@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User has been disabled or not found');
    });
  });

  // Test /logout route
  describe('POST /api/v1/accounts/logout', () => {
    it('should log out the user successfully', async () => {
      const response = await request(app).post('/api/v1/accounts/logout').set('Authorization', `Bearer ${loginToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return 400 if logout fails', async () => {
      const response = await request(app).post('/api/v1/accounts/logout');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Logout failed');
    });
  });

  // Test forgot-password route
  describe('POST /api/v1/accounts/forgot-password', () => {
    it('should send a password reset email', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/forgot-password')
        .send({ email: 'johndoe@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password reset email has been sent to johndoe@example.com');
    });

    it('should return 400 if user is not found', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User has been disabled or not found');
    });
  });

  // Test reset-password route
  describe('POST /api/v1/accounts/reset-password', () => {
    it('should reset the password with a valid token', async () => {
      const response = await request(app).post('/api/v1/accounts/reset-password').send({
        resetPasswordToken: resetPasswordToken,
        newPassword: 'newpassword',
        type: 'ForgetPassword',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password has been updated successfully');
    });

    it('should return 400 if the reset token is invalid or expired', async () => {
      const response = await request(app).post('/api/v1/accounts/reset-password').send({
        resetPasswordToken: 'invalid_token',
        newPassword: 'newpassword123',
        type: 'ForgetPassword',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or expired reset token');
    });
  });

  // Test change-password route
  describe('PUT /api/v1/accounts/change-password', () => {
    it('should change the password for an authenticated user', async () => {
      const response = await request(app)
        .put('/api/v1/accounts/change-password')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({ oldPassword: 'password123', newPassword: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password updated successfully');
    });

    it('should return 400 for incorrect old password', async () => {
      const response = await request(app)
        .put('/api/v1/accounts/change-password')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({ oldPassword: 'wrongpassword', newPassword: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Incorrect password');
    });
  });

  // Test invite-user route
  describe('POST /api/v1/accounts/invite-user', () => {
    it('should invite a new user', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/invite-user')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Invitation sent successfully');
    });

    it('should return 400 if the email is already in use by another role', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/invite-user')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({
          email: 'janesmith@example.com', // Already used by Jane Smith
          firstName: 'New',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already used for a different role');
    });
  });

  // Test request-delete-account route
  describe('DELETE /api/v1/accounts/request-delete-account', () => {
    it('should request account deletion successfully', async () => {
      const response = await request(app)
        .delete('/api/v1/accounts/request-delete-account')
        .send({ email: 'janesmith@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Account deletion email sent');
    });

    it('should return 404 if the account is not found', async () => {
      const response = await request(app)
        .delete('/api/v1/accounts/request-delete-account')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Account not found for deletion');
    });
  });

  // Test delete-account route
  describe('DELETE /api/v1/accounts/delete-account', () => {
    it('should delete the account with a valid token', async () => {
      const response = await request(app)
        .delete('/api/v1/accounts/delete-account')
        .send({ deleteAccountToken: deleteAccountToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Account deleted successfully');
    });

    it('should return 400 if the delete account token is invalid or expired', async () => {
      const response = await request(app)
        .delete('/api/v1/accounts/delete-account')
        .send({ deleteAccountToken: 'invalid_token' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or expired account deletion token');
    });
  });
});
