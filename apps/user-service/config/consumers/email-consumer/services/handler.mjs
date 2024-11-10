import { sendEmail } from './email';

export async function emailHandler(messages) {
  try {
    for (const message of messages) {
      const payload = JSON.parse(message.Body);
      // console.log("email payload: ", payload);
      if (process.env.SEND_EMAIL === 'true') await sendEmail(payload);
    }
  } catch (error) {
    console.log('error from emailConsumer handleMessage', JSON.stringify(error));
  }
}
