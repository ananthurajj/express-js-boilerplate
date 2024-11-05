import { Schema, model } from 'mongoose';

export const DeviceType = Object.freeze({
  NotProvided: 'NOT_PROVIDED',
  Web: 'WEB',
  Mobile: 'MOBILE',
  Desktop: 'DESKTOP',
});

const DeviceTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
      index: true,
    },
    deviceId: {
      type: String,
      required: false,
      default: null,
      trim: true,
      index: true,
    },
    deviceToken: {
      type: String,
      required: false,
      default: null,
      trim: true,
      index: true,
    },
    deviceType: {
      type: String,
      required: false,
      index: true,
      default: 'NOT_PROVIDED',
      enum: ['WEB', 'MOBILE', 'NOT_PROVIDED', 'DESKTOP'],
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

export const DeviceTokenModel = model('DeviceTokenModel', DeviceTokenSchema);
