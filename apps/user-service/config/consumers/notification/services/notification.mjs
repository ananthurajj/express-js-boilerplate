import { AccessMode, appMainSDK } from 'codegen-sdk';
import { assign, join, keys, pick, size } from 'lodash';
import { SQSHandler } from 'shared-backend';
import { notificationConfig } from './notification-work-flow-data.config';

export async function sendNotification(notificationData) {
  try {
    /*  notification template section start */
    const promises = [];
    const { sdk } = appMainSDK(AccessMode.serviceAdmin, process.env.APP_MAIN_TOKEN);

    const event = notificationConfig[notificationData.template];
    /* for method worker */
    if (event?.method) {
      const methodData = await event.method(notificationData.data);
      if (size(methodData)) assign(notificationData.data, { ...methodData });
      if (size(methodData) && methodData.breakExecution) return;
    }
    const templateFields = keys(notificationData.data);
    console.log(templateFields);
    for (const field of templateFields) {
      if (!event.fields[field]) continue;
      event.title = event.title.replace(new RegExp(event.fields[field], 'g'), notificationData.data[field]);
      event.message = event.message.replace(new RegExp(event.fields[field], 'g'), notificationData.data[field]);
    }
    console.log(event, notificationData.data);

    const payload = {
      type: event.pushType ? event.pushType : '',
      templateName: notificationData.template,
      data: {
        notificationId: '',
        ...notificationData.data,
        subject: event.title,
        description: event.message,
      },
    };
    const data = pick({ ...event, ...notificationData.data }, [
      'title',
      'message',
      'eventType',
      'sendFromId',
      'sendToId',
      'userId',
      'redirectPath',
      'eventData',
    ]);
    const notification = await sdk.CreateNotification({ data: data });
    if (notification.createNotification._id)
      payload.data.notificationId = notification.createNotification._id.toString();
    if (event.pushType) {
      console.log('Push notification Sent');
      SQSHandler({
        MessageBody: JSON.stringify(payload),
        QueueUrl: String(process.env.PUSH_NOTIFICATION_QUEUE),
      });
    }

    if (event.sendEmail) {
      await sendMail(data, notificationData.template);
    }
    //sendToPushNotificationQuee
  } catch (err) {
    console.log('ERROR WHILE CREATING NOTIFICATION', err);
  }
}
const sendMail = async (event, template) => {
  const { sdk } = appMainSDK(AccessMode.serviceAdmin, process.env.APP_MAIN_TOKEN);

  const mailHandlers = {
    'customer-session-request': async () => {
      const user = await sdk.GetOneUser({ filter: { _id: event.sendToId } });
      const payload = {
        to: user.getOneUser?.email,
        subject: event.title,
        template: template,
        variables: {
          username: user.getOneUser?.displayName
            ? user.getOneUser?.displayName
            : join([user.getOneUser?.firstName, user.getOneUser?.lastName], ' '),
        },
      };
      SQSHandler({
        MessageBody: JSON.stringify(payload),
        QueueUrl: String(process.env.EMAIL_QUEUE),
      });
    },
  };
  const mail = mailHandlers[template];
  return mail();
};
