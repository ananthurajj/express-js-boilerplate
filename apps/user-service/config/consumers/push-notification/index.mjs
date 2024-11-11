import { Consumer } from 'sqs-consumer';
import { sqs } from '../../aws/sqs.mjs';
import { pushNotificationHandler } from './services/handler';

export const pushNotificationConsumer = Consumer.create({
  queueUrl: String(process.env.PUSH_NOTIFICATION_QUEUE),
  visibilityTimeout: 300,
  batchSize: 3,
  handleMessageBatch: pushNotificationHandler,
  sqs: sqs,
});

pushNotificationConsumer.on('error', (err) => {
  console.error('error from pushNotificationConsumer', err.message);
});

pushNotificationConsumer.on('processing_error', (err) => {
  console.error('processing error from pushNotificationConsumer', err.message);
});

pushNotificationConsumer.on('timeout_error', (err) => {
  console.error('timeout error from pushNotificationConsumer', err.message);
});
