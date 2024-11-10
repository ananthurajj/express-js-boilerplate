//import { Message } from "aws-sdk/clients/sqs";
//import { ProcessEmailDataFields } from "../types";
import { sendNotification } from './notification.mjs';

export async function notificationHandler(messages) {
  try {
    for (const message of messages) {
      const payload = JSON.parse(message.Body);
      if (process.env.SEND_NOTIFICATION === 'true') await sendNotification(payload);
    }
  } catch (error) {
    console.log('error from pushNotificationHandler', JSON.stringify(error));
  }
}
