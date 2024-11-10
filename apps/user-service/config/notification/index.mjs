export const sendNotification = async (type, user, event) => {
  const notificationHandlers = {
    'user-welcome-mail': async () => {
      const payload = {
        template: 'user-welcome-mail',
        data: {
          username: join([user.firstName, user.lastName], ' '),
          title: 'Session Request Received',
          redirectPath: 'https://google.com',
          eventData: JSON.stringify(event),
        },
      };
      SQSHandler({
        MessageBody: JSON.stringify(payload),
        QueueUrl: String(process.env.NOTIFICATION_QUEUE),
      });
    },
  };
  const notify = notificationHandlers[type];

  try {
    await notify();
  } catch (err) {
    console.log('Create Notification error on session module');
  }
};
