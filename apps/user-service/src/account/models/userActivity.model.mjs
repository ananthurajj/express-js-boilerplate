import { Schema, model } from 'mongoose';

const UserActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
      index: true,
    },
    lastActivity: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivityHistory: {
      type: [Date],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserActivityModel = model('UserActivityModel', UserActivitySchema);
