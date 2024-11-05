import bcrypt from 'bcryptjs';
import lodash from 'lodash';
import mongoose from 'mongoose';
const { join, lowerCase, trim, isEmpty } = lodash;

export const Gender = Object.freeze({
  Male: 'MALE',
  Female: 'FEMALE',
  NonBinary: 'NON_BINARY',
});

export const Role = Object.freeze({
  Admin: 'ADMIN',
  User: 'USER',
});

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      index: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      index: true,
      default: null,
    },
    displayName: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    profileImage: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    countryCode: {
      type: String,
      required: false,
      trim: true,
      index: true,
      minlength: 1,
      maxlength: 6,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      minlength: 5,
      maxlength: 25,
    },
    phoneNumberWithCountryCode: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      minlength: 5,
      maxlength: 35,
    },
    gender: {
      type: String,
      enum: Gender,
      required: false,
      index: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 4,
      maxlength: 250,
      default: null,
    },
    locationName: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    locationPoint: {
      type: {
        type: String,
        enum: ['Point'],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        default: [0, 0],
      },
    },
    timezone: {
      type: String,
      required: false,
      default: 'Asia/Kolkata',
      trim: true,
    },
    role: {
      type: String,
      required: false,
      default: Role.User,
      enum: Role,
      index: true,
      trim: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true,
      default: null,
    },
    lastLoggedIn: {
      type: Date,
      required: false,
      default: null,
    },
    loginTryCount: {
      type: Number,
      required: false,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      required: false,
      trim: true,
      default: null,
      index: true,
    },
    deleteAccountToken: {
      type: String,
      required: false,
      trim: true,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ locationPoint: '2dsphere' });

// Pre-save middleware for hashing the password
UserSchema.pre('save', async function (next) {
  const user = this;
  user.displayName = trim(lowerCase(join([user.firstName, user.lastName], ' ')));

  if (!isEmpty(user.phoneNumber) && !isEmpty(user.countryCode))
    user.phoneNumberWithCountryCode = trim(lowerCase(join([user.countryCode, user.phoneNumber], '')));

  if (!user.isModified('password') || !user.password) return next();

  const salt = bcrypt.genSaltSync(12);
  user.password = bcrypt.hashSync(user.password, salt);

  return next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(trim(password), this.password);
};

// Create the model
export const UserModel = mongoose.model('users', UserSchema, 'usermodels');
