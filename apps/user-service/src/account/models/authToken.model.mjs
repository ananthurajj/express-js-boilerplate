import { Schema, model } from 'mongoose';

const AuthTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
      index: true,
    },
    lastTokenGenerated: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    generatedTokenCount: {
      type: Number,
      required: false,
      default: 1,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: Number(process.env.DOC_EXPIRY),
    },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: 'updatedAt',
    },
  }
);

export const AuthTokenModel = model('AuthTokenModel', AuthTokenSchema);
