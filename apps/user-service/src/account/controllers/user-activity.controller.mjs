import { DateTime } from 'luxon';
import { UserModel } from '../../user/models/user.model.mjs';
import { UserActivityModel } from '../models/userActivity.model.mjs';

export const updateLastActivity = async (userId) => {
  const today = DateTime.utc();

  try {
    await Promise.all([
      UserActivityModel.findOneAndUpdate(
        {
          $and: [
            { userId },
            {
              lastActivity: {
                $gte: today.startOf('day').toJSDate(),
              },
            },
            {
              lastActivity: {
                $lte: today.endOf('day').toJSDate(),
              },
            },
          ],
        },
        {
          $set: {
            userId,
            lastActivity: today.toJSDate(),
          },
          $push: { lastActivityHistory: today.toJSDate() },
        },
        { upsert: true }
      ),
      UserModel.updateOne(
        { _id: userId },
        {
          $set: {
            lastLoggedIn: today.toJSDate(),
          },
        }
      ),
    ]);
    return true;
  } catch (err) {
    console.error('Error updating user activity:', err);
    throw new Error('Failed to update user activity');
  }
};
