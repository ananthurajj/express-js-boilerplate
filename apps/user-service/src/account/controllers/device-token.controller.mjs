import { get, isEmpty, omit, set } from 'lodash';
import { DeviceTokenModel } from '../models/deviceToken.model.mjs';

// Function to fetch all device tokens
export const getAllDeviceToken = async (req, res) => {
  const { filter, limit = 10, offset = 0, sort = { updatedAt: -1 } } = req.body;
  const devicePipelines = [];

  // Apply filter if provided
  if (!isEmpty(filter)) {
    // devicePipelines.push({
    //   $match: parseQuery(filter),
    // });
  }

  // Group device tokens
  devicePipelines.push({
    $group: {
      _id: {
        deviceToken: '$deviceToken',
        deviceId: '$deviceId',
        userId: '$userId',
      },
      id: { $first: '$_id' },
      deviceToken: { $first: '$deviceToken' },
      userId: { $first: '$userId' },
      deviceId: { $first: '$deviceId' },
      deviceType: { $first: '$deviceType' },
      createdAt: { $first: '$createdAt' },
      updatedAt: { $first: '$updatedAt' },
    },
  });

  // Project necessary fields
  devicePipelines.push({
    $project: {
      _id: '$id',
      deviceToken: 1,
      userId: 1,
      deviceId: 1,
      deviceType: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  // Sort, skip, and limit
  devicePipelines.push({ $sort: sort });
  devicePipelines.push({ $skip: Number(offset) });
  devicePipelines.push({ $limit: Number(limit) });

  try {
    const devices = await DeviceTokenModel.aggregate(devicePipelines);
    return res.status(200).json(devices);
  } catch (err) {
    console.log('err: getAllDeviceToken:', err);
    return res.status(500).json({ error: 'Failed to fetch device tokens' });
  }
};

// Function to get the total count of device tokens
export const getAllDeviceTokenCount = async (req, res) => {
  const { filter } = req.body;
  const devicePipelines = [];

  // Apply filter if provided
  if (!isEmpty(filter)) {
    // devicePipelines.push({
    //   $match: parseQuery(filter),
    // });
  }

  // Group device tokens
  devicePipelines.push({
    $group: {
      _id: {
        deviceToken: '$deviceToken',
        deviceId: '$deviceId',
        userId: '$userId',
      },
      id: { $first: '$_id' },
      deviceToken: { $first: '$deviceToken' },
      userId: { $first: '$userId' },
      deviceId: { $first: '$deviceId' },
      deviceType: { $first: '$deviceType' },
      createdAt: { $first: '$createdAt' },
      updatedAt: { $first: '$updatedAt' },
    },
  });

  // Count the total number of devices
  devicePipelines.push({ $count: 'totalCount' });

  try {
    const count = (await DeviceTokenModel.aggregate(devicePipelines))[0]?.totalCount || 0;
    return res.status(200).json({ totalCount: count });
  } catch (err) {
    console.log('err: getAllDeviceTokenCount:', err);
    return res.status(500).json({ error: 'Failed to fetch device token count' });
  }
};

// Function to update a device token
export const updateDeviceToken = async (req, res) => {
  const { data } = req.body;
  const { userId } = req.params;

  try {
    const deviceToken = await DeviceTokenModel.findById(userId);
    if (!deviceToken) {
      return res.status(404).json({ error: 'Device token not found' });
    }

    // Update the device token fields, except the ID
    for (const field in omit(data, '_id')) {
      set(deviceToken, field, get(data, field));
    }

    const updatedDeviceToken = await deviceToken.save();
    return res.status(200).json(updatedDeviceToken);
  } catch (err) {
    console.log('err: updateDeviceToken:', err);
    return res.status(500).json({ error: 'Failed to update device token' });
  }
};
