// import 'dotenv/config';
// import mongoose from 'mongoose';
// import connectDB from '../../../config/mongodb/connect-mongo-db.mjs';
import { UserModel } from '../../../src/user/index.mjs';

export const seedUsers = async () => {
  // await connectDB(process.env.MONGO_URI);

  try {
    const users = [
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
        resetPasswordToken: 'resetToken123',
        deleteAccountToken: 'deleteToken123',
      },
    ];

    await UserModel.create(users);
    console.log('Users seeded successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.log('Users already seeded');
    } else {
      console.error('Error seeding users:', error);
    }
  }
  // finally {
  //   mongoose.connection.close();
  // }
};

// seedUsers();
