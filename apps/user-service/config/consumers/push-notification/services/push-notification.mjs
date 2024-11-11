import { DeviceType } from 'codegen-sdk/dist/generated/sdk';
import Expo from 'expo-server-sdk';
import { assign, keys, map } from 'lodash';
import pino from 'pino';
import { DeviceTokenModel } from '../../../../src/account/index.mjs';
import { notificationConfig } from './notification-work-flow-data.config.mjs';
//import { SQSHandlerMessage } from "shared-backend";

export async function sendNotification(notificationData) {
  try {
    /*  notification template section start */
    const promises = [];
    const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN }); //check the deprecated useFcm

    const event = notificationConfig[notificationData.templateName];

    /* for method worker */
    if (event.method) {
      const methodData = await event.method(notificationData.data._id);
      assign(notificationData.data, { ...methodData });
    }

    const templateFields = keys(notificationData.data);
    for (const field of templateFields) {
      if (!event.fields[field]) continue;
      event.subject = event.subject.replace(new RegExp(event.fields[field], 'g'), notificationData.data[field]);
      event.description = event.description.replace(new RegExp(event.fields[field], 'g'), notificationData.data[field]);
    }

    const { getAllDeviceTokenCount } = await DeviceTokenModel.find({
      userId: notificationData.data.sendToId,
      deviceToken: { $ne: null },
      deviceId: { $ne: null },
      deviceType: { $ne: DeviceType.NotProvided },
    });
    if (getAllDeviceTokenCount > 0) {
      const { getAllDeviceToken } = await DeviceTokenModel.find({
        userId: notificationData.data.sendToId,
        deviceToken: { $ne: null },
        deviceId: { $ne: null },
        deviceType: { $ne: DeviceType.NotProvided },
      }).limit(getAllDeviceTokenCount);

      const notificationObjs = [];
      // const { incrementUnreadCount } = await sdk.incrementUnreadCount({ userId: data.sendTo });
      for (const token of map(getAllDeviceToken, 'deviceToken')) {
        notificationObjs.push({
          to: token,
          sound: 'default',
          title: event.subject,
          body: event.description.replace(/###/g, ''),
          badge: 1, //incrementUnreadCount,
          data: {
            ...notificationData.data,
          },
        });
      }
      const chunks = expo.chunkPushNotifications(notificationObjs);
      promises.push(
        Promise.allSettled(
          chunks.map((chunk) =>
            expo.sendPushNotificationsAsync(chunk).then((data) => {
              console.log('Push sent successfull', data);
            })
          )
        )
      );
    }
    //  promises.push(sdk.sendNotificationMany({ datas: notificationInputs }));
    await Promise.all(promises);
  } catch (err) {
    pino().error(err, err.message);
  }
}
